'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { ExclusiveProductCard } from '@/components/ExclusiveProductCard';

interface ProductsExclusiveSectionProps {
  exclusiveProducts: any[];
  currency: string;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
}

export const ProductsExclusiveSection = React.memo(function ProductsExclusiveSection({
  exclusiveProducts,
  currency,
  onAddToCart,
}: ProductsExclusiveSectionProps) {
  const { t } = useLanguage();

  if (!exclusiveProducts || exclusiveProducts.length === 0) return null;

  return (
    <section className="exclusive-section">
      <div className="container">
        <div className="exclusive-header">
          <div className="exclusive-title-wrap">
            <span className="exclusive-line" aria-hidden="true"></span>
            <h2 className="exclusive-heading">
              <span className="exclusive-crown-icon">
                <i className="fa-solid fa-crown"></i>
              </span>
              <span>{t('exclusive_badge', 'Exclusive Collection')}</span>
            </h2>
            <span className="exclusive-line" aria-hidden="true"></span>
          </div>
        </div>

        <div
          className={`exclusive-grid ${
            exclusiveProducts.length === 1
              ? 'exclusive-grid-1 exclusive-grid-single'
              : exclusiveProducts.length === 2
              ? 'exclusive-grid-2 exclusive-grid-double'
              : ''
          }`}
        >
          {exclusiveProducts.map((product) => (
            <ExclusiveProductCard
              key={product.id}
              product={product}
              currency={currency}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
