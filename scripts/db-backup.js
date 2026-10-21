#!/usr/bin/env node

/**
 * StoreForge Database Backup Utility
 *
 * Creates a complete timestamped SQL or JSON snapshot of the PostgreSQL database.
 * Supports:
 * - Docker PostgreSQL container (postgres-test)
 * - Native host pg_dump
 * - Direct Prisma ORM data export fallback
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
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

async function createBackup() {
  const backupsDir = path.join(rootDir, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');
  const backupSqlFile = path.join(backupsDir, `db-backup-${timestamp}.sql`);
  const backupJsonFile = path.join(backupsDir, `db-backup-${timestamp}.json`);

  console.log(`\n${C.cyan}${C.bold}[BACKUP] Initiating StoreForge Database Backup...${C.reset}`);

  const rawUrl = process.env.DATABASE_URL || '';
  let host = 'localhost';
  try {
    if (rawUrl.startsWith('postgresql://') || rawUrl.startsWith('postgres://')) {
      const parsed = new URL(rawUrl);
      host = parsed.hostname;
    }
  } catch {
    const match = rawUrl.match(/@([^:/]+)/);
    if (match) host = match[1];
  }
  const isLocal =
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'postgres-test' ||
    host === '::1';

  // 1. Try host pg_dump using DATABASE_URL (works for ANY PostgreSQL hosting: local, Supabase, Neon, AWS RDS, etc.)
  try {
    const hasPgDump = execSync('command -v pg_dump >/dev/null 2>&1 && echo "yes" || true', { encoding: 'utf8' }).trim() === 'yes';
    if (hasPgDump && rawUrl) {
      console.log(`  ${C.gray}• Executing host pg_dump using DATABASE_URL...${C.reset}`);
      execSync(`pg_dump "${rawUrl}" > "${backupSqlFile}"`, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (fs.existsSync(backupSqlFile) && fs.statSync(backupSqlFile).size > 0) {
        const sizeKb = (fs.statSync(backupSqlFile).size / 1024).toFixed(1);
        console.log(`  ${C.green}[SUCCESS] Backup created successfully:${C.reset} ${C.bold}${backupSqlFile}${C.reset} (${sizeKb} KB)\n`);
        return backupSqlFile;
      }
    }
  } catch {}

  // 2. Try Docker if host pg_dump did not succeed
  try {
    const isDocker = execSync('command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || true', {
      encoding: 'utf8',
    }).trim() === 'yes';

    if (isDocker) {
      if (isLocal) {
        const isRunning = execSync("docker inspect --format='{{.State.Running}}' postgres-test 2>/dev/null || true", {
          encoding: 'utf8',
        }).trim() === 'true';

        if (isRunning) {
          console.log(`  ${C.gray}• Found active local Docker container 'postgres-test'. Dumping via pg_dump...${C.reset}`);
          execSync(`docker exec -t postgres-test pg_dump -U postgres -d postgres > "${backupSqlFile}"`, {
            stdio: ['ignore', 'pipe', 'pipe'],
          });

          if (fs.existsSync(backupSqlFile) && fs.statSync(backupSqlFile).size > 0) {
            const sizeKb = (fs.statSync(backupSqlFile).size / 1024).toFixed(1);
            console.log(`  ${C.green}[SUCCESS] Backup created successfully:${C.reset} ${C.bold}${backupSqlFile}${C.reset} (${sizeKb} KB)\n`);
            return backupSqlFile;
          }
        }
      } else if (rawUrl) {
        console.log(`  ${C.gray}• Running Docker postgres client container against remote database host...${C.reset}`);
        execSync(`docker run --rm postgres:18-alpine pg_dump "${rawUrl}" > "${backupSqlFile}"`, {
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        if (fs.existsSync(backupSqlFile) && fs.statSync(backupSqlFile).size > 0) {
          const sizeKb = (fs.statSync(backupSqlFile).size / 1024).toFixed(1);
          console.log(`  ${C.green}[SUCCESS] Backup created successfully:${C.reset} ${C.bold}${backupSqlFile}${C.reset} (${sizeKb} KB)\n`);
          return backupSqlFile;
        }
      }
    }
  } catch {}

  // 3. Fallback: Full Prisma ORM Snapshot
  console.log(`  ${C.yellow}• Standard pg_dump not found in PATH. Creating full JSON database snapshot via Prisma...${C.reset}`);
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const snapshot = {
      createdAt: now.toISOString(),
      databaseUrl: (process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':****@'),
      tables: {},
    };

    const models = [
      'user',
      'category',
      'product',
      'productVariant',
      'order',
      'orderItem',
      'review',
      'promoCode',
      'faq',
      'setting',
      'translation',
      'customization',
    ];

    for (const model of models) {
      if (prisma[model] && typeof prisma[model].findMany === 'function') {
        try {
          snapshot.tables[model] = await prisma[model].findMany();
        } catch {}
      }
    }

    await prisma.$disconnect();

    fs.writeFileSync(backupJsonFile, JSON.stringify(snapshot, null, 2), 'utf8');
    const sizeKb = (fs.statSync(backupJsonFile).size / 1024).toFixed(1);
    console.log(`  ${C.green}[SUCCESS] Prisma snapshot created successfully:${C.reset} ${C.bold}${backupJsonFile}${C.reset} (${sizeKb} KB)\n`);
    return backupJsonFile;
  } catch (err) {
    console.error(`  ${C.red}[ERROR] Failed to create database backup: ${err.message}${C.reset}\n`);
    throw err;
  }
}

if (require.main === module) {
  createBackup().catch(() => process.exit(1));
}

module.exports = { createBackup };
