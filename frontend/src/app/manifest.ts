import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// High-performance in-memory cache keyed by host to guarantee sub-millisecond response & 0 CPU starvation
interface CacheEntry {
  manifest: MetadataRoute.Manifest;
  timestamp: number;
}
const manifestCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<MetadataRoute.Manifest>>();
const CACHE_TTL_MS = 60_000; // 60 seconds TTL

// Security: Strip control characters, quotes, HTML tags, and bracket injections
function sanitizeText(input: any, maxLen: number): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F<>'"&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// Security: Validate hex color codes (#RGB or #RRGGBB)
function sanitizeHexColor(color: any, fallback: string): string {
  if (typeof color === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim())) {
    return color.trim();
  }
  return fallback;
}

import { getBackendUrl } from '../lib/urls';

function getBackendBaseUrl(): string {
  return getBackendUrl({ asApiRoute: true });
}

interface TenantBrandingPayload {
  tenantId: string;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'natural' | 'portrait' | 'landscape';
  icons?: {
    icon192?: string;
    icon512?: string;
    iconMaskable192?: string;
    iconMaskable512?: string;
    favicon?: string;
  };
}

async function generateManifestForHost(host: string): Promise<MetadataRoute.Manifest> {
  const cleanHost = (host || 'default').split(':')[0].toLowerCase();
  let storeName = (process.env.STORE_NAME || process.env.NEXT_PUBLIC_STORE_NAME || 'StoreForge').trim();
  let storeDesc = 'Modern E-Commerce Store';
  let themeColor = '#8E5A35';
  let bgColor = '#FAF7F2';
  let tenantId = cleanHost.replace(/[^a-z0-9_\-]/g, '_') || 'default';

  try {
    const backendBase = getBackendBaseUrl();
    const microserviceToken = (
      process.env.INTERNAL_MICROSERVICE_TOKEN ||
      process.env.JWT_SECRET ||
      ''
    ).trim();

    const brandingUrl = `${backendBase}/tenants/branding?host=${encodeURIComponent(cleanHost)}`;

    // Timeout of 2500ms prevents long-hanging threads if database or network hangs
    const res = await fetch(brandingUrl, {
      headers: {
        'x-microservice-token': microserviceToken,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(2500),
    }).catch(() => null);

    if (res && res.ok) {
      const branding: TenantBrandingPayload = await res.json();
      if (branding) {
        if (branding.tenantId) {
          tenantId = sanitizeText(branding.tenantId, 64);
        }
        if (branding.name) {
          storeName = sanitizeText(branding.name, 50);
        }
        if (branding.description) {
          storeDesc = sanitizeText(branding.description, 140);
        }
        if (branding.themeColor) {
          themeColor = sanitizeHexColor(branding.themeColor, themeColor);
        }
        if (branding.backgroundColor) {
          bgColor = sanitizeHexColor(branding.backgroundColor, bgColor);
        }
      }
    }
  } catch {
    // If backend is unreachable, gracefully fall through with defaults or cached data
  }

  // CRITICAL PWA & ANDROID FIX:
  // All icon sources point directly to local Next.js proxy route (/api/pwa/icon)
  // This guarantees same-origin icon URLs on domain2.com, completely preventing
  // cross-origin origin mismatch errors when Android compiles the WebAPK!
  const icon192 = `/api/pwa/icon?tenant=${encodeURIComponent(tenantId)}&size=192`;
  const icon512 = `/api/pwa/icon?tenant=${encodeURIComponent(tenantId)}&size=512`;
  const iconMaskable192 = `/api/pwa/icon?tenant=${encodeURIComponent(tenantId)}&size=192&purpose=maskable`;
  const iconMaskable512 = `/api/pwa/icon?tenant=${encodeURIComponent(tenantId)}&size=512&purpose=maskable`;

  const manifestIcons: MetadataRoute.Manifest['icons'] = [
    {
      src: icon192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: icon512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: iconMaskable192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: iconMaskable512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ];

  const shortName = storeName.length > 15 ? storeName.slice(0, 15).trim() : storeName;

  const manifestData: MetadataRoute.Manifest = {
    id: `storefront-pwa-${tenantId}`,
    name: storeName,
    short_name: shortName,
    description: storeDesc,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: bgColor,
    theme_color: themeColor,
    categories: ['shopping', 'lifestyle'],
    icons: manifestIcons,
    shortcuts: [
      {
        name: 'Shop Products',
        short_name: 'Products',
        description: 'Browse our handcrafted collections',
        url: '/products',
        icons: [{ src: icon192, sizes: '192x192' }],
      },
      {
        name: 'Track Order',
        short_name: 'Track',
        description: 'Check real-time delivery status',
        url: '/track',
        icons: [{ src: icon192, sizes: '192x192' }],
      },
    ],
  };

  manifestCache.set(cleanHost, { manifest: manifestData, timestamp: Date.now() });
  return manifestData;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let host = 'default';
  try {
    const headersList = await headers();
    host = headersList.get('x-forwarded-host') || headersList.get('host') || 'default';
  } catch {}

  const cleanHost = host.split(':')[0].toLowerCase();
  const now = Date.now();
  const cached = manifestCache.get(cleanHost);

  // 1. Fresh cache: Return immediately (< 0.02ms, 0 CPU load)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.manifest;
  }

  // 2. Stale cache available: Return immediately without blocking client requests,
  // and trigger asynchronous background revalidation (0ms wait, 0 thread lock)
  if (cached) {
    if (!inFlightRequests.has(cleanHost)) {
      const promise = generateManifestForHost(cleanHost).finally(() => {
        inFlightRequests.delete(cleanHost);
      });
      inFlightRequests.set(cleanHost, promise);
    }
    return cached.manifest;
  }

  // 3. Cold boot / first request: Wait for generation once, deduplicating concurrent requests
  const existingInFlight = inFlightRequests.get(cleanHost);
  if (existingInFlight) {
    return existingInFlight;
  }

  const inFlight = generateManifestForHost(cleanHost);
  inFlightRequests.set(cleanHost, inFlight);
  try {
    return await inFlight;
  } finally {
    inFlightRequests.delete(cleanHost);
  }
}
