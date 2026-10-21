'use client';

import React from 'react';

interface CartHeaderProps {
  t: (key: string, fallback: string) => string;
  formatNum: (val: number | string) => string;
  totalItems: number;
  itemCount: number;
}

export default React.memo(function CartHeader({ t, formatNum, totalItems, itemCount }: CartHeaderProps) {
  return (
    <section className="catalog-page-head cart-page-head">
      <div className="container">
        <p className="catalog-eyebrow">
          <i className="fa-solid fa-cart-shopping me-1"></i> {t('cart_eyebrow', 'আপনার নির্বাচন')}
        </p>
        <div className="cart-title-row">
          <h1 className="cart-page-title">{t('cart_title', 'আপনার শপিং কার্ট')}</h1>
          {itemCount > 0 && (
            <span className="cart-count-badge">
              {formatNum(totalItems)} {t('cart_items_suffix', 'টি পণ্য')}
            </span>
          )}
        </div>
      </div>
    </section>
  );
});
