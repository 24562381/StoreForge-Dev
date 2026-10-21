'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';

interface TrackHeroSectionProps {
  orderNumber: string;
  setOrderNumber: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  token: string;
  setToken: (val: string) => void;
  loading: boolean;
  onTrack: (e?: React.FormEvent) => void;
}

export const TrackHeroSection = React.memo(function TrackHeroSection({
  orderNumber,
  setOrderNumber,
  phone,
  setPhone,
  token,
  setToken,
  loading,
  onTrack,
}: TrackHeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="track-hero">
      <div className="container">
        <div className="track-hero-content text-center">
          <span className="track-pill-badge">
            <i className="fa-solid fa-location-crosshairs"></i> {t('track_badge', 'লাইভ অর্ডার ট্র্যাকিং')}
          </span>
          <h1 className="track-hero-title">{t('track_heading', 'অর্ডারের সর্বশেষ অবস্থা জানুন')}</h1>
          <p className="track-hero-desc">
            {t(
              'track_subheading',
              'আপনার অর্ডার আইডি, মোবাইল নম্বর এবং অর্ডার কনফার্মেশনের ট্র্যাকিং কোড দিয়ে পার্সেলের বর্তমান অবস্থা পর্যবেক্ষণ করুন।',
            )}
          </p>

          {/* Search Form Card */}
          <div className="track-search-card max-w-4xl mx-auto">
            <form onSubmit={onTrack} id="trackForm">
              {/* 3 Inputs in One Line on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 text-left">
                {/* 1. Order ID */}
                <div className="track-input-group">
                  <label htmlFor="orderNumberInput" className="track-input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-[#3E271B]">
                      <i className="fa-solid fa-receipt text-[#8E5A35]"></i>
                      <span>{t('track_form_order_label', 'অর্ডার আইডি / নম্বর')}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 border border-amber-200">
                      {t('required_badge', 'আবশ্যক')}
                    </span>
                  </label>
                  <div className="track-input-wrapper relative">
                    <span className="track-input-icon">
                      <i className="fa-solid fa-hashtag"></i>
                    </span>
                    <input
                      type="text"
                      id="orderNumberInput"
                      className="track-input font-mono uppercase tracking-wider font-bold"
                      placeholder={t('track_form_order_placeholder', 'যেমন: WM000101')}
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* 2. Mobile Phone */}
                <div className="track-input-group">
                  <label htmlFor="phoneInput" className="track-input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-[#3E271B]">
                      <i className="fa-solid fa-mobile-screen text-[#8E5A35]"></i>
                      <span>{t('track_form_phone_label', 'মোবাইল নম্বর')}</span>
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">
                      ({t('optional_badge', 'ঐচ্ছিক')})
                    </span>
                  </label>
                  <div className="track-input-wrapper relative">
                    <span className="track-input-icon">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      id="phoneInput"
                      className="track-input font-mono"
                      placeholder={t('track_form_phone_placeholder', 'যেমন: 017XXXXXXXX')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* 3. Secret Access Code */}
                <div className="track-input-group">
                  <label htmlFor="accessTokenInput" className="track-input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-[#3E271B]">
                      <i className="fa-solid fa-shield-halved text-[#8E5A35]"></i>
                      <span>{t('track_access_code_label', 'অর্ডার সিকিউরিটি কোড')}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-900 border border-emerald-200">
                      {t('required_badge', 'আবশ্যক')}
                    </span>
                  </label>
                  <div className="track-input-wrapper relative">
                    <span className="track-input-icon">
                      <i className="fa-solid fa-key text-amber-700"></i>
                    </span>
                    <input
                      type="text"
                      id="accessTokenInput"
                      className="track-input font-mono tracking-wider font-bold"
                      placeholder={t('track_access_code_placeholder', 'যেমন: sjSjVAuL')}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* Action & Verification Note Row */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-stone-500 text-left">
                  <i className="fa-solid fa-lock text-[#8E5A35]"></i>
                  <span>
                    {t(
                      'track_security_hint',
                      'সিকিউরিটি কোড আপনার অর্ডার কনফার্মেশনের সময় স্ক্রিন ও এসএমএসে দেওয়া হয়েছিল।',
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-[#8E5A35] via-[#A76B3F] to-[#C08A46] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-md shadow-[#8E5A35]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0"
                  id="trackSubmitBtn"
                >
                  <i className={loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-magnifying-glass'}></i>
                  <span>{loading ? t('loading', 'খোঁজা হচ্ছে...') : t('track_form_submit', 'অর্ডার ট্র্যাক করুন')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});
