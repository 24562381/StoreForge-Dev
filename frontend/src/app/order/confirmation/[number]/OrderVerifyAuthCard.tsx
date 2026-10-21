'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../../lib/LanguageContext';

export const OrderVerifyAuthCard = React.memo(function OrderVerifyAuthCard() {
  const { t } = useLanguage();

  return (
    <div className="container py-16 text-center" style={{ minHeight: '60vh' }}>
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          background: '#FFFFFF',
          padding: '40px 28px',
          borderRadius: '24px',
          border: '1px solid #E2D7CC',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.8rem',
          }}
        >
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#2B1D14',
            marginBottom: '10px',
          }}
        >
          {t('order_security_notice', 'অর্ডারের বিবরণ সুরক্ষিত')}
        </h2>
        <p
          style={{
            color: '#64748B',
            fontSize: '0.92rem',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}
        >
          {t(
            'order_security_desc',
            'গ্রাহকের ব্যক্তিগত তথ্যের সুরক্ষার জন্য এই পেজটি শুধুমাত্র ক্রেতার ব্রাউজার সেশনে দৃশ্যমান। আপনার গোপন ট্র্যাকিং কোড দিয়ে অর্ডার ট্র্যাক করুন।',
          )}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/track"
            className="btn btn-outline"
            style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-truck-fast me-2"></i> {t('nav_track', 'অর্ডার ট্র্যাক করুন')}
          </Link>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-house me-2"></i> {t('nav_home', 'হোমে ফিরে যান')}
          </Link>
        </div>
      </div>
    </div>
  );
});
