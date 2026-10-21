'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ProductCard } from '@/components/ProductCard';

interface TopSellingProductsSectionProps {
  products: any[];
  onAddToCart: (e: React.MouseEvent, prod: any) => void;
}

export const TopSellingProductsSection = React.memo(function TopSellingProductsSection({ products, onAddToCart }: TopSellingProductsSectionProps) {
  const { t } = useLanguage();
  const currency = '৳';

  if (!products || products.length === 0) return null;

  return (
    <section
      className="home-section home-best-sellers-section"
      id="best-sellers"
      aria-label={t('home_best_sellers_title', 'সর্বাধিক বিক্রিত পণ্য')}
    >
      <div className="container">
        <div className="home-section-head text-center">
          <h2 className="home-section-title">{t('home_best_sellers_title', 'সর্বাধিক বিক্রিত পণ্য')}</h2>
          <p className="home-section-sub">{t('home_best_sellers_sub', 'ক্রেতাদের সবচেয়ে প্রিয় সংগ্রহ')}</p>
        </div>

        <div
          className={`catalog-grid home-best-sellers-grid ${
            products.length === 1
              ? 'catalog-grid-1'
              : products.length === 2
              ? 'catalog-grid-2'
              : ''
          }`}
        >
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

