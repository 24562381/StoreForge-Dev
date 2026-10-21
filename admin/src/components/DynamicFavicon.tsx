'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

let cachedSettings: Record<string, string> | null = null;
let lastFetchTime = 0;

function setFavicon(url: string) {
  if (!url || typeof document === 'undefined') return;

  const cleanUrl = url.split('?')[0].toLowerCase();
  let mimeType = 'image/x-icon';
  if (cleanUrl.endsWith('.webp')) mimeType = 'image/webp';
  else if (cleanUrl.endsWith('.png')) mimeType = 'image/png';
  else if (cleanUrl.endsWith('.svg')) mimeType = 'image/svg+xml';
  else if (cleanUrl.endsWith('.ico')) mimeType = 'image/x-icon';
  else if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) mimeType = 'image/jpeg';

  // Remove existing non-apple icon links so the browser reliably replaces the tab icon
  const existingIcons = document.querySelectorAll("link[rel*='icon']");
  existingIcons.forEach((el) => {
    if (el.getAttribute('rel')?.toLowerCase().includes('apple')) return;
    el.parentNode?.removeChild(el);
  });

  const link = document.createElement('link');
  link.id = 'dynamic-favicon';
  link.rel = 'icon';
  link.type = mimeType;
  link.href = url;
  document.head.appendChild(link);

  const shortcut = document.createElement('link');
  shortcut.id = 'dynamic-shortcut-favicon';
  shortcut.rel = 'shortcut icon';
  shortcut.type = mimeType;
  shortcut.href = url;
  document.head.appendChild(shortcut);

  const apple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
  if (apple) {
    apple.href = url;
  }
}

export function DynamicFavicon() {
  const pathname = usePathname() || '';

  useEffect(() => {
    let isMounted = true;

    // Immediately try to apply from localStorage if available (instant 0ms feedback)
    try {
      const stored = localStorage.getItem('sf_admin_favicon');
      if (stored) {
        setFavicon(stored);
      }
    } catch {}

    async function syncFavicon() {
      try {
        const now = Date.now();
        let res = cachedSettings;
        if (!res || now - lastFetchTime > 30000) {
          res = await fetchApi('/settings/public', { cache: 'no-store' });
          if (res) {
            cachedSettings = res;
            lastFetchTime = now;
          }
        }
        if (!res || !isMounted) return;

        // In the Admin portal, always use admin_favicon_url, fallback to store_favicon_url, then default icon
        const targetFavicon = res.admin_favicon_url || res.store_favicon_url || '/icons/icon.svg';

        if (targetFavicon) {
          setFavicon(targetFavicon);
          try {
            localStorage.setItem('sf_admin_favicon', targetFavicon);
          } catch {}
        }
      } catch {}
    }

    syncFavicon();

    const handleFaviconUpdated = (e: any) => {
      const newUrl = e?.detail;
      if (newUrl && typeof newUrl === 'string') {
        cachedSettings = null;
        lastFetchTime = 0;
        setFavicon(newUrl);
        try {
          localStorage.setItem('sf_admin_favicon', newUrl);
        } catch {}
      }
    };

    window.addEventListener('sf_favicon_updated', handleFaviconUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('sf_favicon_updated', handleFaviconUpdated);
    };
  }, [pathname]);

  return null;
}
