import { MetadataRoute } from 'next';
import { fetchApi } from '../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// High-performance in-memory cache to guarantee sub-millisecond response & 0 CPU starvation
let cachedManifest: MetadataRoute.Manifest | null = null;
let lastCacheTime = 0;
let inFlightPromise: Promise<MetadataRoute.Manifest> | null = null;
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

// Security: Prevent protocol-relative XSS (//evil.com), javascript:, data:, and directory traversal
function sanitizeUrl(url: any, fallback: string): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  // Safe relative paths starting with / (excluding // which is protocol-relative)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (/^\/[a-zA-Z0-9_\-\.\/\?=&%]+$/.test(trimmed) && !trimmed.includes('..')) {
      return trimmed;
    }
  }

  // Safe absolute https:// URLs only
  if (/^https:\/\/[a-zA-Z0-9_\-\.]+(:\d+)?(\/[a-zA-Z0-9_\-\.\/\?=&%]*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

// Security: Validate hex color codes (#RGB or #RRGGBB)
function sanitizeHexColor(color: any, fallback: string): string {
  if (typeof color === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim())) {
    return color.trim();
  }
  return fallback;
}

function getIconMimeType(url: string): string {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

async function generateManifest(): Promise<MetadataRoute.Manifest> {
  const now = Date.now();
  let storeName = process.env.STORE_NAME || process.env.NEXT_PUBLIC_STORE_NAME || 'StoreForge';
  let icon192 = '/icons/admin-icon-192x192.png';
  let icon512 = '/icons/admin-icon-512x512.png';
  let iconMaskable192 = '/icons/admin-icon-maskable-192x192.png';
  let iconMaskable512 = '/icons/admin-icon-maskable-512x512.png';
  let customFavicon = '';
  let themeColor = '#4f46e5';
  let bgColor = '#0f172a';

  try {
    // Timeout of 2500ms prevents long-hanging threads if database or network hangs
    const settings = await fetchApi('/settings/public', {
      signal: AbortSignal.timeout(2500),
    }).catch(() => null);

    if (settings) {
      // Prioritize English name; fallback to Bangla only if no English name is configured
      const englishName = (
        settings.store_name_en ||
        settings.site_name_en ||
        settings.site_title_en ||
        settings.store_name ||
        settings.site_name ||
        settings.site_title ||
        ''
      ).trim();

      const banglaName = (
        settings.store_name_bn ||
        settings.site_name_bn ||
        settings.site_title_bn ||
        ''
      ).trim();

      const resolvedName = englishName || banglaName || storeName;
      storeName = sanitizeText(resolvedName, 40);

      if (settings.admin_theme_color) {
        themeColor = sanitizeHexColor(settings.admin_theme_color, themeColor);
      }

      // Dynamically generated PWA icons from uploaded favicon
      if (settings.admin_icon_192) {
        icon192 = sanitizeUrl(settings.admin_icon_192, icon192);
      }
      if (settings.admin_icon_512) {
        icon512 = sanitizeUrl(settings.admin_icon_512, icon512);
      }
      if (settings.admin_icon_maskable_192) {
        iconMaskable192 = sanitizeUrl(settings.admin_icon_maskable_192, iconMaskable192);
      }
      if (settings.admin_icon_maskable_512) {
        iconMaskable512 = sanitizeUrl(settings.admin_icon_maskable_512, iconMaskable512);
      }
      if (settings.admin_favicon_url) {
        customFavicon = sanitizeUrl(settings.admin_favicon_url, '');
      }
    } else if (cachedManifest) {
      return cachedManifest;
    }
  } catch {
    if (cachedManifest) return cachedManifest;
  }

  const portalName = `${storeName} Admin Portal`;
  const shortName = `${storeName} Admin`;

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

  if (customFavicon && !customFavicon.endsWith('.ico')) {
    manifestIcons.unshift({
      src: customFavicon,
      sizes: 'any',
      type: getIconMimeType(customFavicon),
      purpose: 'any',
    });
  } else {
    manifestIcons.push({
      src: '/icons/admin-icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    });
  }

  const manifestData: MetadataRoute.Manifest = {
    id: 'admin-portal-pwa',
    name: portalName,
    short_name: shortName.length > 20 ? shortName.slice(0, 20) : shortName,
    description: `${storeName} Master Control Panel and Store Administration.`,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: bgColor,
    theme_color: themeColor,
    categories: ['business', 'productivity', 'management'],
    icons: manifestIcons,
    shortcuts: [
      {
        name: 'Orders',
        short_name: 'Orders',
        description: 'View and manage customer orders',
        url: '/orders',
        icons: [{ src: icon192, sizes: '192x192' }],
      },
      {
        name: 'Products',
        short_name: 'Products',
        description: 'Manage catalog, stock and pricing',
        url: '/products',
        icons: [{ src: icon192, sizes: '192x192' }],
      },
      {
        name: 'Store Settings',
        short_name: 'Settings',
        description: 'Configure delivery, payment and store info',
        url: '/settings',
        icons: [{ src: icon192, sizes: '192x192' }],
      },
    ],
  };

  cachedManifest = manifestData;
  lastCacheTime = now;
  return manifestData;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const now = Date.now();

  // 1. Fresh cache: Return immediately (< 0.02ms, 0 CPU load)
  if (cachedManifest && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedManifest;
  }

  // 2. Stale cache available: Return immediately without blocking client requests,
  // and trigger asynchronous background revalidation (0ms wait, 0 thread lock)
  if (cachedManifest) {
    if (!inFlightPromise) {
      inFlightPromise = generateManifest().finally(() => {
        inFlightPromise = null;
      });
    }
    return cachedManifest;
  }

  // 3. Cold boot / first request: Wait for generation once, deduplicating concurrent requests
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = generateManifest();
  try {
    return await inFlightPromise;
  } finally {
    inFlightPromise = null;
  }
}
