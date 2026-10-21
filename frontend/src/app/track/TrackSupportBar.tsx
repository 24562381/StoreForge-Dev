'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/LanguageContext';

export const TrackSupportBar = React.memo(function TrackSupportBar() {
  const { t } = useLanguage();

  return (
    <div className="track-support-bar">
      <div className="support-left">
        <i className="fa-solid fa-headset text-2xl text-amber-800"></i>
        <div>
          <h4 className="font-bold text-stone-900 text-sm">
            {t('track_support_box_title', 'অর্ডার নিয়ে কোনো প্রশ্ন বা সাহায্য প্রয়োজন?')}
          </h4>
          <p className="text-xs text-stone-500">
            {t(
              'track_support_box_desc',
              'আমাদের কাস্টমার কেয়ার টিম সকাল ১০টা থেকে রাত ১০টা পর্যন্ত সক্রিয় রয়েছে।',
            )}
          </p>
        </div>
      </div>
      <div className="support-actions">
        <a href="tel:+8801700000000" className="btn-support-call">
          <i className="fa-solid fa-phone"></i>
          <span>+880 1700-000000</span>
        </a>
        <Link href="/products" className="btn-support-catalog">
          <i className="fa-solid fa-compass"></i>
          <span>{t('track_browse_catalog_btn', 'অন্যান্য পণ্য দেখুন')}</span>
        </Link>
      </div>
    </div>
  );
});
