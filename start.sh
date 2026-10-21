#!/bin/bash

# Navigate to project root directory
cd "$(dirname "$0")"

# ─── Load environment paths ───────────────────────────────────────────────────
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.docker/bin:$PATH"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🪵  3D Wooden World Map — E-Commerce Platform      ║"
echo "║       NestJS API  ·  Next.js Store  ·  Admin Portal  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Node.js Check ─────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "  ❌  Node.js not found in PATH. Please install Node.js first."
    exit 1
fi

echo "  ✅  Node  $(node -v)   NPM $(npm -v)"
echo ""

# ─── 2. Docker / PostgreSQL ───────────────────────────────────────────────────
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        # Bring up only the postgres service from docker-compose
        echo "  🐘  Starting PostgreSQL container (postgres-test)..."
        docker compose up -d postgres > /dev/null 2>&1

        # Wait for the healthcheck to pass (container uses pg_isready probe)
        echo "  ⏳  Waiting for PostgreSQL to be ready..."
        for i in {1..20}; do
            STATUS=$(docker inspect --format='{{.State.Health.Status}}' postgres-test 2>/dev/null)
            [ "$STATUS" = "healthy" ] && break
            sleep 1
        done

        STATUS=$(docker inspect --format='{{.State.Health.Status}}' postgres-test 2>/dev/null)
        if [ "$STATUS" = "healthy" ]; then
            echo "  ✅  PostgreSQL is healthy  →  localhost:5432"
        else
            echo "  ⚠️   PostgreSQL may not be ready yet (status: ${STATUS:-unknown})"
        fi
    else
        echo "  ❌  Docker daemon did not start in time. Check Docker Desktop."
    fi

else
    echo "  ⚠️   Docker CLI not found — assuming a local PostgreSQL is already running."
fi
echo ""

# ─── 3. Install Dependencies (all workspaces) ────────────────────────────────
if [ ! -d "node_modules" ] \
|| [ ! -d "backend/node_modules" ] \
|| [ ! -d "frontend/node_modules" ] \
|| [ ! -d "admin/node_modules" ]; then
    echo "  📦  Missing dependencies — running npm install (all workspaces)..."
    npm install
    echo ""
fi

# ─── 4. Prisma Client Generation ──────────────────────────────────────────────
if [ ! -d "backend/node_modules/.prisma" ] && [ -d "backend/prisma" ]; then
    echo "  ⚙️   Generating Prisma Client from backend/prisma/schema.prisma..."
    npm run prisma:generate
    echo ""
fi

# ─── 5. Launch Dev Servers ────────────────────────────────────────────────────
echo "  🚀  Starting all development servers..."
echo ""

if [ -f ".env" ]; then
    set -a
    . .env 2>/dev/null || true
    set +a
fi

FRONTEND_DISPLAY="${FRONTEND_URL:-http://localhost:${PORT:-3000}}"
ADMIN_DISPLAY="${ADMIN_URL:-http://localhost:${ADMIN_PORT:-4000}}"
BACKEND_DISPLAY="${NEXT_PUBLIC_API_URL:-http://localhost:${BACKEND_PORT:-8585}}"

echo "  ┌─────────────────────────────────────────────────────┐"
printf "  │  🌐  Frontend Storefront  →  %-23s │\n" "$FRONTEND_DISPLAY"
printf "  │  🛠️   Admin Portal         →  %-23s │\n" "$ADMIN_DISPLAY"
printf "  │  ⚙️   NestJS API            →  %-23s │\n" "$BACKEND_DISPLAY"
printf "  │  📖  API Docs (Swagger)   →  %-23s │\n" "${BACKEND_DISPLAY%/}/api"
echo "  └─────────────────────────────────────────────────────┘"
echo ""

# Runs: backend (nest start --watch) + frontend (next dev :3000) + admin (next dev :4000)
npm run dev
