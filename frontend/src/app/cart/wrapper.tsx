'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { useCart } from '../../lib/CartContext';

import CartHeader from './CartHeader';
import CartEmptyState from './CartEmptyState';
import CartItemsList from './CartItemsList';
import CartSummarySidebar from './CartSummarySidebar';

export default function Wrapper() {
  const { t, formatNum } = useLanguage();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const currency = '৳';

  return (
    <>
      <CartHeader
        t={t}
        formatNum={formatNum}
        totalItems={totalItems}
        itemCount={items.length}
      />

      <section className="cart-section py-5">
        <div className="container">
          {items.length === 0 ? (
            <CartEmptyState t={t} />
          ) : (
            <div className="cart-layout">
              <CartItemsList
                items={items}
                currency={currency}
                t={t}
                formatNum={formatNum}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />

              <CartSummarySidebar
                t={t}
                formatNum={formatNum}
                totalPrice={totalPrice}
                currency={currency}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
