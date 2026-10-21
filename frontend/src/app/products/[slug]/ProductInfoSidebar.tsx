'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../lib/LanguageContext';
import { StoreGuaranteeBadges } from './StoreGuaranteeBadges';
import { ProductWarningCard } from './ProductWarningCard';

interface ProductInfoSidebarProps {
  product: any;
  warningText?: string;
  translatedName: string;
  translatedTagline: string;
  translatedShortDesc: string;
  avgRating: string;
  totalReviewsCount: number;
  currency: string;
  unitPrice: number;
  origPrice: number;
  discountPct: number;
  variants: any[];
  selectedVariantId: number | null;
  selectedVariant: any;
  onSelectVariant: (id: number) => void;
  displayedColors: any[];
  selectedColor: any;
  selectedColorIndex: number;
  onSelectColorIndex: (index: number) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onBuyNow: () => void;
  onAddToCart: () => void;
  addedMessage: boolean;
  onOpenReviewsTab: () => void;
}

export const ProductInfoSidebar = React.memo(function ProductInfoSidebar({
  product,
  translatedName,
  translatedTagline,
  translatedShortDesc,
  avgRating,
  totalReviewsCount,
  currency,
  unitPrice,
  origPrice,
  discountPct,
  variants,
  selectedVariantId,
  selectedVariant,
  onSelectVariant,
  displayedColors,
  selectedColor,
  selectedColorIndex,
  onSelectColorIndex,
  quantity,
  setQuantity,
  onBuyNow,
  onAddToCart,
  addedMessage,
  onOpenReviewsTab,
  warningText,
}: ProductInfoSidebarProps) {
  const { lang, t, formatNum } = useLanguage();

  return (
    <div className="details-info-column">
      <div className="details-meta-row">
        {product.category && (
          <Link
            className="details-category-pill"
            href={`/products?category=${encodeURIComponent(product.category.slug)}`}
          >
            <i className="fa-solid fa-folder-open"></i>{' '}
            {t(`category.${product.category.slug}.name`, product.category.name)}
          </Link>
        )}
        <div className="details-rating-badge" onClick={onOpenReviewsTab} style={{ cursor: 'pointer' }}>
          <div className="stars-gold">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
          </div>
          <span className="rating-number">{avgRating}</span>
          <span className="rating-count">({totalReviewsCount > 0 ? totalReviewsCount : '500+'} reviews)</span>
        </div>
      </div>

      <h1 className="details-product-title">{translatedName}</h1>
      {translatedTagline && <p className="details-product-tagline">{translatedTagline}</p>}

      {/* Price Card */}
      <div className="details-price-card">
        <div className="price-main-display">
          <span className="price-currency">{currency}</span>
          <span className="price-amount" id="detailsPrice">
            {formatNum(unitPrice)}
          </span>
          {origPrice > unitPrice && (
            <span className="price-original-wrapper">
              <span className="price-original">
                {currency}
                {formatNum(origPrice)}
              </span>
              <span className="price-save-badge">Save {discountPct}%</span>
            </span>
          )}
        </div>
        <div className="price-notice-sub">
          <i className="fa-solid fa-circle-info"></i>
          {t('product_tax_note', 'সকল ট্যাক্স ও ভ্যাট অন্তর্ভুক্ত। আপনার লোকেশন অনুযায়ী শিপিং চার্জ যোগ হবে।')}
        </div>
      </div>



      {/* Short Description */}
      {translatedShortDesc && (
        <div className="details-short-desc">
          <p>{translatedShortDesc}</p>
        </div>
      )}

      {/* Purchase Options & Action Form Card */}
      <div className="details-purchase-form mt-4">
        {/* Size Options */}
        {variants.length > 0 && (
          <div className="option-section size-option-section">
            <div className="option-header">
              <label className="option-title">
                <i className="fa-solid fa-ruler-combined"></i>
                <span>{t('product_select_size_label', 'আপনার পছন্দের সাইজ বেছে নিন:')}</span>
              </label>
              <span className="option-current-value">
                {selectedVariant?.sizeName}
                {selectedVariant?.dimensions ? ` / ${selectedVariant.dimensions}` : ''}
              </span>
            </div>

            <div className="size-cards-grid grid grid-cols-2 gap-2">
              {variants.map((v: any) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <div
                    key={v.id}
                    className={`size-option-card ${isSelected ? 'active' : ''}`}
                    onClick={() => onSelectVariant(v.id)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      padding: '8px 12px',
                      borderColor: isSelected ? '#8e5a35' : '#ded9d1',
                      backgroundColor: isSelected ? '#fdf7f2' : '#faf8f5',
                      borderRadius: '8px',
                      minHeight: '48px',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="size-card-check"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.6rem',
                          boxShadow: '0 1px 4px rgba(22, 163, 74, 0.4)',
                        }}
                      >
                        <i className="fa-solid fa-check" style={{ color: '#ffffff' }}></i>
                      </div>
                    )}
                    <strong className="size-card-name text-xs sm:text-[13px] font-bold text-[#203b35] pr-4 leading-tight">
                      {v.sizeName}
                    </strong>
                    {v.dimensions && (
                      <span className="size-card-dim text-[11px] text-[#69756f] leading-tight">
                        {v.dimensions}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Color / Wood Stain Swatches */}
        {displayedColors.length > 0 && (
          <div className="option-section color-option-section">
            <div className="option-header">
              <label className="option-title">
                <i className="fa-solid fa-palette"></i>
                <span>{t('product_select_color_label', 'Select Color & Finish:')}</span>
              </label>
              {selectedColor && (
                <span className="option-current-value">
                  {selectedColor.name}{' '}
                  {Number(selectedColor.priceAdjustment) > 0 ? `(+৳${selectedColor.priceAdjustment})` : ''}
                </span>
              )}
            </div>

            <div className="color-swatches-grid">
              {displayedColors.map((c: any, idx: number) => {
                const isSelected = selectedColor?.name === c.name || idx === selectedColorIndex;
                return (
                  <button
                    key={c.id || c.name || idx}
                    type="button"
                    onClick={() => onSelectColorIndex(idx)}
                    className={`color-swatch-btn ${isSelected ? 'active' : ''}`}
                    aria-label={c.name}
                  >
                    <div
                      className="swatch-circle-inner"
                      style={{ backgroundColor: c.colourHex || '#8E5A35' }}
                    />
                    <span className="swatch-tooltip">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {
          /* Live Stock Status Indicator */
          // <div className="stock-live-indicator">
          //   <span className="stock-pulse-dot in-stock"></span>
          //   <span className="stock-label-text">
          //     {t('product_in_stock_ready', 'ইন স্টক · দ্রুত ডেলিভারির জন্য প্রস্তুত')}
          //   </span>
          // </div> 
        }

        {/* Quantity Stepper & Action Buttons Row */}
        <div className="purchase-actions-box">
          <div className="quantity-controller-wrapper">
            <label className="quantity-label" htmlFor="detailsQuantity">
              {t('order_label_quantity', 'পরিমাণ:')}
            </label>
            <div className="quantity-stepper">
              <button
                type="button"
                className="qty-btn qty-minus"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <input id="detailsQuantity" type="number" value={quantity} readOnly />
              <button
                type="button"
                className="qty-btn qty-plus"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="action-buttons-group">
            <button type="button" className="btn btn-buy-now" onClick={onBuyNow}>
              <i className="fa-solid fa-bolt"></i>
              <span>{t('hero_cta_order', 'এখনই কিনুন')}</span>
            </button>

            <button type="button" className="btn btn-add-cart" onClick={onAddToCart}>
              <i className="fa-solid fa-cart-shopping"></i>
              <span>{t('nav_cart', 'কার্টে যোগ করুন')}</span>
            </button>
          </div>
        </div>

        {addedMessage && (
          <div
            style={{
              color: '#166534',
              background: '#dcfce7',
              padding: '10px 16px',
              borderRadius: '8px',
              marginTop: '6px',
              fontSize: '0.88rem',
            }}
          >
            <i className="fa-solid fa-circle-check me-2"></i>{' '}
            {t('cart_added_toast', 'পণ্যটি আপনার কার্টে যোগ করা হয়েছে!')}
          </div>
        )}
      </div>
      {/* Store Guarantee Badges (Mobile & Tablet - Displayed after Price Card, before Description) */}
      <StoreGuaranteeBadges className="store-guarantees-mobile" />

      {/* Warning / Craftsmanship Notice Under Badges (Mobile & Tablet) */}
      <ProductWarningCard warningText={warningText} className="product-warning-mobile" />

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="product-sticky-bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 max-w-full box-border">
        <div className="min-w-0 flex-1 pr-1">
          <div className="text-[11px] text-stone-600 truncate font-semibold leading-tight">{translatedName}</div>
          <div className="text-sm font-black text-amber-900 leading-tight mt-0.5">
            {currency} {formatNum(unitPrice)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-9 h-9 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
            aria-label={t('nav_cart', 'Cart')}
          >
            <i className="fa-solid fa-cart-shopping text-sm"></i>
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="h-9 px-3 rounded-lg bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 transition-all"
          >
            <i className="fa-solid fa-bolt text-[11px] text-amber-300"></i>
            <span className="whitespace-nowrap">{lang === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
