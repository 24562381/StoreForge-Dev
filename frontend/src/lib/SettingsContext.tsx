'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchApi } from './api';

interface SettingsContextType {
  settings: Record<string, string>;
  categories: any[];
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  categories: [],
  refreshSettings: async () => {},
  loading: false,
});

export const SettingsProvider: React.FC<{
  children: React.ReactNode;
  initialSettings?: Record<string, string>;
  initialCategories?: any[];
}> = ({ children, initialSettings = {}, initialCategories = [] }) => {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      return initialSettings;
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sf_public_settings');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {};
  });

  const [categories, setCategories] = useState<any[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sf_categories');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [loading, setLoading] = useState(false);

  // Synchronize when initialSettings change from SSR stream
  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings(initialSettings);
      try {
        localStorage.setItem('sf_public_settings', JSON.stringify(initialSettings));
      } catch {}
    }
  }, [initialSettings]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      try {
        localStorage.setItem('sf_categories', JSON.stringify(initialCategories));
      } catch {}
    }
  }, [initialCategories]);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [newSettings, newCategories] = await Promise.all([
        fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({})),
        fetchApi('/categories?activeOnly=true', { cache: 'no-store' }).catch(() => []),
      ]);
      if (newSettings && typeof newSettings === 'object' && Object.keys(newSettings).length > 0) {
        setSettings(newSettings);
        try {
          localStorage.setItem('sf_public_settings', JSON.stringify(newSettings));
          window.dispatchEvent(new CustomEvent('sf_settings_updated', { detail: newSettings }));
        } catch {}
      }
      if (Array.isArray(newCategories) && newCategories.length > 0) {
        setCategories(newCategories);
        try {
          localStorage.setItem('sf_categories', JSON.stringify(newCategories));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to refresh public settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guarantee settings are refreshed immediately on client mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      settings,
      categories,
      refreshSettings,
      loading,
    }),
    [settings, categories, refreshSettings, loading]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
