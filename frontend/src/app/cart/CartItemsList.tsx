'use client';

import React from 'react';
import Link from 'next/link';

interface CartItemsListProps {
  items: any[];
  currency: string;
  t: (key: string, fallback: string) => string;
  formatNum: (val: number | string) => string;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
}

export default React.memo(function CartItemsList({
  items,
  currency,
  t,
  formatNum,
  updateQuantity,
  removeFromCart,
}: CartItemsListProps) {
  return (
    <div className="cart-lines-container">
      <div className="cart-lines-list">
        {items.map((item) => {
          const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
          const lineTotal = Number(item.totalPrice ?? unitPrice * item.quantity);
          const productHref = item.productId ? `/products/${item.productId}` : '/products';
          return (
            <article key={item.id} className="cart-item-card">
              <Link href={productHref} className="cart-item-image-wrap">
                <img
                  src={item.imageUrl || '/images/no-image.svg'}
                  alt={item.productName}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/no-image.svg';
                  }}
                />
              </Link>

              <div className="cart-item-content">
                <div className="cart-item-header">
                  <div className="cart-item-info">
                    <h2 className="cart-item-title">
                      <Link href={productHref}>{item.productName}</Link>
                    </h2>
                    <div className="cart-item-variants">
                      <span className="variant-chip">
                        <i className="fa-solid fa-layer-group"></i> {item.variantName}
                      </span>
                    </div>
                  </div>

                  <div className="cart-item-price-box">
                    <span className="cart-item-unit-price">
                      {currency} {formatNum(unitPrice)} <small>/ {t('cart_each', 'প্রতি পণ্য')}</small>
                    </span>
                    <div className="cart-item-total-display">
                      <strong className="cart-item-line-total">
                        {currency} {formatNum(lineTotal)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="cart-item-footer">
                  <div className="cart-stepper-control">
                    <span className="stepper-label">{t('order_label_quantity', 'পরিমাণ')}:</span>
                    <div className="stepper-box">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        className="stepper-qty-val"
                        readOnly
                      />
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <i className="fa-solid fa-trash-can"></i> {t('cart_remove', 'মুছে ফেলুন')}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
});
