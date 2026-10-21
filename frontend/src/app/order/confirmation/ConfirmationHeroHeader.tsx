'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';

interface ConfirmationHeroHeaderProps {
  order: any;
  copied: boolean;
  setCopied: (val: boolean) => void;
  copiedToken: boolean;
  setCopiedToken: (val: boolean) => void;
  cookieToken?: string;
}

export const ConfirmationHeroHeader = React.memo(function ConfirmationHeroHeader({
  order,
  copied,
  setCopied,
  copiedToken,
  setCopiedToken,
  cookieToken,
}: ConfirmationHeroHeaderProps) {
  const { t } = useLanguage();

  const effectiveToken = order?.accessToken || cookieToken || '';

  const handleCopyOrderNumber = React.useCallback(() => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [order?.orderNumber, setCopied]);

  const handleCopyAccessToken = React.useCallback(() => {
    if (!effectiveToken) return;
    navigator.clipboard.writeText(effectiveToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }, [effectiveToken, setCopiedToken]);

  return (
    <div className="text-center">
      <div className="success-icon-wrap">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <span className="confirmation-badge">{t('confirm_badge', 'অর্ডার গৃহীত হয়েছে')}</span>
      <h1 className="confirmation-title">
        {t('confirm_title', 'ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।')}
      </h1>
      <p className="confirmation-subtitle">
        {t(
          'confirm_subtitle',
          'আমাদের টিম আপনার পার্সেল প্রস্তুত করছে। ডেলিভারি নিশ্চিত করতে শীঘ্রই আপনার নম্বরে কল করা হবে:',
        )}{' '}
        <strong>{order.phone}</strong>
      </p>

      <div className="order-number-box">
        <span className="order-number-label">{t('confirm_order_id_label', 'আপনার অর্ডার আইডি:')}</span>
        <strong className="order-number-val" id="orderIdText">
          {order.orderNumber}
        </strong>
        <button
          type="button"
          className="btn btn-sm copy-btn"
          onClick={handleCopyOrderNumber}
        >
          {copied ? t('confirm_copied_btn', 'কপি হয়েছে!') : t('confirm_copy_btn', 'কপি')}
        </button>
      </div>

      {effectiveToken ? (
        <>
          <div className="order-number-box tracking-code-box">
            <span className="order-number-label">
              <i className="fa-solid fa-key me-1" style={{ color: '#8E5A35' }}></i>{' '}
              {t('track_access_code_label', 'গোপন সিক্রেট টোকেন:')}
            </span>
            <strong className="order-number-val tracking-code-value" id="orderTrackingCode">
              {effectiveToken}
            </strong>
            <button
              type="button"
              className="btn btn-sm copy-btn tracking-code-copy"
              onClick={handleCopyAccessToken}
            >
              <i className={copiedToken ? 'fa-solid fa-check' : 'fa-regular fa-copy'} style={{ marginRight: '4px' }}></i>
              {copiedToken ? t('confirm_copied_btn', 'কপি হয়েছে!') : t('confirm_copy_btn', 'কপি')}
            </button>
          </div>
          <p className="text-center tracking-hint-text">
            {t(
              'track_access_code_hint',
              'এই সিক্রেট টোকেনটি সংরক্ষণ করুন। পরবর্তীতে অর্ডার ট্র্যাক ও তথ্য যাচাই করতে এটি প্রয়োজন হবে।',
            )}
          </p>
        </>
      ) : null}
    </div>
  );
});
