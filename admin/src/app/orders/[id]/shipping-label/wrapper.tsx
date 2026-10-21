'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

import ShippingLabelToolbar, { LabelFormat } from './ShippingLabelToolbar';
import InvoiceA4Template from './InvoiceA4Template';
import Thermal3x5Template from './Thermal3x5Template';
import Sticker4x6Template from './Sticker4x6Template';
import ShippingStyles from './ShippingStyles';

export default function Wrapper() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<LabelFormat>('invoice-a4');
  const [zoomScale, setZoomScale] = useState<number>(100);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      fetchApi(`/orders/${orderId}`),
      fetchApi('/settings/public'),
    ])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData || {});
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [orderId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }, []);

  const orderDate = useMemo(() => {
    if (!order?.createdAt) return '';
    return new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [order?.createdAt]);

  const isDhaka = useMemo(() => {
    if (!order) return false;
    return (
      order.district === 'inside_dhaka' || 
      (order.district && order.district.toLowerCase().includes('dhaka')) || 
      (order.address && order.address.toLowerCase().includes('dhaka'))
    );
  }, [order]);

  const isCod = useMemo(() => {
    return !order?.paymentMethod || order.paymentMethod === 'cod';
  }, [order?.paymentMethod]);

  const totalItemCount = useMemo(() => {
    if (!order?.items) return 1;
    return order.items.reduce(
      (sum: number, it: any) => sum + (Number(it.quantity) || 1),
      0
    ) || 1;
  }, [order?.items]);

  const barcodePrefix = settings.barcode_prefix || 'SF';
  const headerBrandTitle = settings.invoice_header_title || settings.store_name_en || settings.store_name || 'STOREFORGE';
  const companyBinNo = settings.invoice_bin_no || 'BIN: 004829103-0101';
  const signatureLabel = settings.invoice_sign_label || 'Authorized Store Signature';
  const footerTerms = settings.invoice_footer_note || 'Thank you for your purchase! 100% replacement guarantee if damaged during courier transit. For customer care support, call +880 1700-000000 or WhatsApp.';

  const barcodeFormattedNumber = useMemo(() => {
    if (!order?.orderNumber) return barcodePrefix + '000101';
    const rawNum = String(order.orderNumber).replace(/#/g, '').trim();
    if (rawNum.toUpperCase().startsWith(barcodePrefix.toUpperCase())) {
      return rawNum.toUpperCase();
    }
    return `${barcodePrefix}-${rawNum}`;
  }, [order?.orderNumber, barcodePrefix]);

  const parcelDescription = useMemo(() => {
    if (!order?.items || order.items.length === 0) {
      return '3D Wooden World Map Set (1 pc)';
    }
    if (order.items.length > 1) {
      return `Wooden Wall Art & Decor Set (${totalItemCount} pcs / ${order.items.length} items)`;
    }
    const item = order.items[0];
    const name = item.product?.name || item.name || '3D Wooden World Map';
    const variant = item.variantName || item.size || item.color ? ` (${[item.size, item.color, item.variantName].filter(Boolean).join(', ')})` : '';
    return `${name}${variant} × ${item.quantity || 1}`;
  }, [order?.items, totalItemCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold">Generating High-Precision Printable Document...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="text-4xl mb-2">📦</div>
        <h2 className="text-lg font-bold mb-1">Order Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">Could not load document data for this order ID.</p>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="doc-screen-wrapper">
      <ShippingStyles format={format} />

      <ShippingLabelToolbar
        orderNumber={order.orderNumber}
        format={format}
        setFormat={setFormat}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        onPrint={handlePrint}
        onClose={handleClose}
      />

      <main
        className="doc-canvas"
        style={{
          transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {format === 'invoice-a4' && (
          <InvoiceA4Template
            order={order}
            settings={settings}
            headerBrandTitle={headerBrandTitle}
            companyBinNo={companyBinNo}
            signatureLabel={signatureLabel}
            footerTerms={footerTerms}
            orderDate={orderDate}
            isDhaka={isDhaka}
            isCod={isCod}
            totalItemCount={totalItemCount}
            barcodeFormattedNumber={barcodeFormattedNumber}
          />
        )}

        {format === 'label-3x5' && (
          <Thermal3x5Template
            order={order}
            settings={settings}
            headerBrandTitle={headerBrandTitle}
            companyBinNo={companyBinNo}
            orderDate={orderDate}
            isDhaka={isDhaka}
            isCod={isCod}
            totalItemCount={totalItemCount}
            parcelDescription={parcelDescription}
            barcodeFormattedNumber={barcodeFormattedNumber}
          />
        )}

        {format === 'label-4x6' && (
          <Sticker4x6Template
            order={order}
            settings={settings}
            headerBrandTitle={headerBrandTitle}
            companyBinNo={companyBinNo}
            orderDate={orderDate}
            isDhaka={isDhaka}
            isCod={isCod}
            totalItemCount={totalItemCount}
            barcodeFormattedNumber={barcodeFormattedNumber}
          />
        )}
      </main>
    </div>
  );
}
