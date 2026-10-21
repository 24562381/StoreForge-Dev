import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure root .env is loaded during Next.js build and dev
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
          if (commentIdx !== -1) val = val.slice(0, commentIdx).trim();
        }
        if (key && (process.env[key] === undefined || process.env[key] === '')) {
          process.env[key] = val;
        }
      }
    } catch {}
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || process.env.FRONTEND_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000'),
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || process.env.ADMIN_URL || (process.env.ADMIN_PORT ? `http://localhost:${process.env.ADMIN_PORT}` : 'http://localhost:4000'),
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/no-image.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/no-image.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
  async rewrites() {
    let rawApiUrl = (
      process.env.INTERNAL_BACKEND_URL ||
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_DOMAIN ||
      process.env.BACKEND_HOST ||
      (process.env.BACKEND_PORT ? `http://localhost:${process.env.BACKEND_PORT}` : 'http://localhost:8585')
    ).trim().replace(/^["']|["']$/g, '');

    if (!/^https?:\/\//i.test(rawApiUrl)) {
      const isLocal = rawApiUrl.startsWith('localhost') || rawApiUrl.startsWith('127.0.0.1') || rawApiUrl.startsWith('0.0.0.0');
      rawApiUrl = isLocal ? `http://${rawApiUrl}` : `https://${rawApiUrl}`;
    }

    const apiTarget = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    return [
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
      },
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
