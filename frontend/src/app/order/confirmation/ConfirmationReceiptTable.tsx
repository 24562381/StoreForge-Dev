'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';

interface ConfirmationReceiptTableProps {
  order: any;
  currency: string;
}

function parseItemColour(colour: any): string {
  if (!colour) return '';
  let displayColor = String(colour).trim();
  try {
    if (displayColor.startsWith('[') && displayColor.endsWith(']')) {
      const parsed = JSON.parse(displayColor);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).join(', ');
      if (typeof parsed === 'string') return parsed;
    }
  } catch (e) {}
  return displayColor.replace(/^[\[\s"']+|[\]\s"']+$/g, '').replace(/["']\s*,\s*["']/g, ', ').trim();
}

export const ConfirmationReceiptTable = React.memo(function ConfirmationReceiptTable({
  order,
  currency,
}: ConfirmationReceiptTableProps) {
  const { t, formatNum } = useLanguage();

  if (!order) return null;

  const items = order.items || [];
  const totalItemsCount = items.reduce(
    (acc: number, item: any) => acc + (Number(item.quantity) || 1),
    0
  );

  return (
    <div className="confirmation-section order-summary-card">
      {/* Card Header with Icon Tile, Title and Item Count */}
      <div className="confirmation-card-header">
        <div className="header-left">
          <div className="header-icon-tile">
            <i className="fa-solid fa-receipt" aria-hidden="true"></i>
          </div>
          <h2 className="header-title">
            {t('order_summary_title', 'অর্ডার সামারি')}
          </h2>
        </div>
        <span className="header-count amount-nowrap">
          {formatNum(totalItemsCount || items.length)}
          {t('items_count_suffix', 'টি পণ্য')}
        </span>
      </div>

      {/* Modern Product Items List (No Table) */}
      <div className="confirmation-items-list">
        {items.map((item: any) => {
          const itemImg =
            item.imageUrl ||
            item.product?.images?.[0]?.imageUrl ||
            item.product?.images?.[0]?.thumbnailUrl ||
            item.product?.imageUrl ||
            '/images/no-image.svg';

          const displayColor = parseItemColour(item.colour);
          const variantParts: string[] = [];
          if (item.sizeName) variantParts.push(item.sizeName);
          if (displayColor) variantParts.push(displayColor);
          const variantLabel = variantParts.join(' · ');

          const qty = Number(item.quantity) || 1;
          const unitPrice =
            item.unitPrice !== undefined && item.unitPrice !== null
              ? Number(item.unitPrice)
              : item.totalPrice && qty > 0
              ? Number(item.totalPrice) / qty
              : Number(item.totalPrice || 0);

          return (
            <div key={item.id} className="confirmation-item-row">
              {/* Column 1: Square thumbnail with circular quantity badge */}
              <div className="confirmation-thumb-wrapper">
                <img
                  src={itemImg}
                  alt={item.productName}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/no-image.svg';
                  }}
                  className="confirmation-thumb-img"
                />
                {qty > 0 && (
                  <span className="confirmation-thumb-badge" aria-label={`Quantity ${qty}`}>
                    {formatNum(qty)}
                  </span>
                )}
              </div>

              {/* Column 2: Product Name, Variant Pill, Unit Price */}
              <div className="confirmation-item-details">
                <h3 className="confirmation-product-name">
                  {item.productName}
                </h3>

                {variantLabel && (
                  <div className="confirmation-variant-pill">
                    {variantLabel}
                  </div>
                )}

                <div className="confirmation-unit-price amount-nowrap">
                  <span>{t('each_item_price', 'প্রতিটি')}</span>{' '}
                  <span className="amount-nowrap">{currency} {formatNum(unitPrice)}</span>
                </div>
              </div>

              {/* Column 3: Line Total */}
              <div className="confirmation-item-total amount-nowrap">
                <span className="amount-nowrap">{currency} {formatNum(item.totalPrice)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals Section with Dashed Dividers */}
      <div className="confirmation-totals-list">
        {/* Subtotal */}
        <div className="confirmation-total-row">
          <span className="total-label">{t('order_subtotal', 'সাবটোটাল')}</span>
          <span className="total-amount amount-nowrap">
            {currency} {formatNum(order.subtotal)}
          </span>
        </div>

        {/* Promo Discount (if applied) */}
        {Number(order.discountAmount || 0) > 0 && (
          <div className="confirmation-total-row discount-row">
            <span className="total-label">
              {t('order_promo_discount', 'প্রোমো ছাড়')}{' '}
              {order.promoCode ? `(${order.promoCode})` : ''}
            </span>
            <span className="total-amount amount-nowrap">
              - {currency} {formatNum(order.discountAmount)}
            </span>
          </div>
        )}

        {/* Delivery Charge */}
        <div className="confirmation-total-row">
          <span className="total-label">{t('order_delivery_charge', 'ডেলিভারি চার্জ')}</span>
          <span className="total-amount amount-nowrap">
            {currency} {formatNum(order.deliveryCharge)}
          </span>
        </div>
      </div>

      {/* Grand Total Band */}
      <div className="confirmation-grand-total-band">
        <span className="grand-total-label">
          {t('order_total_payable', 'সর্বমোট প্রদেয়:')}
        </span>
        <span className="grand-total-amount amount-nowrap">
          {currency} {formatNum(order.total)}
        </span>
      </div>
    </div>
  );
});
