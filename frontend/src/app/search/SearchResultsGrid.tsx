'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { ProductCard } from '@/components/ProductCard';

interface SearchResultsGridProps {
  products: any[];
  loading: boolean;
  activeFilterCount: number;
  currency: string;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
  onReset: (e: React.MouseEvent) => void;
}

export const SearchResultsGrid = React.memo(function SearchResultsGrid({
  products,
  loading,
  activeFilterCount,
  currency,
  onAddToCart,
  onReset,
}: SearchResultsGridProps) {
  const { t, formatNum } = useLanguage();

  return (
    <div className="search-results">
      <div className="search-results-heading">
        <strong>
          {formatNum(products.length)} {t('search_results_count', 'products')}
        </strong>
        {activeFilterCount > 0 && <span>{t('search_filtered_label', 'Filtered results')}</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-stone-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="catalog-grid search-catalog-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <i className="fa-solid fa-magnifying-glass"></i>
          <h2>{t('search_no_results', 'No products match those filters')}</h2>
          <a className="btn btn-outline" href="/search" onClick={onReset}>
            {t('search_reset', 'Reset filters')}
          </a>
        </div>
      )}
    </div>
  );
});

