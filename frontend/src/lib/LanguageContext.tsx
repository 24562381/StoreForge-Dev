'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchApi } from './api';

type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, fallback?: string) => string;
  formatNum: (num: string | number) => string;
}

const bnDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

// OPTIMIZATION: Module-scoped precompiled regex for digit replacement
const DIGIT_REGEX = /[0-9]/g;

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  t: (key, fallback) => fallback || key,
  formatNum: (num) => String(num),
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Language;
  initialDictionary?: Record<string, string>;
}> = ({ children, initialLang, initialDictionary = {} }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sf_lang');
        if (saved === 'bn' || saved === 'en') return saved as Language;
        const match = document.cookie.match(/(?:^|;\s*)sf_lang=(bn|en)/);
        if (match) return match[1] as Language;
      } catch {}
    }
    return 'bn';
  });
  const [dictionary, setDictionary] = useState<Record<string, string>>(initialDictionary);
  const loadedLangRef = React.useRef<string | null>(
    initialDictionary && Object.keys(initialDictionary).length > 0 ? (initialLang || 'bn') : null
  );

  useEffect(() => {
    if (initialDictionary && Object.keys(initialDictionary).length > 0) {
      setDictionary((prev) => (Object.keys(prev).length === 0 ? initialDictionary : prev));
      if (!loadedLangRef.current && initialLang) {
        loadedLangRef.current = initialLang;
      }
    }
  }, [initialDictionary, initialLang]);

  useEffect(() => {
    const saved = localStorage.getItem('sf_lang') as Language;
    if (!saved && !initialLang) {
      // If user hasn't explicitly set a preference, load system default language
      fetchApi('/settings/public')
        .then((s) => {
          if (s?.default_language === 'en' || s?.default_language === 'bn') {
            setLangState(s.default_language);
          }
        })
        .catch(() => {});
    }
  }, [initialLang]);

  useEffect(() => {
    // If dictionary for current lang was already provided via initialDictionary, skip the redundant initial fetch
    if (loadedLangRef.current === lang && Object.keys(dictionary).length > 0) {
      return;
    }

    let cancelled = false;
    fetchApi(`/translations/dictionary?lang=${lang}`)
      .then((data) => {
        if (!cancelled && data && typeof data === 'object') {
          setDictionary(data);
          loadedLangRef.current = lang;
        }
      })
      .catch((err) => console.warn('Could not load translations dictionary:', err));

    return () => {
      cancelled = true;
    };
  }, [lang, dictionary]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('sf_lang', l);
    document.cookie = `sf_lang=${l};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  // OPTIMIZATION: useCallback prevents unnecessary re-rendering of consumer components
  const t = useCallback(
    (key: string, fallback?: string) => {
      return dictionary[key] || fallback || key;
    },
    [dictionary],
  );

  // OPTIMIZATION: useCallback for formatNum
  const formatNum = useCallback(
    (num: string | number): string => {
      const str = String(num);
      if (lang !== 'bn') return str;
      return str.replace(DIGIT_REGEX, (w) => bnDigits[w] || w);
    },
    [lang],
  );

  // OPTIMIZATION: useMemo ensures React only updates consumer components when lang or dictionary changes
  const contextValue = useMemo(
    () => ({ lang, setLang, t, formatNum }),
    [lang, setLang, t, formatNum],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

