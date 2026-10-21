'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface HeroBannerSectionProps {
  settings: Record<string, string>;
}

export const HeroBannerSection = React.memo(function HeroBannerSection({ settings }: HeroBannerSectionProps) {
  const { t } = useLanguage();
  const bannerUrl = settings.home_banner_image || '/images/product-main.jpg';

  return (
    <>
      {/* 1. TOP BANNER */}
      <section className="home-banner-section" aria-label={t('home_banner_label', 'প্রধান ব্যানার')}>
        <div className="container">
          <div className="home-banner">
            <img
              src={bannerUrl}
              alt={t('home_banner_alt', 'স্টোরফোর্জ — প্রিমিয়াম পণ্যসম্ভার')}
              className="home-banner-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. SHORT DESCRIPTION / INSPIRATIONAL MESSAGE */}
      <section className="home-intro-section" aria-label={t('home_intro_label', 'পরিচিতি ও বৈশিষ্ট্য')}>
        <div className="container">
          <div className="home-intro-card">
            <div className="home-intro-badge">
              <span className="badge-sparkle">
                <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
              </span>
              <span>{t('home_intro_badge', 'হস্তনির্মিত প্রিমিয়াম উডেন আর্ট')}</span>
            </div>

            <h1 className="home-intro-title">
              {t('home_headline', settings.home_headline || 'কাঠের স্পর্শে সাজিয়ে তুলুন আপনার পৃথিবী')}
            </h1>

            <p className="home-intro-text">
              {t(
                'home_intro_message',
                settings.home_intro_message ||
                  'প্রাকৃতিক কাঠ, দক্ষ কারিগর আর যত্নের ছোঁয়ায় তৈরি প্রতিটি শিল্পকর্ম — আপনার ঘরের দেয়ালে নিয়ে আসে উষ্ণতা, গল্প আর অনুপ্রেরণা।'
              )}
            </p>

            <div className="home-intro-features">
              <div className="home-intro-feat">
                <span className="feat-icon">
                  <i className="fa-solid fa-tree" aria-hidden="true"></i>
                </span>
                <span className="feat-text">{t('home_feat_1', '১০০% প্রাকৃতিক বার্চ কাঠ')}</span>
              </div>
              <div className="home-intro-feat">
                <span className="feat-icon">
                  <i className="fa-solid fa-layer-group" aria-hidden="true"></i>
                </span>
                <span className="feat-text">{t('home_feat_2', 'মাল্টি-লেয়ার ৩ডি গভীরতা')}</span>
              </div>
              <div className="home-intro-feat">
                <span className="feat-icon">
                  <i className="fa-solid fa-award" aria-hidden="true"></i>
                </span>
                <span className="feat-text">{t('home_feat_3', 'নিখুঁত হ্যান্ডক্রাফটেড ফিনিশিং')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});
