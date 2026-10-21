'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Languages, Sparkles, Save } from 'lucide-react';

interface ProductAddHeaderProps {
  prefix: string;
  translateLoading: boolean;
  aiAction?: 'en_to_bn' | 'bn_to_en' | null;
  aiLoading: boolean;
  loading: boolean;
  onAutoTranslateAll: (direction?: 'en_to_bn' | 'bn_to_en') => void;
  onAiProofread: () => void;
}

export const ProductAddHeader = React.memo(function ProductAddHeader({
  prefix,
  translateLoading,
  aiAction,
  aiLoading,
  loading,
  onAutoTranslateAll,
  onAiProofread,
}: ProductAddHeaderProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <Link
          href={`${prefix}/products`}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create New Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add 3D wooden map with multi-size pricing, color stains, TipTap rich text, and bilingual translations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => onAutoTranslateAll('en_to_bn')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          title="Auto-translate English product details to Bengali"
        >
          <Languages className="w-3.5 h-3.5 text-[#c08a46]" />
          <span>{translateLoading && aiAction === 'en_to_bn' ? 'Translating...' : 'Auto-Translate (EN ➔ বাংলা)'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAutoTranslateAll('bn_to_en')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          title="Auto-translate Bengali product details to English"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{translateLoading && aiAction === 'bn_to_en' ? 'Translating...' : 'Auto-Translate (বাংলা ➔ EN)'}</span>
        </button>

        <button
          type="button"
          onClick={onAiProofread}
          disabled={aiLoading}
          title="Simultaneously proofread, polish grammar, and harmonize both English and Bengali copy with AI"
          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{aiLoading ? 'Proofreading (EN & বাংলা)...' : 'AI Auto-Proofread (EN & বাংলা)'}</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Creating...' : 'Publish Product'}</span>
        </button>
      </div>
    </div>
  );
});

export default ProductAddHeader;
