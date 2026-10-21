'use client';

import React from 'react';
import { generateCode128SVG } from './BarcodeSvg';

interface Sticker4x6TemplateProps {
  order: any;
  settings: Record<string, string>;
  headerBrandTitle: string;
  companyBinNo: string;
  orderDate: string;
  isDhaka: boolean;
  isCod: boolean;
  totalItemCount: number;
  barcodeFormattedNumber: string;
}

export const Sticker4x6Template = React.memo(function Sticker4x6Template({
  order,
  settings,
  headerBrandTitle,
  companyBinNo,
  orderDate,
  isDhaka,
  isCod,
  totalItemCount,
  barcodeFormattedNumber,
}: Sticker4x6TemplateProps) {
  return (
    <div className="label-4x6-card">
      {/* Header */}
      <div className="l4-header">
        <div className="l4-brand-info">
          {settings.store_logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.store_logo_url} alt="Logo" loading="lazy" className="l4-logo" />
          )}
          <div>
            <div className="l4-brand-title">{headerBrandTitle}</div>
            <div className="l4-bin">{companyBinNo}</div>
            <div className="l4-contact">Hub: {settings.contact_address || 'Dhaka, Bangladesh'} | Tel: {settings.contact_phone || '+880 1700-000000'}</div>
          </div>
        </div>

        <div className="l4-order-badge">
          <div className="l4-badge-tag">CONSIGNMENT / ORDER</div>
          <div className="l4-badge-num">{order.orderNumber}</div>
          <div className="l4-badge-date">{orderDate}</div>
        </div>
      </div>

      {/* Dispatch Strip */}
      <div className="l4-dispatch-strip">
        <div className="l4-dispatch-col">
          <span className="l4-label">DELIVERY DESTINATION</span>
          <span className="l4-val">{isDhaka ? 'INSIDE DHAKA METRO' : 'OUTSIDE DHAKA DISTRICT'}</span>
        </div>
        <div className="l4-dispatch-col">
          <span className="l4-label">SERVICE TYPE</span>
          <span className="l4-val">EXPRESS DOORSTEP COURIER</span>
        </div>
        <div className="l4-dispatch-col text-right">
          <span className="l4-label">TOTAL PARCEL WEIGHT/PCS</span>
          <span className="l4-val">{totalItemCount} Unit(s)</span>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="l4-recipient-section">
        <div className="l4-section-header">
          <span>DELIVER TO / প্রাপকের বিবরণ</span>
          <span className="l4-tag-zone">{isDhaka ? 'DHAKA ZONE' : 'NATIONWIDE DELIVERY'}</span>
        </div>

        <div className="l4-cust-row">
          <div className="l4-name">{order.customerName}</div>
          <div className="l4-phone-highlight">
            <span className="l4-phone-tag">PHONE:</span>
            <span className="l4-phone-text">{order.phone}</span>
          </div>
        </div>

        <div className="l4-address">
          <strong>Address:</strong> {order.address}{order.areaThana ? `, ${order.areaThana}` : ''}{order.district && !['inside_dhaka', 'outside_dhaka'].includes(order.district.toLowerCase()) ? `, ${order.district}` : ''}
        </div>

        {order.deliveryNote && (
          <div className="l4-note">
            <strong>Special Delivery Note:</strong> {order.deliveryNote}
          </div>
        )}
      </div>

      {/* COD / Payment Summary */}
      <div className="l4-payment-section">
        <div className="l4-payment-left">
          <div className="l4-pay-status-pill">
            {isCod ? '💵 CASH ON DELIVERY (COD)' : `💳 PREPAID ONLINE (${(order.paymentMethod || 'BKASH').toUpperCase()})`}
          </div>
          <div className="l4-pay-instructions">
            {isCod 
              ? 'Please collect the exact grand total in cash before handing over the parcel.' 
              : 'This consignment is fully prepaid. Do NOT collect any additional fees.'}
          </div>
        </div>

        <div className="l4-payment-right">
          <div className="l4-collect-label">COLLECTABLE CASH AMOUNT</div>
          <div className="l4-collect-price">৳ {Number(order.total || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Itemized Contents */}
      <div className="l4-items-box">
        <div className="l4-items-header">
          <span>PARCEL MANIFEST & ITEMS</span>
          <span>TOTAL {totalItemCount} PCS</span>
        </div>
        <div className="l4-items-list">
          {order.items && order.items.length > 0 ? (
            order.items.map((it: any, idx: number) => (
              <div key={idx} className="l4-item-line">
                <span>• {it.product?.name || it.name || 'StoreForge Product'} {it.variantName ? `(${it.variantName})` : ''}</span>
                <strong>Qty: {it.quantity || 1}</strong>
              </div>
            ))
          ) : (
            <div className="l4-item-line">
              <span>• StoreForge Product</span>
              <strong>Qty: 1</strong>
            </div>
          )}
        </div>
      </div>

      {/* Fragile & Safety Warning */}
      <div className="l4-fragile-box">
        <div className="l4-fragile-text">&#9650; FRAGILE &mdash; HANDLE WITH CARE &mdash; সাবধানে বহন করুন &#9650;</div>
        <div className="l4-fragile-sub">PREMIUM QUALITY CRAFT &bull; DO NOT CRUSH OR BEND &bull; KEEP DRY &bull; REPLACEMENT GUARANTEED</div>
      </div>

      {/* Barcode & Support Footer */}
      <div className="l4-footer">
        <div className="l4-barcode-col">
          {generateCode128SVG(barcodeFormattedNumber, 40)}
          <div className="l4-barcode-text">{barcodeFormattedNumber}</div>
        </div>

        <div className="l4-support-col">
          <div className="l4-sup-tag">LOGISTICS HELPLINE</div>
          <div className="l4-sup-phone">{settings.contact_phone || '+880 1700-000000'}</div>
          <div className="l4-sup-email">{settings.contact_email || 'support@storeforge.io'}</div>
        </div>
      </div>
    </div>
  );
});

export default Sticker4x6Template;
