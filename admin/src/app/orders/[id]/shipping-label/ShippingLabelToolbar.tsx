'use client';

import React from 'react';

export type LabelFormat = 'invoice-a4' | 'label-3x5' | 'label-4x6';

interface ShippingLabelToolbarProps {
  orderNumber: string;
  format: LabelFormat;
  setFormat: (f: LabelFormat) => void;
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  onPrint: () => void;
  onClose: () => void;
}

export const ShippingLabelToolbar = React.memo(function ShippingLabelToolbar({
  orderNumber,
  format,
  setFormat,
  zoomScale,
  setZoomScale,
  onPrint,
  onClose,
}: ShippingLabelToolbarProps) {
  return (
    <header className="screen-toolbar">
      {/* Left: Document Info & Live Format Pill */}
      <div className="toolbar-left">
        <div className="doc-icon-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </div>
        <div className="doc-meta-info">
          <div className="doc-title-row">
            <span className="doc-title">Print Studio</span>
            <span className="doc-order-tag">{orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`}</span>
          </div>
          <div className="doc-size-indicator">
            <span className="live-dot"></span>
            <span className="size-text">
              {format === 'invoice-a4' && 'A4 Full Page (210 × 297 mm)'}
              {format === 'label-3x5' && '3" × 5" Thermal Roll (76 × 127 mm)'}
              {format === 'label-4x6' && '4" × 6" Shipping Sticker (102 × 152 mm)'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Sleek Segmented Format Switcher */}
      <div className="toolbar-center">
        <div className="format-segmented-pill">
          <button
            type="button"
            className={`format-tab-btn ${format === 'invoice-a4' ? 'active' : ''}`}
            onClick={() => setFormat('invoice-a4')}
            title="Full Customer Tax Invoice & Packing Slip (A4 Sheet)"
          >
            <span className="tab-emoji">📄</span>
            <span className="tab-label">A4 Invoice</span>
          </button>

          <button
            type="button"
            className={`format-tab-btn ${format === 'label-3x5' ? 'active' : ''}`}
            onClick={() => setFormat('label-3x5')}
            title="Standard 3 inch by 5 inch Thermal Sticker (Steadfast, Pathao, Paperfly)"
          >
            <span className="tab-emoji">🏷️</span>
            <span className="tab-label">3&quot; &times; 5&quot; Thermal</span>
          </button>

          <button
            type="button"
            className={`format-tab-btn ${format === 'label-4x6' ? 'active' : ''}`}
            onClick={() => setFormat('label-4x6')}
            title="Standard 4 inch by 6 inch Logistics Label (Universal 100x150mm sticker)"
          >
            <span className="tab-emoji">📦</span>
            <span className="tab-label">4&quot; &times; 6&quot; Sticker</span>
          </button>
        </div>
      </div>

      {/* Right: Zoom Controls & Print Action Buttons */}
      <div className="toolbar-right">
        <div className="zoom-stepper">
          <button 
            type="button" 
            className="zoom-step-btn" 
            onClick={() => setZoomScale((prev) => Math.max(75, prev - 15))}
            title="Zoom Out Screen Preview"
          >
            &minus;
          </button>
          <span className="zoom-percentage">{zoomScale}%</span>
          <button 
            type="button" 
            className="zoom-step-btn" 
            onClick={() => setZoomScale((prev) => Math.min(150, prev + 15))}
            title="Zoom In Screen Preview"
          >
            +
          </button>
        </div>

        <button type="button" className="btn-print-action" onClick={onPrint}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print
        </button>

        <button type="button" className="btn-close-action" onClick={onClose} title="Close window">
          Close
        </button>
      </div>
    </header>
  );
});

export default ShippingLabelToolbar;
