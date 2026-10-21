'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';

export interface ExclusiveProductCardProps {
  product: any;
  currency?: string;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
  className?: string;
}

export const ExclusiveProductCard = React.memo(function ExclusiveProductCard({
  product,
  currency = '৳',
  onAddToCart,
  className = '',
}: ExclusiveProductCardProps) {
  const { t, formatNum } = useLanguage();

  const defaultVar =
    product.variants?.find((v: any) => v.isDefault) || product.variants?.[0] || {};
  const primaryImg =
    product.images?.find((img: any) => img.isPrimary) || product.images?.[0] || {};

  const minPriceVal = product.min_price || defaultVar.price || 4500;
  const maxPriceVal = product.max_price || defaultVar.price;
  const origPrice = Number(
    defaultVar.originalPrice ||
    defaultVar.original_price ||
    product.originalPrice ||
    product.original_price ||
    0
  );

  const catName = product.category?.name || product.category_name || 'World Maps';
  const catSlug = product.category?.slug || product.category_slug || 'world-maps';
  const categoryDisplay = t(`category_${catSlug}`, catName).toUpperCase();

  const availableVariant = (product.variants || []).find(
    (v: any) => v.stockStatus !== 'out_of_stock' && v.stock !== 0,
  );
  const isAvailable = Boolean(availableVariant);

  const discountPct =
    origPrice > minPriceVal
      ? Math.round(((origPrice - minPriceVal) / origPrice) * 100)
      : 0;

  const ratingVal =
    product.avgRating ||
    product.avg_rating ||
    product.averageRating ||
    product.average_rating ||
    (product.reviews?.length
      ? (
          product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
          product.reviews.length
        ).toFixed(1)
      : '4.9');

  const imgUrl =
    primaryImg.imageUrl ||
    primaryImg.image_url ||
    product.imageUrl ||
    '/images/no-image.svg';

  const translatedName = t(
    `product_${product.id}_name`,
    t(`product.${product.slug}.name`, product.name),
  );

  return (
    <article
      className={`exclusive-card-redesign catalog-product group relative flex flex-col justify-between w-full max-w-[255px] mx-auto p-2.5 sm:p-3 rounded-[18px] bg-[#FEEFDE] border-[1.5px] border-[#f4d3b0] shadow-[0_4px_16px_-2px_rgba(45,30,15,0.06)] hover:shadow-[0_12px_24px_-4px_rgba(60,40,20,0.13)] hover:-translate-y-1 transition-all duration-300 text-center overflow-visible ${className}`}
    >
      {/* 1. Top Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-[13px] overflow-visible bg-[#eddccb] mb-2.5">
        <Link
          href={`/products/${product.slug}`}
          className="relative block w-full h-full rounded-[13px] overflow-hidden"
          aria-label={translatedName}
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

          {/* Top Right: Discount Pill Badge */}
          {discountPct > 0 && (
            <span className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-xs text-[#b84c17] text-[10.5px] font-black tracking-tight px-2 py-0.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] leading-tight select-none">
              -{discountPct}%
            </span>
          )}
        </Link>

        {/* Floating Overlapping Bottom Badge: Crown + EXCLUSIVE */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-[#b84c17] text-white text-[9px] font-black tracking-widest uppercase shadow-[0_3px_8px_rgba(184,76,23,0.3)] ring-[2.5px] ring-[#FEEFDE] whitespace-nowrap">
            <i className="fa-solid fa-crown text-[8.5px] text-white" aria-hidden="true"></i>
            <span>{t('badge_exclusive', 'EXCLUSIVE')}</span>
          </span>
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="flex flex-col items-center flex-1 pt-0.5 w-full">
        {/* Category & Star Rating Row */}
        <div className="exclusive-meta-row flex items-center justify-center gap-1 w-full max-w-full px-0.5 text-[10px] font-extrabold tracking-wider uppercase text-[#b84c17] mb-0.5 min-w-0 overflow-hidden">
          <span className="exclusive-category-tag min-w-0 truncate text-center" title={categoryDisplay}>
            {categoryDisplay}
          </span>
          <span className="text-[#d89366] text-xs shrink-0 select-none">·</span>
          <span className="exclusive-rating-badge inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
            <i className="fa-solid fa-star text-amber-500 text-[9.5px]"></i>
            <span className="text-[#b84c17] font-black">{formatNum(ratingVal)}</span>
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-extrabold text-[13.5px] sm:text-[14px] text-[#1c1917] tracking-tight leading-snug line-clamp-1 mb-0.5 hover:text-[#b84c17] transition-colors">
          <Link href={`/products/${product.slug}`} title={translatedName}>
            {translatedName}
          </Link>
        </h3>

        {/* Pricing Row: Strikethrough & Selling Price Centered Together */}
        <div className="flex items-center justify-center gap-2 my-1 text-center">
          {origPrice > minPriceVal && (
            <span className="text-[12px] text-[#9ca3af] line-through font-semibold leading-none">
              {currency}{formatNum(origPrice)}
            </span>
          )}
          <strong className="text-[18px] sm:text-[20px] font-black text-[#111827] tracking-tight leading-none">
            {currency}{formatNum(minPriceVal)}
          </strong>
        </div>

        {/* Stock Status Badge */}
        <div className="flex justify-center my-1">
          <span
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isAvailable
                ? 'bg-[#fdead6] border border-[#f4d6c0] text-[#b6481c]'
                : 'bg-stone-100 border border-stone-200 text-stone-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable
                  ? 'bg-[#f87a5c] ring-2 ring-[#faab92]/70'
                  : 'bg-stone-400 ring-2 ring-stone-200'
              }`}
            />
            <span>
              {isAvailable
                ? t('in_stock_label', 'In stock')
                : t('product_out_of_stock', 'Out of stock')}
            </span>
          </span>
        </div>

        {/* 3. Action Buttons */}
        <div className="w-full mt-auto pt-1 flex flex-col items-center">
          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => onAddToCart(e, product)}
              className="w-full h-[36px] sm:h-[38px] rounded-xl bg-gradient-to-r from-[#de6826] to-[#be4c16] hover:from-[#cd5c1d] hover:to-[#ac4210] active:scale-[0.98] text-white font-extrabold text-[12px] sm:text-[12.5px] inline-flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(190,76,22,0.25)] hover:shadow-[0_4px_12px_rgba(190,76,22,0.35)] transition-all cursor-pointer"
            >
              <i className="fa-solid fa-cart-shopping text-xs"></i>
              <span>{t('catalog_add_cart', 'Add to Cart')}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full h-[36px] sm:h-[38px] rounded-xl bg-stone-200 text-stone-400 font-bold text-xs inline-flex items-center justify-center cursor-not-allowed"
            >
              <span>{t('product_out_of_stock', 'Out of stock')}</span>
            </button>
          )}

          {/* View Details Link */}
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-[#b84c17] hover:text-[#8e360c] hover:underline transition-colors mt-1.5 mb-0.5 cursor-pointer"
          >
            <span>{t('view_details_label', 'View details')}</span>
            <span className="text-[11px] leading-none">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
});
