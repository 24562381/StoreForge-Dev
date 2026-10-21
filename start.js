#!/usr/bin/env node

/**
 * StoreForge Platform — Production Launcher
 *
 * Runs all StoreForge microservices in the background (detached daemon mode)
 * by default, allowing the terminal session to close while the services stay alive.
 *
 * Supports:
 * - node start                  (Runs detached in background, terminal is free)
 * - node start --foreground     (Runs attached in current terminal)
 * - node start -f               (Short flag for foreground mode)
 * - node start --backend-only   (Runs backend only)
 * - node start --frontend-only  (Runs storefront only)
 * - node start --admin-only     (Runs admin portal only)
 * - node stop                   (Stops all background services and frees ports)
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn, execSync } = require('child_process');
const { validateEnvFile, validateDatabaseConnection } = require('./scripts/validate-env');

const rootDir = __dirname;

// 0. Proper environment check: Ensure valid .env exists before anything else runs
validateEnvFile({ exitOnError: true });

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  gold: '\x1b[38;5;214m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

/**
 * Single Central .env Loader
 */
function loadEnvFiles() {
  const rootEnvFiles = [
    path.join(rootDir, '.env.local'),
    path.join(rootDir, '.env'),
  ];

  for (const envPath of rootEnvFiles) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
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
          if (key && (process.env[key] === undefined || process.env[key] === '')) {
            process.env[key] = val;
          }
        }
      } catch {}
    }
  }

  // Ensure a cryptographically secure 256-bit JWT_SECRET is configured
  const insecureDefaults = [
    'storeforge_super_secure_jwt_secret_change_in_production_2026',
    'default_jwt_secret',
    'supersecretjwtkey',
    'changeme',
  ];
  if (!process.env.JWT_SECRET || insecureDefaults.includes(process.env.JWT_SECRET.trim())) {
    try {
      const crypto = require('crypto');
      const generatedSecret = crypto.randomBytes(32).toString('hex');
      process.env.JWT_SECRET = generatedSecret;
      const envFile = path.join(rootDir, '.env');
      if (fs.existsSync(envFile)) {
        let content = fs.readFileSync(envFile, 'utf8');
        if (content.includes('JWT_SECRET=')) {
          content = content.replace(/JWT_SECRET=["']?[^"'\n\r]+["']?/, `JWT_SECRET="${generatedSecret}"`);
        } else {
          content += `\nJWT_SECRET="${generatedSecret}"\n`;
        }
        fs.writeFileSync(envFile, content, 'utf8');
      }
    } catch {}
  }
}

loadEnvFiles();

/**
 * Check if a PID is alive
 */
function isPidAlive(pid) {
  if (!pid || isNaN(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a port is currently open
 */
function isPortAvailable(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

const args = process.argv.slice(2);
const isDaemonChild = args.includes('--daemon-child');
const isForeground =
  args.includes('--foreground') ||
  args.includes('-f') ||
  args.includes('--fg') ||
  process.env.FOREGROUND === 'true' ||
  process.env.pm_id !== undefined ||
  process.env.PM2_HOME !== undefined ||
  process.env.PASSENGER_APP_ENV !== undefined;

const pidFilePath = path.join(rootDir, '.pids.json');

// If checking from terminal (not daemon child and not foreground), verify if already running
if (!isDaemonChild && !isForeground) {
  if (fs.existsSync(pidFilePath)) {
    try {
      const savedPids = JSON.parse(fs.readFileSync(pidFilePath, 'utf8'));
      const supervisorAlive = isPidAlive(savedPids?.supervisor);
      const backendAlive = isPidAlive(savedPids?.services?.backend?.pid);
      const frontendAlive = isPidAlive(savedPids?.services?.frontend?.pid);
      const adminAlive = isPidAlive(savedPids?.services?.admin?.pid);

      if (supervisorAlive || backendAlive || frontendAlive || adminAlive) {
        const port = process.env.PORT || '3000';
        const adminPort = process.env.ADMIN_PORT || '4000';
        const backendPort = process.env.BACKEND_PORT || '8585';
        const isBackend = args.includes('--backend-only') || args.includes('--backend');
        const isFrontend = args.includes('--frontend-only') || args.includes('--frontend');
        const isAdmin = args.includes('--admin-only') || args.includes('--admin');
        const isTargeted = isBackend || isFrontend || isAdmin;

        const displayFrontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_STORE_URL || `http://localhost:${port}`;
        const displayAdmin = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || `http://localhost:${adminPort}`;
        const displayBackend = process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${backendPort}`;

        console.log(`\n${C.yellow}[NOTICE] StoreForge is already running!${C.reset}`);
        if (!isTargeted || isFrontend) console.log(`  ${C.bold}• Customer Storefront:${C.reset}   ${C.cyan}${displayFrontend}${C.reset}`);
        if (!isTargeted || isAdmin) console.log(`  ${C.bold}• Dedicated Admin Portal:${C.reset} ${C.magenta}${displayAdmin}${C.reset}`);
        if (!isTargeted || isBackend) console.log(`  ${C.bold}• Backend REST API:${C.reset}      ${C.cyan}${displayBackend.replace(/\/+$/, '')}/api${C.reset}`);
        console.log(`\n  ${C.gray}• Real-time logs:${C.reset}  ${C.cyan}tail -f logs/server.log${C.reset}`);
        console.log(`  ${C.gray}• Stop server:${C.reset}     ${C.bold}node stop${C.reset}\n`);
        process.exit(0);
      }
    } catch {}
  }
}

/**
 * Automatically configure swap space on Linux VPS if running with root/sudo and swap < 1GB.
 * Prevents the Linux Out-Of-Memory (OOM) killer from terminating `npm install` or microservices.
 */
function checkAndConfigureLinuxSwap() {
  if (process.platform !== 'linux') return;
  try {
    let swapTotalKb = 0;
    if (fs.existsSync('/proc/meminfo')) {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const swapMatch = meminfo.match(/SwapTotal:\s+(\d+)\s+kB/i);
      if (swapMatch) {
        swapTotalKb = parseInt(swapMatch[1], 10);
      }
    }

    if (swapTotalKb < 512 * 1024) {
      const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
      if (isRoot) {
        console.log(`\n${C.yellow}[NOTICE] Low memory environment detected (${Math.round(swapTotalKb / 1024)}MB Swap).${C.reset}`);
        console.log(`${C.cyan}[INFO] Automatically provisioning a 2GB swapfile to prevent OOM killer crashes...${C.reset}`);
        try {
          const swapFile = '/swapfile';
          if (!fs.existsSync(swapFile)) {
            try {
              execSync('fallocate -l 2G /swapfile', { stdio: 'ignore' });
            } catch {
              execSync('dd if=/dev/zero of=/swapfile bs=1M count=2048', { stdio: 'ignore' });
            }
            execSync('chmod 600 /swapfile', { stdio: 'ignore' });
            execSync('mkswap /swapfile', { stdio: 'ignore' });
          }
          execSync('swapon /swapfile 2>/dev/null || true', { stdio: 'ignore' });

          try {
            if (fs.existsSync('/etc/fstab')) {
              const fstab = fs.readFileSync('/etc/fstab', 'utf8');
              if (!fstab.includes('/swapfile')) {
                fs.appendFileSync('/etc/fstab', '\n/swapfile none swap sw 0 0\n');
              }
            }
          } catch {}

          console.log(`${C.green}[SUCCESS] 2GB swap space successfully activated.${C.reset}\n`);
        } catch (swapErr) {
          console.warn(`${C.yellow}[WARN] Could not automatically create swapfile: ${swapErr.message}${C.reset}`);
        }
      } else {
        console.warn(`\n${C.yellow}[NOTICE] Low memory detected without swap space (${Math.round(swapTotalKb / 1024)}MB Swap).${C.reset}`);
        console.warn(`   ${C.bold}If npm gets Killed by Linux OOM, run:${C.reset}`);
        console.warn(`   ${C.cyan}sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile${C.reset}\n`);
      }
    }
  } catch {}
}

function checkMissingDependencies() {
  const hasRootModules = fs.existsSync(path.join(rootDir, 'node_modules'));
  const hasNest =
    fs.existsSync(path.join(rootDir, 'backend', 'node_modules', '@nestjs', 'core')) ||
    fs.existsSync(path.join(rootDir, 'node_modules', '@nestjs', 'core'));
  const hasNext =
    fs.existsSync(path.join(rootDir, 'frontend', 'node_modules', 'next')) ||
    fs.existsSync(path.join(rootDir, 'node_modules', 'next'));
  const hasPrisma =
    fs.existsSync(path.join(rootDir, 'backend', 'node_modules', '@prisma', 'client')) ||
    fs.existsSync(path.join(rootDir, 'node_modules', '@prisma', 'client'));

  return {
    missing: !hasRootModules || !hasNest || !hasNext || !hasPrisma,
    hasRootModules,
    hasNest,
    hasNext,
    hasPrisma,
  };
}

/**
 * Ensure microservice production builds exist before starting
 */
function ensureBuildsExist(isBackend, isFrontend, isAdmin) {
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'frontend');
  const adminDir = path.join(rootDir, 'admin');

  const backendBuilt =
    fs.existsSync(path.join(backendDir, 'dist', 'src', 'main.js')) ||
    fs.existsSync(path.join(backendDir, 'dist', 'main.js'));
  const frontendBuilt = fs.existsSync(path.join(frontendDir, '.next'));
  const adminBuilt = fs.existsSync(path.join(adminDir, '.next'));

  if (!isFrontend && !isAdmin && !backendBuilt) {
    console.log(`${C.cyan}[BUILD] Backend build missing. Compiling NestJS Backend (nest build)...${C.reset}`);
    try {
      execSync('npm run build --workspace=backend', { cwd: rootDir, stdio: 'inherit' });
      console.log(`${C.green}[SUCCESS] Backend compiled successfully.${C.reset}\n`);
    } catch (err) {
      console.error(`${C.red}[ERROR] Backend build failed: ${err.message}${C.reset}`);
    }
  }

  if (!isBackend && !isAdmin && !frontendBuilt) {
    console.log(`${C.cyan}[BUILD] Storefront build missing. Compiling Next.js Storefront (next build)...${C.reset}`);
    try {
      execSync('npm run build --workspace=frontend', { cwd: rootDir, stdio: 'inherit' });
      console.log(`${C.green}[SUCCESS] Storefront compiled successfully.${C.reset}\n`);
    } catch (err) {
      console.error(`${C.red}[ERROR] Storefront build failed: ${err.message}${C.reset}`);
    }
  }

  if (!isBackend && !isFrontend && !adminBuilt) {
    console.log(`${C.cyan}[BUILD] Admin portal build missing. Compiling Next.js Admin Portal (next build)...${C.reset}`);
    try {
      execSync('npm run build --workspace=admin', { cwd: rootDir, stdio: 'inherit' });
      console.log(`${C.green}[SUCCESS] Admin portal compiled successfully.${C.reset}\n`);
    } catch (err) {
      console.error(`${C.red}[ERROR] Admin build failed: ${err.message}${C.reset}`);
    }
  }
}

// 1. Check swap and dependencies
checkAndConfigureLinuxSwap();

let depStatus = checkMissingDependencies();

if (depStatus.missing) {
  console.log(`\n${C.gold}${C.bold}[INSTALL] Missing dependencies detected. Automatically installing with memory optimizations...${C.reset}\n`);
  let installSuccess = false;

  // Attempt 1: Production dependencies with concurrency limit to reduce RAM footprint
  try {
    execSync('npm install --omit=dev --no-audit --no-fund --maxsockets=2', { cwd: rootDir, stdio: 'inherit' });
    depStatus = checkMissingDependencies();
    if (!depStatus.missing) installSuccess = true;
  } catch (err) {
    console.warn(`\n${C.yellow}[WARN] Concurrency-limited install encountered an issue. Retrying with ultra-low memory mode...${C.reset}\n`);
  }

  // Attempt 2: Ultra low-memory single-thread mode
  if (!installSuccess) {
    try {
      execSync('npm install --omit=dev --prefer-offline --no-audit --no-fund --maxsockets=1', { cwd: rootDir, stdio: 'inherit' });
      depStatus = checkMissingDependencies();
      if (!depStatus.missing) installSuccess = true;
    } catch (err2) {
      console.warn(`\n${C.yellow}[WARN] Retrying with standard npm install (--no-audit --no-fund --maxsockets=2)...${C.reset}\n`);
      try {
        execSync('npm install --no-audit --no-fund --maxsockets=2', { cwd: rootDir, stdio: 'inherit' });
        depStatus = checkMissingDependencies();
        if (!depStatus.missing) installSuccess = true;
      } catch (err3) {
        console.error(`\n${C.red}[ERROR] Failed to auto-install dependencies:${C.reset}`, err3.message);
      }
    }
  }

  // Final check: Abort startup if dependencies are still missing! DO NOT falsely report success!
  depStatus = checkMissingDependencies();
  if (depStatus.missing) {
    console.error(`\n${C.red}${C.bold}================================================================================${C.reset}`);
    console.error(`${C.red}${C.bold}  CRITICAL: DEPENDENCY INSTALLATION FAILED (OOM KILLED)${C.reset}`);
    console.error(`${C.red}${C.bold}================================================================================${C.reset}`);
    console.error(`\n${C.yellow}Your server does not have enough free RAM to complete 'npm install' without swap.${C.reset}`);
    console.error(`The Linux Out-Of-Memory (OOM) killer terminated the npm process.\n`);
    console.error(`${C.bold}Quick Fix (run these commands in your Ubuntu VPS terminal):${C.reset}`);
    console.error(`  ${C.cyan}sudo fallocate -l 2G /swapfile${C.reset}`);
    console.error(`  ${C.cyan}sudo chmod 600 /swapfile${C.reset}`);
    console.error(`  ${C.cyan}sudo mkswap /swapfile${C.reset}`);
    console.error(`  ${C.cyan}sudo swapon /swapfile${C.reset}`);
    console.error(`  ${C.cyan}echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab${C.reset}`);
    console.error(`  ${C.cyan}npm install --omit=dev --no-audit --no-fund --maxsockets=2${C.reset}`);
    console.error(`  ${C.cyan}sudo node start${C.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${C.green}[SUCCESS] Dependencies successfully installed and verified.${C.reset}\n`);
  }
}

// Ensure Prisma client is generated
const prismaSchemaPath = [
  path.join(rootDir, 'backend', 'prisma', 'schema.prisma'),
  path.join(rootDir, 'prisma', 'schema.prisma'),
].find((p) => fs.existsSync(p));

const prismaClientGenerated =
  fs.existsSync(path.join(rootDir, 'node_modules', '.prisma', 'client', 'index.js')) ||
  fs.existsSync(path.join(rootDir, 'backend', 'node_modules', '.prisma', 'client', 'index.js'));

if (prismaSchemaPath && !prismaClientGenerated) {
  console.log(`${C.gold}[INIT] Generating Prisma ORM client artifacts...${C.reset}`);
  try {
    execSync(`npx prisma generate --schema="${prismaSchemaPath}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log(`${C.green}[SUCCESS] Prisma client generated successfully.${C.reset}\n`);
  } catch (err) {
    console.error(`${C.red}[ERROR] Prisma generate failed:${C.reset}`, err.message);
  }
}

(async function launch() {
  const isBackendOnly = args.includes('--backend-only') || args.includes('--backend');
  const isFrontendOnly = args.includes('--frontend-only') || args.includes('--frontend');
  const isAdminOnly = args.includes('--admin-only') || args.includes('--admin');

  // Verify database connection before building or launching services
  if (!isFrontendOnly && !isAdminOnly) {
    await validateDatabaseConnection(process.env.DATABASE_URL, { exitOnError: true });
  }

  // 2. Ensure builds exist before launching
  ensureBuildsExist(isBackendOnly, isFrontendOnly, isAdminOnly);

  // If this is the background child process or foreground execution requested, hand off to start-server.js
  if (isDaemonChild || isForeground) {
    // Strip --daemon-child so child script gets pristine arguments
    process.argv = process.argv.filter((arg) => arg !== '--daemon-child');
    require('./scripts/start-server.js');
  } else {
    // Background daemon launcher
    (async function launchBackgroundDaemon() {
      const port = process.env.PORT || '3000';
      const adminPort = process.env.ADMIN_PORT || '4000';
      const backendPort = process.env.BACKEND_PORT || '8585';

      const isTargeted = isBackendOnly || isFrontendOnly || isAdminOnly;

    // 1. Verify & synchronize database schema safely before daemonizing
    if (!isAdminOnly && !isFrontendOnly) {
      try {
        const { syncDatabaseSchema } = require('./scripts/db-sync');
        await syncDatabaseSchema({ force: false });
      } catch (dbErr) {
        console.warn(`\n${C.yellow}[WARN] Database verification notice: ${dbErr.message}${C.reset}\n`);
      }
    }

    // 2. Ensure logs directory exists
    const logsDir = path.join(rootDir, 'logs');
    if (!fs.existsSync(logsDir)) {
      try {
        fs.mkdirSync(logsDir, { recursive: true });
      } catch {}
    }

    const logFile = path.join(logsDir, 'server.log');
    const logFd = fs.openSync(logFile, 'a');

    // 3. Spawn background supervisor process completely detached
    const child = spawn(
      process.execPath,
      [path.join(rootDir, 'start.js'), '--daemon-child', ...args],
      {
        cwd: rootDir,
        detached: true,
        stdio: ['ignore', logFd, logFd],
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' },
      }
    );

    // Write initial PID file so `node stop` knows about this process immediately
    try {
      fs.writeFileSync(
        pidFilePath,
        JSON.stringify(
          {
            supervisor: child.pid,
            startedAt: new Date().toISOString(),
            mode: isTargeted ? 'single-service' : 'cluster',
          },
          null,
          2
        )
      );
    } catch {}

    fs.closeSync(logFd);
    child.unref();

    // 4. Verify that background supervisor remains healthy and does not crash on startup
    for (let check = 0; check < 5; check++) {
      await new Promise((r) => setTimeout(r, 600));
      if (!isPidAlive(child.pid)) {
        console.error(`\n${C.red}[FATAL] Server process crashed immediately after launching.${C.reset}`);
        console.error(`  ${C.yellow}Check logs/server.log for details:${C.reset}\n`);
        try {
          const errorContent = fs.readFileSync(logFile, 'utf8');
          const lines = errorContent.trim().split('\n');
          console.error(lines.slice(-20).join('\n'));
        } catch {}
        process.exit(1);
      }
    }

    const displayFrontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_STORE_URL || `http://localhost:${port}`;
    const displayAdmin = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || `http://localhost:${adminPort}`;
    const displayBackend = process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${backendPort}`;

    console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE PLATFORM — BACKGROUND SERVER RUNNING                        ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}

  ${C.green}[OK] Server successfully launched in the background (PID: ${child.pid}).${C.reset}
  ${C.gray}Your terminal session is free. You can safely close this terminal window.${C.reset}
`);

    if (!isTargeted || isFrontendOnly) {
      console.log(`  ${C.bold}• Customer Storefront:${C.reset}   ${C.cyan}${displayFrontend}${C.reset}`);
    }
    if (!isTargeted || isAdminOnly) {
      console.log(`  ${C.bold}• Dedicated Admin Portal:${C.reset} ${C.magenta}${displayAdmin}${C.reset}`);
    }
    if (!isTargeted || isBackendOnly) {
      console.log(`  ${C.bold}• Backend REST API:${C.reset}      ${C.cyan}${displayBackend.replace(/\/+$/, '')}/api${C.reset}`);
    }

    console.log(`
  ${C.bold}Log File:${C.reset}        ${C.cyan}tail -f logs/server.log${C.reset}
  ${C.bold}Stop Command:${C.reset}    ${C.yellow}${C.bold}node stop${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);
    process.exit(0);
    })();
  }
})();
