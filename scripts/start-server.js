#!/usr/bin/env node

/**
 * StoreForge Engine — Production Bootstrapper & Lifecycle Manager
 *
 * Launches 3 independent micro-services:
 * - NestJS REST API Backend (port 8585 / $BACKEND_PORT)
 * - Next.js Storefront (port 3000 / $PORT)
 * - Next.js Admin Portal (port 4000 / $ADMIN_PORT)
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const readline = require('readline');
const { spawn, execSync } = require('child_process');
const { validateEnvFile, validateDatabaseConnection } = require('./validate-env');

const rootDir = path.resolve(__dirname, '..');

// Ensure valid .env exists before booting microservices
validateEnvFile({ exitOnError: true });

/**
 * Single Central .env Loader — reads ONLY from the project root
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

// Load root and workspace .env files immediately
loadEnvFiles();

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

const pidFilePath = path.join(rootDir, '.pids.json');

function saveClusterPids(services) {
  try {
    const data = {
      supervisor: process.pid,
      startedAt: new Date().toISOString(),
      services,
    };
    fs.writeFileSync(pidFilePath, JSON.stringify(data, null, 2));
  } catch {}
}

function removePidFile() {
  try {
    if (fs.existsSync(pidFilePath)) fs.unlinkSync(pidFilePath);
  } catch {}
}

/**
 * Check if a port is currently available
 */
function isPortAvailable(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => {
        resolve(false);
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

/**
 * Find PIDs occupying a port
 */
function getPidsForPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && parseInt(pid, 10) > 0) pids.add(parseInt(pid, 10));
      }
      return Array.from(pids);
    } else {
      try {
        const output = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: 'utf8' });
        const pids = output
          .trim()
          .split('\n')
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !isNaN(p) && p !== process.pid);
        if (pids.length > 0) return pids;
      } catch {}

      try {
        const output = execSync(`fuser ${port}/tcp 2>/dev/null`, { encoding: 'utf8' });
        const pids = output
          .trim()
          .split(/\s+/)
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !isNaN(p) && p !== process.pid);
        if (pids.length > 0) return pids;
      } catch {}

      return [];
    }
  } catch {
    return [];
  }
}

/**
 * Terminate a process by PID
 */
function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Ask user confirmation in interactive terminal
 */
function askUserPermission(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      return resolve(true);
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      const ans = (answer || '').trim().toLowerCase();
      resolve(ans === '' || ans.startsWith('y'));
    });
  });
}

/**
 * Ensure ports are free, asking user permission if conflicting processes exist
 */
async function ensurePortsAvailable(ports, autoKill = false) {
  const occupiedPorts = [];

  for (const port of ports) {
    const isFree = await isPortAvailable(port);
    if (!isFree) {
      const pids = getPidsForPort(port);
      occupiedPorts.push({ port, pids });
    }
  }

  if (occupiedPorts.length === 0) return true;

  if (!autoKill) {
    console.log(`\n${C.gold}${C.bold}[PORT CONFLICT DETECTED]${C.reset}`);
    for (const item of occupiedPorts) {
      const pidStr = item.pids.length > 0 ? ` (PID: ${item.pids.join(', ')})` : '';
      console.log(`  ${C.red}• Port ${item.port} is already in use by another process${pidStr}${C.reset}`);
    }

    const promptText = `\n${C.cyan}?${C.reset} ${C.bold}Would you like to terminate the conflicting process(es) and free the port(s)?${C.reset} ${C.gray}(Y/n)${C.reset}: `;
    const shouldKill = await askUserPermission(promptText);

    if (!shouldKill) {
      console.log(
        `\n${C.yellow}Startup aborted by user. Please free ports ${ports.join(', ')} or configure alternative PORTs.${C.reset}\n`
      );
      process.exit(1);
    }
  }

  console.log(`${C.gold}[INFO] Freeing port(s) ${occupiedPorts.map((o) => o.port).join(', ')}...${C.reset}`);
  for (const item of occupiedPorts) {
    for (const pid of item.pids) {
      killPid(pid);
    }
  }

  await new Promise((r) => setTimeout(r, 600));

  for (const port of ports) {
    const isFree = await isPortAvailable(port);
    if (!isFree && process.platform !== 'win32') {
      try {
        execSync(`kill -9 $(lsof -t -i:${port}) 2>/dev/null || true`, { stdio: 'ignore' });
      } catch {}
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  console.log(`${C.green}[SUCCESS] Ports successfully freed.${C.reset}\n`);
  return true;
}

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
  const rootNodeModules = fs.existsSync(path.join(rootDir, 'node_modules'));
  const backendInstalled =
    fs.existsSync(path.join(rootDir, 'node_modules', '@nestjs', 'core')) ||
    fs.existsSync(path.join(rootDir, 'backend', 'node_modules', '@nestjs', 'core'));
  const nextInstalled =
    fs.existsSync(path.join(rootDir, 'node_modules', 'next')) ||
    fs.existsSync(path.join(rootDir, 'frontend', 'node_modules', 'next'));
  const prismaInstalled =
    fs.existsSync(path.join(rootDir, 'node_modules', '@prisma', 'client')) ||
    fs.existsSync(path.join(rootDir, 'backend', 'node_modules', '@prisma', 'client'));

  return !rootNodeModules || !backendInstalled || !nextInstalled || !prismaInstalled;
}

function ensureDependenciesInstalled() {
  checkAndConfigureLinuxSwap();

  if (checkMissingDependencies()) {
    console.log(
      `\n${C.gold}${C.bold}[INSTALL] Missing production dependencies detected. Automatically installing with memory optimizations...${C.reset}`
    );
    let installSuccess = false;

    try {
      execSync('npm install --omit=dev --no-audit --no-fund --maxsockets=2', { cwd: rootDir, stdio: 'inherit' });
      if (!checkMissingDependencies()) installSuccess = true;
    } catch (err) {
      console.warn(
        `\n${C.yellow}[WARN] Concurrency-limited install failed. Retrying with ultra-low memory mode...${C.reset}`
      );
    }

    if (!installSuccess) {
      try {
        execSync('npm install --omit=dev --prefer-offline --no-audit --no-fund --maxsockets=1', { cwd: rootDir, stdio: 'inherit' });
        if (!checkMissingDependencies()) installSuccess = true;
      } catch (err2) {
        console.warn(`\n${C.yellow}[WARN] Retrying with standard npm install (--no-audit --no-fund --maxsockets=2)...${C.reset}`);
        try {
          execSync('npm install --no-audit --no-fund --maxsockets=2', { cwd: rootDir, stdio: 'inherit' });
          if (!checkMissingDependencies()) installSuccess = true;
        } catch (err3) {
          console.error(`\n${C.red}[ERROR] Failed to auto-install dependencies: ${err3.message}${C.reset}\n`);
        }
      }
    }

    if (checkMissingDependencies()) {
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
      console.log(`${C.green}[SUCCESS] Production dependencies successfully installed and verified.${C.reset}\n`);
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

function ensurePostgresStartedIfDocker() {
  try {
    const isDocker = execSync('command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || true', { encoding: 'utf8' }).trim() === 'yes';
    if (isDocker && fs.existsSync(path.join(rootDir, 'docker-compose.yml'))) {
      const isRunning = execSync("docker inspect --format='{{.State.Running}}' postgres-test 2>/dev/null || true", { encoding: 'utf8' }).trim() === 'true';
      if (!isRunning) {
        console.log(`${C.cyan}[DOCKER] Docker detected. Starting containerized PostgreSQL database (postgres-test)...${C.reset}`);
        execSync('docker compose up -d postgres', { cwd: rootDir, stdio: 'ignore' });
      }
    }
  } catch {}
}

/**
 * Automatically synchronize database schema if DATABASE_URL is configured.
 * Uses StoreForge Database Schema Guard (scripts/db-sync.js):
 * 1. Schema Matches: Skips table setup completely.
 * 2. Safe Updates: Adds new tables/columns without altering or removing existing data.
 * 3. Destructive Changes: Halts startup, asks user to backup database first and run npm run db:merge.
 */
async function ensureDatabaseSchemaSynced() {
  loadEnvFiles();
  ensurePostgresStartedIfDocker();

  try {
    const { syncDatabaseSchema } = require('./db-sync');
    await syncDatabaseSchema({ force: false });
  } catch (err) {
    console.warn(
      `\n${C.yellow}[WARN] Database auto-sync notice: ${err.message}${C.reset}\n`
    );
  }
}

function resolveNextCommand(appDir, port) {
  const nextCliJs = [
    path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
  ].find((p) => fs.existsSync(p));

  const isWin = process.platform === 'win32';
  const nextBin = [
    path.join(rootDir, 'node_modules', '.bin', isWin ? 'next.cmd' : 'next'),
    path.join(appDir, 'node_modules', '.bin', isWin ? 'next.cmd' : 'next'),
  ].find((p) => fs.existsSync(p));

  if (nextCliJs) {
    return { cmd: 'node', args: [nextCliJs, 'start', '-p', port] };
  } else if (nextBin) {
    return { cmd: nextBin, args: ['start', '-p', port] };
  } else {
    return { cmd: 'npx', args: ['next', 'start', '-p', port] };
  }
}

/**
 * Start the fullstack production cluster (or a single isolated microservice if flagged)
 */
async function startProductionCluster() {
  const args = process.argv.slice(2);
  const isBackend = args.includes('--backend-only') || args.includes('--backend') || process.env.RUN_SERVICE === 'backend' || process.env.SERVICE === 'backend';
  const isFrontend = args.includes('--frontend-only') || args.includes('--frontend') || process.env.RUN_SERVICE === 'frontend' || process.env.SERVICE === 'frontend';
  const isAdmin = args.includes('--admin-only') || args.includes('--admin') || process.env.RUN_SERVICE === 'admin' || process.env.SERVICE === 'admin';

  // 1. Ensure node_modules and Prisma client exist
  ensureDependenciesInstalled();

  // 2. Verify active database connection before compiling or launching
  if (!isFrontend && !isAdmin) {
    await validateDatabaseConnection(process.env.DATABASE_URL, { exitOnError: true });
  }

  // 3. Ensure microservices are compiled
  ensureBuildsExist(isBackend, isFrontend, isAdmin);

  const port = process.env.PORT || '3000';
  const adminPort = process.env.ADMIN_PORT || '4000';
  const backendPort = process.env.BACKEND_PORT || '8585';

  const backendDir = path.join(rootDir, 'backend');
  const backendEntry = fs.existsSync(path.join(backendDir, 'dist', 'src', 'main.js'))
    ? path.join('dist', 'src', 'main.js')
    : path.join('dist', 'main.js');

  const frontendDir = path.join(rootDir, 'frontend');
  const adminDir = path.join(rootDir, 'admin');

  // Multi-server mode: Backend Only
  if (isBackend) {
    await ensureDatabaseSchemaSynced();
    await ensurePortsAvailable([parseInt(backendPort, 10)]);

    console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE BACKEND API SERVICE RUNNING                                 ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);
    const displayBackend = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || `http://localhost:${backendPort}`;
    console.log(`  ${C.bold}• Backend REST API:${C.reset}     ${C.cyan}${displayBackend.replace(/\/+$/, '')}/api${C.reset}`);
    console.log(`  ${C.bold}• Public Uploads Dir:${C.reset}   ${C.cyan}${displayBackend.replace(/\/+$/, '')}/uploads/${C.reset}\n`);

    const backendProc = spawn('node', [backendEntry], {
      cwd: backendDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', PORT: backendPort },
    });

    backendProc.on('error', (err) => {
      console.error(`${C.red}[FATAL] Backend Process Error:${C.reset}`, err.message);
    });

    backendProc.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        console.error(`${C.red}[FATAL] Backend process terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
      }
    });

    saveClusterPids({
      backend: { pid: backendProc.pid, port: backendPort },
    });

    const cleanup = () => {
      try { backendProc.kill('SIGTERM'); } catch {}
      removePidFile();
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    return;
  }

  // Multi-server mode: Frontend Storefront Only
  if (isFrontend) {
    await ensurePortsAvailable([parseInt(port, 10)]);

    console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE STOREFRONT SERVICE RUNNING                                  ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);
    const displayFrontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_STORE_URL || `http://localhost:${port}`;
    console.log(`  ${C.bold}• Customer Storefront:${C.reset}  ${C.cyan}${displayFrontend}${C.reset}`);
    console.log(`  ${C.bold}• Connected Backend:${C.reset}    ${C.gold}${process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8585'}${C.reset}\n`);

    const frontendExec = resolveNextCommand(frontendDir, port);
    const frontendProc = spawn(frontendExec.cmd, frontendExec.args, {
      cwd: frontendDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', PORT: port },
    });

    frontendProc.on('error', (err) => {
      console.error(`${C.red}[FATAL] Frontend Storefront Error:${C.reset}`, err.message);
    });

    frontendProc.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        console.error(`${C.red}[FATAL] Frontend Storefront terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
      }
    });

    saveClusterPids({
      frontend: { pid: frontendProc.pid, port: port },
    });

    const cleanup = () => {
      try { frontendProc.kill('SIGTERM'); } catch {}
      removePidFile();
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    return;
  }

  // Multi-server mode: Admin Portal Only
  if (isAdmin) {
    await ensurePortsAvailable([parseInt(adminPort, 10)]);

    console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE ADMIN PORTAL SERVICE RUNNING                                ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);
    const displayAdmin = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || `http://localhost:${adminPort}`;
    console.log(`  ${C.bold}• Admin Portal URL:${C.reset}     ${C.magenta}${displayAdmin}${C.reset}`);
    console.log(`  ${C.bold}• Connected Backend:${C.reset}    ${C.gold}${process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8585'}${C.reset}\n`);

    const adminExec = resolveNextCommand(adminDir, adminPort);
    const adminProc = spawn(adminExec.cmd, adminExec.args, {
      cwd: adminDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', PORT: adminPort },
    });

    adminProc.on('error', (err) => {
      console.error(`${C.red}[FATAL] Admin Portal Error:${C.reset}`, err.message);
    });

    adminProc.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        console.error(`${C.red}[FATAL] Admin Portal terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
      }
    });

    saveClusterPids({
      admin: { pid: adminProc.pid, port: adminPort },
    });

    const cleanup = () => {
      try { adminProc.kill('SIGTERM'); } catch {}
      removePidFile();
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    return;
  }

  // Default: Fullstack Production Cluster (Backend + Storefront + Admin)
  await ensureDatabaseSchemaSynced();

  const portsToCheck = [
    parseInt(port, 10),
    parseInt(adminPort, 10),
    parseInt(backendPort, 10),
  ].filter((p) => !isNaN(p) && p > 0);

  if (portsToCheck.length > 0) {
    await ensurePortsAvailable(portsToCheck);
  }

  console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE PLATFORM — PRODUCTION CLUSTER RUNNING                       ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);

  const displayFrontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_STORE_URL || `http://localhost:${port}`;
  const displayAdmin = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || `http://localhost:${adminPort}`;
  const displayBackend = process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${backendPort}`;

  console.log(`  ${C.bold}• Customer Storefront:${C.reset}   ${C.cyan}${displayFrontend}${C.reset}`);
  console.log(`  ${C.bold}• Dedicated Admin Portal:${C.reset} ${C.magenta}${displayAdmin}${C.reset} ${C.gray}(Initial setup wizard on first launch)${C.reset}`);
  console.log(`  ${C.bold}• Backend REST API:${C.reset}       ${C.cyan}${displayBackend.replace(/\/+$/, '')}/api${C.reset}\n`);

  // 1. Spawn NestJS Backend
  const backendProc = spawn('node', [backendEntry], {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', PORT: backendPort },
  });

  // 2. Spawn Next.js Storefront (Port 3000)
  const frontendExec = resolveNextCommand(frontendDir, port);
  const frontendProc = spawn(frontendExec.cmd, frontendExec.args, {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', PORT: port },
  });

  // 3. Spawn Next.js Admin Portal (Port 4000)
  const adminExec = resolveNextCommand(adminDir, adminPort);
  const adminProc = spawn(adminExec.cmd, adminExec.args, {
    cwd: adminDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', PORT: adminPort },
  });

  backendProc.on('error', (err) => {
    console.error(`${C.red}[FATAL] Backend Process Error:${C.reset}`, err.message);
  });

  backendProc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`${C.red}[FATAL] Backend process terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
    }
  });

  frontendProc.on('error', (err) => {
    console.error(`${C.red}[FATAL] Frontend Storefront Error:${C.reset}`, err.message);
  });

  frontendProc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`${C.red}[FATAL] Frontend Storefront terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
    }
  });

  adminProc.on('error', (err) => {
    console.error(`${C.red}[FATAL] Admin Portal Error:${C.reset}`, err.message);
  });

  adminProc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`${C.red}[FATAL] Admin Portal terminated unexpectedly with exit code ${code} (signal: ${signal})${C.reset}`);
    }
  });

  saveClusterPids({
    backend: { pid: backendProc.pid, port: backendPort },
    frontend: { pid: frontendProc.pid, port: port },
    admin: { pid: adminProc.pid, port: adminPort },
  });

  // Handle process lifecycle & termination
  const cleanup = () => {
    try {
      backendProc.kill('SIGTERM');
    } catch {}
    try {
      frontendProc.kill('SIGTERM');
    } catch {}
    try {
      adminProc.kill('SIGTERM');
    } catch {}
    removePidFile();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startProductionCluster().catch((err) => {
  console.error(`${C.red}[FATAL] Startup Error:${C.reset}`, err);
  process.exit(1);
});
