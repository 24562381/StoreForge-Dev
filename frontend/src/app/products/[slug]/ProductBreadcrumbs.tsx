'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../lib/LanguageContext';

interface ProductBreadcrumbsProps {
  product: any;
  translatedName: string;
}

export const ProductBreadcrumbs = React.memo(function ProductBreadcrumbs({ product, translatedName }: ProductBreadcrumbsProps) {
  const { t } = useLanguage();

  return (
    <nav className="details-breadcrumb" aria-label="Breadcrumb">
      <Link href="/">
        <i className="fa-solid fa-house"></i> {t('nav_home', 'Home')}
      </Link>
      <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
      <Link href="/products">{t('nav_products', 'Products')}</Link>
      {product.category && (
        <>
          <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
          <Link
            href={`/products?category=${encodeURIComponent(product.category.slug)}`}
            className="breadcrumb-category"
          >
            {t(`category.${product.category.slug}.name`, product.category.name)}
          </Link>
        </>
      )}
      <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
      <span className="breadcrumb-current">{translatedName}</span>
    </nav>
  );
});
