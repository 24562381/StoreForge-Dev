'use client';

import React from 'react';
import Link from 'next/link';
import { User, Phone, Clock, Building2, MapPin, FileText } from 'lucide-react';

interface CheckoutDeliveryFormProps {
  t: (key: string, fallback: string) => string;
  formatNum: (val: number | string) => string;
  currency: string;
  customerName: string;
  setCustomerName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  areaThana: string;
  setAreaThana: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  deliveryNote: string;
  setDeliveryNote: (val: string) => void;
  deliveryDhaka: number;
  deliveryOutside: number;
  policyAccepted: boolean;
  setPolicyAccepted: (val: boolean) => void;
}

export default React.memo(function CheckoutDeliveryForm({
  t,
  formatNum,
  currency,
  customerName,
  setCustomerName,
  phone,
  setPhone,
  district,
  setDistrict,
  areaThana,
  setAreaThana,
  address,
  setAddress,
  deliveryNote,
  setDeliveryNote,
  deliveryDhaka,
  deliveryOutside,
  policyAccepted,
  setPolicyAccepted,
}: CheckoutDeliveryFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3.5 border-b border-stone-100 min-w-0">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm sm:text-base min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#FAF3EB] text-[#8E5A35] flex items-center justify-center font-black text-xs border border-[#ebdccc] shrink-0">
            ১
          </div>
          <span className="truncate">{t('order_sec_delivery_info', 'ডেলিভারির ঠিকানা ও তথ্য')}</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
          {t('checkout_home_delivery_badge', 'হোম ডেলিভারি')}
        </span>
      </div>

      {/* Full Name */}
      <div className="form-group">
        <label htmlFor="customer_name" className="block text-xs font-bold text-stone-700 mb-1.5 flex flex-wrap items-center justify-between gap-1">
          <span>{t('order_label_fullname', 'আপনার পুরো নাম')} <span className="text-red-500">*</span></span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="customer_name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#C08A46] focus:ring-2 focus:ring-[#C08A46]/10 transition-all"
            placeholder={t('order_placeholder_name', 'যেমন: মোহাম্মদ সাকিব')}
            required
          />
        </div>
      </div>

      {/* Mobile Phone */}
      <div className="form-group">
        <label htmlFor="phone" className="block text-xs font-bold text-stone-700 mb-1.5 flex flex-wrap items-center justify-between gap-1">
          <span>{t('order_label_phone', 'মোবাইল ফোন নম্বর')} <span className="text-red-500">*</span></span>
          <span className="text-[10px] text-stone-500 font-normal">{t('order_phone_digits_hint', '১১ ডিজিট')}</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#C08A46] focus:ring-2 focus:ring-[#C08A46]/10 transition-all"
            placeholder={t('order_placeholder_phone', 'যেমন: 01712345678')}
            required
          />
        </div>
        <p className="text-[11px] text-stone-500 font-medium mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#C08A46] shrink-0" />
          <span>{t('order_help_phone', 'অর্ডার কনফার্মেশনের জন্য এই নম্বরে কল বা এসএমএস দেওয়া হবে।')}</span>
        </p>
      </div>

      {/* Delivery Area Radio Toggle Cards */}
      <div>
        <label className="block text-xs font-bold text-stone-700 mb-2">
          {t('order_label_location', 'ডেলিভারি এরিয়া নির্বাচন করুন')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full min-w-0">
          <button
            type="button"
            onClick={() => setDistrict('inside_dhaka')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 w-full min-w-0 ${
              district === 'inside_dhaka'
                ? 'border-[#C08A46] bg-[#FAF3EB]/70 shadow-2xs ring-1 ring-[#C08A46]'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                district === 'inside_dhaka' ? 'border-[#C08A46]' : 'border-stone-300'
              }`}>
                {district === 'inside_dhaka' && (
                  <div className="w-2 h-2 rounded-full bg-[#C08A46]"></div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-stone-900 truncate">
                  {t('order_opt_dhaka', 'ঢাকার ভিতরে')}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">{t('order_delivery_dhaka_eta', '১-২ দিনে ফাস্ট ডেলিভারি')}</div>
              </div>
            </div>
            <span className="font-serif font-black text-xs sm:text-sm text-[#8E5A35] shrink-0 whitespace-nowrap">
              {currency} {formatNum(deliveryDhaka)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDistrict('outside_dhaka')}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 w-full min-w-0 ${
              district === 'outside_dhaka'
                ? 'border-[#C08A46] bg-[#FAF3EB]/70 shadow-2xs ring-1 ring-[#C08A46]'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                district === 'outside_dhaka' ? 'border-[#C08A46]' : 'border-stone-300'
              }`}>
                {district === 'outside_dhaka' && (
                  <div className="w-2 h-2 rounded-full bg-[#C08A46]"></div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-stone-900 truncate">
                  {t('order_opt_outside', 'ঢাকার বাইরে')}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">{t('order_delivery_outside_eta', '২-৩ দিনে সারাদেশে হোম ডেলিভারি')}</div>
              </div>
            </div>
            <span className="font-serif font-black text-xs sm:text-sm text-[#8E5A35] shrink-0 whitespace-nowrap">
              {currency} {formatNum(deliveryOutside)}
            </span>
          </button>
        </div>
      </div>

      {/* Thana / District */}
      <div className="form-group">
        <label htmlFor="area_thana" className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
          <span>{t('order_label_area', 'থানা / জেলা / এলাকা')} <span className="text-red-500">*</span></span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Building2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="area_thana"
            value={areaThana}
            onChange={(e) => setAreaThana(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#C08A46] focus:ring-2 focus:ring-[#C08A46]/10 transition-all"
            placeholder={t('order_placeholder_area', 'যেমন: ধানমন্ডি / মিরপুর / কোতোয়ালী, চট্টগ্রাম')}
            required
          />
        </div>
      </div>

      {/* Full Address */}
      <div className="form-group">
        <label htmlFor="address" className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
          <span>{t('order_label_address', 'সম্পূর্ণ ঠিকানা (বাসা / রোড / ফ্ল্যাট নম্বর)')} <span className="text-red-500">*</span></span>
        </label>
        <div className="relative">
          <div className="absolute top-3.5 left-3.5 pointer-events-none text-stone-400">
            <MapPin className="w-4 h-4" />
          </div>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#C08A46] focus:ring-2 focus:ring-[#C08A46]/10 transition-all resize-none"
            placeholder={t('order_placeholder_address', 'যেমন: বাসা ১৪, রোড ৫, ব্লক বি, ধানমন্ডি, ঢাকা')}
            required
          ></textarea>
        </div>
      </div>

      {/* Delivery Note */}
      <div className="form-group">
        <label htmlFor="delivery_note" className="block text-xs font-bold text-stone-700 mb-1.5">
          {t('order_label_note', 'ডেলিভারি নোট / বিশেষ নির্দেশনা (ঐচ্ছিক)')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="delivery_note"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-[#C08A46] focus:ring-2 focus:ring-[#C08A46]/10 transition-all"
            placeholder={t('order_placeholder_note', 'যেমন: বিকাল ৩টার পর ডেলিভারি দেবেন / কল দিয়ে আসবেন')}
          />
        </div>
      </div>

      {/* Policy Acceptance Checkbox */}
      <div className="form-group pt-1">
        <label
          htmlFor="policy_accepted"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50/80 border border-stone-200 hover:border-[#C08A46]/50 cursor-pointer transition-all select-none group"
        >
          <input
            type="checkbox"
            id="policy_accepted"
            checked={policyAccepted}
            onChange={(e) => setPolicyAccepted(e.target.checked)}
            required
            className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#8E5A35] focus:ring-[#C08A46] focus:ring-offset-0 cursor-pointer shrink-0 accent-[#8E5A35]"
          />
          <span className="text-xs text-stone-700 font-medium leading-relaxed">
            {t('checkout_policy_agree_prefix', 'আমি ')}
            <Link
              href="/terms"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[#8E5A35] font-bold hover:underline"
            >
              {t('policy_terms_title', 'শর্তাবলী')}
            </Link>
            {', '}
            <Link
              href="/privacy-policy"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[#8E5A35] font-bold hover:underline"
            >
              {t('policy_privacy_title', 'গোপনীয়তা নীতি')}
            </Link>
            {' ' + t('common_and', 'এবং') + ' '}
            <Link
              href="/return-policy"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[#8E5A35] font-bold hover:underline"
            >
              {t('policy_returns_title', 'রিটার্ন পলিসি')}
            </Link>
            {t(
              'checkout_policy_agree_suffix',
              '-র সাথে একমত হয়ে অর্ডার কনফার্ম করছি।'
            )}
            <span className="text-red-500 font-bold ml-1">*</span>
          </span>
        </label>
      </div>
    </div>
  );
});
