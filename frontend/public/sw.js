/* ==========================================================================
   StoreForge Storefront — Service Worker
   Offline shell caching, stale-while-revalidate for static assets, network-first for pages
   ========================================================================== */

const CACHE_NAME = 'sf-storefront-v11';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/no-image.svg',
  '/images/no-image.svg',
  '/css/globals.css',
  '/css/icons.css',
  '/css/site/header-footer.css',
  '/icons/icon-192x192.png',
  '/icons/favicon-32x32.png',
  '/manifest.json'
];

// Install: precache offline shell and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && (res.status === 200 || res.type === 'opaque')) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW] Pre-caching skipped for:', url, err);
          }
        })
      );
    })
  );
});

// Activate: purge stale cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET, cross-origin requests, and dynamic API endpoints
  if (request.method !== 'GET' || !url.origin.startsWith(self.location.origin) || url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. CSS Stylesheets: NETWORK-FIRST to prevent stale CSS caching
  if (request.destination === 'style' || url.pathname.endsWith('.css') || url.pathname.includes('/css/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Static assets (JS, WebP/PNG/SVG images, fonts)
  if (
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/uploads/') ||
    /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(url.pathname)
  ) {
    const isImage = request.destination === 'image' || /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(url.pathname);

    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            } else if (isImage && networkResponse && networkResponse.status >= 400) {
              // Image returned 404 or server error -> fallback to cached no-image.svg
              return caches.match('/no-image.svg').then((noImg) => noImg || caches.match('/images/no-image.svg') || networkResponse);
            }
            return networkResponse;
          })
          .catch(async () => {
            if (cachedResponse) return cachedResponse;
            if (isImage) {
              const fallback = await caches.match('/no-image.svg') || await caches.match('/images/no-image.svg');
              if (fallback) return fallback;
            }
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. All other requests: Network with fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
