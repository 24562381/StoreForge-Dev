'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, Package, Search, Truck } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';

export const NotFoundCard = React.memo(function NotFoundCard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#faf7f2]">
      <div className="max-w-xl w-full text-center">
        {/* Visual Badge / Map Compass Illustration */}
        <div className="relative mx-auto w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8e5a35]/20 to-[#dfc276]/30 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-white border-2 border-[#8e5a35]/20 shadow-xl flex items-center justify-center text-[#8e5a35]">
            <Compass className="w-12 h-12 stroke-[1.5] text-[#8e5a35]" />
          </div>
        </div>

        {/* 404 Error Code */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#f3ece2] border border-[#8e5a35]/20 text-[#8e5a35] font-mono font-bold text-sm mb-3 tracking-widest">
          ERROR 404
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2c1810] tracking-tight mb-3 font-serif">
          {t('not_found_title', 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি')}
        </h1>

        {/* Description */}
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
          {t(
            'not_found_desc',
            'আপনি যে পৃষ্ঠাটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি সঠিক নয়। অনুগ্রহ করে আমাদের হোমপেজ বা ক্যাটালগ ঘুরে দেখুন।',
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-10">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#8e5a35] hover:bg-[#724526] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#8e5a35]/20 transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>{t('nav_home', 'হোমপেজে ফিরে যান')}</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#2c1810] font-bold text-sm flex items-center justify-center gap-2 border border-stone-300 shadow-sm transition-all active:scale-98"
          >
            <Package className="w-4 h-4 text-[#8e5a35]" />
            <span>{t('nav_all_products', 'সকল পণ্য দেখুন')}</span>
          </Link>
        </div>

        {/* Quick Links Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs max-w-md mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
            {t('popular_links', 'প্রয়োজনীয় লিংকসমূহ')}
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/track"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 hover:bg-[#f5ede4] text-[#2c1810] transition-colors"
            >
              <Truck className="w-4 h-4 text-[#8e5a35]" />
              <span>{t('nav_track', 'ট্র্যাক অর্ডার')}</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 hover:bg-[#f5ede4] text-[#2c1810] transition-colors"
            >
              <Search className="w-4 h-4 text-[#8e5a35]" />
              <span>{t('search_catalog', 'পণ্য সার্চ')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
