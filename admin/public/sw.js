/* ==========================================================================
   StoreForge Admin Portal — Service Worker
   Fast UI caching, offline protection, real-time data integrity
   ========================================================================== */

const CACHE_NAME = 'sf-admin-portal-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/css/globals.css',
  '/icons/admin-icon-192x192.png',
  '/icons/admin-icon.svg',
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
            console.warn('[Admin SW] Pre-caching skipped for:', url, err);
          }
        })
      );
    })
  );
});

// Activate: clean up older cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
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

  // Never intercept non-GET requests or dynamic API endpoints
  if (request.method !== 'GET' || !url.origin.startsWith(self.location.origin) || url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (Admin pages) — Network first to guarantee latest data
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
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Portal Offline</title></head><body><h1>Offline</h1><p>The Admin Management Portal requires an active connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Static UI assets (CSS, JS, admin icon images) — Stale-while-revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Fallback for all other GET requests
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
