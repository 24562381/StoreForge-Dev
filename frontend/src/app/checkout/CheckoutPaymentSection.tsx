'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface CheckoutPaymentSectionProps {
  t: (key: string, fallback: string) => string;
  settings: Record<string, string>;
  hasAnyPaymentMethod: boolean;
  codEnabled: boolean;
  bkashEnabled: boolean;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default React.memo(function CheckoutPaymentSection({
  t,
  settings,
  hasAnyPaymentMethod,
  codEnabled,
  bkashEnabled,
  paymentMethod,
  setPaymentMethod,
}: CheckoutPaymentSectionProps) {
  return (
    <div className="pt-6 border-t border-stone-100 space-y-4">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3.5 border-b border-stone-100 min-w-0">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm sm:text-base min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#FAF3EB] text-[#8E5A35] flex items-center justify-center font-black text-xs border border-[#ebdccc] shrink-0">
            ২
          </div>
          <span className="truncate">{t('order_sec_payment_method', 'পেমেন্ট মেথড নির্বাচন করুন')}</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
          {t('checkout_secure_badge', '১০০% সুরক্ষিত')}
        </span>
      </div>

      <div className="payment-method-selector space-y-3 w-full min-w-0">
        {!hasAnyPaymentMethod && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">অনলাইন পেমেন্ট মেথড বর্তমানে সাময়িকভাবে স্থগিত আছে</div>
              <div className="text-xs text-amber-800 mt-1">
                সরাসরি অর্ডার করতে বা সহায়তার জন্য আমাদের হেল্পলাইনে অথবা ফেসবুক পেজে যোগাযোগ করুন।
              </div>
            </div>
          </div>
        )}

        {/* Cash on Delivery Card */}
        {codEnabled && (
          <label
            className={`payment-method-card flex items-start gap-3 p-3.5 sm:p-5 rounded-xl border transition-all cursor-pointer relative w-full max-w-full min-w-0 overflow-hidden ${
              paymentMethod === 'cod'
                ? 'border-[#C08A46] bg-[#FAF3EB]/60 shadow-2xs ring-1 ring-[#C08A46]'
                : 'border-stone-200 bg-white hover:bg-stone-50/50'
            }`}
            onClick={() => setPaymentMethod('cod')}
          >
            <input
              type="radio"
              name="payment_method"
              value="cod"
              checked={paymentMethod === 'cod'}
              readOnly
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                paymentMethod === 'cod' ? 'border-[#C08A46]' : 'border-stone-300'
              }`}
            >
              {paymentMethod === 'cod' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#C08A46]"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="font-bold text-stone-900 text-xs sm:text-base">
                  {t('order_payment_cod', 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে পরিশোধ)')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                  {t('sort_popular', 'সবচেয়ে জনপ্রিয়')}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {settings.payment_cod_instructions?.trim() ||
                  t(
                    'order_cod_desc',
                    'এখন কোনো অগ্রিম টাকা লাগবে না। পার্সেলটি রিসিভ করে দেখে ডেলিভারিম্যানকে টাকা পরিশোধ করুন।'
                  )}
              </p>
            </div>
          </label>
        )}

        {/* bKash Payment Card */}
        {bkashEnabled && (
          <label
            className={`payment-method-card is-bkash flex items-start gap-3 p-3.5 sm:p-5 rounded-xl border transition-all cursor-pointer relative w-full max-w-full min-w-0 overflow-hidden ${
              paymentMethod === 'bkash'
                ? 'border-[#E2136E] bg-pink-50/50 shadow-2xs ring-1 ring-[#E2136E]'
                : 'border-stone-200 bg-white hover:bg-stone-50/50'
            }`}
            onClick={() => setPaymentMethod('bkash')}
          >
            <input
              type="radio"
              name="payment_method"
              value="bkash"
              checked={paymentMethod === 'bkash'}
              readOnly
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                paymentMethod === 'bkash' ? 'border-[#E2136E]' : 'border-stone-300'
              }`}
            >
              {paymentMethod === 'bkash' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="font-bold text-stone-900 text-xs sm:text-base">
                  {t('order_payment_bkash', 'বিকাশ অনলাইন পেমেন্ট (bKash)')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#E2136E] border border-pink-300 shrink-0">
                  {t('checkout_instant_confirm', 'তাৎক্ষণিক কনফার্মেশন')}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {settings.payment_bkash_instructions?.trim() ||
                  t(
                    'order_bkash_desc',
                    'অফিশিয়াল বিকাশ গেটওয়ের মাধ্যমে আপনার বিকাশ অ্যাকাউন্ট থেকে নিরাপদে সরাসরি পেমেন্ট করুন।'
                  )}
              </p>
            </div>
            <div className="shrink-0 pl-1">
              <img src="/images/bkash-logo.svg" alt="bKash" loading="lazy" className="h-6 sm:h-7 w-auto" />
            </div>
          </label>
        )}
      </div>
    </div>
  );
});
