'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';

interface ConfirmationDeliveryInfoProps {
  order: any;
  currency?: string;
}

export const ConfirmationDeliveryInfo = React.memo(function ConfirmationDeliveryInfo({
  order,
  currency = '৳',
}: ConfirmationDeliveryInfoProps) {
  const { t, formatNum } = useLanguage();

  if (!order) return null;

  const isInsideDhaka =
    order.district === 'inside_dhaka' ||
    order.district?.toLowerCase()?.includes('inside') ||
    order.district?.includes('ভিতরে') ||
    order.district?.includes('ভেতরে');

  const rawZoneText = isInsideDhaka
    ? t('order_opt_dhaka', 'ঢাকা সিটির ভেতরে')
    : t('order_opt_outside', 'ঢাকা সিটির বাইরে');

  // Strip any baked-in price in parentheses from dictionary string, e.g. "ঢাকা সিটির ভেতরে (৳ ৮০)" -> "ঢাকা সিটির ভেতরে"
  const cleanZoneText = rawZoneText.replace(/\s*\([^)]*\)/, '').trim();

  const deliveryChargeVal = order.deliveryCharge !== undefined && order.deliveryCharge !== null ? Number(order.deliveryCharge) : null;
  const deliveryAreaPill = deliveryChargeVal !== null
    ? `${cleanZoneText} (${currency} ${formatNum(deliveryChargeVal)})`
    : rawZoneText;

  const hasNote = Boolean(order.deliveryNote && order.deliveryNote.trim());

  return (
    <div className="confirmation-section delivery-address-card">
      {/* Card Header with Icon Tile and Title */}
      <div className="confirmation-card-header">
        <div className="header-left">
          <div className="header-icon-tile">
            <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
          </div>
          <h2 className="header-title">
            {t('confirm_delivery_address', 'ডেলিভারি ঠিকানা')}
          </h2>
        </div>
      </div>

      {/* Responsive Definition List Grid (Auto-fits side by side when space permits) */}
      <dl className="delivery-fields-grid">
        {/* Customer Full Name */}
        <div className="delivery-field">
          <dt className="delivery-field-label">
            {t('order_label_fullname', 'আপনার পূর্ণ নাম')}
          </dt>
          <dd className="delivery-field-val">
            {order.customerName || '—'}
          </dd>
        </div>

        {/* Mobile Number */}
        <div className="delivery-field">
          <dt className="delivery-field-label">
            {t('order_label_phone', 'মোবাইল নম্বর (১১ ডিজিট)')}
          </dt>
          <dd className="delivery-field-val amount-nowrap">
            {order.phone || '—'}
          </dd>
        </div>

        {/* Email (if present) */}
        {order.email && (
          <div className="delivery-field full-width">
            <dt className="delivery-field-label">
              {t('order_label_email', 'ইমেইল')}
            </dt>
            <dd className="delivery-field-val">
              {order.email}
            </dd>
          </div>
        )}

        {/* Full Address - Spans full width */}
        <div className="delivery-field full-width">
          <dt className="delivery-field-label">
            {t('order_label_address', 'সম্পূর্ণ ঠিকানা (বাসা/রোড নম্বর)')}
          </dt>
          <dd className="delivery-field-val address-val">
            {order.address || '—'}
          </dd>
        </div>

        {/* Delivery Area (Pill Badge) */}
        <div className="delivery-field">
          <dt className="delivery-field-label">
            {t('order_label_location', 'ডেলিভারি এলাকা')}
          </dt>
          <dd className="delivery-field-val">
            <span className="delivery-area-pill amount-nowrap">
              {deliveryAreaPill}
            </span>
          </dd>
        </div>

        {/* Thana / District */}
        {order.areaThana && (
          <div className="delivery-field">
            <dt className="delivery-field-label">
              {t('order_label_area', 'থানা / জেলা')}
            </dt>
            <dd className="delivery-field-val">
              {order.areaThana}
            </dd>
          </div>
        )}

        {/* Special Delivery Note - Tinted box with 3px brown border (hidden if empty) */}
        {hasNote && (
          <div className="delivery-field full-width">
            <dt className="delivery-field-label">
              {t('order_label_note', 'অর্ডারের বিশেষ নোট (ঐচ্ছিক)')}
            </dt>
            <dd className="delivery-field-val delivery-note-box">
              {order.deliveryNote}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
});
