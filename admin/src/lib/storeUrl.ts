'use client';

import { useState, useEffect } from 'react';
import { getFrontendUrl } from './urls';

let memoryStoreUrl: string | null = null;

/**
 * Strict URL sanitization and intelligent origin inference
 */
export function sanitizeStoreUrl(raw?: string | null): string {
  const isBrowser = typeof window !== 'undefined';
  const browserHost = isBrowser ? window.location.hostname : '';
  const browserProtocol = isBrowser ? window.location.protocol : 'http:';
  const isRemoteBrowser = isBrowser && browserHost !== 'localhost' && browserHost !== '127.0.0.1';

  // If candidate is empty or invalid
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    // If running in a remote browser (VPS domain, LAN IP, mobile device),
    // dynamically infer from current window.location
    if (isRemoteBrowser) {
      const cleanHost = browserHost.startsWith('admin.')
        ? browserHost.replace(/^admin\./, '')
        : browserHost;
      const port = window.location.port === '4000'
        ? ':3000'
        : window.location.port
        ? `:${window.location.port}`
        : '';
      return `${browserProtocol}//${cleanHost}${port}`;
    }
    // Local development or configured fallback
    return getFrontendUrl();
  }

  let trimmed = raw.trim();

  // Reject javascript:, data:, vbscript: or other dangerous pseudo-protocols
  if (/^(javascript|data|vbscript|blob):/i.test(trimmed)) {
    return isRemoteBrowser
      ? `${browserProtocol}//${browserHost}:3000`
      : 'http://localhost:3000';
  }

  // If candidate is localhost / 127.0.0.1, BUT the browser is accessing from a remote IP / domain:
  // e.g. Phone connected to LAN IP http://192.168.1.50:4000 or production https://admin.example.com
  // 'localhost:3000' would fail completely on the phone. Translate it to current browser host!
  if (isRemoteBrowser && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
    const cleanHost = browserHost.startsWith('admin.')
      ? browserHost.replace(/^admin\./, '')
      : browserHost;
    const port = window.location.port === '4000'
      ? ':3000'
      : window.location.port
      ? `:${window.location.port}`
      : '';
    return `${browserProtocol}//${cleanHost}${port}`;
  }

  // Prepend protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    // If accessed over HTTPS, default to https://
    const preferHttps = isBrowser && browserProtocol === 'https:';
    trimmed = `${preferHttps ? 'https' : 'http'}://${trimmed}`;
  }

  // If the browser is on HTTPS and target URL is HTTP with matching domain,
  // ensure we don't produce mixed-content that triggers browser HTTPS-first upgrade errors
  if (isBrowser && browserProtocol === 'https:' && trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname === browserHost || parsed.hostname === browserHost.replace(/^admin\./, '')) {
        trimmed = trimmed.replace(/^http:\/\//i, 'https://');
      }
    } catch {}
  }

  return trimmed.replace(/\/+$/, '');
}

/**
 * Resolve the best initial guess for the Storefront URL
 */
export function getInitialStoreUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Check localStorage first, then sessionStorage
    try {
      const stored = localStorage.getItem('sf_store_url') || sessionStorage.getItem('sf_store_url');
      if (stored && stored.trim()) {
        const sanitized = sanitizeStoreUrl(stored);
        memoryStoreUrl = sanitized;
        return sanitized;
      }
    } catch {}

    // 2. Infer dynamically from current origin if remote
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const dynamic = sanitizeStoreUrl('');
      memoryStoreUrl = dynamic;
      return dynamic;
    }
  }

  if (memoryStoreUrl) return memoryStoreUrl;

  // 3. Build-time / inlined env variable
  const envUrl = process.env.NEXT_PUBLIC_STORE_URL || process.env.FRONTEND_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    const sanitized = sanitizeStoreUrl(envUrl);
    memoryStoreUrl = sanitized;
    return sanitized;
  }

  const fallback = sanitizeStoreUrl(envUrl || 'http://localhost:3000');
  memoryStoreUrl = fallback;
  return fallback;
}

/**
 * Update the cached store URL across memory, storage, and notify all components in all tabs
 */
export function setCachedStoreUrl(url: string | null | undefined) {
  const cleanUrl = sanitizeStoreUrl(url);
  memoryStoreUrl = cleanUrl;

  if (typeof window !== 'undefined') {
    try {
      if (cleanUrl) {
        localStorage.setItem('sf_store_url', cleanUrl);
        sessionStorage.setItem('sf_store_url', cleanUrl);
      } else {
        localStorage.removeItem('sf_store_url');
        sessionStorage.removeItem('sf_store_url');
      }
      window.dispatchEvent(new CustomEvent('sf_store_url_updated', { detail: cleanUrl }));
    } catch {}
  }
}

/**
 * React hook to always have the latest store URL in any component
 */
export function useStoreUrl(): string {
  const [storeUrl, setStoreUrl] = useState<string>(() => getInitialStoreUrl());

  useEffect(() => {
    // Sync with storage on mount
    const current = getInitialStoreUrl();
    if (current && current !== storeUrl) {
      setStoreUrl(current);
    }

    const handleUpdate = (e: any) => {
      const next = e?.detail || getInitialStoreUrl();
      if (next) setStoreUrl(next);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sf_store_url' && e.newValue) {
        setStoreUrl(sanitizeStoreUrl(e.newValue));
      }
    };

    const handleFocus = () => {
      const latest = getInitialStoreUrl();
      if (latest && latest !== storeUrl) {
        setStoreUrl(latest);
      }
    };

    window.addEventListener('sf_store_url_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('sf_store_url_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [storeUrl]);

  return storeUrl;
}
