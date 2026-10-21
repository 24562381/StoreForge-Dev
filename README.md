# 🛍️ StoreForge Platform — Multi-Theme High-Performance E-Commerce Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

**StoreForge** is a modern, modular, production-grade e-commerce engine designed for high throughput, sub-10ms response times, and minimal memory footprint. It features an isolated 3-tier micro-service architecture with a decoupled customer storefront, a dedicated back-office administrative portal, and a resilient NestJS REST API backend.

- **Current Customer Storefront Theme**: `3D Wooden Map` (Luxury Wall Decor Showcase)
- **Administrative Portal**: `StoreForge Administration & Management Portal`
- **Backend API Engine**: `StoreForge RESTful API Engine`

---

## 🏛️ System Architecture

StoreForge is organized into a clean multi-package workspace:

```
storeforge-engine/
├── backend/                       # ⚙️ NestJS 10 RESTful API Engine (Port 8585)
│   ├── prisma/
│   │   ├── schema.prisma          # Unified PostgreSQL schema (Orders, Products, Variants, Users, Reviews, Settings)
│   │   └── seed.ts                # Database seeder & default catalog generator
│   └── src/
│       ├── common/                # Security guards, role interceptors, rate-limiters, exception filters
│       ├── modules/
│       │   ├── auth/              # JWT session authentication, password hashing & permissions
│       │   ├── products/          # Catalog management, size/color variant matrix, media & highlights
│       │   ├── categories/        # Nested categories, slugs & SEO tags
│       │   ├── orders/            # Order processing, state machine workflow, analytics & invoice calculations
│       │   ├── reviews/           # Customer reviews, star ratings & moderation pipeline
│       │   ├── faqs/              # Categorized FAQ management & search
│       │   ├── settings/          # Store identity, courier delivery rates, SMS & invoice customization
│       │   ├── translations/      # Bilingual (Bangla 🇧🇩 / English 🇬🇧) translation dictionary & AI sync
│       │   ├── ai/                # Multi-provider AI Studio (Gemini, Groq, OpenRouter)
│       │   ├── payments/          # bKash payment gateway tokenized execution & refund simulator
│       │   ├── barcode/           # Code128 & QR code generator (bwip-js) for shipping labels
│       │   ├── promo-codes/       # Coupon validation, usage limits & percentage/fixed discounts
│       │   ├── uploads/           # Sharp WebP image compression & static file storage
│       │   └── moderators/        # Staff team management, granular role-based access control (RBAC)
│       ├── app.module.ts
│       └── main.ts
│
├── frontend/                      # 🛍️ Next.js 14 Customer Storefront (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Luxury 3D Wooden Map landing page & featured showcase
│   │   │   ├── products/          # Dynamic product catalog, filtering & instant search
│   │   │   ├── products/[slug]/   # High-converting product details with size matrix & gallery
│   │   │   ├── cart/              # Slide-over cart drawer & persistent shopping basket
│   │   │   ├── checkout/          # 1-page frictionless Cash on Delivery (COD) & bKash checkout
│   │   │   ├── order/confirmation/ # Instant order confirmation & printable customer invoice
│   │   │   ├── track/             # Real-time interactive order timeline tracker
│   │   │   └── payment/bkash/     # bKash sandbox simulator & payment status handler
│   │   ├── components/            # Reusable memoized UI components (Header, Footer, LanguageSwitcher)
│   │   └── lib/                   # API client, Cart Context & Language Context
│
├── admin/                         # 🔐 Next.js 14 Back-Office Administration (Port 4000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Live revenue metrics, order status charts & real-time feed
│   │   │   ├── orders/            # Advanced order fulfillment, status transitions & invoice printing
│   │   │   ├── orders/[id]/print  # A4 customer invoice & packing slip generator
│   │   │   ├── orders/[id]/shipping-label # 3x5 thermal & 4x6 courier sticker barcode labels
│   │   │   ├── products/          # Product CRUD, variant matrix manager & WebP photo uploader
│   │   │   ├── featured-product/  # Homepage featured exclusive product customizer
│   │   │   ├── categories/        # Dynamic category hierarchy & slug generator
│   │   │   ├── promo-codes/       # Discount code engine & expiration manager
│   │   │   ├── reviews/           # Customer feedback moderation & feature pinboard
│   │   │   ├── faqs/              # Accordion FAQ manager with drag-and-drop order
│   │   │   ├── policies/          # Rich-text legal policy page editor
│   │   │   ├── translations/      # Live translation editor with 1-click AI translation
│   │   │   ├── moderators/        # Team members, staff permissions & NID verification
│   │   │   ├── profile/           # Admin security credentials & session management
│   │   │   └── settings/          # General branding, delivery charges, SMS & AI studio keys
│   │   ├── components/            # Memoized admin UI components, modals & uploaders
│   │   └── lib/                   # RBAC permission guards, API client & modal provider
│
├── scripts/
│   ├── start-server.js            # Self-healing multi-process supervisor & port conflict resolver
│   └── bundle-precompiled.js      # Zero-overhead production pre-compiler & packager
│
├── .env.example                   # Master environment variables template
├── docker-compose.yml             # Docker infrastructure setup (PostgreSQL + Microservices)
└── package.json                   # Workspace orchestrator scripts
```

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- **Node.js**: `v18+` (v20+ LTS recommended)
- **PostgreSQL**: `v14+` or Docker

### 2. Install Workspace Dependencies
```bash
npm install
```

### 3. Configure Local Environment
Create `.env` from the root template:
```bash
cp .env.example .env
```
Ensure your PostgreSQL credentials in `DATABASE_URL` are valid:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/storeforge?schema=public"
JWT_SECRET="generate_with_openssl_rand_-hex_32"
```

### 4. Initialize Database & Seed Catalog
```bash
# Push schema tables to database
npm run prisma:push

# (Optional) Seed default admin & initial catalog
npm run prisma:seed
```

### 5. Launch Full Development Environment
```bash
npm run dev
```
This concurrently starts all 3 micro-services in watch mode:
- **🛍️ Storefront**: [http://localhost:3000](http://localhost:3000)
- **🔐 Admin Portal**: [http://localhost:4000](http://localhost:4000) *(First-run setup wizard on initial launch)*
- **⚙️ Backend API**: [http://localhost:8585/api](http://localhost:8585/api)

### 6. Production & Background Server Commands
```bash
# Start all services in the background (detached session, terminal is free)
node start
# or: npm start, ./start

# View live output and request logs
tail -f logs/server.log

# Gracefully stop all services and free all ports (3000, 4000, 8585)
node stop
# or: npm run stop, ./stop
```

---

## 🐳 Docker Container Deployment

To launch the full PostgreSQL database and application cluster via Docker:

```bash
# Start PostgreSQL only (for local development)
npm run docker:db

# Start complete containerized stack in background
npm run docker:up

# View real-time container logs
npm run docker:logs

# Stop containers
npm run docker:down
```

---

## 🚀 Production Pre-Compilation & Release Packaging

StoreForge includes an automated production bundler that pre-compiles all three applications, strips development caches (`.next/cache`, `.map` source maps, test traces, scratch files), and creates a lean, ready-to-deploy release in `PRECOMPILED_OUTPUT/`:

```bash
npm run bundle:precompiled
```

### 📦 Key Characteristics of Pre-compiled Artifact:
- **Total Bundle Size**: **~19.8 MB** (pruned from >540 MB dev directory).
- **RAM Requirement**: **~150 MB RAM** at runtime.
- **Instant Boot**: Starts immediately via `npm run start` without on-server compilation.

---

## 🔑 Initial Superadmin Setup

When accessing the **Admin Portal** ([http://localhost:4000](http://localhost:4000)) for the first time:
1. **Step 1 (Admin Profile):** Enter your custom administrator name, master email, and password.
2. **Step 2 (Site Configuration):** Set your store name, website title, support contact details, and delivery charges.
3. Upon completion, you will be automatically logged in to the dashboard. The setup wizard will never show again.

---

## 📜 License
Private & Commercial License — StoreForge Platform Engine.
