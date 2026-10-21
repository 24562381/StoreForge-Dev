'use client';

import React from 'react';
import { ShoppingBag, TicketPercent, Tag, Loader2, AlertCircle, X, Truck, ShieldCheck, RotateCcw, Headphones, Edit2 } from 'lucide-react';
import { useCart } from '../../lib/CartContext';

interface CheckoutOrderSummaryProps {
  t: (key: string, fallback: string) => string;
  formatNum: (val: number | string) => string;
  currency: string;
  items: any[];
  totalPrice: number;
  district: string;
  currentDelivery: number;
  grandTotal: number;
  appliedPromo: {
    code: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    discountAmount: number;
    description?: string;
  } | null;
  promoInput: string;
  setPromoInput: (val: string) => void;
  promoLoading: boolean;
  promoError: string;
  setPromoError: (val: string) => void;
  onApplyPromo: (e?: React.FormEvent) => void;
  onRemovePromo: () => void;
}

function parseCheckoutItemColor(displayColor?: string): string {
  if (!displayColor) return '';
  try {
    if (displayColor.startsWith('[') && displayColor.endsWith(']')) {
      const parsed = JSON.parse(displayColor);
      if (Array.isArray(parsed)) return parsed[0] || '';
    }
  } catch {}
  return displayColor;
}

export default React.memo(function CheckoutOrderSummary({
  t,
  formatNum,
  currency,
  items,
  totalPrice,
  district,
  currentDelivery,
  grandTotal,
  appliedPromo,
  promoInput,
  setPromoInput,
  promoLoading,
  promoError,
  setPromoError,
  onApplyPromo,
  onRemovePromo,
}: CheckoutOrderSummaryProps) {
  const { setIsCartOpen } = useCart();
  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="order-summary-col order-1 lg:order-2 w-full min-w-0 max-w-full">
      <div className="order-summary-card bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-stone-200/80 shadow-md space-y-4 sm:space-y-5 lg:sticky lg:top-24 w-full min-w-0 max-w-full box-border">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 sm:pb-3.5 min-w-0">
          <h3 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-4 h-4 text-[#C08A46] shrink-0" />
            <span className="truncate">{t('order_summary_title', 'অর্ডার সামারি')}</span>
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-stone-500">
              {formatNum(totalItemCount)} {t('items_count_label', 'টি পণ্য')}
            </span>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold text-[#8E5A35] hover:text-[#724526] hover:underline flex items-center gap-1 cursor-pointer bg-[#8E5A35]/10 hover:bg-[#8E5A35]/20 px-2 py-0.5 rounded-md transition-colors"
              title={t('cart_edit_btn', 'কার্ট পরিবর্তন করুন')}
            >
              <Edit2 className="w-3 h-3" />
              <span>{t('cart_edit_btn', 'পরিবর্তন')}</span>
            </button>
          </div>
        </div>

        {/* Product items list */}
        <div className="summary-items-list space-y-2.5 sm:space-y-3 max-h-[320px] overflow-y-auto pr-1 w-full min-w-0">
          {items.map((item) => {
            const displayColor = parseCheckoutItemColor(item.colour);

            return (
              <div
                key={item.id}
                className="summary-product-item flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 w-full min-w-0"
              >
                <img
                  src={item.imageUrl || '/images/no-image.svg'}
                  alt={item.productName}
                  loading="lazy"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border border-stone-200 shrink-0 bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/no-image.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-xs truncate leading-snug" title={item.productName}>
                    {item.productName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-600 truncate">
                    {item.variantName && (
                      <span className="font-medium text-stone-700 shrink-0">
                        {item.variantName}
                      </span>
                    )}
                    {displayColor && (
                      <>
                        <span className="text-stone-300 shrink-0">•</span>
                        <span className="inline-flex items-center gap-1 text-stone-600 truncate">
                          {item.colourHex && (
                            <span
                              className="w-2 h-2 rounded-full border border-stone-300 shrink-0 inline-block"
                              style={{ backgroundColor: item.colourHex }}
                            />
                          )}
                          <span className="truncate">{displayColor}</span>
                        </span>
                      </>
                    )}
                    <span className="text-stone-300 shrink-0">•</span>
                    <span className="font-bold text-stone-800 shrink-0">
                      × {formatNum(item.quantity)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif font-black text-stone-900 text-xs sm:text-sm whitespace-nowrap">
                    {currency} {formatNum(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo Code Voucher Section */}
        <div className="promo-voucher-section pt-3 border-t border-stone-100 w-full min-w-0">
          {appliedPromo ? (
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-2 w-full min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <TicketPercent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-emerald-900 tracking-wider">
                      {appliedPromo.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded shrink-0">
                      {appliedPromo.discountType === 'percentage'
                        ? `${appliedPromo.discountValue}% ${t('product_save_badge', 'ছাড়')}`
                        : t('promo_flat_discount', 'ফ্ল্যাট ছাড়')}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-700 truncate">
                    ৳{formatNum(appliedPromo.discountAmount)} {t('promo_saved_text', 'সাশ্রয় হয়েছে!')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemovePromo}
                className="p-1.5 rounded-lg text-emerald-700 hover:text-red-600 hover:bg-emerald-100/50 transition-colors cursor-pointer shrink-0"
                title={t('remove', 'মুছে ফেলুন')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={onApplyPromo} className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <div className="relative flex-1 min-w-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Tag className="w-3.5 h-3.5 text-[#C08A46]" />
                  </div>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    placeholder={t('checkout_promo_placeholder', 'প্রোমো কোড লিখুন')}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-xs font-bold uppercase tracking-wider focus:bg-white focus:outline-none focus:border-[#C08A46] transition-all min-w-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-[#8E5A35] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0 shadow-2xs whitespace-nowrap"
                >
                  {promoLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{t('promo_apply_btn', 'প্রয়োগ')}</span>
                  )}
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{promoError}</span>
                </p>
              )}
            </form>
          )}
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="summary-calculation-lines pt-3 border-t border-stone-100 space-y-2.5 w-full min-w-0">
          <div className="flex items-center justify-between text-xs text-stone-600 gap-2 min-w-0">
            <span className="truncate">{t('order_subtotal', 'পণ্য মূল্য (সাবটোটাল):')}</span>
            <span className="font-bold text-stone-900 shrink-0 whitespace-nowrap">{currency} {formatNum(totalPrice)}</span>
          </div>

          {appliedPromo && (
            <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold animate-in fade-in gap-2 min-w-0">
              <span className="flex items-center gap-1 min-w-0 truncate">
                <TicketPercent className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{t('order_promo_discount', 'প্রোমো ছাড়')} ({appliedPromo.code}):</span>
              </span>
              <span className="font-bold font-mono shrink-0 whitespace-nowrap">- {currency} {formatNum(appliedPromo.discountAmount)}</span>
            </div>
          )}
          
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 text-xs text-stone-600 min-w-0">
            <span className="flex items-center gap-1 min-w-0 flex-1">
              <Truck className="w-3.5 h-3.5 text-[#C08A46] shrink-0" />
              <span className="truncate">{t('order_delivery_charge', 'ডেলিভারি চার্জ')}</span>
              <span className="text-[10px] text-stone-400 shrink-0">
                ({district === 'inside_dhaka' ? t('order_opt_dhaka', 'ঢাকার ভিতরে') : t('order_opt_outside', 'ঢাকার বাইরে')})
              </span>:
            </span>
            <span className="font-bold text-stone-900 shrink-0 whitespace-nowrap">{currency} {formatNum(currentDelivery)}</span>
          </div>

          <div className="calc-divider my-2 border-t border-dashed border-stone-200"></div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 text-sm sm:text-base font-black text-stone-900 min-w-0">
            <span className="truncate">{t('order_total_payable', 'সর্বমোট পরিশোধযোগ্য:')}</span>
            <span className="font-serif text-lg sm:text-xl text-[#8E5A35] shrink-0 whitespace-nowrap">
              {currency} {formatNum(grandTotal)}
            </span>
          </div>
        </div>

        {/* Trust Badges in Sidebar */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FAF3EB]/70 border border-[#ebdccc] space-y-2 text-[10.5px] sm:text-[11px] text-[#8E5A35] w-full min-w-0">
          <div className="flex items-center gap-2 font-bold min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#C08A46] shrink-0" />
            <span className="truncate">{t('checkout_guarantee_1', '১০০% অরিজিনাল কাঠের পণ্য গ্যারান্টি')}</span>
          </div>
          <div className="flex items-center gap-2 font-bold min-w-0">
            <RotateCcw className="w-4 h-4 text-[#C08A46] shrink-0" />
            <span className="truncate">{t('checkout_guarantee_2', 'ডেলিভারির সময় চেক করে নেওয়ার সুযোগ')}</span>
          </div>
          <div className="flex items-center gap-2 font-bold min-w-0">
            <Headphones className="w-4 h-4 text-[#C08A46] shrink-0" />
            <span className="truncate">{t('checkout_guarantee_3', 'সার্বক্ষণিক কাস্টমার সাপোর্ট ও গাইডলাইন')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
