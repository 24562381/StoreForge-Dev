'use client';

import React from 'react';
import { Globe2, Sparkles, RotateCcw } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import { DEFAULT_WARNING_EN, DEFAULT_WARNING_BN } from '@/lib/productDefaults';

const generateSlug = (val: string): string => {
  return (val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface ProductEditContentSectionProps {
  contentLangMode: 'both' | 'en' | 'bn';
  setContentLangMode: (mode: 'both' | 'en' | 'bn') => void;
  hasSizeVariants: boolean;
  setHasSizeVariants: (v: boolean) => void;
  hasColorVariants: boolean;
  setHasColorVariants: (v: boolean) => void;
  isExclusive?: boolean;
  setIsExclusive?: (v: boolean) => void;
  slug: string;
  setSlug: (s: string) => void;
  categoryId: number | '';
  setCategoryId: (id: number | '') => void;
  categories: any[];
  status: string;
  setStatus: (st: string) => void;
  name: string;
  setName: (n: string) => void;
  nameBn: string;
  setNameBn: (n: string) => void;
  tagline: string;
  setTagline: (t: string) => void;
  taglineBn: string;
  setTaglineBn: (t: string) => void;
  shortDescription: string;
  setShortDescription: (s: string) => void;
  shortDescriptionBn: string;
  setShortDescriptionBn: (s: string) => void;
  fullDescription: string;
  setFullDescription: (f: string) => void;
  fullDescriptionBn: string;
  setFullDescriptionBn: (f: string) => void;
  warningText: string;
  setWarningText: (w: string) => void;
  warningTextBn: string;
  setWarningTextBn: (w: string) => void;
  defaultWarningEn?: string;
  defaultWarningBn?: string;
  onResetWarningToDefault?: () => void;
}

export const ProductEditContentSection = React.memo(function ProductEditContentSection({
  contentLangMode,
  setContentLangMode,
  hasSizeVariants,
  setHasSizeVariants,
  hasColorVariants,
  setHasColorVariants,
  slug,
  setSlug,
  categoryId,
  setCategoryId,
  categories,
  status,
  setStatus,
  name,
  setName,
  nameBn,
  setNameBn,
  tagline,
  setTagline,
  taglineBn,
  setTaglineBn,
  shortDescription,
  setShortDescription,
  shortDescriptionBn,
  setShortDescriptionBn,
  fullDescription,
  setFullDescription,
  fullDescriptionBn,
  setFullDescriptionBn,
  warningText,
  setWarningText,
  warningTextBn,
  setWarningTextBn,
  defaultWarningEn,
  defaultWarningBn,
  onResetWarningToDefault,
}: ProductEditContentSectionProps) {
  const effectiveDefaultEn = defaultWarningEn || DEFAULT_WARNING_EN;
  const effectiveDefaultBn = defaultWarningBn || DEFAULT_WARNING_BN;
  const isDefaultWarning =
    (!warningText || warningText.trim() === effectiveDefaultEn.trim()) &&
    (!warningTextBn || warningTextBn.trim() === effectiveDefaultBn.trim());
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
          <Globe2 className="w-4 h-4 text-[#c08a46]" /> 1. Content & Bilingual Translations
        </h2>

        {/* Language Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setContentLangMode('en')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              contentLangMode === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English (EN)
          </button>
          <button
            type="button"
            onClick={() => setContentLangMode('bn')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              contentLangMode === 'bn' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা (BN)
          </button>
          <button
            type="button"
            onClick={() => setContentLangMode('both')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              contentLangMode === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Option Toggles */}
      <div className="grid grid-cols-1 gap-2">
        <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={hasSizeVariants}
            onChange={(e) => setHasSizeVariants(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-[#c08a46]"
          />
          <div>
            <div className="text-xs font-bold text-slate-900">Enable Multiple Sizes</div>
            <div className="text-[11px] text-slate-500">Allow customers to choose from 4ft, 5ft, 6ft, 8ft</div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={hasColorVariants}
            onChange={(e) => setHasColorVariants(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-[#c08a46]"
          />
          <div>
            <div className="text-xs font-bold text-slate-900">Enable Color / Stain Swatches</div>
            <div className="text-[11px] text-slate-500">Enable wood stain variations (Terra, Oak, Birch)</div>
          </div>
        </label>
      </div>

      {/* URL Slug, Categories, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">URL Slug *</label>
            <button
              type="button"
              onClick={() => setSlug(generateSlug(name))}
              className="text-[11px] font-bold text-[#c08a46] hover:text-[#9a6a2f] inline-flex items-center gap-1 transition-colors cursor-pointer"
              title="Generate slug from English product name"
            >
              <Sparkles className="w-3 h-3" /> Auto-generate
            </button>
          </div>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="3d-wooden-world-map"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          >
            <option value="">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          >
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Bilingual Field 1: Product Name */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className={`grid gap-3 ${contentLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(contentLangMode === 'both' || contentLangMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Product Name (English) *</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  const prevAuto = generateSlug(name);
                  const newAuto = generateSlug(val);
                  setName(val);
                  if (!slug.trim() || slug === prevAuto) {
                    setSlug(newAuto);
                  }
                }}
                placeholder="e.g. 3D Wooden World Map"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
          {(contentLangMode === 'both' || contentLangMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                <span>পণ্যের নাম (বাংলা - BN)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: ৩ডি কাঠের বিশ্ব মানচিত্র"
                className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilingual Field 2: Tagline */}
      <div className="space-y-2">
        <div className={`grid gap-3 ${contentLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(contentLangMode === 'both' || contentLangMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Tagline (English)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Transform Your Wall Into a Piece of Art"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
          {(contentLangMode === 'both' || contentLangMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                <span>ট্যাগলাইন (বাংলা - BN)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
              </label>
              <input
                type="text"
                value={taglineBn}
                onChange={(e) => setTaglineBn(e.target.value)}
                placeholder="আপনার ঘরের দেয়ালকে রূপান্তর করুন শিল্পকর্মে"
                className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilingual Field 3: Short Description */}
      <div className="space-y-2">
        <div className={`grid gap-3 ${contentLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(contentLangMode === 'both' || contentLangMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Short Summary (English)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Handcrafted multi-layered wooden world map..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
          {(contentLangMode === 'both' || contentLangMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                <span>সংক্ষিপ্ত বিবরণ (বাংলা - BN)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
              </label>
              <textarea
                rows={3}
                value={shortDescriptionBn}
                onChange={(e) => setShortDescriptionBn(e.target.value)}
                placeholder="প্রিমিয়াম প্রাকৃতিক বার্চ কাঠ দিয়ে হাতে তৈরি ৩ডি স্তরযুক্ত মানচিত্র..."
                className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilingual Field 4: Full Description with TipTap Rich Text Editor */}
      <div className="space-y-3">
        <div className={`grid gap-3.5 ${contentLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(contentLangMode === 'both' || contentLangMode === 'en') && (
            <div>
              <TipTapEditor
                value={fullDescription}
                onChange={(val) => setFullDescription(val)}
                label="Full Description (English Rich Text)"
                badge="EN"
                badgeColor="slate"
                minHeight="190px"
              />
            </div>
          )}
          {(contentLangMode === 'both' || contentLangMode === 'bn') && (
            <div>
              <TipTapEditor
                value={fullDescriptionBn}
                onChange={(val) => setFullDescriptionBn(val)}
                label="বিস্তারিত বিবরণ (বাংলা - Rich Text)"
                badge="বাংলা"
                badgeColor="emerald"
                minHeight="190px"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilingual Field 5: Warning / Disclaimer */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Warning & Craftsmanship Notice
            </span>
            {isDefaultWarning ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Default from Settings
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Custom Product Notice
              </span>
            )}
          </div>
          {onResetWarningToDefault && !isDefaultWarning && (
            <button
              type="button"
              onClick={onResetWarningToDefault}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto hover:underline"
              title="Revert back to default warning configured in Settings"
            >
              <RotateCcw className="w-3 h-3 text-[#c08a46]" />
              <span>Use Settings Default</span>
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Pre-filled with default craftsmanship notice from Settings. You can keep it as is, or customize it for this specific product.
        </p>

        <div className={`grid gap-3 ${contentLangMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(contentLangMode === 'both' || contentLangMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Warning (English)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
              </label>
              <input
                type="text"
                value={warningText}
                onChange={(e) => setWarningText(e.target.value)}
                placeholder={effectiveDefaultEn}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
          {(contentLangMode === 'both' || contentLangMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                <span>সতর্কতা নোট (বাংলা - BN)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
              </label>
              <input
                type="text"
                value={warningTextBn}
                onChange={(e) => setWarningTextBn(e.target.value)}
                placeholder={effectiveDefaultBn}
                className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductEditContentSection;
