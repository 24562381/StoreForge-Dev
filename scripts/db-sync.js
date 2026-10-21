#!/usr/bin/env node

/**
 * StoreForge Database Schema Synchronization & Safety Guard
 *
 * Implements non-destructive schema synchronization:
 * 1. Schema Matches: Skips table setup completely.
 * 2. Safe Updates: Adds new tables/columns without altering or removing existing data.
 * 3. Destructive Changes Detected: Pauses startup, advises user to take a backup first,
 *    and requires running an explicit merge command with warnings.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createBackup } = require('./db-backup');

const rootDir = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  gold: '\x1b[38;5;214m',
};

function loadEnv() {
  const envFiles = [path.join(rootDir, '.env.local'), path.join(rootDir, '.env')];
  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx <= 0) continue;
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      } catch {}
    }
  }
}

loadEnv();

function findPrismaSchema() {
  const candidates = [
    path.join(rootDir, 'backend', 'prisma', 'schema.prisma'),
    path.join(rootDir, 'prisma', 'schema.prisma'),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

function findPrismaBin() {
  const isWin = process.platform === 'win32';
  const candidates = [
    path.join(rootDir, 'node_modules', '.bin', isWin ? 'prisma.cmd' : 'prisma'),
    path.join(rootDir, 'backend', 'node_modules', '.bin', isWin ? 'prisma.cmd' : 'prisma'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || 'npx prisma';
}

/**
 * Checks whether SQL script contains potentially destructive DDL
 */
function analyzeSqlForDestructiveChanges(sqlScript) {
  if (!sqlScript || typeof sqlScript !== 'string') return { isDestructive: false, reasons: [] };

  const reasons = [];
  const lines = sqlScript.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('--')) continue;

    // Check for DROP TABLE
    if (/\bDROP\s+TABLE\b/i.test(line)) {
      reasons.push(line);
    }
    // Check for DROP COLUMN
    else if (/\bDROP\s+COLUMN\b/i.test(line)) {
      reasons.push(line);
    }
  }

  return {
    isDestructive: reasons.length > 0,
    reasons,
  };
}

/**
 * Core Database Synchronization Engine
 */
async function syncDatabaseSchema(options = {}) {
  const { force = false, silent = false } = options;
  const schemaPath = findPrismaSchema();
  const prismaCmd = findPrismaBin();

  if (!schemaPath) {
    if (!silent) console.warn(`${C.yellow}[WARN] No schema.prisma file found. Skipping database check.${C.reset}`);
    return { status: 'skipped', reason: 'no_schema' };
  }

  if (!process.env.DATABASE_URL) {
    if (!silent) console.warn(`${C.yellow}[WARN] DATABASE_URL not configured. Skipping database check.${C.reset}`);
    return { status: 'skipped', reason: 'no_database_url' };
  }

  if (!silent) {
    console.log(`${C.cyan}[DB] Verifying database schema integrity against project models...${C.reset}`);
  }

  // 1. Check if database schema is already in sync using prisma migrate diff --exit-code
  let diffExitCode = 0;
  let diffSql = '';

  try {
    diffSql = execSync(
      `"${prismaCmd}" migrate diff --from-schema-datasource="${schemaPath}" --to-schema-datamodel="${schemaPath}" --script`,
      {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      }
    ).trim();

    // If script is empty migration, schemas match exactly
    if (diffSql.includes('-- This is an empty migration.') || !diffSql) {
      diffExitCode = 0;
    } else {
      diffExitCode = 2;
    }
  } catch (err) {
    // If command failed due to connection error
    if (err.message && (err.message.includes('P1001') || err.message.includes("Can't reach database"))) {
      console.warn(`\n${C.yellow}[WARN] Database connection notice: PostgreSQL server is not responding.${C.reset}`);
      return { status: 'offline', error: err.message };
    }
    diffExitCode = 2;
  }

  // State 1: Schema matches perfectly -> SKIP table setup
  if (diffExitCode === 0) {
    if (!silent) {
      console.log(`${C.green}[SUCCESS] Database tables and column structures match project schema perfectly. Skipping table setup.${C.reset}\n`);
    }
    return { status: 'synced', skipped: true };
  }

  // State 2: Differences detected -> Inspect for destructive operations
  const analysis = analyzeSqlForDestructiveChanges(diffSql);

  if (!analysis.isDestructive) {
    // State 2A: Safe non-destructive changes (creating new tables, adding nullable/default columns)
    if (!silent) {
      console.log(`${C.gold}[DB] Non-destructive schema additions detected. Safely updating database without touching existing data...${C.reset}`);
    }

    try {
      execSync(`"${prismaCmd}" db push --schema="${schemaPath}" --skip-generate`, {
        cwd: rootDir,
        stdio: 'inherit',
        env: { ...process.env },
      });
      if (!silent) {
        console.log(`${C.green}[SUCCESS] Database tables synchronized successfully. All existing data preserved.${C.reset}\n`);
      }
      return { status: 'updated', destructive: false };
    } catch (pushErr) {
      // If prisma db push threw a data-loss warning despite our check
      if (pushErr.message && pushErr.message.includes('data loss')) {
        analysis.isDestructive = true;
        analysis.reasons.push('Prisma detected potential data loss during schema update.');
      } else {
        throw pushErr;
      }
    }
  }

  // State 3: Destructive changes detected (DROP TABLE, DROP COLUMN, lossy type conversion)
  if (analysis.isDestructive) {
    if (force) {
      // User explicitly ran with --force flag
      console.log(`\n${C.yellow}${C.bold}[WARN] FORCED MERGE INITIATED (--force flag detected).${C.reset}`);
      console.log(`${C.cyan}[BACKUP] Creating an automated safety backup before applying destructive changes...${C.reset}`);
      try {
        await createBackup();
      } catch (backupErr) {
        console.error(`${C.red}[ERROR] Safety backup failed: ${backupErr.message}. Aborting merge.${C.reset}`);
        process.exit(1);
      }

      console.log(`${C.gold}[DB] Applying database schema merge with --accept-data-loss...${C.reset}`);
      execSync(`"${prismaCmd}" db push --schema="${schemaPath}" --skip-generate --accept-data-loss`, {
        cwd: rootDir,
        stdio: 'inherit',
        env: { ...process.env },
      });
      console.log(`${C.green}[SUCCESS] Database schema merged successfully.${C.reset}\n`);
      return { status: 'merged_forced', destructive: true };
    }

    // Default Protection: HALT and alert user! DO NOT DELETE ANY DATA!
    console.error(`
${C.red}${C.bold}================================================================================${C.reset}
${C.red}${C.bold}  CRITICAL: POTENTIALLY DESTRUCTIVE DATABASE CHANGES DETECTED                   ${C.reset}
${C.red}${C.bold}================================================================================${C.reset}

  ${C.yellow}The updated project structure requires database modifications that cannot be applied
  automatically without deleting or altering existing columns, tables, or stored data.${C.reset}

  ${C.bold}Detected Alterations:${C.reset}
${analysis.reasons.map((r) => `    ${C.red}• ${r}${C.reset}`).join('\n')}

  ${C.bold}PROTECTION ACTIVE: Automatic server startup has been safely halted${C.reset}
  ${C.bold}to prevent accidental deletion of your existing database records.${C.reset}

  ${C.bold}REQUIRED STEPS TO MERGE SAFELY:${C.reset}

  1. ${C.cyan}Take a full backup of your existing database first:${C.reset}
     ${C.bold}npm run db:backup${C.reset}

  2. ${C.cyan}Once your backup is confirmed, run the explicit merge command:${C.reset}
     ${C.bold}npm run db:merge -- --force${C.reset}
     ${C.gray}(or: node scripts/db-sync.js --force)${C.reset}

${C.red}${C.bold}================================================================================${C.reset}
`);

    process.exit(1);
  }
}

// Direct CLI invocation handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  syncDatabaseSchema({ force }).catch((err) => {
    console.error(`\n${C.red}[ERROR] Database sync error: ${err.message}${C.reset}\n`);
    process.exit(1);
  });
}

module.exports = { syncDatabaseSchema };
