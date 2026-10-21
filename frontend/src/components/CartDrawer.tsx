'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useLanguage } from '../lib/LanguageContext';

function parseItemColor(rawColour?: string): string {
  if (!rawColour) return '';
  if (rawColour.charCodeAt(0) === 91 /* '[' */ && rawColour.charCodeAt(rawColour.length - 1) === 93 /* ']' */) {
    try {
      const parsed = JSON.parse(rawColour);
      if (Array.isArray(parsed)) return parsed[0] || '';
    } catch {}
  }
  return rawColour;
}

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, totalPrice, updateQuantity, removeFromCart, totalItems } = useCart();
  const { t, formatNum } = useLanguage();
  const pathname = usePathname();
  const currency = '৳';

  // Automatically close cart drawer on route change
  const prevPathnameRef = React.useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setIsCartOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, setIsCartOpen]);

  // Lock body scroll and add backdrop class when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    };
  }, [isCartOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        style={{ zIndex: 99998 }}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Cart Drawer Panel */}
      <div
        className="fixed top-0 right-0 h-full h-[100dvh] w-full max-w-[420px] bg-white text-stone-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ zIndex: 99999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-[#fbf9f5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8e5a35]/15 flex items-center justify-center text-[#8e5a35] shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2b1d14] m-0 leading-tight">
                {t('nav_cart', 'কার্ট')}
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {formatNum(totalItems)} {t('items_count_label', 'টি পণ্য')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 rounded-xl bg-stone-200/70 hover:bg-stone-300/80 active:scale-95 text-stone-700 flex items-center justify-center transition-all cursor-pointer border border-stone-300/60"
            title={t('close', 'বন্ধ করুন')}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-[#faf7f2]/50">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4 border border-stone-200">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h4 className="text-lg font-bold text-stone-800 mb-1">
                {t('cart_empty_title', 'আপনার কার্ট খালি')}
              </h4>
              <p className="text-xs text-stone-500 max-w-[240px] mb-6">
                {t('cart_empty_desc', 'আপনার পছন্দের প্রিমিয়াম উডেন ম্যাপ কার্টে যোগ করুন।')}
              </p>
              <Link
                href="/products"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8e5a35] hover:bg-[#724526] text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('cart_start_shopping', 'পণ্য দেখুন')}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-[#8e5a35]/30 transition-all overflow-hidden"
                >
                  {/* Fixed Thumbnail Wrapper */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] sm:min-w-[80px] max-w-[64px] sm:max-w-[80px] h-[64px] sm:h-[80px] aspect-square rounded-xl overflow-hidden border border-stone-200/70 bg-stone-100 shrink-0 flex items-center justify-center">
                    <img
                      src={item.imageUrl || '/images/no-image.svg'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/no-image.svg';
                      }}
                    />
                  </div>

                  {/* Item Details and Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                    <div className="space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate leading-snug" title={item.productName}>
                          {item.productName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-red-500 active:scale-95 transition-colors p-1 -mr-1 -mt-1 cursor-pointer shrink-0"
                          title={t('remove', 'মুছে ফেলুন')}
                          aria-label={t('remove', 'মুছে ফেলুন')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.variantName && (
                          <span className="inline-block text-[10px] sm:text-[11px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md truncate max-w-[180px]">
                            {item.variantName}
                          </span>
                        )}
                        {item.colour && parseItemColor(item.colour) && (
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md truncate max-w-[140px]">
                            {item.colourHex && (
                              <span
                                className="w-2 h-2 rounded-full border border-stone-300 shrink-0"
                                style={{ backgroundColor: item.colourHex }}
                              />
                            )}
                            <span className="truncate">{parseItemColor(item.colour)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-stone-100">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50/90 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-6 sm:w-7 text-center text-xs font-bold text-stone-800 select-none">
                          {formatNum(item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      <strong className="text-xs sm:text-sm font-black text-[#8e5a35] tracking-tight">
                        {currency} {formatNum(Number(item.totalPrice ?? (Number(item.price ?? item.unitPrice ?? 0) * item.quantity)))}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3 shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-medium">{t('order_subtotal', 'সাবটোটাল:')}</span>
              <span className="text-lg font-extrabold text-[#8e5a35]">
                {currency} {formatNum(totalPrice)}
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#8e5a35] hover:bg-[#724526] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#8e5a35]/25 transition-all active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {pathname === '/checkout'
                    ? t('cart_return_to_checkout', 'চেকআউটে ফিরে যান')
                    : t('cart_proceed_checkout', 'চেকআউট করুন')}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                {t('continue_shopping', 'আরও কেনাকাটা করুন')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
