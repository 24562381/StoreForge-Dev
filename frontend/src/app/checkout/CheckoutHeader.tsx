'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '../../lib/CartContext';

interface CheckoutHeaderProps {
  t: (key: string, fallback: string) => string;
}

export default React.memo(function CheckoutHeader({ t }: CheckoutHeaderProps) {
  const { setIsCartOpen } = useCart();

  return (
    <>
      {/* Navigation & Stepper Header */}
      <div className="checkout-top-nav flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 border-b border-stone-200/70 w-full max-w-full min-w-0">
        <div className="checkout-breadcrumb flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-stone-500 min-w-0 max-w-full">
          <Link href="/" className="hover:text-[#8E5A35] transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('checkout_back_store', 'হোমপেজ')}</span>
          </Link>
          <span className="text-stone-300">/</span>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="hover:text-[#8E5A35] transition-colors shrink-0 bg-transparent border-none p-0 cursor-pointer font-semibold text-stone-500 text-xs"
          >
            <span>{t('cart_title', 'কার্ট')}</span>
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-bold truncate">{t('checkout_breadcrumb', 'নিরাপদ চেকআউট')}</span>
        </div>

        {/* 3-Step Visual Stepper */}
        <div className="checkout-stepper flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold max-w-full overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 px-2 sm:px-3 py-1 rounded-full border border-emerald-200 shrink-0 cursor-pointer transition-all"
            title={t('checkout_step_cart', '১. কার্ট')}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('checkout_step_cart', '১. কার্ট')}</span>
          </button>
          <span className="text-stone-300 font-normal shrink-0">➔</span>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[#8E5A35] bg-[#FAF3EB] px-2 sm:px-3 py-1 rounded-full border border-[#ebdccc] shadow-2xs shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#C08A46]" />
            <span>{t('checkout_step_info_payment', '২. তথ্য ও পেমেন্ট')}</span>
          </div>
          <span className="text-stone-300 font-normal shrink-0">➔</span>
          <div className="flex items-center gap-1 sm:gap-1.5 text-stone-400 px-2 sm:px-2.5 py-1 shrink-0">
            <span>{t('checkout_step_confirm', '৩. নিশ্চিতকরণ')}</span>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header text-center mb-6 sm:mb-8 max-w-xl mx-auto px-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8E5A35] bg-[#FAF3EB] px-3 py-1 rounded-full border border-[#ebdccc] mb-2 shadow-2xs max-w-full text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C08A46] shrink-0" />
          <span className="truncate">{t('checkout_badge_secure', '১০০% নিরাপদ ও ক্যাশ অন ডেলিভারি')}</span>
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {t('checkout_title', 'অর্ডার সম্পন্ন করুন')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
          {t('checkout_subtitle', 'পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।')}
        </p>
      </div>
    </>
  );
});
