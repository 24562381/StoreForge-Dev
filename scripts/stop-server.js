#!/usr/bin/env node

/**
 * StoreForge Platform — Production Stop Command & Process Terminator
 *
 * Safely stops all StoreForge microservices:
 * - NestJS REST API Backend (port 8585 / $BACKEND_PORT)
 * - Next.js Storefront (port 3000 / $PORT)
 * - Next.js Admin Portal (port 4000 / $ADMIN_PORT)
 *
 * Supports:
 * - node stop
 * - node stop.js
 * - ./stop
 * - npm run stop
 * - Single service stops: node stop --backend-only, --frontend-only, --admin-only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

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
  } catch (err) {
    return false;
  }
}

/**
 * Find PIDs occupying a port
 */
function getPidsForPort(port) {
  if (!port) return [];
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
      return Array.from(pids).filter((p) => p !== process.pid);
    } else {
      try {
        const output = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: 'utf8' });
        const pids = output
          .trim()
          .split('\n')
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !isNaN(p) && p > 0 && p !== process.pid);
        if (pids.length > 0) return pids;
      } catch {}

      try {
        const output = execSync(`fuser ${port}/tcp 2>/dev/null`, { encoding: 'utf8' });
        const pids = output
          .trim()
          .split(/\s+/)
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !isNaN(p) && p > 0 && p !== process.pid);
        if (pids.length > 0) return pids;
      } catch {}

      return [];
    }
  } catch {
    return [];
  }
}

/**
 * Kill a process by PID (SIGTERM, then SIGKILL fallback)
 */
function killPid(pid, force = false) {
  if (!isPidAlive(pid)) return true;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill ${force ? '/F ' : ''}/PID ${pid}`, { stdio: 'ignore' });
    } else {
      process.kill(pid, force ? 'SIGKILL' : 'SIGTERM');
    }
    return true;
  } catch {
    return false;
  }
}

async function stopCluster() {
  const args = process.argv.slice(2);
  const isBackendOnly = args.includes('--backend-only') || args.includes('--backend');
  const isFrontendOnly = args.includes('--frontend-only') || args.includes('--frontend');
  const isAdminOnly = args.includes('--admin-only') || args.includes('--admin');
  const isTargeted = isBackendOnly || isFrontendOnly || isAdminOnly;

  const port = process.env.PORT || '3000';
  const adminPort = process.env.ADMIN_PORT || '4000';
  const backendPort = process.env.BACKEND_PORT || '8585';

  const pidFilePath = path.join(rootDir, '.pids.json');
  let savedPids = null;
  if (fs.existsSync(pidFilePath)) {
    try {
      savedPids = JSON.parse(fs.readFileSync(pidFilePath, 'utf8'));
    } catch {}
  }

  // Determine which targets to stop
  const pidsToKill = new Set();
  const servicesToReport = [];

  if (!isTargeted || isBackendOnly) {
    const backendPortPids = getPidsForPort(backendPort);
    backendPortPids.forEach((p) => pidsToKill.add(p));
    if (savedPids?.services?.backend?.pid) {
      pidsToKill.add(savedPids.services.backend.pid);
    }
    servicesToReport.push({ name: 'Backend REST API', port: backendPort });
  }

  if (!isTargeted || isFrontendOnly) {
    const frontendPortPids = getPidsForPort(port);
    frontendPortPids.forEach((p) => pidsToKill.add(p));
    if (savedPids?.services?.frontend?.pid) {
      pidsToKill.add(savedPids.services.frontend.pid);
    }
    servicesToReport.push({ name: 'Customer Storefront', port: port });
  }

  if (!isTargeted || isAdminOnly) {
    const adminPortPids = getPidsForPort(adminPort);
    adminPortPids.forEach((p) => pidsToKill.add(p));
    if (savedPids?.services?.admin?.pid) {
      pidsToKill.add(savedPids.services.admin.pid);
    }
    servicesToReport.push({ name: 'Dedicated Admin Portal', port: adminPort });
  }

  // If stopping everything, also terminate the supervisor daemon
  if (!isTargeted && savedPids?.supervisor) {
    pidsToKill.add(savedPids.supervisor);
  }

  // Filter out invalid/dead PIDs
  const activePids = Array.from(pidsToKill).filter((pid) => pid !== process.pid && isPidAlive(pid));

  if (activePids.length === 0) {
    if (!isTargeted) {
      try {
        if (fs.existsSync(pidFilePath)) fs.unlinkSync(pidFilePath);
      } catch {}
    }
    console.log(`\n${C.cyan}[INFO] StoreForge is not currently running.${C.reset}`);
    console.log(`  ${C.gray}Ports ${[port, adminPort, backendPort].join(', ')} are already free.${C.reset}\n`);
    return;
  }

  console.log(`\n${C.yellow}[STOP] Stopping StoreForge services (PIDs: ${activePids.join(', ')})...${C.reset}`);

  // Step 1: Send graceful SIGTERM
  for (const pid of activePids) {
    killPid(pid, false);
  }

  // Step 2: Wait up to 2 seconds for graceful shutdown
  const startWait = Date.now();
  let remainingPids = activePids.filter(isPidAlive);
  while (remainingPids.length > 0 && Date.now() - startWait < 2000) {
    await new Promise((r) => setTimeout(r, 200));
    remainingPids = remainingPids.filter(isPidAlive);
  }

  // Step 3: Force kill any stubborn processes with SIGKILL
  if (remainingPids.length > 0) {
    console.log(`  ${C.yellow}[WARN] Forcefully terminating ${remainingPids.length} remaining process(es)...${C.reset}`);
    for (const pid of remainingPids) {
      killPid(pid, true);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // Update or delete .pids.json
  if (!isTargeted) {
    try {
      if (fs.existsSync(pidFilePath)) fs.unlinkSync(pidFilePath);
    } catch {}
  } else if (savedPids?.services) {
    try {
      if (isBackendOnly && savedPids.services.backend) delete savedPids.services.backend;
      if (isFrontendOnly && savedPids.services.frontend) delete savedPids.services.frontend;
      if (isAdminOnly && savedPids.services.admin) delete savedPids.services.admin;
      fs.writeFileSync(pidFilePath, JSON.stringify(savedPids, null, 2));
    } catch {}
  }

  console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}         STOREFORGE PLATFORM — SERVICES STOPPED                                 ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}
`);
  for (const svc of servicesToReport) {
    console.log(`  ${C.bold}• ${svc.name}:${C.reset}  ${C.green}Stopped${C.reset} ${C.gray}(Port ${svc.port} freed)${C.reset}`);
  }
  console.log(`\n  ${C.cyan}• To restart services:${C.reset}  ${C.bold}node start${C.reset}\n`);
}

stopCluster().catch((err) => {
  console.error(`\n${C.red}Error stopping cluster:${C.reset}`, err.message);
  process.exit(1);
});
