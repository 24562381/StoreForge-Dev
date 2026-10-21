'use client';

import React from 'react';
import Link from 'next/link';

interface CartSummarySidebarProps {
  t: (key: string, fallback: string) => string;
  formatNum: (val: number | string) => string;
  totalPrice: number;
  currency: string;
}

export default React.memo(function CartSummarySidebar({
  t,
  formatNum,
  totalPrice,
  currency,
}: CartSummarySidebarProps) {
  return (
    <div className="cart-summary-sidebar">
      <div className="order-summary-card">
        <h3 className="summary-title">
          <i className="fa-solid fa-receipt"></i> {t('order_summary_title', 'অর্ডার সামারি')}
        </h3>

        <div className="summary-calculation-lines">
          <div className="calc-line">
            <span>{t('order_subtotal', 'সাবটোটাল:')}</span>
            <span>{currency} {formatNum(totalPrice)}</span>
          </div>
          <div className="calc-line">
            <span>{t('order_delivery_charge', 'ডেলিভারি চার্জ')}:</span>
            <span>{t('cart_calc_at_checkout', 'চেকআউটে নির্ধারিত হবে')}</span>
          </div>
          <div className="calc-divider"></div>
          <div className="calc-line total-line">
            <span>{t('order_total_payable', 'সর্বমোট:')}</span>
            <strong className="total-amount">{currency} {formatNum(totalPrice)}</strong>
          </div>
        </div>

        <Link href="/checkout" className="btn btn-primary btn-block btn-lg mt-4">
          <i className="fa-solid fa-lock"></i> {t('cart_proceed_checkout', 'চেকআউটে এগিয়ে যান')}
        </Link>
      </div>
    </div>
  );
});
