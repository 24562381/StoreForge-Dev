'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';

interface StoreGuaranteeBadgesProps {
  className?: string;
}

export const StoreGuaranteeBadges = React.memo(function StoreGuaranteeBadges({
  className = '',
}: StoreGuaranteeBadgesProps) {
  const { t } = useLanguage();

  return (
    <div className={`store-guarantees-grid ${className}`}>
      <div className="guarantee-item">
        <div className="guarantee-icon">
          <i className="fa-solid fa-truck-ramp-box"></i>
        </div>
        <div className="guarantee-text">
          <strong>{t('guarantee_delivery_title', 'Nationwide Delivery')}</strong>
          <small>{t('guarantee_delivery_desc', 'Inside Dhaka 24-48h, Outside Dhaka 2-4 days')}</small>
        </div>
      </div>
      <div className="guarantee-item">
        <div className="guarantee-icon">
          <i className="fa-solid fa-money-bill-wave"></i>
        </div>
        <div className="guarantee-text">
          <strong>{t('guarantee_cod_title', 'Cash on Delivery')}</strong>
          <small>{t('guarantee_cod_desc', 'Pay safely after inspecting the product')}</small>
        </div>
      </div>
      <div className="guarantee-item">
        <div className="guarantee-icon">
          <i className="fa-solid fa-award"></i>
        </div>
        <div className="guarantee-text">
          <strong>{t('guarantee_quality_title', '100% Quality Guaranteed')}</strong>
          <small>{t('guarantee_quality_desc', 'Precision laser-crafted premium natural wood')}</small>
        </div>
      </div>
      <div className="guarantee-item">
        <div className="guarantee-icon">
          <i className="fa-solid fa-rotate-left"></i>
        </div>
        <div className="guarantee-text">
          <strong>{t('guarantee_replacement_title', '7-Day Easy Replacement')}</strong>
          <small>{t('guarantee_replacement_desc', 'Hassle-free support for transit damages')}</small>
        </div>
      </div>
    </div>
  );
});
