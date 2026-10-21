'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';
import { useSettings } from '../lib/SettingsContext';
import { fetchApi } from '../lib/api';

export function PwaRegister() {
  const pathname = usePathname() || '';
  const isProductPage = pathname.startsWith('/products/');
  const { lang } = useLanguage();
  const { settings, refreshSettings } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [fallbackSettings, setFallbackSettings] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sf_public_settings');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {};
  });

  // Effective merged settings (context settings prioritized, fallback to cached settings)
  const activeSettings = useMemo(() => {
    return Object.keys(settings).length > 0 ? settings : fallbackSettings;
  }, [settings, fallbackSettings]);

  const storeName = useMemo(() => {
    const isBn = lang === 'bn';

    // 1. Language-specific configured names from settings
    if (isBn) {
      const bnName = (activeSettings?.store_name_bn || activeSettings?.site_name_bn || activeSettings?.site_title_bn || '').trim();
      if (bnName) return bnName;
    } else {
      const enName = (activeSettings?.store_name_en || activeSettings?.site_name_en || activeSettings?.site_title_en || '').trim();
      if (enName) return enName;
    }

    // 2. Cross-language configured store or site name from settings
    const configuredName = (
      activeSettings?.store_name ||
      activeSettings?.site_name ||
      activeSettings?.site_title ||
      activeSettings?.store_name_en ||
      activeSettings?.site_title_en ||
      activeSettings?.store_name_bn ||
      activeSettings?.site_title_bn ||
      ''
    ).trim();

    if (configuredName) return configuredName;

    return isBn ? 'স্টোরফোর্জ' : 'StoreForge';
  }, [lang, activeSettings]);

  // Icon URL from settings (PWA proxy icon, uploaded store icon, or fallback)
  const iconUrl = useMemo(() => {
    return (
      activeSettings?.store_icon_192 ||
      activeSettings?.store_favicon_url ||
      '/icons/icon-192x192.png'
    );
  }, [activeSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fetch fresh settings on mount if settings appear empty
    if (!activeSettings || Object.keys(activeSettings).length === 0 || !activeSettings.store_name) {
      fetchApi('/settings/public', { cache: 'no-store' })
        .then((data) => {
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setFallbackSettings(data);
            try {
              localStorage.setItem('sf_public_settings', JSON.stringify(data));
            } catch {}
          }
        })
        .catch(() => {});
    }

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail && typeof e.detail === 'object') {
        setFallbackSettings(e.detail);
      }
    };
    window.addEventListener('sf_settings_updated', handleSettingsUpdated);

    // 1. Detect if running as standalone PWA
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
                  console.log('[PWA] Storefront update ready');
                }
              });
            }
          });
        } catch (err) {
          console.warn('[PWA] Service worker registration error:', err);
        }
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerWorker();
      } else {
        window.addEventListener('DOMContentLoaded', registerWorker, { once: true });
        window.addEventListener('load', registerWorker, { once: true });
      }
    }

    // 3. Handle beforeinstallprompt for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed in this session
      const dismissed = sessionStorage.getItem('sf_pwa_dismissed');
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
      window.removeEventListener('sf_settings_updated', handleSettingsUpdated);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [activeSettings]);

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
      sessionStorage.setItem('sf_pwa_dismissed', '1');
    } catch {}
  }, []);

  if (!showPrompt || isStandalone) {
    return null;
  }

  const isBn = lang === 'bn';

  return (
    <div
      id="pwaInstallBanner"
      className={`fixed ${
        isProductPage
          ? 'bottom-[calc(66px+env(safe-area-inset-bottom,8px))] lg:bottom-4'
          : 'bottom-3 sm:bottom-4'
      } left-3 sm:left-4 z-50 max-w-[280px] sm:max-w-xs w-auto bg-stone-900/95 backdrop-blur-md text-white border border-stone-700/80 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center gap-2 sm:gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
      role="banner"
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8e5a35] flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1 border border-stone-600/50">
        <img
          src={iconUrl}
          alt={`${storeName} App`}
          className="w-full h-full object-contain rounded-md"
          width="32"
          height="32"
        />
      </div>

      <div className="flex-1 min-w-0 pr-0.5">
        <h4 className="text-[12px] sm:text-[13px] font-bold text-stone-100 truncate leading-tight">
          {isBn ? `${storeName} অ্যাপ` : `${storeName} App`}
        </h4>
        <p className="hidden sm:block text-[10px] text-stone-400 leading-snug line-clamp-1 mt-0.5">
          {isBn ? 'সহজ কেনাকাটা ও দ্রুত লোডিং' : 'Fast shopping & offline access'}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-2.5 py-1 bg-[#8e5a35] hover:bg-[#724526] active:scale-95 text-white text-[11px] font-extrabold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          {isBn ? 'ইনস্টল' : 'Install'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-5 h-5 flex items-center justify-center text-stone-400 hover:text-white rounded-md hover:bg-stone-800 text-[10px] transition-colors cursor-pointer"
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
