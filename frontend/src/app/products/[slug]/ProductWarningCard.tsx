'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../lib/LanguageContext';

interface ProductWarningCardProps {
  warningText?: string;
  className?: string;
}

export const ProductWarningCard = React.memo(function ProductWarningCard({
  warningText,
  className = '',
}: ProductWarningCardProps) {
  const { lang, t } = useLanguage();

  if (!warningText || !warningText.trim()) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .product-warning-card {
          margin-top: 14px;
          padding: 13px 16px;
          background: #fdfaf6;
          border: 1px solid #f0e4d7;
          border-left: 3.5px solid #d97706;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(43, 29, 20, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-warning-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(43, 29, 20, 0.06);
        }
        .warning-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .warning-card-icon-box {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(217, 119, 6, 0.12);
          color: #d97706;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .warning-card-title {
          font-size: 0.84rem;
          font-weight: 800;
          color: #92400e;
          letter-spacing: -0.01em;
        }
        .warning-card-content {
          margin: 0;
          padding-left: 30px;
          font-size: 0.82rem;
          line-height: 1.55;
          color: #78350f;
          font-weight: 500;
        }
        @media (min-width: 993px) {
          .product-warning-desktop {
            display: block !important;
          }
          .product-warning-mobile {
            display: none !important;
          }
        }
        @media (max-width: 992px) {
          .product-warning-desktop {
            display: none !important;
          }
          .product-warning-mobile {
            display: block !important;
            margin-top: 14px;
            margin-bottom: 6px;
          }
        }
      ` }} />
      <div className={`product-warning-card ${className}`}>
        <div className="warning-card-header">
          <span className="warning-card-icon-box">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          </span>
          <strong className="warning-card-title">
            {t('product_warning_title', lang === 'bn' ? 'সতর্কতা নোট' : 'Warning & Craftsmanship Notice')}
          </strong>
        </div>
        <p className="warning-card-content">{warningText}</p>
      </div>
    </>
  );
});

