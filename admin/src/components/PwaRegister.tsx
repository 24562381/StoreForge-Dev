'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '../lib/api';

export function PwaRegister() {
  const pathname = usePathname() || '';
  const isSettingsPage = pathname.startsWith('/settings');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [storeName, setStoreName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sf_admin_site_title') || localStorage.getItem('sf_store_name') || '').trim();
    }
    return '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fetch live configured store name from backend settings
    fetchApi('/settings/public')
      .then((data) => {
        const resolvedName = (
          data?.store_name_en ||
          data?.store_name ||
          data?.site_name ||
          data?.site_title ||
          data?.store_name_bn ||
          data?.site_name_bn ||
          ''
        ).trim();
        if (resolvedName) {
          setStoreName(resolvedName);
          try {
            localStorage.setItem('sf_admin_site_title', resolvedName);
          } catch {}
        }
      })
      .catch(() => {});

    const handleTitleUpdated = (e: any) => {
      if (e?.detail && typeof e.detail === 'string' && e.detail.trim()) {
        const newName = e.detail.trim();
        setStoreName(newName);
        try {
          localStorage.setItem('sf_admin_site_title', newName);
        } catch {}
      }
    };

    window.addEventListener('sf_site_title_updated', handleTitleUpdated);

    // 1. Standalone mode detection
    const checkStandalone = () => {
      const standalone = Boolean(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
      setIsStandalone(standalone);
      return standalone;
    };

    if (checkStandalone()) return;

    // 2. Immediate Service Worker Registration
    if ('serviceWorker' in navigator) {
      const registerWorker = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          reg.update().catch(() => {});

          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Admin PWA] Admin portal update ready');
                }
              });
            }
          });
        } catch (err) {
          console.warn('[Admin PWA] Service worker registration error:', err);
        }
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerWorker();
      } else {
        window.addEventListener('DOMContentLoaded', registerWorker, { once: true });
        window.addEventListener('load', registerWorker, { once: true });
      }
    } else if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      console.warn(
        `[Admin PWA] Service workers & PWA installation require HTTPS or localhost. Current origin (${window.location.origin}) is non-secure HTTP. PWA features are disabled by browser security policy.`
      );
    }

    // 3. Handle beforeinstallprompt for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed in this session
      const dismissed = sessionStorage.getItem('sf_admin_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('sf_site_title_updated', handleTitleUpdated);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch {}
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('sf_admin_pwa_dismissed', '1');
    } catch {}
  }, []);

  if (!showPrompt || isStandalone) {
    return null;
  }

  const displayName = storeName ? `${storeName} Admin` : 'StoreForge Admin';

  return (
    <div
      id="adminPwaInstallBanner"
      className={`fixed ${
        isSettingsPage ? 'bottom-3 md:bottom-24' : 'bottom-3 md:bottom-6'
      } left-3 sm:left-4 md:left-auto md:right-6 z-50 max-w-[280px] sm:max-w-xs w-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center gap-2 sm:gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 print:hidden`}
      role="banner"
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1 border border-indigo-500/40">
        <img
          src="/icons/admin-icon-192x192.png"
          alt={`${displayName} App`}
          className="w-full h-full object-contain rounded-md"
          width="32"
          height="32"
        />
      </div>

      <div className="flex-1 min-w-0 pr-0.5">
        <h4 className="text-[12px] sm:text-[13px] font-bold text-slate-100 truncate leading-tight">
          {displayName} App
        </h4>
        <p className="hidden sm:block text-[10px] text-slate-400 leading-snug line-clamp-1 mt-0.5">
          Fast management & desktop app
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[11px] font-extrabold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded-md hover:bg-slate-800 text-[10px] transition-colors cursor-pointer"
          aria-label="Dismiss"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default PwaRegister;
