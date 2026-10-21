'use client';

import React from 'react';
import { AlertCircle, RotateCcw, Banknote } from 'lucide-react';
import { useLanguage } from '../../../../../lib/LanguageContext';

interface BkashStatusCardProps {
  status: string;
  msg: string;
  onSwitchToCod: () => void;
  onRetryBkash: () => void;
}

export const BkashStatusCard = React.memo(function BkashStatusCard({
  status,
  msg,
  onSwitchToCod,
  onRetryBkash,
}: BkashStatusCardProps) {
  const { lang } = useLanguage();

  return (
    <div className="max-w-xl mx-auto px-4 py-20 space-y-8 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-stone-900">
          {status === 'cancelled'
            ? lang === 'bn'
              ? 'বিকাশ পেমেন্ট বাতিল করা হয়েছে'
              : 'bKash Payment Was Cancelled'
            : lang === 'bn'
            ? 'বিকাশ পেমেন্ট সম্পন্ন হয়নি'
            : 'bKash Payment Failed'}
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          {msg ||
            (lang === 'bn'
              ? 'আপনি চাইলে পুনরায় বিকাশ দিয়ে চেষ্টা করতে পারেন অথবা ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করতে পারেন।'
              : 'You can retry bKash payment or switch to Cash on Delivery with no extra charge.')}
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <button
          onClick={onSwitchToCod}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#b8892d] to-[#dfc276] text-[#1e130c] font-black text-sm uppercase tracking-wider shadow hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
        >
          <Banknote className="w-5 h-5" />
          <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারিতে নিন' : 'Switch to Cash on Delivery (COD)'}</span>
        </button>

        <button
          onClick={onRetryBkash}
          className="w-full py-3.5 px-6 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{lang === 'bn' ? 'পুনরায় বিকাশ পেমেন্ট চেষ্টা করুন' : 'Retry bKash Payment'}</span>
        </button>
      </div>
    </div>
  );
});
