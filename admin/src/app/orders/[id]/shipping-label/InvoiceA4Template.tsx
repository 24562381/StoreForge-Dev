'use client';

import React from 'react';
import { generateCode128SVG } from './BarcodeSvg';

interface InvoiceA4TemplateProps {
  order: any;
  settings: Record<string, string>;
  headerBrandTitle: string;
  companyBinNo: string;
  signatureLabel: string;
  footerTerms: string;
  orderDate: string;
  isDhaka: boolean;
  isCod: boolean;
  totalItemCount: number;
  barcodeFormattedNumber: string;
}

export const InvoiceA4Template = React.memo(function InvoiceA4Template({
  order,
  settings,
  headerBrandTitle,
  companyBinNo,
  signatureLabel,
  footerTerms,
  orderDate,
  isDhaka,
  isCod,
  totalItemCount,
  barcodeFormattedNumber,
}: InvoiceA4TemplateProps) {
  return (
    <div className="invoice-a4-card">
      {/* Header */}
      <div className="a4-header">
        <div className="a4-brand-col">
          {settings.store_logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.store_logo_url} alt="Logo" loading="lazy" className="a4-logo" />
          )}
          <h1 className="a4-brand-title">{headerBrandTitle}</h1>
          <div className="a4-bin">{companyBinNo}</div>
          <div className="a4-address">{settings.contact_address || 'Dhaka, Bangladesh'}</div>
          <div className="a4-contact">
            Tel: {settings.contact_phone || '+880 1700-000000'} | Email: {settings.contact_email || 'support@storeforge.io'}
          </div>
        </div>

        <div className="a4-meta-col">
          <div className="a4-invoice-badge">TAX INVOICE / BILL</div>
          <div className="a4-meta-table">
            <div className="a4-meta-row">
              <span className="a4-meta-label">Invoice / Order #:</span>
              <span className="a4-meta-val font-mono font-bold">{order.orderNumber}</span>
            </div>
            <div className="a4-meta-row">
              <span className="a4-meta-label">Order Date:</span>
              <span className="a4-meta-val">{orderDate}</span>
            </div>
            <div className="a4-meta-row">
              <span className="a4-meta-label">Payment Status:</span>
              <span className={`a4-status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}`}>
                {(order.paymentStatus || 'pending').toUpperCase()}
              </span>
            </div>
            <div className="a4-meta-row">
              <span className="a4-meta-label">Payment Method:</span>
              <span className="a4-meta-val font-bold">
                {order.paymentMethod === 'bkash' ? 'bKash Online' : (order.paymentMethod || 'COD').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Logistics Details Grid */}
      <div className="a4-details-grid">
        <div className="a4-box">
          <div className="a4-box-title">CUSTOMER BILLING & SHIPPING DETAILS / প্রাপক</div>
          <div className="a4-cust-name">{order.customerName}</div>
          <div className="a4-cust-line"><strong>Phone / মোবাইল:</strong> {order.phone}</div>
          {order.email && <div className="a4-cust-line"><strong>Email:</strong> {order.email}</div>}
          <div className="a4-cust-line">
            <strong>Address / ঠিকানা:</strong> {order.address}{order.areaThana ? `, ${order.areaThana}` : ''}{order.district && !['inside_dhaka', 'outside_dhaka'].includes(order.district.toLowerCase()) ? `, ${order.district}` : ''}
          </div>
          {order.deliveryNote && (
            <div className="a4-cust-note">
              <strong>Special Delivery Instructions:</strong> {order.deliveryNote}
            </div>
          )}
        </div>

        <div className="a4-box a4-routing-box">
          <div className="a4-box-title">LOGISTICS & DISPATCH SUMMARY</div>
          <div className="a4-routing-row">
            <span>Delivery Zone:</span>
            <strong>{isDhaka ? 'INSIDE DHAKA' : 'OUTSIDE DHAKA'}</strong>
          </div>
          <div className="a4-routing-row">
            <span>Courier Service:</span>
            <strong>Express Home Delivery</strong>
          </div>
          <div className="a4-routing-row">
            <span>Total Items:</span>
            <strong>{totalItemCount} Unit(s)</strong>
          </div>
          <div className="a4-barcode-container">
            {generateCode128SVG(barcodeFormattedNumber, 36)}
            <div className="a4-barcode-text">{barcodeFormattedNumber}</div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <table className="a4-table">
        <thead>
          <tr>
            <th style={{ width: '45px' }} className="text-center">#</th>
            <th>Product Description & Variations</th>
            <th style={{ width: '80px' }} className="text-center">Qty</th>
            <th style={{ width: '130px' }} className="text-right">Unit Price</th>
            <th style={{ width: '140px' }} className="text-right">Total (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {order.items && order.items.length > 0 ? (
            order.items.map((it: any, idx: number) => {
              const unitPrice = Number(it.price || it.unitPrice || 0);
              const qty = Number(it.quantity || 1);
              const lineTotal = unitPrice * qty;
              return (
                <tr key={it.id || idx}>
                  <td className="text-center font-bold text-slate-500">{idx + 1}</td>
                  <td>
                    <div className="a4-item-title">
                      {it.product?.name || it.name || 'StoreForge Product'}
                    </div>
                    {(it.variantName || it.size || it.color) && (
                      <div className="a4-item-var">
                        {[
                          it.size ? `Size: ${it.size}` : '',
                          it.color ? `Color: ${it.color}` : '',
                          it.variantName && !it.size && !it.color ? it.variantName : ''
                        ].filter(Boolean).join(' | ')}
                      </div>
                    )}
                    {it.product?.sku && (
                      <div className="a4-item-sku">SKU: {it.product.sku}</div>
                    )}
                  </td>
                  <td className="text-center font-bold">{qty}</td>
                  <td className="text-right font-mono">৳ {unitPrice.toLocaleString()}</td>
                  <td className="text-right font-mono font-bold">৳ {lineTotal.toLocaleString()}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="text-center font-bold">1</td>
              <td>
                <div className="a4-item-title">StoreForge Product</div>
                <div className="a4-item-var">Standard Order Package</div>
              </td>
              <td className="text-center font-bold">1</td>
              <td className="text-right font-mono">৳ {Number(order.subtotal || order.total || 0).toLocaleString()}</td>
              <td className="text-right font-mono font-bold">৳ {Number(order.subtotal || order.total || 0).toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Calculations & Totals */}
      <div className="a4-summary-row">
        <div className="a4-payment-note">
          <div className="a4-note-head">
            {isCod ? '💵 CASH ON DELIVERY' : `💳 PAID ONLINE VIA ${(order.paymentMethod || 'BKASH').toUpperCase()}`}
          </div>
          <div className="a4-note-p">
            {isCod
              ? 'Please collect the exact total amount in cash upon delivery.'
              : 'This order is fully paid online. Do NOT collect any extra cash.'}
          </div>
        </div>

        <div className="a4-calc-box">
          <div className="a4-calc-line">
            <span>Subtotal Amount:</span>
            <span className="font-mono">৳ {Number(order.subtotal || (Number(order.total || 0) - Number(order.deliveryCharge || 0))).toLocaleString()}</span>
          </div>
          {Number(order.discount || 0) > 0 && (
            <div className="a4-calc-line discount-text">
              <span>Promo Discount {order.promoCode ? `(${order.promoCode})` : ''}:</span>
              <span className="font-mono font-bold">- ৳ {Number(order.discount).toLocaleString()}</span>
            </div>
          )}
          <div className="a4-calc-line">
            <span>Courier Delivery Charge:</span>
            <span className="font-mono">৳ {Number(order.deliveryCharge || 0).toLocaleString()}</span>
          </div>
          <div className="a4-calc-line a4-grand-total">
            <span>TOTAL PAYABLE:</span>
            <span className="font-mono">৳ {Number(order.total || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms & Authorized Signature */}
      <div className="a4-footer-section">
        <div className="a4-terms-box">
          <div className="a4-terms-title">🛡️ Customer Guarantee & Replacement Policy</div>
          <p className="a4-terms-desc">{footerTerms}</p>
        </div>

        <div className="a4-sig-box">
          <div className="a4-sig-line"></div>
          <div className="a4-sig-name">{signatureLabel}</div>
          <div className="a4-sig-company">{headerBrandTitle}</div>
        </div>
      </div>
    </div>
  );
});

export default InvoiceA4Template;
