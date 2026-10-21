'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../lib/LanguageContext';

interface ConfirmationActionsRowProps {
  order: any;
  whatsappUrl: string;
  contactPhone?: string;
}

export const ConfirmationActionsRow = React.memo(function ConfirmationActionsRow({
  order,
  whatsappUrl,
  contactPhone,
}: ConfirmationActionsRowProps) {
  const { t } = useLanguage();

  return (
    <div className="confirmation-actions-row">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-whatsapp btn-lg"
      >
        <i className="fa-brands fa-whatsapp"></i>{' '}
        {t('confirm_btn_whatsapp', 'হোয়াটসঅ্যাপে অর্ডার নিশ্চিত করুন')}
      </a>
      <Link
        href={`/track?order=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.phone)}&token=${encodeURIComponent(order.accessToken || '')}`}
        className="btn btn-outline btn-lg"
      >
        <i className="fa-solid fa-truck-fast"></i>{' '}
        {t('confirm_btn_track', 'লাইভ অর্ডার ট্র্যাক করুন')}
      </Link>
      {contactPhone && (
        <a
          href={`tel:${contactPhone.replace(/\s+/g, '')}`}
          className="btn btn-outline btn-lg"
        >
          <i className="fa-solid fa-phone"></i> {t('confirm_btn_call', 'সাপোর্টে কল করুন')}
        </a>
      )}
    </div>
  );
});
