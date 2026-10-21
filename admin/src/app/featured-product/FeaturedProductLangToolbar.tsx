'use client';

import React from 'react';
import { Languages, Wand2, Bot, Loader2 } from 'lucide-react';

interface FeaturedProductLangToolbarProps {
  langMode: 'both' | 'en' | 'bn';
  setLangMode: (mode: 'both' | 'en' | 'bn') => void;
  onAutoTranslate: (direction: 'en_to_bn' | 'bn_to_en') => void;
  translateLoading: boolean;
  aiAction: string | null;
}

export const FeaturedProductLangToolbar = React.memo(function FeaturedProductLangToolbar({
  langMode,
  setLangMode,
  onAutoTranslate,
  translateLoading,
  aiAction,
}: FeaturedProductLangToolbarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Languages className="w-4 h-4 text-[#c08a46]" />
          <span>Translation View Mode:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setLangMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              langMode === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Side-by-Side (Both)</span>
          </button>
          <button
            type="button"
            onClick={() => setLangMode('bn')}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              langMode === 'bn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>বাংলা (BN)</span>
          </button>
          <button
            type="button"
            onClick={() => setLangMode('en')}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              langMode === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>English (EN)</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onAutoTranslate('en_to_bn')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          title="Translate all English fields to Bengali using AI"
        >
          {translateLoading && aiAction === 'en_to_bn' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c08a46]" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-[#c08a46]" />
          )}
          <span>AI Auto-Translate (EN ➔ বাংলা)</span>
        </button>

        <button
          type="button"
          onClick={() => onAutoTranslate('bn_to_en')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 text-blue-900 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          title="Translate all Bengali fields to English using AI"
        >
          {translateLoading && aiAction === 'bn_to_en' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Bot className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>AI Auto-Translate (বাংলা ➔ EN)</span>
        </button>
      </div>
    </div>
  );
});

export default FeaturedProductLangToolbar;
