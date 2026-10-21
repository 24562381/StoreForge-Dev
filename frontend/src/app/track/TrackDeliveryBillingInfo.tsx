'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';

interface TrackDeliveryBillingInfoProps {
  order: any;
  currency: string;
  isDhaka: boolean;
  isCod: boolean;
}

export const TrackDeliveryBillingInfo = React.memo(function TrackDeliveryBillingInfo({
  order,
  currency,
  isDhaka,
  isCod,
}: TrackDeliveryBillingInfoProps) {
  const { lang, t, formatNum } = useLanguage();

  const subtotal = order.subtotal || (order.total - (order.shippingFee || 0));
  const shippingFee = order.shippingFee !== undefined && order.shippingFee !== null
    ? order.shippingFee
    : (isDhaka ? 70 : 130);

  // Clean and deduplicate formatted address
  const formattedAddress = React.useMemo(() => {
    if (!order.address) return '';
    const raw = String(order.address).trim();
    // If already contains street hidden notice or full formatted string
    if (raw.includes('Street address hidden') || raw.includes('Address protected')) {
      return raw;
    }
    const parts: string[] = [raw];
    if (order.areaThana && !raw.toLowerCase().includes(order.areaThana.toLowerCase())) {
      parts.push(order.areaThana.trim());
    }
    if (order.district) {
      const cleanDistrict = order.district
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      if (!raw.toLowerCase().includes(cleanDistrict.toLowerCase())) {
        parts.push(cleanDistrict);
      }
    }
    return parts.join(', ');
  }, [order.address, order.areaThana, order.district]);

  return (
    <div className="track-info-grid grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* ───────────────── COLUMN 1: RECIPIENT & DELIVERY ADDRESS ───────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE3D9] shadow-lg shadow-stone-900/5 flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-[#8E5A35] flex items-center justify-center text-lg shadow-2xs">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                  {t('track_delivery_address_title', 'ডেলিভারি ঠিকানা ও প্রাপক')}
                </h3>
                <span className="text-xs text-stone-400 font-medium">
                  {t('track_delivery_sub', 'অর্ডারের ডেলিভারি গন্তব্য তথ্য')}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#7C4A27] border border-[#E7DDD3] flex items-center gap-1.5 shadow-2xs">
              <i className="fa-solid fa-location-dot text-amber-600"></i>
              <span>{isDhaka ? t('zone_inside_dhaka', 'ঢাকা সিটির ভেতরে') : t('zone_outside_dhaka', 'ঢাকার বাইরে')}</span>
            </span>
          </div>

          {/* Privacy Notice (When masked) */}
          {!order.isVerifiedAccess && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed shadow-2xs">
              <i className="fa-solid fa-shield-halved text-amber-600 mt-0.5 text-sm shrink-0"></i>
              <span>
                {t(
                  'track_privacy_masked_notice',
                  lang === 'bn'
                    ? 'ব্যক্তিগত তথ্যের সুরক্ষার্থে গ্রাহকের নাম, ফোন ও ঠিকানা সংক্ষেপিত রয়েছে। সম্পূর্ণ তথ্য উন্মোচন করতে অর্ডারের সিকিউরিটি কোড দিন।'
                    : 'Customer details are partially masked for privacy. Enter your Order Access Code to view full address.',
                )}
              </span>
            </div>
          )}

          {/* Structured Info Tiles */}
          <div className="space-y-3.5">
            {/* Tile 1: Recipient Full Name */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] flex items-center gap-3.5 transition-all hover:bg-white hover:border-[#DFCFC0] hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8E5A35] to-[#C08A46] text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                <i className="fa-regular fa-user"></i>
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  {t('order_label_fullname', 'গ্রাহকের পুরো নাম')}
                </span>
                <strong className="block text-sm font-bold text-stone-900 truncate mt-0.5">
                  {order.customerName}
                </strong>
              </div>
            </div>

            {/* Tile 2: Mobile Phone Number */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] flex items-center justify-between gap-3.5 transition-all hover:bg-white hover:border-[#DFCFC0] hover:shadow-sm">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/80 text-[#8E5A35] flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    {t('order_label_phone', 'মোবাইল নম্বর')}
                  </span>
                  <strong className="block text-sm font-mono font-bold text-stone-900 tracking-wide mt-0.5">
                    {order.phone}
                  </strong>
                </div>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                <i className="fa-solid fa-check text-[10px]"></i> {t('verified_contact', 'ভেরিফাইড')}
              </span>
            </div>

            {/* Tile 3: Complete Address */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] flex items-start gap-3.5 transition-all hover:bg-white hover:border-[#DFCFC0] hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-200/80 text-[#8E5A35] flex items-center justify-center text-sm font-bold shadow-2xs shrink-0 mt-0.5">
                <i className="fa-solid fa-house-chimney"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    {t('order_label_address', 'সম্পূর্ণ ডেলিভারি ঠিকানা')}
                  </span>
                  {order.areaThana && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200/60 text-stone-700">
                      {order.areaThana}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-stone-800 leading-relaxed mt-1">
                  {formattedAddress}
                </p>
              </div>
            </div>

            {/* Tile 4 (Optional): Delivery Note */}
            {order.deliveryNote && (
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-950">
                <i className="fa-regular fa-note-sticky text-[#8E5A35] mt-0.5 shrink-0 text-sm"></i>
                <div className="flex-1">
                  <strong className="block text-[11px] font-bold text-[#7C4A27]">
                    {t('track_delivery_note_label', 'ডেলিভারি নোট / নির্দেশনা:')}
                  </strong>
                  <span className="text-xs text-stone-700 italic block mt-0.5">
                    "{order.deliveryNote}"
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────── COLUMN 2: PAYMENT & BILLING SUMMARY ───────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE3D9] shadow-lg shadow-stone-900/5 flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-[#8E5A35] flex items-center justify-center text-lg shadow-2xs">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                  {t('track_payment_summary_title', 'পেমেন্ট ও বিলিং সারাংশ')}
                </h3>
                <span className="text-xs text-stone-400 font-medium">
                  {t('track_payment_sub', 'অর্ডারের মোট মূল্য ও পেমেন্ট বিবরণ')}
                </span>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
              isCod
                ? 'bg-amber-100/80 text-amber-900 border border-amber-200'
                : 'bg-emerald-100/80 text-emerald-900 border border-emerald-200'
            }`}>
              <i className={isCod ? 'fa-solid fa-hand-holding-dollar' : 'fa-solid fa-credit-card'}></i>
              <span>{isCod ? t('payment_method_cod', 'ক্যাশ অন ডেলিভারি') : t('payment_method_online', 'অনলাইনে পরিশোধিত')}</span>
            </span>
          </div>

          {/* Breakdown Rows in Tactile Container */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DE] space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-semibold flex items-center gap-2">
                <i className="fa-solid fa-basket-shopping text-xs text-stone-400"></i>
                <span>{t('order_subtotal', 'আইটেম সাবটোটাল')}</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                {currency} {formatNum(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-semibold flex items-center gap-2">
                <i className="fa-solid fa-truck-fast text-xs text-stone-400"></i>
                <span>{t('order_delivery_charge', 'ডেলিভারি চার্জ')}</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">{t('free_delivery', 'ফ্রি')}</span>
                ) : (
                  `${currency} ${formatNum(shippingFee)}`
                )}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-200/60">
                <span className="text-emerald-700 font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-tag text-xs text-emerald-600"></i>
                  <span>{t('order_discount', 'ডিসকাউন্ট')}</span>
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  -{currency} {formatNum(order.discountAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Total Payable Luxury Highlight Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#241710] via-[#352115] to-[#1F120B] text-white shadow-xl shadow-stone-950/15 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-200/80">
                {t('order_total_payable', 'সর্বমোট প্রদেয় মূল্য')}
              </span>
              <span className="text-xs text-stone-300 font-light mt-0.5 block">
                {t('tax_shipping_included', '(সকল চার্জ ও ভ্যাট অন্তর্ভুক্ত)')}
              </span>
            </div>
            <div className="text-right">
              <strong className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-tight block">
                {currency} {formatNum(order.total)}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment Status Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            {t('order_payment_status_label', 'পেমেন্ট স্ট্যাটাস:')}
          </span>
          <span className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full ${
            order.paymentStatus === 'paid'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>
              {order.paymentStatus === 'paid'
                ? t('track_payment_paid_badge', lang === 'bn' ? 'পরিশোধ সম্পন্ন (PAID)' : 'PAID IN FULL')
                : t('track_payment_unpaid_badge', lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (পরিশোধ বাকি)' : 'PAY ON DELIVERY (UNPAID)')}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
});
