# 🌐 StoreForge — Multi-Server Distributed Deployment Guide

This guide details how to deploy the **Customer Storefront**, **Admin Portal**, and **Backend REST API** across **separate servers**, virtual machines (VPS), or independent subdomains with enterprise-grade isolation, high availability, and SSL encryption.

---

## 🏗️ 1. Architecture & Network Topology

```
                         ┌──────────────────────────────────────────────┐
                         │               DNS / Cloudflare               │
                         └──────┬────────────────┬───────────────┬──────┘
                                │                │               │
                     https://yourstore.com       │    https://admin.yourstore.com
                                │                │               │
                                ▼                │               ▼
                  ┌───────────────────────────┐  │  ┌───────────────────────────┐
                  │    SERVER 2: STOREFRONT   │  │  │     SERVER 3: ADMIN       │
                  │      Next.js (Port 3000)  │  │  │   Next.js (Port 4000)     │
                  │   Nginx Reverse Proxy     │  │  │   Nginx Reverse Proxy     │
                  └─────────────┬─────────────┘  │  └─────────────┬─────────────┘
                                │                │                │
            Internal Next.js SSR│                │                │ Admin Requests
            Rewrites & API Calls│                │                │ & Media Uploads
                                │                │                │
                                │   https://api.yourstore.com     │
                                └───────────────►▼◄───────────────┘
                                  ┌───────────────────────────┐
                                  │     SERVER 1: BACKEND     │
                                  │    NestJS API (Port 8585) │
                                  │    Prisma ORM & PostgreSQL│
                                  │   Public Uploads Storage  │
                                  │    Nginx Reverse Proxy    │
                                  └───────────────────────────┘
```

### 📡 Port & Domain Matrix

| Service | Target Domain | Local Port | Key Technologies | Primary Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Server 1: Backend** | `https://api.yourstore.com` | `8585` | NestJS, Prisma, PostgreSQL | REST API endpoints, DB, Auth, Media uploads |
| **Server 2: Storefront** | `https://yourstore.com` | `3000` | Next.js (App Router), SSR | Customer browsing, cart, checkout, tracking |
| **Server 3: Admin** | `https://admin.yourstore.com` | `4000` | Next.js (App Router), React | Inventory, order management, settings wizard |

---

## ⚙️ 2. Server 1: Backend REST API (`api.yourstore.com`)

Server 1 hosts the PostgreSQL database, NestJS REST API, and product/media image storage in `public/uploads/`.

### 📂 Required Folders & Files
Upload the precompiled release to Server 1. If you wish to minimize file footprint, only the following folders and files are needed on Server 1:
```text
/var/www/storeforge/
├── backend/                  <-- Dist build, src & prisma schema
├── scripts/                  <-- Bootstrapper scripts
├── package.json
├── package-lock.json
├── server.js
├── start.js
├── .env                      <-- Server 1 Environment file
└── public/
    └── uploads/              <-- Uploaded media directory
```

### 📝 Step 1: Configure `.env` on Server 1
Create `/var/www/storeforge/.env`:
```env
# Server 1 Port
PORT=8585
BACKEND_PORT=8585

# Cross-Origin Resource Sharing (CORS) — Whitelist Storefront and Admin
FRONTEND_URL="https://yourstore.com"
ADMIN_URL="https://admin.yourstore.com"

# Public API and Store URLs
NEXT_PUBLIC_API_URL="https://api.yourstore.com"
NEXT_PUBLIC_STORE_URL="https://yourstore.com"

# PostgreSQL Database Connection
DATABASE_URL="postgresql://dbuser:StrongPassword123@localhost:5432/storeforge_db?schema=public"

# 256-bit Hex Security Secret for JWT Authentication (generate via: openssl rand -hex 32)
JWT_SECRET="e9d2f4a1873b190f845a702b85e0fa0c1289df713b94a8e2501dc64b73e51a29"

# Optional Payment Gateway (bKash)
BKASH_APP_KEY=""
BKASH_APP_SECRET=""
BKASH_USERNAME=""
BKASH_PASSWORD=""
BKASH_BASE_URL=""
```

### 📦 Step 2: Install Dependencies & Run Database Migration
```bash
cd /var/www/storeforge
npm install --omit=dev
npx prisma db push --schema=backend/prisma/schema.prisma
```

### 🚀 Step 3: Start Backend API with PM2
Launch only the backend service using the dedicated `--backend-only` flag:
```bash
npm install -g pm2
pm2 start server.js --name storeforge-backend -- --backend-only
pm2 save
pm2 startup
```

### 🌐 Step 4: Configure Nginx for Server 1 (`api.yourstore.com`)
Create `/etc/nginx/sites-available/api.yourstore.com`:
```nginx
server {
    listen 80;
    server_name api.yourstore.com;

    client_max_body_size 50M;

    # Static Uploaded Media Files (Images, Banners, Thermal SVGs)
    location /uploads/ {
        proxy_pass http://127.0.0.1:8585/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }

    # REST API Endpoints
    location / {
        proxy_pass http://127.0.0.1:8585;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and obtain free Let's Encrypt SSL:
```bash
ln -s /etc/nginx/sites-available/api.yourstore.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d api.yourstore.com
```

---

## 🛍️ 3. Server 2: Customer Storefront (`yourstore.com`)

Server 2 hosts the customer-facing Next.js storefront. It communicates with Server 1 over HTTPS.

### 📂 Required Folders & Files
```text
/var/www/storeforge/
├── frontend/                 <-- Pre-compiled Next.js storefront (.next/ & src/)
├── scripts/
├── package.json
├── package-lock.json
├── server.js
├── start.js
└── .env                      <-- Server 2 Environment file
```

### 📝 Step 1: Configure `.env` on Server 2
Create `/var/www/storeforge/.env`:
```env
# Local Port for Next.js Storefront
PORT=3000

# Point all API requests & image rewrites to Server 1
NEXT_PUBLIC_API_URL="https://api.yourstore.com"
NEXT_PUBLIC_STORE_URL="https://yourstore.com"
```

> [!NOTE]
> **Zero CORS / Seamless Media Delivery**:
> The Storefront's `next.config.mjs` automatically rewrites all requests to `/api/*` and `/uploads/*` directly to `NEXT_PUBLIC_API_URL` (`https://api.yourstore.com`). Visitors on `yourstore.com` never encounter cross-origin image blocks.

### 📦 Step 2: Install Dependencies
```bash
cd /var/www/storeforge
npm install --omit=dev
```

### 🚀 Step 3: Start Storefront with PM2
Launch only the frontend service using the dedicated `--frontend-only` flag:
```bash
pm2 start server.js --name storeforge-frontend -- --frontend-only
pm2 save
pm2 startup
```

### 🌐 Step 4: Configure Nginx for Server 2 (`yourstore.com`)
Create `/etc/nginx/sites-available/yourstore.com`:
```nginx
server {
    listen 80;
    server_name yourstore.com www.yourstore.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable site and obtain SSL:
```bash
ln -s /etc/nginx/sites-available/yourstore.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourstore.com -d www.yourstore.com
```

---

## 🔐 4. Server 3: Admin Portal (`admin.yourstore.com`)

Server 3 hosts the dedicated administrative control panel.

### 📂 Required Folders & Files
```text
/var/www/storeforge/
├── admin/                    <-- Pre-compiled Next.js admin portal (.next/ & src/)
├── scripts/
├── package.json
├── package-lock.json
├── server.js
├── start.js
└── .env                      <-- Server 3 Environment file
```

### 📝 Step 1: Configure `.env` on Server 3
Create `/var/www/storeforge/.env`:
```env
# Local Port for Admin Portal
PORT=4000
ADMIN_PORT=4000

# Point all administrative API requests to Server 1
NEXT_PUBLIC_API_URL="https://api.yourstore.com"
NEXT_PUBLIC_STORE_URL="https://yourstore.com"
```

### 📦 Step 2: Install Dependencies
```bash
cd /var/www/storeforge
npm install --omit=dev
```

### 🚀 Step 3: Start Admin Portal with PM2
Launch only the admin service using the dedicated `--admin-only` flag:
```bash
pm2 start server.js --name storeforge-admin -- --admin-only
pm2 save
pm2 startup
```

### 🌐 Step 4: Configure Nginx for Server 3 (`admin.yourstore.com`)
Create `/etc/nginx/sites-available/admin.yourstore.com`:
```nginx
server {
    listen 80;
    server_name admin.yourstore.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable site and obtain SSL:
```bash
ln -s /etc/nginx/sites-available/admin.yourstore.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d admin.yourstore.com
```

---

## 💡 5. Popular Alternative: 2-Server Setup

If you want the benefits of separate servers while keeping hosting costs minimal, the **2-Server Setup** is the most popular choice:

1. **Server 1 (Backend + Admin)**:
   - Hosts `https://api.yourstore.com` and `https://admin.yourstore.com`
   - Runs Backend on `:8585` and Admin on `:4000`
   - Keeps admin users on the same internal network as the database for ultra-fast dashboard queries.
   - Run command:
     ```bash
     pm2 start server.js --name storeforge-backend -- --backend-only
     pm2 start server.js --name storeforge-admin -- --admin-only
     ```
2. **Server 2 (Storefront)**:
   - Dedicated solely to customer traffic on `https://yourstore.com`
   - Absorbs all visitor traffic spikes without affecting admin operations.
   - Run command:
     ```bash
     pm2 start server.js --name storeforge-frontend -- --frontend-only
     ```

---

## 🛡️ 6. Firewall & Security Hardening (UFW)

On all servers, block external access to direct Node.js ports so traffic ONLY flows through Nginx over encrypted HTTPS (`443`):

```bash
# Allow SSH, HTTP, and HTTPS only
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ensure internal micro-service ports are NOT exposed to the public
sudo ufw deny 3000
sudo ufw deny 4000
sudo ufw deny 8585
sudo ufw deny 5432

sudo ufw enable
```

---

## 🔍 7. Troubleshooting & Verification

### 1. Test Backend Connectivity from Storefront or Admin Server
On Server 2 or Server 3, verify you can reach Server 1:
```bash
curl -I https://api.yourstore.com/api/settings
```
Expected response: `HTTP/2 200` or `HTTP/1.1 200 OK`.

### 2. Verify CORS
If you see `Access to fetch has been blocked by CORS policy` in the browser console:
- Verify that `FRONTEND_URL="https://yourstore.com"` and `ADMIN_URL="https://admin.yourstore.com"` in Server 1's `.env` **match your exact domain protocol** (`https://`, no trailing slash).
- Restart the backend on Server 1: `pm2 restart storeforge-backend`.

### 3. Check Service Logs
```bash
# View real-time logs on any server
pm2 logs
# Or specific service
pm2 logs storeforge-backend
pm2 logs storeforge-frontend
pm2 logs storeforge-admin
```
