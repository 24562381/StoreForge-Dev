'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from '../lib/SettingsContext';

const TRIM_SLASHES_REGEX = /^\/+|\/+$/g;
const COOKIE_SLUG_REGEX = /(?:^|;\s*)admin_active_slug=([^;]*)/;

function getAdminActiveSlug(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(COOKIE_SLUG_REGEX);
  if (!match) return '';
  return decodeURIComponent(match[1]).trim().toLowerCase().replace(TRIM_SLASHES_REGEX, '') || '';
}

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
  const { settings } = useSettings();

  useEffect(() => {
    try {
      const res = settings;
      if (!res || Object.keys(res).length === 0) return;

      const cleanPath = (pathname || '').trim().replace(TRIM_SLASHES_REGEX, '').toLowerCase();
      const firstSegment = cleanPath.split('/')[0] || '';
      const activeAdminSlug = getAdminActiveSlug();

      const isAdmin =
        pathname.startsWith('/admin') ||
        cleanPath === 'admin' ||
        firstSegment === 'admin' ||
        Boolean(activeAdminSlug && (cleanPath === activeAdminSlug || firstSegment === activeAdminSlug));

      const targetFavicon = isAdmin
        ? res.admin_favicon_url || res.store_favicon_url || '/icons/icon.svg'
        : res.store_favicon_url || '/icons/icon.svg';

      if (targetFavicon) {
        setFavicon(targetFavicon);
      }
    } catch {}
  }, [pathname, settings]);

  return null;
}
