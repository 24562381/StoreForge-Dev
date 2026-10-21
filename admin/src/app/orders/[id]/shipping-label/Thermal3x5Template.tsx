'use client';

import React from 'react';
import { generateCode128SVG } from './BarcodeSvg';

interface Thermal3x5TemplateProps {
  order: any;
  settings: Record<string, string>;
  headerBrandTitle: string;
  companyBinNo: string;
  orderDate: string;
  isDhaka: boolean;
  isCod: boolean;
  totalItemCount: number;
  parcelDescription: string;
  barcodeFormattedNumber: string;
}

export const Thermal3x5Template = React.memo(function Thermal3x5Template({
  order,
  settings,
  headerBrandTitle,
  companyBinNo,
  orderDate,
  isDhaka,
  isCod,
  totalItemCount,
  parcelDescription,
  barcodeFormattedNumber,
}: Thermal3x5TemplateProps) {
  return (
    <div className="label-3x5-card">
      {/* Header Docket */}
      <div className="l3-header">
        <div className="l3-brand-col">
          <div className="l3-brand-name">{headerBrandTitle}</div>
          <div className="l3-bin">{companyBinNo}</div>
          <div className="l3-hub">Hub: {settings.contact_address || 'Dhaka, Bangladesh'}</div>
          <div className="l3-phone">Hotline: {settings.contact_phone || '+880 1700-000000'}</div>
        </div>

        <div className="l3-order-col">
          <div className="l3-order-tag">ORDER NO</div>
          <div className="l3-order-num">{order.orderNumber}</div>
          <div className="l3-order-date">{orderDate}</div>
        </div>
      </div>

      {/* Logistics Routing Strip */}
      <div className="l3-routing-strip">
        <div className="l3-route-item">
          ZONE: <strong>{isDhaka ? 'INSIDE DHAKA' : 'OUTSIDE DHAKA'}</strong>
        </div>
        <div className="l3-route-item">
          SERVICE: <strong>EXPRESS HOME DELIVERY</strong>
        </div>
      </div>

      {/* Recipient / Deliver To Block */}
      <div className="l3-recipient-box">
        <div className="l3-section-title">
          <span>DELIVER TO / প্রাপক</span>
          <span className="l3-city-badge">{isDhaka ? 'DHAKA CITY' : 'OUTSIDE DHAKA'}</span>
        </div>

        <div className="l3-cust-name">{order.customerName}</div>
        
        <div className="l3-phone-row">
          <span className="l3-phone-label">PHONE / মোবাইল:</span>
          <span className="l3-phone-number">{order.phone}</span>
        </div>

        <div className="l3-address-text">
          <strong>Address:</strong> {order.address}{order.areaThana ? `, ${order.areaThana}` : ''}{order.district && !['inside_dhaka', 'outside_dhaka'].includes(order.district.toLowerCase()) ? `, ${order.district}` : ''}
        </div>

        {order.deliveryNote && (
          <div className="l3-note-text">
            <strong>Note:</strong> {order.deliveryNote}
          </div>
        )}
      </div>

      {/* Payment / COD Collection Box */}
      <div className="l3-payment-box">
        <div className="l3-pay-left">
          <div className="l3-pay-badge">
            {isCod ? 'CASH ON DELIVERY (COD)' : `PREPAID ORDER (${(order.paymentMethod || 'ONLINE').toUpperCase()})`}
          </div>
          <div className="l3-pay-sub">
            {isCod ? 'Collect Cash at Doorstep' : 'Do NOT Collect Cash (Already Paid)'}
          </div>
        </div>

        <div className="l3-pay-right">
          <div className="l3-amount-tag">AMOUNT TO COLLECT</div>
          <div className="l3-amount-val">৳ {Number(order.total || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Parcel Contents */}
      <div className="l3-parcel-box">
        <div className="l3-parcel-title">
          <span>PARCEL CONTENTS ({totalItemCount} PCS)</span>
          <span>FRAGILE ITEM</span>
        </div>
        <div className="l3-parcel-desc">
          {parcelDescription}
        </div>
      </div>

      {/* Fragile Banner */}
      <div className="l3-fragile-strip">
        <div className="l3-fragile-main">&#9650; FRAGILE &mdash; HANDLE WITH CARE &#9650;</div>
        <div className="l3-fragile-sub">ভঙ্গুর পণ্য &bull; সাবধানে বহন করুন &bull; KEEP DRY &bull; DO NOT BEND</div>
      </div>

      {/* Barcode Footer */}
      <div className="l3-footer">
        <div className="l3-barcode-col">
          {generateCode128SVG(barcodeFormattedNumber, 32)}
          <div className="l3-barcode-text">{barcodeFormattedNumber}</div>
        </div>

        <div className="l3-support-col">
          <div className="l3-sup-title">HELPLINE SUPPORT</div>
          <div className="l3-sup-num">{settings.contact_phone || '+880 1700-000000'}</div>
          <div className="l3-sup-url">{settings.store_name_en || settings.store_name || 'StoreForge'}</div>
        </div>
      </div>
    </div>
  );
});

export default Thermal3x5Template;
