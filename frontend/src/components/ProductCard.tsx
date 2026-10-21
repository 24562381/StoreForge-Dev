'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { ExclusiveProductCard } from './ExclusiveProductCard';

export interface ProductCardProps {
  product: any;
  currency?: string;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
  className?: string;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  currency = '৳',
  onAddToCart,
  className = '',
}: ProductCardProps) {
  if (product?.isExclusive || product?.is_exclusive) {
    return (
      <ExclusiveProductCard
        product={product}
        currency={currency}
        onAddToCart={onAddToCart}
        className={className}
      />
    );
  }

  const { t, formatNum } = useLanguage();

  const defaultVar =
    product.variants?.find((v: any) => v.isDefault) || product.variants?.[0] || {};
  const primaryImg =
    product.images?.find((img: any) => img.isPrimary) || product.images?.[0] || {};

  const minPriceVal = product.min_price || defaultVar.price || 4500;
  const maxPriceVal = product.max_price || defaultVar.price;
  const origPrice = Number(defaultVar.originalPrice || defaultVar.original_price || 0);

  const catName = product.category?.name || product.category_name || 'Wall Art';
  const catSlug = product.category?.slug || product.category_slug || 'wall-art';

  const availableVariant = (product.variants || []).find(
    (v: any) => v.stockStatus !== 'out_of_stock' && v.stock !== 0,
  );
  const isAvailable = Boolean(availableVariant);

  const discountPct =
    origPrice > minPriceVal
      ? Math.round(((origPrice - minPriceVal) / origPrice) * 100)
      : 0;
  const savings = origPrice > minPriceVal ? origPrice - minPriceVal : 0;

  const ratingVal =
    product.avgRating ||
    product.avg_rating ||
    (product.reviews?.length
      ? (
        product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
        product.reviews.length
      ).toFixed(1)
      : '4.9');

  const reviewCount =
    product.reviewsCount ||
    product.reviews_count ||
    product.totalReviews ||
    (product.reviews?.length || 120);

  const imgUrl =
    primaryImg.imageUrl ||
    primaryImg.image_url ||
    product.imageUrl ||
    '/images/no-image.svg';

  const translatedName = t(
    `product_${product.id}_name`,
    t(`product.${product.slug}.name`, product.name),
  );

  const translatedDesc = t(
    `product_${product.id}_short_description`,
    product.shortDescription ||
    product.short_description ||
    product.tagline ||
    'Handcrafted multi-layered birch wood map with detailed engravings.',
  );

  return (
    <article className={`catalog-product group p-2.5 sm:p-3 rounded-[18px] bg-white border border-[#ede8e3] shadow-[0_4px_16px_-2px_rgba(45,30,15,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(60,40,20,0.12)] hover:border-[#8E5A35]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-left w-full max-w-[255px] mx-auto h-full min-w-0 ${className}`}>
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="catalog-product-image relative aspect-[4/3] rounded-[13px] overflow-hidden bg-[#f4ede4] block group mb-2"
      >
        <img
          src={imgUrl}
          alt={translatedName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out block"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = '/no-image.svg';
          }}
        />

        {discountPct > 0 && (
          <span className="catalog-badge-discount absolute top-2 left-2 z-10 bg-[#e11d48] text-white text-[10.5px] font-extrabold tracking-wide px-2 py-0.5 rounded-full shadow-[0_2px_6px_rgba(225,29,72,0.35)] leading-tight">
            -{discountPct}%
          </span>
        )}

        <span className="catalog-stock-indicator absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm leading-tight">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isAvailable
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.9)]'
                : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]'
              }`}
          />
          <span>
            {isAvailable
              ? t('in_stock_label', 'In stock')
              : t('out_of_stock_label', 'Out of stock')}
          </span>
        </span>
      </Link>

      {/* Card Body */}
      <div className="catalog-product-body pt-1 px-0.5 pb-0.5 flex flex-col flex-1">
        {/* Category & Rating Row */}
        <div className="catalog-meta-row flex items-center justify-between gap-1 mb-0.5 w-full max-w-full min-w-0 overflow-hidden">
          <span className="catalog-category-tag text-[10px] font-extrabold uppercase tracking-wider text-[#8E5A35] truncate min-w-0 flex-1" title={t(`category_${catSlug}`, catName)}>
            {t(`category_${catSlug}`, catName)}
          </span>
          <div className="catalog-rating-wrap inline-flex items-center gap-1 text-[10.5px] shrink-0 font-bold whitespace-nowrap">
            <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
            <span className="text-stone-900 font-extrabold">{formatNum(ratingVal)}</span>
            <span className="text-stone-400 font-normal text-[10px]">({formatNum(reviewCount)})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="catalog-product-title font-extrabold text-[13.5px] sm:text-[14px] text-stone-900 line-clamp-1 mb-0.5 leading-snug">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-[#8E5A35] transition-colors"
          >
            {translatedName}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="catalog-product-desc text-[11px] sm:text-[11.5px] text-stone-500 line-clamp-2 leading-snug min-h-[28px] mb-1.5">
          {translatedDesc}
        </p>

        {/* Dashed Divider */}
        <div className="catalog-card-divider border-b border-dashed border-stone-200 my-1 w-full" />

        {/* Price & Savings Row */}
        <div className="catalog-price-container flex items-end justify-between gap-1.5 mt-auto mb-2">
          <div className="catalog-price-col flex flex-col justify-end min-w-0">
            {origPrice > minPriceVal && (
              <span className="catalog-orig-price text-[11px] text-stone-400 line-through block font-medium leading-none mb-0.5">
                {currency} {formatNum(origPrice)}
              </span>
            )}
            <strong className="catalog-main-price text-[18px] sm:text-[20px] font-black text-stone-900 tracking-tight leading-none flex items-baseline flex-wrap gap-1">
              <span>{currency} {formatNum(minPriceVal)}</span>
              {/* {Number(maxPriceVal) > Number(minPriceVal) && (
                <span className="text-xs font-bold text-stone-500">
                  – {currency} {formatNum(maxPriceVal)}
                </span>
              )} */}
            </strong>
          </div>

          {savings > 0 && (
            <span className="catalog-save-tag bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md whitespace-nowrap mb-0.5 border border-emerald-100/80 shrink-0">
              {t('product_save_badge', 'Save')} {currency} {formatNum(savings)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="catalog-card-actions flex items-center gap-1.5 w-full mt-auto">
          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => onAddToCart(e, product)}
              className="btn-card-add-cart flex-1 min-w-0 h-[36px] sm:h-[38px] bg-[#8E5A35] hover:bg-[#744322] active:scale-[0.98] text-white font-extrabold text-[12px] sm:text-[12.5px] rounded-xl inline-flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_6px_rgba(142,90,53,0.25)] hover:shadow-[0_4px_10px_rgba(142,90,53,0.35)] cursor-pointer px-2.5"
            >
              <i className="fa-solid fa-cart-shopping text-xs"></i>
              <span>{t('catalog_add_cart', 'Add to Cart')}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="btn-card-add-cart is-out-of-stock flex-1 min-w-0 h-[36px] sm:h-[38px] bg-stone-100 text-stone-400 font-bold text-xs rounded-xl inline-flex items-center justify-center border border-stone-200 cursor-not-allowed px-2.5"
            >
              <span>{t('product_out_of_stock', 'Out of stock')}</span>
            </button>
          )}

          <Link
            href={`/products/${product.slug}`}
            className="btn-card-view-details shrink-0 w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] bg-[#fbf5ee] hover:bg-[#f5e9dc] active:scale-[0.98] text-[#8E5A35] hover:text-[#6b3e1f] border border-[#ebdccc] hover:border-[#8E5A35] rounded-xl inline-flex items-center justify-center text-xs transition-all cursor-pointer shadow-2xs"
            title={t('view_details', 'View Details')}
            aria-label={t('view_details', 'View Details')}
          >
            <i className="fa-regular fa-eye text-sm"></i>
          </Link>
        </div>
      </div>
    </article>
  );
});
