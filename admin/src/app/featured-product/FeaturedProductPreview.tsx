'use client';

import React, { useState, useMemo } from 'react';
import { Eye, ShoppingBag, Save, Star, Sparkles, Check, Zap, Tag, ArrowRight } from 'lucide-react';

interface FeaturedProductPreviewProps {
  previewLang: 'bn' | 'en';
  setPreviewLang: (lang: 'bn' | 'en') => void;
  prevSecTitle: string;
  prevSecSubtitle: string;
  displayImage: string;
  prevTitle: string;
  prevTagline?: string;
  prevDesc?: string;
  prevBadge?: string;
  prevPriceNote?: string;
  prevHighlights?: string[];
  prevBtnView?: string;
  prevBtnBuy?: string;
  price: number;
  origPrice: number;
  onSave: () => void;
  saving: boolean;
  selectedProduct?: any;
}

const toBnDigits = (n: number | string): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bn[parseInt(d, 10)]);
};

const formatPrice = (amount: number, isBn: boolean): string => {
  const formatted = Math.round(amount).toLocaleString('en-US');
  return isBn ? toBnDigits(formatted) : formatted;
};

export const FeaturedProductPreview = React.memo(function FeaturedProductPreview({
  previewLang,
  setPreviewLang,
  prevSecTitle,
  prevSecSubtitle,
  displayImage,
  prevTitle,
  prevTagline,
  prevDesc,
  prevBadge,
  prevPriceNote,
  prevHighlights = [],
  prevBtnView,
  prevBtnBuy,
  price,
  origPrice,
  onSave,
  saving,
  selectedProduct,
}: FeaturedProductPreviewProps) {
  const isBn = previewLang === 'bn';
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  // Derive size options from product or fallback to realistic luxury map sizes
  const sizeOptions = useMemo(() => {
    if (selectedProduct?.variants && selectedProduct.variants.length > 0) {
      return selectedProduct.variants.map((v: any, i: number) => ({
        id: v.id || i,
        name: v.sizeName || v.size_name || (i === 0 ? '4 Feet' : '6 Feet'),
        dim: v.dimensions || (i === 0 ? '4 x 2.5 ft (120 x 75 cm)' : '6 x 3.8 ft (180 x 115 cm)'),
        price: Number(v.price || price || 4500),
        origPrice: Number(v.originalPrice || v.original_price || origPrice || 5500),
      }));
    }
    return [
      {
        id: 1,
        name: '4 Feet',
        dim: '4 x 2.5 ft (120 x 75 cm)',
        price: price || 4500,
        origPrice: origPrice || 5500,
      },
      {
        id: 2,
        name: '6 Feet',
        dim: '6 x 3.8 ft (180 x 115 cm)',
        price: Math.round((price || 4500) * 1.55),
        origPrice: Math.round((origPrice || 5500) * 1.55),
      },
    ];
  }, [selectedProduct?.variants, price, origPrice]);

  const activeSize = sizeOptions[selectedSizeIndex] || sizeOptions[0];
  const currentPrice = activeSize?.price || price || 4500;
  const currentOrigPrice = activeSize?.origPrice || origPrice || 5500;
  const savingsAmount = currentOrigPrice > currentPrice ? currentOrigPrice - currentPrice : 0;
  const savingsPercent = currentOrigPrice > currentPrice ? Math.round((savingsAmount / currentOrigPrice) * 100) : 0;

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const colorOptions = useMemo(() => {
    if (selectedProduct?.colors && selectedProduct.colors.length > 0) {
      return selectedProduct.colors.map((c: any, i: number) => ({
        id: c.id || i,
        name: c.name || `Finish ${i + 1}`,
        hex: c.colourHex || '#8E5A35',
      }));
    }
    return [
      {
        id: 1,
        name: isBn ? 'Natural Oak & Walnut' : 'Natural Oak & Walnut',
        hex: '#6F4E37',
      },
    ];
  }, [selectedProduct?.colors, isBn]);

  const activeColor = colorOptions[selectedColorIndex] || colorOptions[0];
  const colorName = activeColor?.name;
  const colorHex = activeColor?.hex;

  const shortSummary =
    selectedProduct?.shortDescription ||
    selectedProduct?.short_description ||
    (isBn
      ? 'Handcrafted luxury 3D multi-layered birch wood map with detailed engravings.'
      : 'Handcrafted luxury 3D multi-layered birch wood map with detailed engravings.');

  return (
    <div className="order-3 lg:order-2 lg:col-span-7 space-y-4">
      <div className="lg:sticky lg:top-24 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#c08a46]" /> Real-time Storefront Preview
          </span>

          {/* Preview Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewLang('bn')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                previewLang === 'bn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                previewLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Preview Container simulating luxury storefront theme */}
        <div className="bg-[#FAF8F5] p-5 sm:p-7 rounded-3xl border border-[#e2d7cc] shadow-xl space-y-6">
          {/* Section Header */}
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl font-black text-[#2B1D14] tracking-tight">
              {prevSecTitle || (isBn ? 'ওয়ার্ল্ড ম্যাপ' : 'World Map')}
            </h3>
            {prevSecSubtitle && (
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">{prevSecSubtitle}</p>
            )}
          </div>

          {/* Main Showcase Card matching storefront home-featured-card */}
          <div className="bg-white rounded-3xl border border-[#8E5A35]/15 p-5 sm:p-6 shadow-[0_20px_40px_-15px_rgba(43,29,20,0.07)] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* =========================================================
                  COLUMN 1 (Left):
                  1. Image Box with badge
                  2. Storytelling Panel (Tagline, Description, Highlights)
                 ========================================================= */}
              <div className="flex flex-col gap-4">
                {/* Product Image */}
                <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-[#FAF3EB] border border-[#8E5A35]/15 shadow-sm group">
                  <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-stone-900/85 backdrop-blur-md text-[#DFC276] border border-[#DFC276]/30 shadow-md">
                    {prevBadge || (isBn ? 'এক্সক্লুসিভ কালেকশন' : 'EXCLUSIVE SHOWCASE')}
                  </span>
                  <img
                    src={displayImage || '/images/no-image.svg'}
                    alt={prevTitle || 'Featured Product'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/no-image.svg';
                    }}
                  />
                </div>

                {/* Craftsmanship / Storytelling Panel */}
                <div className="bg-gradient-to-br from-[#FAF4ED] to-white border border-[#8E5A35]/20 border-l-[3.5px] border-l-[#8E5A35] rounded-xl p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-[#8E5A35] bg-[#8E5A35]/10 w-fit">
                      <Sparkles className="w-3 h-3 text-[#8E5A35]" />
                      <span>{isBn ? 'কারিগরী বৈশিষ্ট্য' : 'Artisan Craftsmanship'}</span>
                    </span>
                    <h4 className="font-serif font-black text-[#2B1D14] text-xs sm:text-sm leading-snug">
                      {prevTagline || (isBn ? 'Transform Your Wall Into a Piece of Art' : 'Transform Your Wall Into a Piece of Art')}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#4A3B32] leading-relaxed line-clamp-3">
                    {prevDesc ||
                      (isBn
                        ? 'আমাদের প্রতিটি থ্রিডি কাঠের মানচিত্র অভিজ্ঞ শিল্পীদের হাতে তৈরি নিখুঁত শিল্পকর্ম। উচ্চমানের প্রাকৃতিক বার্চ কাঠের লেয়ারিং আপনার ঘরকে দেবে রাজকীয় আভিজাত্য।'
                        : 'Handcrafted luxury 3D multi-layered birch wood map with detailed engravings.')}
                  </p>

                  {/* Highlights pills */}
                  {prevHighlights.length > 0 && (
                    <div className="pt-2 border-t border-dashed border-[#8E5A35]/20 flex flex-wrap gap-1.5">
                      {prevHighlights.map((hl, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 bg-white border border-[#8E5A35]/20 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold text-[#2B1D14] shadow-2xs"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#ECFDF5] border border-[#10B981]/35 flex items-center justify-center text-[#059669]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span>{hl}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* =========================================================
                  COLUMN 2 (Right):
                  1. Meta chips (Rating, Fast Delivery, Price Note)
                  2. Title & Short summary
                  3. Size Selector
                  4. Color Selector
                  5. Price Row with Savings Badge
                  6. Stacked Action Buttons
                 ========================================================= */}
              <div className="flex flex-col gap-3.5 justify-between h-full">
                <div className="space-y-3">
                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{isBn ? '৪.৯ (১২০+ রিভিউ)' : '4.9 (120+ Reviews)'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>{isBn ? 'ইন-স্টক • ফাস্ট ডেলিভারি' : 'In Stock • Fast Dispatch'}</span>
                    </span>

                    {prevPriceNote && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span>{prevPriceNote}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Short Summary */}
                  <div>
                    <h4 className="font-serif text-xl sm:text-2xl font-black text-[#2B1D14] tracking-tight leading-snug">
                      {prevTitle || (isBn ? '3D Wooden World Map' : '3D Wooden World Map')}
                    </h4>
                    {shortSummary && (
                      <p className="text-stone-600 text-xs leading-relaxed mt-1">{shortSummary}</p>
                    )}
                  </div>

                  {/* Size and Color Selection Card (Matches Picture 2) */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col gap-3.5 my-1"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #ded9d1',
                      borderRadius: '18px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Size Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2B1D14]">
                        <span className="font-bold text-xs sm:text-sm text-[#2B1D14]">
                          {isBn ? 'সাইজ নির্বাচন করুন:' : 'Select Size:'}
                        </span>
                        {activeSize && (
                          <span className="text-[10px] sm:text-xs font-bold text-[#8E5A35] bg-[#FAF3EB] px-2.5 py-0.5 rounded-full border border-[#8E5A35]/20">
                            {activeSize.name} ({activeSize.dim})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {sizeOptions.map((s, idx) => {
                          const isSelected = idx === selectedSizeIndex;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedSizeIndex(idx)}
                              className={`relative p-2.5 rounded-xl text-left border-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#8E5A35] bg-[#FDF7F2] shadow-xs'
                                  : 'border-stone-200 bg-[#FAF8F5] hover:border-[#8E5A35]/60 hover:bg-white'
                              }`}
                            >
                              <span className="block text-xs font-bold text-[#203b35] pr-4">
                                {s.name}
                              </span>
                              <span className="block text-[10px] text-stone-500 leading-tight mt-0.5">
                                {s.dim}
                              </span>
                              {isSelected && (
                                <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2B1D14]">
                        <span className="font-bold text-xs sm:text-sm text-[#2B1D14]">
                          {isBn ? 'কাঠের ফিনিশ / কালার বেছে নিন:' : 'Choose Wood Finish Tone:'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {colorOptions.map((c: any, idx: number) => {
                          const isSelected = idx === selectedColorIndex;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedColorIndex(idx)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#8E5A35] bg-[#FDF7F2] text-[#2B1D14] shadow-xs'
                                  : 'border-stone-200 bg-[#FAF8F5] text-stone-700 hover:border-[#8E5A35]/50 hover:bg-white'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-inner"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-[#8E5A35] stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Stacked Actions */}
                <div className="space-y-3 pt-2">
                  {/* Pricing Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                    <span className="font-serif text-2xl font-black text-[#2B1D14] tracking-tight">
                      ৳ {formatPrice(currentPrice, isBn)}
                    </span>

                    <div className="flex items-center gap-2">
                      {currentOrigPrice > currentPrice && (
                        <span className="text-xs sm:text-sm text-stone-400 line-through font-semibold">
                          ৳ {formatPrice(currentOrigPrice, isBn)}
                        </span>
                      )}

                      {savingsAmount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#10B981] text-white shadow-xs">
                          <Tag className="w-3 h-3" />
                          <span>
                            {isBn
                              ? `৳ ${formatPrice(savingsAmount, true)} ছাড় (${toBnDigits(savingsPercent)}% OFF)`
                              : `৳ ${formatPrice(savingsAmount, false)} OFF (${savingsPercent}% OFF)`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stacked Action Buttons */}
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      className="w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#8E5A35]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #8E5A35 0%, #C08A46 100%)',
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{prevBtnBuy || (isBn ? 'এখনই অর্ডার করুন' : 'Order Now')}</span>
                    </button>

                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl text-stone-900 font-bold text-xs border-2 border-[#2B1D14] hover:bg-[#FAF3EB] hover:border-[#8E5A35] hover:text-[#8E5A35] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>{prevBtnView || (isBn ? 'সম্পূর্ণ বিস্তারিত দেখুন' : 'View Full Details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Apply & Save Showcase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeaturedProductPreview;
