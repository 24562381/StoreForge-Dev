'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/LanguageContext';
import { useSettings } from '../../lib/SettingsContext';
import { useCart } from '../../lib/CartContext';
import { fetchApi } from '../../lib/api';
import { saveOrderSession } from '../../lib/orderSession';

import CheckoutHeader from './CheckoutHeader';
import CheckoutDeliveryForm from './CheckoutDeliveryForm';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import { AlertCircle, Loader2, ShoppingBag, Lock } from 'lucide-react';

export default function Wrapper() {
  const { lang, t, formatNum } = useLanguage();
  const { settings: contextSettings } = useSettings();
  const { items, totalPrice, clearCart, setIsCartOpen } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const [settings, setSettings] = useState<Record<string, string>>(contextSettings || {});
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('inside_dhaka');
  const [areaThana, setAreaThana] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    // OPTIMIZATION: Use preloaded settings from SettingsContext to eliminate client-side /settings/public API calls
    const s = contextSettings && Object.keys(contextSettings).length > 0 ? contextSettings : null;
    if (s) {
      setSettings(s);
      const isCod = s.payment_cod_enabled !== 'false';
      const isBkash = s.payment_bkash_enabled !== 'false';
      if (!isCod && isBkash) {
        setPaymentMethod('bkash');
      } else if (isCod) {
        setPaymentMethod('cod');
      }
      return;
    }

    fetchApi('/settings/public')
      .then((data) => {
        const fetched = data || {};
        setSettings(fetched);
        const isCod = fetched.payment_cod_enabled !== 'false';
        const isBkash = fetched.payment_bkash_enabled !== 'false';
        if (!isCod && isBkash) {
          setPaymentMethod('bkash');
        } else if (isCod) {
          setPaymentMethod('cod');
        }
      })
      .catch(() => {});
  }, [contextSettings]);

  const codEnabled = settings.payment_cod_enabled !== 'false';
  const bkashEnabled = settings.payment_bkash_enabled !== 'false';
  const hasAnyPaymentMethod = codEnabled || bkashEnabled;

  const currency = '৳';

  const { currentDelivery, deliveryDhaka, deliveryOutside, discountAmount, grandTotal } =
    useMemo(() => {
      const dDhaka = Number(settings.delivery_charge_dhaka || 80);
      const dOutside = Number(settings.delivery_charge_outside || 150);
      const currentDeliv = district === 'inside_dhaka' ? dDhaka : dOutside;
      const discount = appliedPromo ? appliedPromo.discountAmount : 0;
      const net = Math.max(0, totalPrice - discount);
      const grand = net + currentDeliv;
      return {
        currentDelivery: currentDeliv,
        deliveryDhaka: dDhaka,
        deliveryOutside: dOutside,
        discountAmount: discount,
        netSubtotal: net,
        grandTotal: grand,
      };
    }, [settings, district, appliedPromo, totalPrice]);

  const handleApplyPromo = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!promoInput.trim()) {
        setPromoError('অনুগ্রহ করে একটি প্রোমো কোড লিখুন।');
        return;
      }
      setPromoLoading(true);
      setPromoError('');
      setPromoSuccess('');

      try {
        const res = await fetchApi('/promo-codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promoInput.trim(),
            subtotal: totalPrice,
          }),
        });

        if (res.valid) {
          setAppliedPromo({
            code: res.code,
            discountType: res.discountType,
            discountValue: res.discountValue,
            discountAmount: res.discountAmount,
            description: res.description,
          });
          setPromoSuccess(res.message || 'প্রোমো কোড সফলভাবে যোগ হয়েছে!');
          setPromoInput('');
        } else {
          setPromoError(res.message || 'প্রোমো কোডটি সঠিক নয়।');
        }
      } catch (err: any) {
        setPromoError(err.message || 'প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
      } finally {
        setPromoLoading(false);
      }
    },
    [promoInput, totalPrice]
  );

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoError('');
    setPromoSuccess('');
    setPromoInput('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !areaThana.trim() || !address.trim()) {
      setErrorMessage(
        t(
          'form_required_error',
          'দয়া করে সকল প্রয়োজনীয় তথ্য (নাম, মোবাইল নম্বর, এলাকা/থানা ও সম্পূর্ণ ঠিকানা) পূরণ করুন।'
        )
      );
      return;
    }

    if (!policyAccepted) {
      setErrorMessage(
        t(
          'policy_acceptance_required_error',
          'অর্ডার সম্পন্ন করতে অনুগ্রহ করে শর্তাবলী ও নীতিমালা মেনে নেওয়ার বক্সে টিক চিহ্ন দিন।'
        )
      );
      return;
    }

    if (items.length === 0) {
      setErrorMessage(
        t('cart_empty_title', 'আপনার কার্ট বর্তমানে খালি আছে। অনুগ্রহ করে পণ্য যোগ করুন।')
      );
      return;
    }

    if (!hasAnyPaymentMethod) {
      setErrorMessage(
        t(
          'payment_all_disabled_error',
          'বর্তমানে অনলাইন অর্ডার ও পেমেন্ট সাময়িকভাবে স্থগিত আছে। অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।'
        )
      );
      return;
    }

    if (paymentMethod === 'cod' && !codEnabled) {
      setErrorMessage(
        t(
          'payment_cod_disabled_error',
          'ক্যাশ অন ডেলিভারি বর্তমানে বন্ধ রয়েছে। অনুগ্রহ করে অন্য পেমেন্ট মেথড বেছে নিন।'
        )
      );
      return;
    }

    if (paymentMethod === 'bkash' && !bkashEnabled) {
      setErrorMessage(
        t(
          'payment_bkash_disabled_error',
          'বিকাশ অনলাইন পেমেন্ট বর্তমানে বন্ধ রয়েছে। অনুগ্রহ করে অন্য পেমেন্ট মেথড বেছে নিন।'
        )
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        district,
        areaThana: areaThana.trim(),
        address: address.trim(),
        deliveryNote: deliveryNote.trim(),
        policyAccepted: true,
        paymentMethod,
        promoCode: appliedPromo ? appliedPromo.code : undefined,
        discountAmount,
        subtotal: totalPrice,
        deliveryCharge: currentDelivery,
        total: grandTotal,
        items: items.map((i) => {
          const itemPrice = Number(i.price ?? i.unitPrice ?? 0);
          const itemQty = Math.max(1, Number(i.quantity) || 1);
          return {
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            sizeName: i.variantName || i.sizeName || 'Standard',
            unitPrice: itemPrice,
            quantity: itemQty,
            totalPrice: itemPrice * itemQty,
            colour: i.colour,
            colourHex: i.colourHex,
          };
        }),
      };

      const createdOrder = await fetchApi('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      clearCart();

      // Save order session in cookies & storage for buyer security
      saveOrderSession(createdOrder);

      if (paymentMethod === 'bkash') {
        const orderNumClean = createdOrder.orderNumber.replace('#', '');
        const tokenParam = createdOrder.accessToken ? `?token=${encodeURIComponent(createdOrder.accessToken.trim())}` : '';
        const bkashRes = await fetchApi(`/payment/bkash/initiate/${orderNumClean}${tokenParam}`, {
          method: 'POST',
        });
        if (bkashRes.bkashURL) {
          window.location.href = bkashRes.bkashURL;
          return;
        }
      }

      router.push('/order/confirmation');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'অর্ডার সম্পন্ন হতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-wrapper w-full max-w-full overflow-x-hidden">
      <div className="container py-4 sm:py-8 px-3 sm:px-6 max-w-6xl mx-auto w-full min-w-0">
        <CheckoutHeader t={t} />

        <div className="order-form-grid w-full max-w-full min-w-0">
          {/* Left Column: Customer Details & Payment Form (Second on mobile, first on desktop) */}
          <div className="order-form-col order-2 lg:order-1 w-full max-w-full min-w-0">
            <form id="storefrontOrderForm" onSubmit={handleSubmit} className="checkout-form space-y-6 w-full max-w-full min-w-0 box-border">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Delivery Information Section */}
              <CheckoutDeliveryForm
                t={t}
                formatNum={formatNum}
                currency={currency}
                customerName={customerName}
                setCustomerName={setCustomerName}
                phone={phone}
                setPhone={setPhone}
                district={district}
                setDistrict={setDistrict}
                areaThana={areaThana}
                setAreaThana={setAreaThana}
                address={address}
                setAddress={setAddress}
                deliveryNote={deliveryNote}
                setDeliveryNote={setDeliveryNote}
                deliveryDhaka={deliveryDhaka}
                deliveryOutside={deliveryOutside}
                policyAccepted={policyAccepted}
                setPolicyAccepted={setPolicyAccepted}
              />

              {/* Payment Method Section */}
              <CheckoutPaymentSection
                t={t}
                settings={settings}
                hasAnyPaymentMethod={hasAnyPaymentMethod}
                codEnabled={codEnabled}
                bkashEnabled={bkashEnabled}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !hasAnyPaymentMethod}
                className="w-full py-3.5 sm:py-4 px-3 sm:px-6 rounded-2xl bg-gradient-to-r from-[#8E5A35] via-[#A67435] to-[#C08A46] hover:opacity-95 text-white font-black text-xs sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 min-w-0 text-center"
                id="submitOrderBtn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('order_processing', 'অর্ডার প্রসেস হচ্ছে...')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      {t('order_btn_confirm', 'অর্ডার নিশ্চিত করুন')} — {currency} {formatNum(grandTotal)}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-stone-500 font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('checkout_encryption_note', '২৫৬-বিট নিরাপদ এনক্রিপশন • ক্যাশ অন ডেলিভারি সুবিধা')}</span>
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Live Order Summary Card */}
          <CheckoutOrderSummary
            t={t}
            formatNum={formatNum}
            currency={currency}
            items={items}
            totalPrice={totalPrice}
            district={district}
            currentDelivery={currentDelivery}
            grandTotal={grandTotal}
            appliedPromo={appliedPromo}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            promoLoading={promoLoading}
            promoError={promoError}
            setPromoError={setPromoError}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
          />
        </div>
      </div>
    </div>
  );
}
