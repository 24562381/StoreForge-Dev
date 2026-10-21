'use client';

import React from 'react';
import { Languages, Plus, Trash2, RotateCcw } from 'lucide-react';

interface ProductEditHighlightsSectionProps {
  features: any[];
  setFeatures: React.Dispatch<React.SetStateAction<any[]>>;
  featuresLangMode: 'both' | 'en' | 'bn';
  setFeaturesLangMode: (mode: 'both' | 'en' | 'bn') => void;
  onAddFeature: () => void;
  onRemoveFeature: (idx: number) => void;
  isDefaultHighlights?: boolean;
  onResetToDefaultHighlights?: () => void;
}

export const ProductEditHighlightsSection = React.memo(function ProductEditHighlightsSection({
  features,
  setFeatures,
  featuresLangMode,
  setFeaturesLangMode,
  onAddFeature,
  onRemoveFeature,
  isDefaultHighlights = false,
  onResetToDefaultHighlights,
}: ProductEditHighlightsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#c08a46]" /> 2. Key Highlights & Bullet Specs (Bilingual)
            </h2>
            {isDefaultHighlights ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Default from Settings
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Custom Product Highlights
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pre-filled with default highlights from Settings. You can keep them, modify them, or add custom highlights for this product.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFeaturesLangMode('en')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                featuresLangMode === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English (EN)
            </button>
            <button
              type="button"
              onClick={() => setFeaturesLangMode('bn')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                featuresLangMode === 'bn' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা (BN)
            </button>
            <button
              type="button"
              onClick={() => setFeaturesLangMode('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                featuresLangMode === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {onResetToDefaultHighlights && !isDefaultHighlights && (
            <button
              type="button"
              onClick={onResetToDefaultHighlights}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Reset highlights to defaults set from Settings"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c08a46]" />
              <span>Use Settings Defaults</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddFeature}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Highlight
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((f, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-slate-200/70 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c08a46] text-white text-[10px] flex items-center justify-center font-mono font-bold">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {f.title || `Highlight #${idx + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-[11px] font-bold">Icon:</span>
                  <select
                    value={f.icon || 'feather'}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx] = { ...updated[idx], icon: e.target.value };
                      setFeatures(updated);
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#c08a46] cursor-pointer"
                  >
                    <option value="feather">🪶 Feather / Natural Wood</option>
                    <option value="layers">🥞 Layers / 3D Relief</option>
                    <option value="compass">🧭 Compass / Laser Precision</option>
                    <option value="shield">🛡️ Shield / Quality & Warranty</option>
                    <option value="sparkles">✨ Sparkles / Premium Finish</option>
                    <option value="check">✅ Checkmark / Verified Spec</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFeature(idx)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                  title="Remove highlight"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feature Title (EN & BN) */}
            <div className={`grid gap-2.5 ${featuresLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {(featuresLangMode === 'both' || featuresLangMode === 'en') && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5 flex items-center justify-between">
                    <span>Title (English)</span>
                    <span className="text-[9px] px-1 rounded bg-slate-200/70 text-slate-600 font-mono">EN</span>
                  </label>
                  <input
                    type="text"
                    value={f.title}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].title = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="e.g. Premium Natural Birch Wood"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold"
                  />
                </div>
              )}
              {(featuresLangMode === 'both' || featuresLangMode === 'bn') && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-800 mb-0.5 flex items-center justify-between">
                    <span>শিরোনাম (বাংলা - BN)</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
                  </label>
                  <input
                    type="text"
                    value={f.titleBn || ''}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].titleBn = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="যেমন: প্রিমিয়াম প্রাকৃতিক বার্চ কাঠ"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs font-bold"
                  />
                </div>
              )}
            </div>

            {/* Feature Description (EN & BN) */}
            <div className={`grid gap-2.5 ${featuresLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {(featuresLangMode === 'both' || featuresLangMode === 'en') && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5 flex items-center justify-between">
                    <span>Description (English)</span>
                    <span className="text-[9px] px-1 rounded bg-slate-200/70 text-slate-600 font-mono">EN</span>
                  </label>
                  <textarea
                    rows={2}
                    value={f.description}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].description = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="Handcrafted from 100% natural, eco-friendly certified birch plywood..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs"
                  />
                </div>
              )}
              {(featuresLangMode === 'both' || featuresLangMode === 'bn') && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-800 mb-0.5 flex items-center justify-between">
                    <span>বিবরণ (বাংলা - BN)</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
                  </label>
                  <textarea
                    rows={2}
                    value={f.descriptionBn || ''}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].descriptionBn = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="১০০% পরিবেশবান্ধব প্রাকৃতিক বার্চ কাঠ থেকে নিপুণ কারিগরি দক্ষতায় তৈরি..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-50/40 border border-emerald-200 text-slate-800 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductEditHighlightsSection;
