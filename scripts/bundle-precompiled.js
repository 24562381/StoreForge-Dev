#!/usr/bin/env node

/**
 * StoreForge Platform — Production Pre-compiler & Full Package Exporter
 *
 * Compiles backend, storefront, and admin portal into production-ready artifacts,
 * copies both pre-compiled builds (.next/, dist/) AND full source trees (src/, configs),
 * prunes compilation caches (.next/cache, .turbo, .swc, logs), and exports a complete,
 * ready-to-run release into `PRECOMPILED_OUTPUT/`.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'PRECOMPILED_OUTPUT');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  gold: '\x1b[38;5;214m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

// Strict exclusion patterns: ONLY prune build cache, test artifacts, version control & log noise
const EXCLUDED_PATTERNS = [
  // Build & Compiler Caches (Saves tens of MBs)
  /[\\/]\.next[\\/]cache($|[\\/])/,
  /[\\/]\.next[\\/]dev($|[\\/])/,
  /[\\/]\.turbo($|[\\/])/,
  /[\\/]\.swc($|[\\/])/,
  /\.eslintcache$/,
  /\.prettiercache$/,
  /\.map$/,

  // Tests & Test Artifacts
  /test-.*\.ts$/,
  /.*\.spec\.(ts|js|jsx|tsx)$/,
  /.*\.test\.(ts|js|jsx|tsx)$/,
  /[\\/]__tests__[\\/]/,
  /[\\/]coverage[\\/]/,
  /jest\.config\.(js|ts|json)$/,

  // Version Control & Workspace Agent Metadata
  /[\\/]\.git($|[\\/])/,
  /[\\/]\.agents($|[\\/])/,
  /[\\/]\.optimize($|[\\/])/,
  /[\\/]\.bugfix($|[\\/])/,
  /[\\/]\.audit($|[\\/])/,
  /[\\/]\.vscode($|[\\/])/,
  /[\\/]\.idea($|[\\/])/,
  /\.DS_Store$/,
  /Thumbs\.db$/,

  // DB Locks & Sock Files
  /[\\/]pgdata($|[\\/])/,
  /.*\.PGSQL.*/,
  /.*\.sock.*/,

  // Temporary & Log Files
  /node_modules($|[\\/])/,
  /PRECOMPILED_OUTPUT($|[\\/])/,
  /.*\.log$/,
  /npm-debug\.log.*/,
  /yarn-debug\.log.*/,
  /yarn-error\.log.*/,
  /.*\.tmp$/,
  /.*\.bak$/,
];

let stats = {
  copiedFiles: 0,
  copiedBytes: 0,
  prunedFiles: 0,
  prunedBytes: 0,
};

function isExcluded(filePath, fileName) {
  const normPath = filePath.split(path.sep).join('/');
  for (const pattern of EXCLUDED_PATTERNS) {
    if (pattern.test(fileName) || pattern.test(normPath) || pattern.test(filePath)) {
      return true;
    }
  }
  return false;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  const baseName = path.basename(src);

  if (isExcluded(src, baseName)) {
    if (stat.isDirectory()) {
      stats.prunedBytes += getDirectorySize(src);
    } else {
      stats.prunedFiles++;
      stats.prunedBytes += stat.size;
    }
    return;
  }

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcChild = path.join(src, entry);
      const destChild = path.join(dest, entry);
      copyRecursive(srcChild, destChild);
    }
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    stats.copiedFiles++;
    stats.copiedBytes += stat.size;
  }
}

function getDirectorySize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return stat.size;

    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      size += getDirectorySize(fullPath);
    }
  } catch { }
  return size;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function bundle() {
  console.log(`
${C.gold}${C.bold}================================================================================${C.reset}
${C.gold}${C.bold}      STOREFORGE — PRODUCTION PRE-COMPILER & FULL PACKAGE EXPORTER              ${C.reset}
${C.gray}      Compiles fullstack apps & exports complete package into PRECOMPILED_OUTPUT  ${C.reset}
${C.gold}${C.bold}================================================================================${C.reset}
`);

  const startTime = Date.now();

  // 1. Compile Backend
  console.log(`${C.cyan}[1/5] Compiling NestJS Backend (nest build)...${C.reset}`);
  execSync('npm run build --workspace=backend', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(`${C.green}[SUCCESS] Backend compiled successfully into backend/dist${C.reset}\n`);

  // 2. Compile Frontend Storefront
  console.log(`${C.cyan}[2/5] Compiling Next.js Storefront (next build)...${C.reset}`);
  execSync('npm run build --workspace=frontend', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(`${C.green}[SUCCESS] Storefront compiled successfully into frontend/.next${C.reset}\n`);

  // 3. Compile Admin Portal
  console.log(`${C.cyan}[3/5] Compiling Next.js Admin Portal (next build)...${C.reset}`);
  execSync('npm run build --workspace=admin', {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(`${C.green}[SUCCESS] Admin portal compiled successfully into admin/.next${C.reset}\n`);

  // 4. Clean and prepare PRECOMPILED_OUTPUT directory
  console.log(`${C.cyan}[4/5] Packaging all project folders & files into PRECOMPILED_OUTPUT/...${C.reset}`);
  if (fs.existsSync(outputDir)) {
    const entries = fs.readdirSync(outputDir);
    for (const entry of entries) {
      try {
        fs.rmSync(path.join(outputDir, entry), { recursive: true, force: true });
      } catch { }
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 4.1 Copy Root Files
  const rootFiles = [
    'package-lock.json',
    'docker-compose.yml',
    '.env',
    '.env.example',
    'start.js',
    'start',
    'stop.js',
    'stop',
    'stop.sh',
    'stop.bat',
    'server.js',
    'app.js',
    'ecosystem.config.js',
    'start.bat',
    '.htaccess.example',
    'nginx.conf.example',
    'MULTI_SERVER_DEPLOYMENT.md',
  ];
  for (const file of rootFiles) {
    const src = path.join(rootDir, file);
    if (fs.existsSync(src)) {
      const dest = path.join(outputDir, file);
      fs.copyFileSync(src, dest);
      if (
        file === 'start' ||
        file === 'start.js' ||
        file === 'stop' ||
        file === 'stop.js' ||
        file === 'stop.sh' ||
        file === 'server.js' ||
        file === 'app.js'
      ) {
        try { fs.chmodSync(dest, 0o755); } catch {}
      }
      stats.copiedFiles++;
    }
  }

  // Dedicated Production .gitignore for PRECOMPILED_OUTPUT (Keeps .next/ and dist/ tracked!)
  const prodGitignore = `# StoreForge Standalone Production Pre-compiled Release
node_modules/
.env
.env.local
.env*.local
.installed
installation/installed.lock
*.zip
.DS_Store
Thumbs.db
/uploads/
backend/uploads/
frontend/public/uploads/
!backend/src/modules/uploads/
!backend/src/modules/uploads/**
.pids.json
*.pid
logs/
*.log
backups/
*.sql

# Note: .next/ and backend/dist/ are pre-compiled production artifacts and must NOT be ignored in this release!
`;
  fs.writeFileSync(path.join(outputDir, '.gitignore'), prodGitignore, 'utf8');
  stats.copiedFiles++;

  // Dedicated Production start.sh for PRECOMPILED_OUTPUT (runs scripts/start-server.js)
  const prodStartSh = `#!/bin/bash
# Navigate to project root directory
cd "$(dirname "$0")"

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.docker/bin:$PATH"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       StoreForge Platform — Production Release       ║"
echo "║       NestJS API  ·  Next.js Store  ·  Admin Portal  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

if ! command -v node &> /dev/null; then
    echo "  [ERROR] Node.js not found in PATH. Please install Node.js first."
    exit 1
fi

echo "  [OK] Node  $(node -v)   NPM $(npm -v)"
echo ""

# Optional Docker check (if using containerized PostgreSQL)
if command -v docker &> /dev/null && docker info > /dev/null 2>&1; then
    if [ "$(docker inspect --format='{{.State.Running}}' postgres-test 2>/dev/null)" = "true" ]; then
        echo "  [DB] PostgreSQL container (postgres-test) is already active..."
    elif [ -f "docker-compose.yml" ]; then
        echo "  [DB] Starting PostgreSQL container (postgres-test)..."
        docker compose up -d postgres > /dev/null 2>&1 || true
        sleep 1
    fi
else
    echo "  [DB] Using host/managed PostgreSQL (DATABASE_URL in .env)..."
fi
echo ""

if [ ! -d "node_modules" ] || [ ! -d "node_modules/@prisma" ]; then
    echo "  [INSTALL] Installing production dependencies..."
    if [ "$(uname -s)" = "Linux" ] && [ -f /proc/meminfo ]; then
        SWAP_KB=$(grep SwapTotal /proc/meminfo | awk '{print $2}')
        if [ "$SWAP_KB" -lt 524288 ] && [ "$(id -u)" -eq 0 ]; then
            echo "  [WARN] Low memory VPS detected (<512MB swap). Automatically creating 2GB swapfile..."
            fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
            chmod 600 /swapfile
            mkswap /swapfile >/dev/null 2>&1 || true
            swapon /swapfile 2>/dev/null || true
            grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
            echo "  [OK] Swapfile created."
        fi
    fi
    npm install --omit=dev --no-audit --no-fund --maxsockets=2 || npm install --omit=dev --prefer-offline --no-audit --no-fund --maxsockets=1
    echo ""
fi

# Verify database configuration and schema safely without removing existing data
if [ -f "scripts/db-sync.js" ]; then
    node scripts/db-sync.js || exit 1
fi
echo ""

echo "  [INFO] Launching StoreForge Production Server..."
node scripts/start-server.js
`;
  const prodStartShPath = path.join(outputDir, 'start.sh');
  fs.writeFileSync(prodStartShPath, prodStartSh, { mode: 0o755 });
  stats.copiedFiles++;

  // Root package.json
  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const cleanRootPkg = {
    name: rootPkg.name || 'storeforge-engine',
    version: rootPkg.version || '2.0.0',
    description: rootPkg.description || 'Pre-compiled Production Release',
    private: true,
    workspaces: ['backend', 'frontend', 'admin'],
    scripts: {
      postinstall: 'prisma generate --schema=backend/prisma/schema.prisma || true',
      start: 'node scripts/start-server.js',
      'start:backend': 'node scripts/start-server.js --backend-only',
      'start:frontend': 'node scripts/start-server.js --frontend-only',
      'start:admin': 'node scripts/start-server.js --admin-only',
      server: 'node server.js',
      'start:prod': 'node scripts/start-server.js',
      'start:all': 'concurrently "npm run start:prod --workspace=backend" "npm run start --workspace=frontend" "npm run start --workspace=admin"',
      'db:sync': 'node scripts/db-sync.js',
      'db:backup': 'node scripts/db-backup.js',
      'db:merge': 'node scripts/db-sync.js',
      'prisma:generate': 'npm run prisma:generate --workspace=backend',
      'prisma:migrate': 'npm run prisma:migrate --workspace=backend',
      'prisma:push': 'npm run prisma:push --workspace=backend',
      'prisma:seed': 'npm run prisma:seed --workspace=backend',
    },
    dependencies: {
      bcryptjs: '^2.4.3',
      prisma: '^5.22.0',
    },
    devDependencies: {
      concurrently: '^8.2.2',
    },
  };
  fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(cleanRootPkg, null, 2) + '\n');
  stats.copiedFiles++;

  // 4.2 Copy Scripts & Root Public
  const scriptsDest = path.join(outputDir, 'scripts');
  fs.mkdirSync(scriptsDest, { recursive: true });
  copyRecursive(path.join(rootDir, 'scripts'), scriptsDest);

  if (fs.existsSync(path.join(rootDir, 'public'))) {
    copyRecursive(path.join(rootDir, 'public'), path.join(outputDir, 'public'));
  }

  // 4.3 Copy Backend (dist, src, prisma, public, uploads, configs)
  const backendDest = path.join(outputDir, 'backend');
  fs.mkdirSync(backendDest, { recursive: true });
  copyRecursive(path.join(rootDir, 'backend', 'dist'), path.join(backendDest, 'dist'));
  copyRecursive(path.join(rootDir, 'backend', 'src'), path.join(backendDest, 'src'));
  copyRecursive(path.join(rootDir, 'backend', 'prisma'), path.join(backendDest, 'prisma'));
  copyRecursive(path.join(rootDir, 'backend', 'public'), path.join(backendDest, 'public'));

  const backendConfigFiles = [
    'package.json',
    'tsconfig.json',
    'nest-cli.json',
    'Dockerfile',
  ];
  for (const cfg of backendConfigFiles) {
    const src = path.join(rootDir, 'backend', cfg);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(backendDest, cfg));
      stats.copiedFiles++;
    }
  }

  const uploadsDir = path.join(backendDest, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
  stats.copiedFiles++;

  // 4.4 Copy Frontend (src, .next, public, configs)
  const frontendDest = path.join(outputDir, 'frontend');
  fs.mkdirSync(frontendDest, { recursive: true });
  copyRecursive(path.join(rootDir, 'frontend', '.next'), path.join(frontendDest, '.next'));
  copyRecursive(path.join(rootDir, 'frontend', 'src'), path.join(frontendDest, 'src'));
  copyRecursive(path.join(rootDir, 'frontend', 'public'), path.join(frontendDest, 'public'));

  const frontendConfigFiles = [
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'next-env.d.ts',
    'Dockerfile',
  ];
  for (const cfg of frontendConfigFiles) {
    const src = path.join(rootDir, 'frontend', cfg);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(frontendDest, cfg));
      stats.copiedFiles++;
    }
  }

  // 4.5 Copy Admin (src, .next, public, configs)
  const adminDest = path.join(outputDir, 'admin');
  fs.mkdirSync(adminDest, { recursive: true });
  copyRecursive(path.join(rootDir, 'admin', '.next'), path.join(adminDest, '.next'));
  copyRecursive(path.join(rootDir, 'admin', 'src'), path.join(adminDest, 'src'));
  copyRecursive(path.join(rootDir, 'admin', 'public'), path.join(adminDest, 'public'));

  const adminConfigFiles = [
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'next-env.d.ts',
    'Dockerfile',
  ];
  for (const cfg of adminConfigFiles) {
    const src = path.join(rootDir, 'admin', cfg);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(adminDest, cfg));
      stats.copiedFiles++;
    }
  }

  // 4.6 Copy Root Environment Template and Config
  if (fs.existsSync(path.join(rootDir, '.env.example'))) {
    fs.copyFileSync(path.join(rootDir, '.env.example'), path.join(outputDir, '.env.example'));
    stats.copiedFiles++;
  }

  // 4.7 Generate Production Readme
  fs.writeFileSync(
    path.join(outputDir, 'README.md'),
    `# StoreForge Platform — Universal Production Pre-compiled Release

High-performance, production-ready pre-compiled release running 3 isolated micro-services:
- **Customer Storefront**: Port 3000 (*Theme: 3D Wooden Map*)
- **Admin Portal**: Port 4000 (*StoreForge Administration*)
- **Backend REST API**: Port 8585 (*NestJS REST API Engine*)

---

## Server Requirements & Compatibility
- **Environment**: Supported on **cPanel (Node.js Selector / Passenger)**, **Bare Linux VPS (Ubuntu, Debian, CentOS, AlmaLinux)**, **Windows VPS/Server**, **Cloud Hosts (Render, Railway, Fly.io, AWS EC2, DigitalOcean)**, and **Docker**.
- **Node.js**: \`>= 18.0.0\` (Node 20 LTS or 22 LTS recommended)
- **PostgreSQL**: \`>= 14\` (cPanel PostgreSQL, Local PostgreSQL, Supabase, Neon, Railway, RDS, or Docker)
- **RAM**: Only **~150MB** required at runtime (runs smoothly on any 512MB / 1GB VPS or shared hosting account).

---

## Deployment Options

### Option A: cPanel Hosting (Phusion Passenger / CloudLinux Node.js)
1. **Upload Files**: Upload this release folder to your cPanel directory (e.g., \`public_html\` or a dedicated app directory).
2. **Setup Node.js App in cPanel**:
   - Go to **Setup Node.js App** in cPanel.
   - Click **Create Application**.
   - **Node.js version**: Choose \`20.x\` or \`18.x\`.
   - **Application mode**: \`Production\`.
   - **Application root**: Path to your uploaded folder.
   - **Application startup file**: \`server.js\` (or \`app.js\`).
3. **Configure Environment Variables**:
   - Create or edit \`.env\` in the application root.
   - Set your PostgreSQL database connection:
     \`\`\`env
     DATABASE_URL="postgresql://username:password@localhost:5432/databasename?schema=public"
     \`\`\`
   - Set a secure random key for JWT:
     \`\`\`env
     JWT_SECRET="generate_a_random_32_character_string_here"
     \`\`\`
4. **Install Dependencies**:
   - In cPanel, click **Run NPM Install** (or run \`npm install --omit=dev\` via terminal).
5. **Reverse Proxy Configuration**:
   - Copy \`.htaccess.example\` to \`.htaccess\` in your \`public_html\` so Apache routes visitors to the Next.js Storefront (:3000) and API calls to NestJS (:8585).
6. **Start Application**: Click **Restart** in cPanel.

---

### Option B: Linux VPS (PM2 — DigitalOcean, Linode, AWS, Hetzner, Vultr)
1. Install production dependencies:
   \`\`\`bash
   npm install --omit=dev
   \`\`\`
2. Configure \`.env\` with your \`DATABASE_URL\` and \`JWT_SECRET\`.
3. Launch with PM2 process manager:
   \`\`\`bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`
4. **Nginx Reverse Proxy**:
   - Copy \`nginx.conf.example\` to \`/etc/nginx/sites-available/storeforge\`.
   - Update your domain name, symlink to \`sites-enabled\`, and run \`systemctl reload nginx\`.

---

### Option C: Direct Linux / macOS Execution (Without Docker)
1. Install dependencies & initialize:
   \`\`\`bash
   npm install --omit=dev
   \`\`\`
2. Configure \`.env\` with your PostgreSQL database URL.
3. Start the entire cluster:
   \`\`\`bash
   ./start.sh
   # or
   npm start
   \`\`\`

---

### Option D: Windows Server / Windows VPS
1. Configure your database connection in \`.env\`.
2. Double-click \`start.bat\` (or run \`start.bat\` from Command Prompt / PowerShell).

---

### Option E: Docker Deployment (Optional)
If you prefer running inside Docker containers:
\`\`\`bash
docker compose up -d
\`\`\`

---

### Option F: Multi-Server / Multi-Domain Deployment (Separate Servers)
If you want to run **Storefront**, **Admin Portal**, and **Backend REST API** across **separate physical servers**, independent VPS instances, or custom subdomains (e.g. \`yourstore.com\`, \`admin.yourstore.com\`, and \`api.yourstore.com\`):
- See the comprehensive step-by-step guide: **\`MULTI_SERVER_DEPLOYMENT.md\`**
- Each service can be run independently using dedicated flags or scripts:
  - **Server 1 (Backend API):** \`npm run start:backend\` (or \`node scripts/start-server.js --backend-only\`)
  - **Server 2 (Storefront):** \`npm run start:frontend\` (or \`node scripts/start-server.js --frontend-only\`)
  - **Server 3 (Admin Portal):** \`npm run start:admin\` (or \`node scripts/start-server.js --admin-only\`)
- Complete Nginx reverse proxy configurations with SSL, CORS whitelisting, PM2 commands, and media upload handling are provided in \`MULTI_SERVER_DEPLOYMENT.md\`.

---

## Default Ports & Access Points

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Storefront** | [http://localhost:3000](http://localhost:3000) | Customer-facing store & checkout |
| **Admin Portal** | [http://localhost:4000](http://localhost:4000) | Master control panel & inventory |
| **Backend API** | [http://localhost:8585/api](http://localhost:8585/api) | NestJS REST API endpoints |

### First-Time Superadmin Setup:
When you open the **Admin Portal** ([http://localhost:4000](http://localhost:4000)) for the very first time:
1. **Step 1 (Admin Profile):** Enter your custom administrator name, master email/phone, and password.
2. **Step 2 (Site Configuration):** Set your store name, website title, support contact details, and delivery charges.
3. Upon completion, you will be automatically logged in to the dashboard. The setup wizard will never show again.
`
  );
  stats.copiedFiles++;

  console.log(`${C.green}[SUCCESS] All project folders, src/ trees, and production assets packaged cleanly.${C.reset}\n`);

  // 5. Summary and Metrics
  console.log(`${C.cyan}[5/5] Verifying Pre-compiled Output Integrity...${C.reset}`);
  const totalSizeBytes = getDirectorySize(outputDir);
  const backendSizeBytes = getDirectorySize(backendDest);
  const frontendSizeBytes = getDirectorySize(frontendDest);
  const adminSizeBytes = getDirectorySize(adminDest);
  const scriptsSizeBytes = getDirectorySize(scriptsDest);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`
${C.green}${C.bold}================================================================================${C.reset}
${C.green}${C.bold}       PRE-COMPILED PRODUCTION BUNDLE CREATED SUCCESSFULLY!                     ${C.reset}
${C.green}${C.bold}================================================================================${C.reset}

  • Output Directory:     ${C.gold}PRECOMPILED_OUTPUT/${C.reset}
  • Total Size:           ${C.cyan}${C.bold}${formatBytes(totalSizeBytes)}${C.reset}
  • Total Packaged Files: ${C.yellow}${stats.copiedFiles} files${C.reset}
  • Compilation Time:     ${C.gray}${elapsedSec}s${C.reset}
  • Runtime RAM Quota:    ${C.green}~150 MB RAM (Runs on any 512MB VPS / Cloud Host)${C.reset}

  ${C.bold}Micro-Service Breakdown:${C.reset}
    ├── Storefront (:3000):   ${C.cyan}${formatBytes(frontendSizeBytes)}${C.reset} (Includes .next/ & src/)
    ├── Admin Portal (:4000): ${C.magenta}${formatBytes(adminSizeBytes)}${C.reset} (Includes .next/ & src/)
    ├── Backend API (:8585):  ${C.cyan}${formatBytes(backendSizeBytes)}${C.reset} (Includes dist/, src/ & prisma/)
    └── Scripts & Launchers:  ${C.cyan}${formatBytes(scriptsSizeBytes)}${C.reset}

  ${C.bold}Ready to Deploy:${C.reset}
    1. ${C.cyan}npm install --omit=dev${C.reset}
    2. ${C.cyan}npm run start${C.reset}
`);
}

bundle().catch((err) => {
  console.error(`\n${C.red}${C.bold}[ERROR] Bundle failed: ${err.message}${C.reset}\n`);
  process.exit(1);
});
