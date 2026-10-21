'use client';

import React from 'react';
import { Tag, Wand2, Bot, Loader2, Trash2, Plus } from 'lucide-react';

interface FeaturedProductCustomizerProps {
  langMode: 'both' | 'en' | 'bn';
  onAutoTranslate: (direction: 'en_to_bn' | 'bn_to_en') => void;
  translateLoading: boolean;
  aiAction: string | null;
  selectedProduct: any;
  badgeTextBn: string;
  setBadgeTextBn: (val: string) => void;
  badgeTextEn: string;
  setBadgeTextEn: (val: string) => void;
  priceNoteBn?: string;
  setPriceNoteBn?: (val: string) => void;
  priceNoteEn?: string;
  setPriceNoteEn?: (val: string) => void;
  customTitleBn?: string;
  setCustomTitleBn?: (val: string) => void;
  customTitleEn?: string;
  setCustomTitleEn?: (val: string) => void;
  customTaglineBn?: string;
  setCustomTaglineBn?: (val: string) => void;
  customTaglineEn?: string;
  setCustomTaglineEn?: (val: string) => void;
  customDescriptionBn: string;
  setCustomDescriptionBn: (val: string) => void;
  customDescriptionEn: string;
  setCustomDescriptionEn: (val: string) => void;
  highlightsBn: string[];
  highlightsEn: string[];
  onRemoveHighlight: (index: number) => void;
  newHlBn: string;
  setNewHlBn: (val: string) => void;
  newHlEn: string;
  setNewHlEn: (val: string) => void;
  onAddHighlight: () => void;
  btnViewTextBn: string;
  setBtnViewTextBn: (val: string) => void;
  btnViewTextEn: string;
  setBtnViewTextEn: (val: string) => void;
  btnBuyTextBn: string;
  setBtnBuyTextBn: (val: string) => void;
  btnBuyTextEn: string;
  setBtnBuyTextEn: (val: string) => void;
}

export const FeaturedProductCustomizer = React.memo(function FeaturedProductCustomizer({
  langMode,
  onAutoTranslate,
  translateLoading,
  aiAction,
  selectedProduct,
  badgeTextBn,
  setBadgeTextBn,
  badgeTextEn,
  setBadgeTextEn,
  priceNoteBn,
  setPriceNoteBn,
  priceNoteEn,
  setPriceNoteEn,
  customTitleBn,
  setCustomTitleBn,
  customTitleEn,
  setCustomTitleEn,
  customTaglineBn,
  setCustomTaglineBn,
  customTaglineEn,
  setCustomTaglineEn,
  customDescriptionBn,
  setCustomDescriptionBn,
  customDescriptionEn,
  setCustomDescriptionEn,
  highlightsBn,
  highlightsEn,
  onRemoveHighlight,
  newHlBn,
  setNewHlBn,
  newHlEn,
  setNewHlEn,
  onAddHighlight,
  btnViewTextBn,
  setBtnViewTextBn,
  btnViewTextEn,
  setBtnViewTextEn,
  btnBuyTextBn,
  setBtnBuyTextBn,
  btnBuyTextEn,
  setBtnBuyTextEn,
}: FeaturedProductCustomizerProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Tag className="w-4 h-4 text-[#c08a46]" />
          <span>3. Custom Information & Copywriting (Bilingual)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAutoTranslate('en_to_bn')}
            disabled={translateLoading}
            className="text-[11px] font-bold text-[#c08a46] hover:text-[#a67435] bg-[#FAF3EB] hover:bg-[#f3e7da] px-3 py-1.5 rounded-lg border border-[#ebdccc] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Translate English fields to Bengali"
          >
            {translateLoading && aiAction === 'en_to_bn' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c08a46]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>Translate to BN</span>
          </button>

          <button
            type="button"
            onClick={() => onAutoTranslate('bn_to_en')}
            disabled={translateLoading}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Translate Bengali fields to English"
          >
            {translateLoading && aiAction === 'bn_to_en' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Translate to EN</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Badge Text (Bilingual) */}
        <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(langMode === 'both' || langMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Custom Badge Text (বাংলা)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
              </label>
              <input
                type="text"
                value={badgeTextBn}
                onChange={(e) => setBadgeTextBn(e.target.value)}
                placeholder="e.g. এক্সক্লুসিভ কালেকশন"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}

          {(langMode === 'both' || langMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Custom Badge Text (English)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
              </label>
              <input
                type="text"
                value={badgeTextEn}
                onChange={(e) => setBadgeTextEn(e.target.value)}
                placeholder="e.g. PREMIUM EXCLUSIVE"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
        </div>


        {/* Custom Description (Bilingual) */}
        <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(langMode === 'both' || langMode === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Custom Description (বাংলা)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
              </label>
              <textarea
                rows={4}
                value={customDescriptionBn}
                onChange={(e) => setCustomDescriptionBn(e.target.value)}
                placeholder="বাংলায় আকর্ষক পণ্যের বর্ণনা লিখুন..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}

          {(langMode === 'both' || langMode === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Custom Description (English)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
              </label>
              <textarea
                rows={4}
                value={customDescriptionEn}
                onChange={(e) => setCustomDescriptionEn(e.target.value)}
                placeholder="Write an engaging English product description or promotional text..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
        </div>

        {/* Two-Column Grid: Feature Highlights (Left) & Action Buttons (Right) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Bullet Highlights (Bilingual) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Feature Highlights (Pills & Badges)
            </label>

            <div className="space-y-2">
              {highlightsBn.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center text-xs text-slate-500">
                  ✨ No feature highlights configured. This section will be hidden on the storefront card. You can add custom badges below whenever needed.
                </div>
              ) : (
                highlightsBn.map((hBn, idx) => {
                  const hEn = highlightsEn[idx] || '';
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className={`flex-1 grid ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                        {(langMode === 'both' || langMode === 'bn') && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">BN</span>
                            <span className="font-semibold text-slate-800">{hBn || '—'}</span>
                          </div>
                        )}
                        {(langMode === 'both' || langMode === 'en') && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">EN</span>
                            <span className="text-slate-600">{hEn || '—'}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveHighlight(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Remove highlight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className={langMode === 'en' ? 'hidden' : langMode === 'bn' ? 'sm:col-span-10' : 'sm:col-span-5'}>
                <input
                  type="text"
                  value={newHlBn}
                  onChange={(e) => setNewHlBn(e.target.value)}
                  placeholder="বাংলা হাইলাইট (e.g. ১০০% কাঠের তৈরি)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
              <div className={langMode === 'bn' ? 'hidden' : langMode === 'en' ? 'sm:col-span-10' : 'sm:col-span-5'}>
                <input
                  type="text"
                  value={newHlEn}
                  onChange={(e) => setNewHlEn(e.target.value)}
                  placeholder="English highlight (e.g. 100% Solid Birch Wood)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={onAddHighlight}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Action Buttons Label Configuration (Bilingual) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Action Buttons (CTA) Text
            </label>

            <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {(langMode === 'both' || langMode === 'bn') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Button 1: View Details (বাংলা)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
                  </label>
                  <input
                    type="text"
                    value={btnViewTextBn}
                    onChange={(e) => setBtnViewTextBn(e.target.value)}
                    placeholder="সম্পূর্ণ বিস্তারিত দেখুন"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                  />
                </div>
              )}

              {(langMode === 'both' || langMode === 'en') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Button 1: View Details (English)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
                  </label>
                  <input
                    type="text"
                    value={btnViewTextEn}
                    onChange={(e) => setBtnViewTextEn(e.target.value)}
                    placeholder="View Full Details"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                  />
                </div>
              )}
            </div>

            <div className={`grid gap-3 ${langMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {(langMode === 'both' || langMode === 'bn') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Button 2: Buy Now (বাংলা)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">BN</span>
                  </label>
                  <input
                    type="text"
                    value={btnBuyTextBn}
                    onChange={(e) => setBtnBuyTextBn(e.target.value)}
                    placeholder="এখনই অর্ডার করুন"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                  />
                </div>
              )}

              {(langMode === 'both' || langMode === 'en') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Button 2: Buy Now (English)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">EN</span>
                  </label>
                  <input
                    type="text"
                    value={btnBuyTextEn}
                    onChange={(e) => setBtnBuyTextEn(e.target.value)}
                    placeholder="Order Now"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeaturedProductCustomizer;
