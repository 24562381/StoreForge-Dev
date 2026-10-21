/**
 * StoreForge Platform — Strict Environment & Database Validator
 *
 * Runs before any service boots or dependencies are checked.
 * Validates that:
 * 1. A real, populated .env exists in the project root.
 * 2. DATABASE_URL is properly formatted without template placeholders.
 * 3. The PostgreSQL database connection is actively tested and verified.
 *
 * If invalid or unreachable, halts execution immediately and prints an actionable fix.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

const rootDir = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  gold: '\x1b[38;5;214m',
  magenta: '\x1b[35m',
};

function parseEnvString(content) {
  const env = {};
  const lines = content.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;

    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();

    if (val.startsWith('"')) {
      const endIdx = val.indexOf('"', 1);
      val = endIdx !== -1 ? val.slice(1, endIdx) : val.slice(1);
    } else if (val.startsWith("'")) {
      const endIdx = val.indexOf("'", 1);
      val = endIdx !== -1 ? val.slice(1, endIdx) : val.slice(1);
    } else {
      const commentIdx = val.indexOf('#');
      if (commentIdx !== -1) {
        val = val.slice(0, commentIdx).trim();
      }
    }
    env[key] = val;
  }
  return env;
}

function parseDatabaseUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return {
      protocol: u.protocol.replace(':', ''),
      username: decodeURIComponent(u.username || ''),
      password: u.password ? '••••••••' : '(none)',
      hasPassword: Boolean(u.password),
      host: u.hostname || 'localhost',
      port: u.port || '5432',
      database: u.pathname.replace(/^\//, '') || '',
      ssl: u.searchParams.get('sslmode') || u.searchParams.get('ssl') || null,
      schema: u.searchParams.get('schema') || 'public',
    };
  } catch {
    return null;
  }
}

/**
 * Validates environment configuration file syntax & contents.
 * Returns { valid: boolean, errors: Array<{ field: string, issue: string, fix: string }> }
 */
function validateEnvFile(options = { exitOnError: true }) {
  const envPath = path.join(rootDir, '.env');
  const envLocalPath = path.join(rootDir, '.env.local');

  const hasEnv = fs.existsSync(envPath);
  const hasEnvLocal = fs.existsSync(envLocalPath);

  // 1. Check if .env or .env.local exists
  if (!hasEnv && !hasEnvLocal) {
    const errorMsg = {
      title: 'MISSING .env CONFIGURATION FILE',
      errors: [
        {
          field: '.env',
          issue: `No environment file found at ${envPath}`,
          fix: `Create your .env file from the template:\n     ${C.bold}cp .env.example .env${C.reset}`,
        },
      ],
    };

    if (options.exitOnError) {
      renderErrorBanner(errorMsg);
      process.exit(1);
    }
    return { valid: false, ...errorMsg };
  }

  const activeFilePath = hasEnv ? envPath : envLocalPath;
  const activeFileName = hasEnv ? '.env' : '.env.local';

  // 2. Check if .env is readable and has actual content
  let content = '';
  try {
    content = fs.readFileSync(activeFilePath, 'utf8');
  } catch (readErr) {
    const errorMsg = {
      title: `UNREADABLE ${activeFileName.toUpperCase()} FILE`,
      errors: [
        {
          field: activeFileName,
          issue: `Could not read ${activeFilePath}: ${readErr.message}`,
          fix: `Check file permissions:\n     ${C.bold}chmod 644 ${activeFilePath}${C.reset}`,
        },
      ],
    };
    if (options.exitOnError) {
      renderErrorBanner(errorMsg);
      process.exit(1);
    }
    return { valid: false, ...errorMsg };
  }

  const parsed = parseEnvString(content);
  const nonCommentLines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (nonCommentLines.length === 0 || Object.keys(parsed).length === 0) {
    const errorMsg = {
      title: `EMPTY ${activeFileName.toUpperCase()} CONFIGURATION FILE`,
      errors: [
        {
          field: activeFileName,
          issue: `The ${activeFileName} file is completely empty or contains only comments.`,
          fix: `Initialize your ${activeFileName} from the template:\n     ${C.bold}cp .env.example ${activeFileName}${C.reset}`,
        },
      ],
    };
    if (options.exitOnError) {
      renderErrorBanner(errorMsg);
      process.exit(1);
    }
    return { valid: false, ...errorMsg };
  }

  // 3. Inspect essential configuration variables
  const validationErrors = [];

  // Check DATABASE_URL
  const dbUrl = (process.env.DATABASE_URL || parsed.DATABASE_URL || '').trim();
  if (!dbUrl) {
    validationErrors.push({
      field: 'DATABASE_URL',
      issue: `DATABASE_URL is missing or empty in ${activeFileName}.`,
      fix: `Define your PostgreSQL database connection in ${activeFileName}:\n     ${C.bold}DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"${C.reset}\n     (Supports local PostgreSQL, Supabase, Neon, Railway, or Docker)`,
    });
  } else if (
    dbUrl.includes('[DB_USER]') ||
    dbUrl.includes('[DB_PASSWORD]') ||
    dbUrl.includes('[DB_HOST]') ||
    dbUrl.includes('[DB_PORT]') ||
    dbUrl.includes('[DB_NAME]')
  ) {
    validationErrors.push({
      field: 'DATABASE_URL',
      issue: `DATABASE_URL still contains unconfigured template placeholders ([DB_USER], [DB_PASSWORD], etc.).`,
      fix: `Replace the bracketed placeholders in ${activeFileName} with your real PostgreSQL credentials:\n     ${C.bold}DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"${C.reset}`,
    });
  } else if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    validationErrors.push({
      field: 'DATABASE_URL',
      issue: `DATABASE_URL must be a valid PostgreSQL connection string starting with "postgresql://" or "postgres://".`,
      fix: `Correct the connection scheme in ${activeFileName}:\n     ${C.bold}DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"${C.reset}`,
    });
  }

  // Check Ports (if customized)
  const port = parsed.PORT || process.env.PORT;
  const adminPort = parsed.ADMIN_PORT || process.env.ADMIN_PORT;
  const backendPort = parsed.BACKEND_PORT || process.env.BACKEND_PORT;

  const validatePortNum = (name, val) => {
    if (val !== undefined && val !== '') {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 65535) {
        validationErrors.push({
          field: name,
          issue: `${name}="${val}" is not a valid port number (must be between 1 and 65535).`,
          fix: `Set ${name} to a valid port number in ${activeFileName} (e.g. ${name}=${name === 'PORT' ? '3000' : name === 'ADMIN_PORT' ? '4000' : '8585'}).`,
        });
      }
    }
  };

  validatePortNum('PORT', port);
  validatePortNum('ADMIN_PORT', adminPort);
  validatePortNum('BACKEND_PORT', backendPort);

  // Check for port collision between services
  if (port && adminPort && String(port).trim() === String(adminPort).trim()) {
    validationErrors.push({
      field: 'PORT / ADMIN_PORT',
      issue: `PORT and ADMIN_PORT are configured to the same port (${port}). Each service requires a unique port.`,
      fix: `Assign separate ports in ${activeFileName} (e.g. PORT=3000 and ADMIN_PORT=4000).`,
    });
  }
  if (port && backendPort && String(port).trim() === String(backendPort).trim()) {
    validationErrors.push({
      field: 'PORT / BACKEND_PORT',
      issue: `PORT and BACKEND_PORT are configured to the same port (${port}).`,
      fix: `Assign separate ports in ${activeFileName} (e.g. PORT=3000 and BACKEND_PORT=8585).`,
    });
  }
  if (adminPort && backendPort && String(adminPort).trim() === String(backendPort).trim()) {
    validationErrors.push({
      field: 'ADMIN_PORT / BACKEND_PORT',
      issue: `ADMIN_PORT and BACKEND_PORT are configured to the same port (${adminPort}).`,
      fix: `Assign separate ports in ${activeFileName} (e.g. ADMIN_PORT=4000 and BACKEND_PORT=8585).`,
    });
  }

  if (validationErrors.length > 0) {
    const errorMsg = {
      title: `INVALID CONFIGURATION IN ${activeFileName.toUpperCase()}`,
      activeFilePath,
      errors: validationErrors,
    };
    if (options.exitOnError) {
      renderErrorBanner(errorMsg);
      process.exit(1);
    }
    return { valid: false, ...errorMsg };
  }

  return { valid: true, activeFilePath, parsed };
}

/**
 * Actively tests connection to the PostgreSQL database using credentials from DATABASE_URL.
 * If connection fails, prints detailed diagnostics, connection details, and specific fix steps.
 */
async function validateDatabaseConnection(rawDbUrl, options = { exitOnError: true, timeoutMs: 5000, silent: false }) {
  const dbUrl = (rawDbUrl || process.env.DATABASE_URL || '').trim();
  const dbInfo = parseDatabaseUrl(dbUrl);

  if (!dbUrl) {
    const errObj = {
      title: 'DATABASE_URL NOT CONFIGURED',
      message: 'No DATABASE_URL was provided or found in the environment.',
      fix: 'Add your PostgreSQL connection string to .env:\n     DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"',
    };
    if (options.exitOnError) {
      renderDbErrorBanner(errObj, dbInfo);
      process.exit(1);
    }
    return { success: false, ...errObj };
  }

  // Load pg client from root or backend directory
  let pg;
  try {
    const pgPath = require.resolve('pg', {
      paths: [rootDir, path.join(rootDir, 'backend')],
    });
    pg = require(pgPath);
  } catch {
    // If pg is not installed yet, test TCP socket reachability as fallback
    if (dbInfo && dbInfo.host && dbInfo.port) {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(options.timeoutMs || 4000);
        socket.on('connect', () => {
          socket.destroy();
          resolve({ success: true, fallback: true, ...dbInfo });
        });
        socket.on('timeout', () => {
          socket.destroy();
          const errObj = {
            title: 'DATABASE SERVER NOT REACHABLE (TIMEOUT)',
            message: `Connection to PostgreSQL at ${dbInfo.host}:${dbInfo.port} timed out after ${options.timeoutMs}ms.`,
            fix: getDbFixGuidance('ETIMEDOUT', dbInfo),
          };
          if (options.exitOnError) {
            renderDbErrorBanner(errObj, dbInfo);
            process.exit(1);
          }
          resolve({ success: false, ...errObj });
        });
        socket.on('error', (err) => {
          socket.destroy();
          const errObj = {
            title: 'CANNOT REACH DATABASE SERVER',
            message: `Could not connect to PostgreSQL host at ${dbInfo.host}:${dbInfo.port}: ${err.message}`,
            fix: getDbFixGuidance(err.code || err.message, dbInfo),
          };
          if (options.exitOnError) {
            renderDbErrorBanner(errObj, dbInfo);
            process.exit(1);
          }
          resolve({ success: false, ...errObj });
        });
        socket.connect(parseInt(dbInfo.port, 10), dbInfo.host);
      });
    }
    return { success: true, skipped: true };
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    connectionTimeoutMillis: options.timeoutMs || 5000,
  });

  try {
    await client.connect();
    const queryRes = await client.query('SELECT 1 AS ok, current_database() AS db, current_user AS "user"');
    await client.end();

    const activeDb = queryRes.rows[0]?.db || dbInfo?.database || 'postgres';
    const activeUser = queryRes.rows[0]?.user || dbInfo?.username || 'postgres';

    if (!options.silent) {
      console.log(`[DB] Database connection verified successfully (${activeUser}@${dbInfo?.host || 'localhost'}:${dbInfo?.port || '5432'}/${activeDb}).`);
    }

    return {
      success: true,
      database: activeDb,
      user: activeUser,
      host: dbInfo?.host,
      port: dbInfo?.port,
    };
  } catch (err) {
    try {
      await client.end();
    } catch {}

    const errCode = err.code || '';
    const errMsg = err.message || '';

    const fixGuidance = getDbFixGuidance(errCode, dbInfo, errMsg);

    const errorDetails = {
      title: getDbErrorTitle(errCode, errMsg),
      message: errMsg,
      code: errCode,
      fix: fixGuidance,
    };

    if (options.exitOnError) {
      renderDbErrorBanner(errorDetails, dbInfo);
      process.exit(1);
    }
    return { success: false, ...errorDetails };
  }
}

function getDbErrorTitle(code, message = '') {
  if (code === 'ECONNREFUSED' || message.includes('ECONNREFUSED')) {
    return 'DATABASE SERVER IS NOT RUNNING (CONNECTION REFUSED)';
  }
  if (code === '28P01' || message.includes('password authentication failed')) {
    return 'DATABASE AUTHENTICATION FAILED (INVALID USERNAME OR PASSWORD)';
  }
  if (code === '3D000' || message.includes('does not exist')) {
    return 'DATABASE DOES NOT EXIST ON POSTGRESQL SERVER';
  }
  if (code === 'ENOTFOUND' || message.includes('ENOTFOUND')) {
    return 'DATABASE HOST NOT FOUND (DNS RESOLUTION FAILED)';
  }
  if (code === 'ETIMEDOUT' || message.includes('ETIMEDOUT') || message.includes('timeout')) {
    return 'DATABASE CONNECTION TIMED OUT';
  }
  if (message.includes('SSL') || message.includes('no pg_hba.conf entry')) {
    return 'DATABASE SSL / SECURITY POLICY REJECTED CONNECTION';
  }
  return 'CANNOT CONNECT TO POSTGRESQL DATABASE';
}

function getDbFixGuidance(code, dbInfo, fullMessage = '') {
  const isLocal = !dbInfo?.host || dbInfo.host === 'localhost' || dbInfo.host === '127.0.0.1';
  const dbName = dbInfo?.database || 'postgres';
  const dbUser = dbInfo?.username || 'postgres';

  if (code === 'ECONNREFUSED' || fullMessage.includes('ECONNREFUSED')) {
    if (isLocal) {
      return (
        `Your local PostgreSQL server is not running on port ${dbInfo?.port || 5432}.\n\n` +
        `     ${C.bold}How to start PostgreSQL on your system:${C.reset}\n` +
        `     • ${C.cyan}macOS (Homebrew):${C.reset}  brew services start postgresql@16\n` +
        `     • ${C.cyan}Linux (Ubuntu):${C.reset}     sudo systemctl start postgresql\n` +
        `     • ${C.cyan}Docker Compose:${C.reset}     docker compose up -d postgres\n\n` +
        `     Then verify with: ${C.bold}node start${C.reset}`
      );
    }
    return (
      `PostgreSQL server at ${dbInfo?.host}:${dbInfo?.port} is not accepting connections.\n\n` +
      `     ${C.bold}How to fix:${C.reset}\n` +
      `     1. Check if the remote database is running and port ${dbInfo?.port} is open.\n` +
      `     2. Check your cloud firewall or security group allows inbound connections.`
    );
  }

  if (code === '28P01' || fullMessage.includes('password authentication failed')) {
    return (
      `The password or username for "${dbUser}" is incorrect.\n\n` +
      `     ${C.bold}How to fix:${C.reset}\n` +
      `     1. Open your .env file and check DATABASE_URL.\n` +
      `     2. If your password has special characters (#, @, %, &, ?), URL-encode them:\n` +
      `        Example: password "my#pass" becomes "my%23pass".\n` +
      `     3. Format: DATABASE_URL="postgresql://${dbUser}:YOUR_CORRECT_PASSWORD@${dbInfo?.host}:${dbInfo?.port}/${dbName}?schema=public"`
    );
  }

  if (code === '3D000' || fullMessage.includes('does not exist')) {
    return (
      `PostgreSQL is running, but the database "${dbName}" does not exist yet.\n\n` +
      `     ${C.bold}How to create the database:${C.reset}\n` +
      `     • In terminal: ${C.cyan}createdb ${dbName}${C.reset}\n` +
      `     • Or via psql:  ${C.cyan}psql -U ${dbUser} -c "CREATE DATABASE ${dbName};"${C.reset}\n` +
      `     • Or change the database name in .env to an existing one (e.g. "postgres").`
    );
  }

  if (code === 'ENOTFOUND' || fullMessage.includes('ENOTFOUND')) {
    return (
      `The hostname "${dbInfo?.host}" could not be resolved.\n\n` +
      `     ${C.bold}How to fix:${C.reset}\n` +
      `     1. Check for typos in your DATABASE_URL in .env.\n` +
      `     2. Check your internet connection if using Supabase, Neon, or cloud database.`
    );
  }

  if (code === 'ETIMEDOUT' || fullMessage.includes('timeout')) {
    return (
      `Connection to ${dbInfo?.host}:${dbInfo?.port} timed out.\n\n` +
      `     ${C.bold}How to fix:${C.reset}\n` +
      `     1. If using a free cloud database (Supabase/Neon), check if the project is PAUSED.\n` +
      `     2. Check your network or firewall rules allow connections to port ${dbInfo?.port}.`
    );
  }

  if (fullMessage.includes('SSL') || fullMessage.includes('no pg_hba.conf')) {
    return (
      `The database server requires an encrypted SSL connection.\n\n` +
      `     ${C.bold}How to fix:${C.reset}\n` +
      `     Append "?sslmode=require" to your DATABASE_URL in .env:\n` +
      `     DATABASE_URL="postgresql://${dbUser}:password@${dbInfo?.host}:${dbInfo?.port}/${dbName}?sslmode=require"`
    );
  }

  return (
    `Verify your DATABASE_URL credentials in .env:\n` +
    `     DATABASE_URL="postgresql://${dbUser}:password@${dbInfo?.host || 'localhost'}:${dbInfo?.port || 5432}/${dbName}?schema=public"`
  );
}

function renderErrorBanner({ title, activeFilePath, errors }) {
  console.error(`\n${C.red}${C.bold}================================================================================${C.reset}`);
  console.error(`${C.red}${C.bold}  CRITICAL STARTUP ERROR: ${title}${C.reset}`);
  console.error(`${C.red}${C.bold}================================================================================${C.reset}\n`);

  console.error(`  ${C.yellow}StoreForge stopped before launching because the environment configuration is invalid.${C.reset}\n`);

  errors.forEach((err, idx) => {
    console.error(`  ${C.red}${C.bold}[${idx + 1}] ${err.field}:${C.reset} ${err.issue}`);
    console.error(`      ${C.bold}Fix:${C.reset} ${C.cyan}${err.fix}${C.reset}\n`);
  });

  if (activeFilePath) {
    console.error(`  ${C.gray}Config file location:${C.reset} ${C.bold}${activeFilePath}${C.reset}`);
  }
  console.error(`  ${C.gray}After resolving the issue, run:${C.reset}   ${C.gold}${C.bold}node start${C.reset}\n`);
  console.error(`${C.red}${C.bold}================================================================================${C.reset}\n`);
}

function renderDbErrorBanner(errDetails, dbInfo) {
  console.error(`\n${C.red}${C.bold}================================================================================${C.reset}`);
  console.error(`${C.red}${C.bold}  CRITICAL STARTUP ERROR: ${errDetails.title}${C.reset}`);
  console.error(`${C.red}${C.bold}================================================================================${C.reset}\n`);

  console.error(`  ${C.yellow}StoreForge stopped before launching because it cannot connect to PostgreSQL.${C.reset}\n`);

  if (dbInfo) {
    console.error(`  ${C.bold}[Configured Database Details]:${C.reset}`);
    console.error(`  • ${C.gray}Host:${C.reset}     ${C.cyan}${dbInfo.host}:${dbInfo.port}${C.reset}`);
    console.error(`  • ${C.gray}Database:${C.reset} ${C.bold}${dbInfo.database || '(default)'}${C.reset}`);
    console.error(`  • ${C.gray}User:${C.reset}     ${C.bold}${dbInfo.username || '(none)'}${C.reset}`);
    console.error(`  • ${C.gray}Password:${C.reset} ${dbInfo.hasPassword ? `${C.green}[configured]${C.reset}` : `${C.red}[none]${C.reset}`}`);
    if (dbInfo.ssl) {
      console.error(`  • ${C.gray}SSL Mode:${C.reset} ${C.cyan}${dbInfo.ssl}${C.reset}`);
    }
    console.error();
  }

  console.error(`  ${C.bold}[Database Response]:${C.reset}`);
  console.error(`  ${C.red}${errDetails.message}${C.reset}\n`);

  console.error(`  ${C.bold}[Actionable Fix]:${C.reset}`);
  const fixLines = errDetails.fix.split('\n');
  fixLines.forEach((line) => {
    console.error(`  ${line}`);
  });

  console.error(`\n  ${C.gray}Config file:${C.reset} ${C.bold}${path.join(rootDir, '.env')}${C.reset}`);
  console.error(`  ${C.gray}After verifying your database, restart with:${C.reset} ${C.gold}${C.bold}node start${C.reset}\n`);
  console.error(`${C.red}${C.bold}================================================================================${C.reset}\n`);
}

module.exports = {
  validateEnvFile,
  validateDatabaseConnection,
  parseEnvString,
  parseDatabaseUrl,
};
