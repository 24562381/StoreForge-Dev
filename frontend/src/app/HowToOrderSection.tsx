'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface HowToOrderSectionProps {
  settings: Record<string, string>;
}

export const HowToOrderSection = React.memo(function HowToOrderSection({ settings }: HowToOrderSectionProps) {
  const { t, formatNum } = useLanguage();

  return (
    <section
      className="home-section home-order-guide-section"
      id="order-guide"
      aria-label={t('home_order_guide_title', 'অর্ডার করার সহজ নিয়ম')}
    >
      <div className="container">
        <div className="home-section-head text-center">
          <div className="home-section-badge">
            <i className="fa-solid fa-clipboard-check" aria-hidden="true"></i>
            <span>{t('home_order_guide_badge', 'সহজ ও নিরাপদ কেনাকাটা')}</span>
          </div>
          <h2 className="home-section-title">{t('home_order_guide_title', 'কিভাবে অর্ডার করবেন?')}</h2>
          <p className="home-section-sub">
            {t(
              'home_order_guide_sub',
              'মাত্র কয়েকটি সহজ ধাপে পছন্দের কাঠের শিল্পকর্ম অর্ডার করুন আপনার পছন্দের ঠিকানায়'
            )}
          </p>
        </div>

        <div className="order-guide-grid">
          <div className="order-step-card">
            <div className="order-step-header">
              <span className="order-step-number">{formatNum(1)}</span>
              <div className="order-step-icon">
                <i className="fa-solid fa-compass" aria-hidden="true"></i>
              </div>
            </div>
            <h3 className="order-step-title">{t('guide_step_1_title', 'পণ্য ও সাইজ পছন্দ করুন')}</h3>
            <p className="order-step-desc">
              {t(
                'guide_step_1_desc',
                'ক্যাটালগ থেকে আপনার ঘরের দেয়ালের পরিমাপ অনুযায়ী উপযুক্ত মডেল ও কালার বেছে নিন।'
              )}
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-header">
              <span className="order-step-number">{formatNum(2)}</span>
              <div className="order-step-icon">
                <i className="fa-solid fa-address-card" aria-hidden="true"></i>
              </div>
            </div>
            <h3 className="order-step-title">{t('guide_step_2_title', 'নাম ও ঠিকানা প্রদান করুন')}</h3>
            <p className="order-step-desc">
              {t(
                'guide_step_2_desc',
                'অর্ডার ফর্মে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা সঠিকভাবে পূরণ করুন।'
              )}
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-header">
              <span className="order-step-number">{formatNum(3)}</span>
              <div className="order-step-icon">
                <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
              </div>
            </div>
            <h3 className="order-step-title">{t('guide_step_3_title', 'পেমেন্ট পদ্ধতি বেছে নিন')}</h3>
            <p className="order-step-desc">
              {t(
                'guide_step_3_desc',
                '১০০% ঝুঁকিমুক্ত ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ) অথবা বিকাশে পেমেন্ট সম্পন্ন করুন।'
              )}
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-header">
              <span className="order-step-number">{formatNum(4)}</span>
              <div className="order-step-icon">
                <i className="fa-solid fa-truck-fast" aria-hidden="true"></i>
              </div>
            </div>
            <h3 className="order-step-title">{t('guide_step_4_title', 'দ্রুত হোম ডেলিভারি বুঝে নিন')}</h3>
            <p className="order-step-desc">
              {t(
                'guide_step_4_desc',
                '২-৪ কার্যদিবসের মধ্যে ডেলিভারি বুঝে নিন এবং কর্নার স্টেনসিল দিয়ে সহজে দেয়ালে সাজিয়ে তুলুন।'
              )}
            </p>
          </div>
        </div>

        <div className="order-guide-cta-row">
          <Link href="/catalog" className="btn btn-primary btn-lg order-guide-cta-btn" id="orderGuideCtaBtn">
            <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
            <span>{t('home_order_now_cta', 'এখনই পছন্দ করুন')}</span>
          </Link>
          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}
              className="btn btn-outline btn-lg order-guide-phone-btn"
              id="orderGuidePhoneBtn"
            >
              <i className="fa-solid fa-phone-volume" aria-hidden="true"></i>
              <span>
                {t('home_order_call_btn', 'ফোনে অর্ডার করুন')}: {settings.contact_phone}
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
});
