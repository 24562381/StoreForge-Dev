'use client';

import React from 'react';
import Link from 'next/link';

interface CartEmptyStateProps {
  t: (key: string, fallback: string) => string;
}

export default React.memo(function CartEmptyState({ t }: CartEmptyStateProps) {
  return (
    <div className="cart-empty-card">
      <div className="empty-cart-icon-circle">
        <i className="fa-solid fa-cart-shopping"></i>
      </div>
      <h2 className="empty-cart-title">{t('cart_empty_title', 'আপনার কার্ট বর্তমানে খালি আছে')}</h2>
      <p className="empty-cart-desc">
        {t('cart_empty_body', 'আমাদের প্রিমিয়াম কালেকশন থেকে আপনার পছন্দের কাঠের মানচিত্র বেছে নিন।')}
      </p>
      <Link className="btn btn-primary btn-lg empty-cart-btn" href="/products">
        <i className="fa-solid fa-arrow-left"></i> {t('home_browse', 'পণ্য ব্রাউজ করুন')}
      </Link>
    </div>
  );
});
