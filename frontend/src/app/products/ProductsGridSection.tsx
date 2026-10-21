'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/LanguageContext';
import { ProductCard } from '@/components/ProductCard';

interface ProductsGridSectionProps {
  products: any[];
  loading: boolean;
  currency: string;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
}

export const ProductsGridSection = React.memo(function ProductsGridSection({
  products,
  loading,
  currency,
  onAddToCart,
}: ProductsGridSectionProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-stone-200/60 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalog-empty">
        <i className="fa-solid fa-magnifying-glass"></i>
        <h2>{t('search_no_results', 'No products found')}</h2>
        <Link className="btn btn-outline" href="/products">
          {t('search_reset', 'Reset filters')}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`catalog-grid products-page-grid ${
        products.length === 1
          ? 'catalog-grid-1'
          : products.length === 2
          ? 'catalog-grid-2'
          : ''
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
});

