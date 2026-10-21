'use client';

import React from 'react';
import { Package, RotateCcw } from 'lucide-react';

interface FeaturedProductSelectorProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  products: any[];
  selectedProductId: string;
  onProductChange: (id: string) => void;
  selectedProduct: any;
  onResetFromProduct: () => void;
  langMode: 'both' | 'en' | 'bn';
  sectionTitleBn: string;
  setSectionTitleBn: (val: string) => void;
  sectionTitleEn: string;
  setSectionTitleEn: (val: string) => void;
  sectionSubtitleBn: string;
  setSectionSubtitleBn: (val: string) => void;
  sectionSubtitleEn: string;
  setSectionSubtitleEn: (val: string) => void;
}

export const FeaturedProductSelector = React.memo(function FeaturedProductSelector({
  enabled,
  setEnabled,
  products,
  selectedProductId,
  onProductChange,
  selectedProduct,
  onResetFromProduct,
  langMode,
  sectionTitleBn,
  setSectionTitleBn,
  sectionTitleEn,
  setSectionTitleEn,
  sectionSubtitleBn,
  setSectionSubtitleBn,
  sectionSubtitleEn,
  setSectionSubtitleEn,
}: FeaturedProductSelectorProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Package className="w-4 h-4 text-[#c08a46]" />
          <span>1. Select Product & Section Headers</span>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-xs font-bold text-slate-700">Section Enabled</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-[#c08a46] focus:ring-[#c08a46] cursor-pointer"
          />
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Featured Product
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:border-[#c08a46] cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.slug ? `(${p.slug})` : ''} — ৳{Number(p.variants?.[0]?.price || p.basePrice || 0).toLocaleString()}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Selected: <strong>{selectedProduct?.name}</strong></span>
            <button
              type="button"
              onClick={onResetFromProduct}
              className="text-[#c08a46] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Auto-fill from Product
            </button>
          </div>
        </div>

        {/* Section Heading & Subtitle (Bilingual) */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {(langMode === 'both' || langMode === 'bn') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Section Title (বাংলা)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
                </label>
                <input
                  type="text"
                  value={sectionTitleBn}
                  onChange={(e) => setSectionTitleBn(e.target.value)}
                  placeholder="e.g. ওয়ার্ল্ড ম্যাপ / এক্সক্লুসিভ কালেকশন"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            )}

            {(langMode === 'both' || langMode === 'en') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Section Title (English)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
                </label>
                <input
                  type="text"
                  value={sectionTitleEn}
                  onChange={(e) => setSectionTitleEn(e.target.value)}
                  placeholder="e.g. Premium Exclusive Collection"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            )}
          </div>

          <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {(langMode === 'both' || langMode === 'bn') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Section Subtitle (বাংলা)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
                </label>
                <input
                  type="text"
                  value={sectionSubtitleBn}
                  onChange={(e) => setSectionSubtitleBn(e.target.value)}
                  placeholder="e.g. আমাদের সবচেয়ে প্রশংসিত হস্তনির্মিত কাঠের শিল্পকর্ম"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            )}

            {(langMode === 'both' || langMode === 'en') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Section Subtitle (English)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
                </label>
                <input
                  type="text"
                  value={sectionSubtitleEn}
                  onChange={(e) => setSectionSubtitleEn(e.target.value)}
                  placeholder="e.g. Our most admired handcrafted wooden artwork"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeaturedProductSelector;
