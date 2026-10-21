'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../lib/LanguageContext';
import { ProductCard } from '@/components/ProductCard';

interface ProductSimilarSectionProps {
  relatedProducts: any[];
  currency: string;
  onAddRelatedToCart: (e: React.MouseEvent, rel: any) => void;
}

export const ProductSimilarSection = React.memo(function ProductSimilarSection({
  relatedProducts,
  currency,
  onAddRelatedToCart,
}: ProductSimilarSectionProps) {
  const { t } = useLanguage();

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="related-products-section mt-16 pt-10 border-t border-stone-200/80">
      <div className="catalog-heading-row flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E5A35] bg-[#FAF3EB] px-3 py-1 rounded-full border border-[#ebdccc] uppercase tracking-wider mb-2">
            <i className="fa-solid fa-layer-group text-[#8E5A35]"></i>
            <span>{t('similar_products_eyebrow', 'সম্পর্কিত কালেকশন')}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight">
            {t('details_related_title', 'একই ধরনের আরও আকর্ষণীয় কাঠের ম্যাপ')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t(
              'details_related_sub',
              'আপনার ঘরের দেয়াল সাজাতে আমাদের প্রিমিয়াম কালেকশনের আরও কিছু জনপ্রিয় শিল্পকর্ম।',
            )}
          </p>
        </div>
        <Link
          className="text-xs sm:text-sm font-bold text-[#8E5A35] hover:text-[#5c3519] flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
          href="/products"
        >
          <span>{t('home_search_link', 'সকল পণ্য দেখুন')}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>

      <div
        className={`catalog-grid home-best-sellers-grid ${
          relatedProducts.length === 1
            ? 'catalog-grid-1'
            : relatedProducts.length === 2
            ? 'catalog-grid-2'
            : ''
        }`}
      >
        {relatedProducts.map((prod: any) => (
          <ProductCard
            key={prod.id}
            product={prod}
            currency={currency}
            onAddToCart={onAddRelatedToCart}
          />
        ))}
      </div>
    </section>
  );
});


