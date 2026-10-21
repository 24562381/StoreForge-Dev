'use client';

import React from 'react';
import { LabelFormat } from './ShippingLabelToolbar';

export const ShippingStyles = React.memo(function ShippingStyles({ format }: { format: LabelFormat }) {
  return (
    <>
      {format === 'invoice-a4' && (
        <style>{`
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          @media print {
            html, body {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .doc-screen-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              min-height: 0 !important;
              display: block !important;
            }
            .doc-canvas {
              padding: 0 !important;
              margin: 0 !important;
              transform: none !important;
            }
            .invoice-a4-card {
              width: 210mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              padding: 16mm 18mm !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}</style>
      )}

      {format === 'label-3x5' && (
        <style>{`
          @page {
            size: 3in 5in;
            margin: 0 !important;
          }
          @media print {
            html, body {
              width: 3in !important;
              height: 5in !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .doc-screen-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              min-height: 0 !important;
              display: block !important;
            }
            .doc-canvas {
              padding: 0 !important;
              margin: 0 !important;
              transform: none !important;
            }
            .label-3x5-card {
              width: 3in !important;
              height: 5in !important;
              max-width: 3in !important;
              max-height: 5in !important;
              min-height: 5in !important;
              box-shadow: none !important;
              border: 2px solid #000000 !important;
              margin: 0 !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}</style>
      )}

      {format === 'label-4x6' && (
        <style>{`
          @page {
            size: 4in 6in;
            margin: 0 !important;
          }
          @media print {
            html, body {
              width: 4in !important;
              height: 6in !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .doc-screen-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              min-height: 0 !important;
              display: block !important;
            }
            .doc-canvas {
              padding: 0 !important;
              margin: 0 !important;
              transform: none !important;
            }
            .label-4x6-card {
              width: 4in !important;
              height: 6in !important;
              max-width: 4in !important;
              max-height: 6in !important;
              min-height: 6in !important;
              box-shadow: none !important;
              border: 2px solid #000000 !important;
              margin: 0 !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}</style>
      )}

      <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", sans-serif;
          color: #000000;
          background: #0F172A;
          line-height: 1.4;
          -webkit-font-smoothing: antialiased;
        }

        .doc-screen-wrapper {
          min-height: 100vh;
          background: #0F172A;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .screen-toolbar {
          width: 100%;
          max-width: 980px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 8px 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.5);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .doc-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(192, 138, 70, 0.22), rgba(192, 138, 70, 0.06));
          border: 1px solid rgba(192, 138, 70, 0.35);
          color: #FBBF24;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .doc-meta-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .doc-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .doc-title {
          font-size: 12.5px;
          font-weight: 800;
          color: #F8FAFC;
          letter-spacing: -0.01em;
        }

        .doc-order-tag {
          font-size: 11px;
          font-weight: 800;
          color: #CBD5E1;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 5px;
          border-radius: 4px;
        }

        .doc-size-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          color: #94A3B8;
          font-weight: 600;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
          display: inline-block;
        }

        .toolbar-center {
          display: flex;
          justify-content: center;
          flex: 1;
          min-width: 0;
        }

        .format-segmented-pill {
          display: flex;
          align-items: center;
          background: rgba(2, 6, 23, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px;
          border-radius: 11px;
          gap: 3px;
        }

        .format-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 11.5px;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }

        .format-tab-btn:hover {
          color: #F1F5F9;
          background: rgba(255, 255, 255, 0.06);
        }

        .format-tab-btn.active {
          background: linear-gradient(135deg, #dfa858, #b0752b);
          color: #FFFFFF;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(192, 138, 70, 0.4);
        }

        .tab-emoji {
          font-size: 12px;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .zoom-stepper {
          display: flex;
          align-items: center;
          background: rgba(2, 6, 23, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 2px 4px;
        }

        .zoom-step-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .zoom-step-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
        }

        .zoom-percentage {
          font-size: 10.5px;
          font-weight: 700;
          color: #CBD5E1;
          padding: 0 5px;
          min-width: 34px;
          text-align: center;
        }

        .btn-print-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6.5px 15px;
          background: linear-gradient(135deg, #dfa858, #b0752b);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 800;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(192, 138, 70, 0.4);
          transition: all 0.18s ease;
        }

        .btn-print-action:hover {
          background: linear-gradient(135deg, #e5b369, #a36924);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(192, 138, 70, 0.55);
        }

        .btn-close-action {
          padding: 6.5px 12px;
          background: rgba(51, 65, 85, 0.6);
          color: #E2E8F0;
          font-size: 12px;
          font-weight: 700;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .btn-close-action:hover {
          background: rgba(71, 85, 105, 0.9);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 768px) {
          .screen-toolbar {
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            padding: 10px;
          }
          .toolbar-left, .toolbar-center, .toolbar-right {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        .doc-canvas {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          transition: transform 0.2s ease;
        }

        .invoice-a4-card {
          width: 210mm;
          min-height: 297mm;
          max-width: 210mm;
          background: #FFFFFF;
          padding: 16mm 18mm;
          border-radius: 4px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          color: #0F172A;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .a4-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0F172A;
          padding-bottom: 18px;
          margin-bottom: 20px;
          gap: 20px;
        }

        .a4-brand-col { flex: 1; }

        .a4-logo {
          max-height: 52px;
          max-width: 220px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .a4-brand-title {
          font-size: 18pt;
          font-weight: 900;
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: #0F172A;
        }

        .a4-bin {
          font-size: 10pt;
          font-weight: 800;
          color: #C08A46;
          font-family: monospace;
          margin-top: 3px;
        }

        .a4-address, .a4-contact {
          font-size: 9.5pt;
          color: #475569;
          margin-top: 2px;
          line-height: 1.35;
        }

        .a4-meta-col {
          text-align: right;
          min-width: 260px;
        }

        .a4-invoice-badge {
          display: inline-block;
          background: #0F172A;
          color: #FFFFFF;
          padding: 5px 14px;
          font-size: 10.5pt;
          font-weight: 900;
          border-radius: 4px;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .a4-meta-table {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 9.5pt;
        }

        .a4-meta-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .a4-meta-label { color: #64748B; font-weight: 600; }
        .a4-meta-val { color: #0F172A; }

        .a4-status-badge {
          font-weight: 800;
          font-size: 8.5pt;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .status-paid { background: #DCFCE7; color: #15803D; }
        .status-pending { background: #FEF3C7; color: #B45309; }

        .a4-details-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 18px;
          margin-bottom: 22px;
        }

        .a4-box {
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          padding: 14px 16px;
          background: #F8FAFC;
          font-size: 9.5pt;
        }

        .a4-box-title {
          font-size: 8pt;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 1.5px solid #E2E8F0;
          padding-bottom: 4px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .a4-cust-name {
          font-size: 13pt;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 4px;
        }

        .a4-cust-line { margin-bottom: 3px; color: #1E293B; line-height: 1.35; }
        .a4-cust-note {
          background: #FEF3C7;
          border-left: 3px solid #D97706;
          padding: 5px 8px;
          font-size: 9pt;
          margin-top: 6px;
          color: #92400E;
          border-radius: 0 4px 4px 0;
        }

        .a4-routing-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 9.5pt;
          color: #334155;
        }

        .a4-barcode-container {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #94A3B8;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .a4-barcode-container .barcode-svg {
          height: 32px;
          width: auto;
          max-width: 180px;
        }

        .a4-barcode-text {
          font-family: "Courier New", Courier, monospace;
          font-size: 8.5pt;
          font-weight: bold;
          letter-spacing: 0.12em;
          margin-top: 2px;
        }

        .a4-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 22px;
          font-size: 9.5pt;
        }

        .a4-table th {
          background: #0F172A;
          color: #FFFFFF;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 9pt;
          text-transform: uppercase;
          text-align: left;
        }

        .a4-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #E2E8F0;
          vertical-align: middle;
        }

        .a4-table tbody tr:nth-child(even) {
          background: #F8FAFC;
        }

        .a4-item-title { font-size: 10.5pt; font-weight: 800; color: #0F172A; }
        .a4-item-var { font-size: 8.5pt; color: #64748B; margin-top: 2px; }
        .a4-item-sku { font-family: monospace; font-size: 8pt; color: #94A3B8; margin-top: 1px; }

        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }

        .a4-summary-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .a4-payment-note {
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          padding: 12px 14px;
          background: #F8FAFC;
        }

        .a4-note-head { font-size: 10pt; font-weight: 900; color: #0F172A; margin-bottom: 4px; }
        .a4-note-p { font-size: 9pt; color: #64748B; line-height: 1.4; }

        .a4-calc-box {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 9.5pt;
        }

        .a4-calc-line {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          color: #334155;
        }

        .discount-text { color: #059669; font-weight: 700; }

        .a4-grand-total {
          border-top: 2px solid #0F172A;
          padding-top: 8px;
          margin-top: 4px;
          font-size: 13.5pt;
          font-weight: 900;
          color: #0F172A;
        }

        .a4-footer-section {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 24px;
          border-top: 1.5px solid #CBD5E1;
          padding-top: 16px;
        }

        .a4-terms-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 14px;
        }

        .a4-terms-title { font-size: 9pt; font-weight: 800; color: #0F172A; margin-bottom: 3px; }
        .a4-terms-desc { font-size: 8.5pt; color: #64748B; line-height: 1.45; }

        .a4-sig-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          text-align: center;
          padding-top: 20px;
        }

        .a4-sig-line {
          width: 180px;
          border-top: 1.5px dashed #0F172A;
          margin-bottom: 6px;
        }

        .a4-sig-name { font-size: 9.5pt; font-weight: 800; color: #0F172A; }
        .a4-sig-company { font-size: 8.5pt; color: #64748B; text-transform: uppercase; }

        .label-3x5-card {
          width: 3in;
          height: 5in;
          min-height: 5in;
          max-height: 5in;
          background: #FFFFFF;
          border: 2px solid #000000;
          padding: 2.2mm 2.5mm;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
          color: #000000;
          box-sizing: border-box;
        }

        .l3-header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          border-bottom: 2px solid #000000;
          padding-bottom: 2px;
          gap: 4px;
        }

        .l3-brand-col { flex: 1; min-width: 0; }

        .l3-brand-name {
          font-size: 7.8pt;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .l3-bin {
          font-size: 5.5pt;
          font-weight: 800;
          color: #000000;
          font-family: monospace;
          margin-top: 1px;
        }

        .l3-hub, .l3-phone {
          font-size: 5.5pt;
          font-weight: 700;
          color: #222222;
          line-height: 1.15;
        }

        .l3-order-col {
          background: #000000;
          color: #FFFFFF;
          padding: 2.5px 5px;
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 1px;
          flex-shrink: 0;
        }

        .l3-order-tag {
          font-size: 5pt;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #E2E8F0;
        }

        .l3-order-num {
          font-size: 10.5pt;
          font-weight: 900;
          color: #FFFFFF !important;
          line-height: 1.1;
        }

        .l3-order-date {
          font-size: 5.5pt;
          font-weight: 700;
          color: #E2E8F0 !important;
        }

        .l3-routing-strip {
          background: #F1F5F9;
          border: 1px solid #000000;
          padding: 2px 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 6pt;
          font-weight: 700;
          margin-top: 2px;
        }

        .l3-route-item strong {
          font-size: 6.5pt;
          font-weight: 900;
        }

        .l3-recipient-box {
          border: 1.5px solid #000000;
          padding: 2.5px 4.5px;
          margin-top: 2px;
          background: #FFFFFF;
        }

        .l3-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 6pt;
          font-weight: 900;
          text-transform: uppercase;
          border-bottom: 1px solid #DDDDDD;
          padding-bottom: 1px;
          margin-bottom: 2px;
        }

        .l3-city-badge {
          background: #000000;
          color: #FFFFFF;
          padding: 0.5px 3px;
          font-size: 5.5pt;
          font-weight: 900;
        }

        .l3-cust-name {
          font-size: 9.5pt;
          font-weight: 900;
          color: #000000;
          line-height: 1.15;
          text-transform: capitalize;
        }

        .l3-phone-row {
          display: inline-flex;
          align-items: baseline;
          gap: 5px;
          border-bottom: 1px solid #000000;
          padding-bottom: 1px;
          margin: 1px 0 2px;
        }

        .l3-phone-label {
          font-size: 6pt;
          font-weight: 800;
          color: #333333;
        }

        .l3-phone-number {
          font-size: 10.5pt;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.02em;
        }

        .l3-address-text {
          font-size: 7.2pt;
          font-weight: 700;
          color: #000000;
          line-height: 1.25;
          word-break: break-word;
        }

        .l3-note-text {
          font-size: 6pt;
          font-weight: 700;
          color: #111111;
          font-style: italic;
          background: #F8FAFC;
          padding: 1px 4px;
          border-left: 2px solid #000000;
          margin-top: 1.5px;
        }

        .l3-payment-box {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          border: 2px solid #000000;
          margin-top: 2px;
          background: #F8FAFC;
        }

        .l3-pay-left {
          padding: 3px 5px;
          flex: 1;
        }

        .l3-pay-badge {
          font-size: 7pt;
          font-weight: 900;
          color: #000000;
        }

        .l3-pay-sub {
          font-size: 5.5pt;
          font-weight: 700;
          color: #333333;
        }

        .l3-pay-right {
          background: #000000;
          color: #FFFFFF;
          padding: 3px 6px;
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-shrink: 0;
        }

        .l3-amount-tag {
          font-size: 5pt;
          font-weight: 800;
          color: #CBD5E1;
        }

        .l3-amount-val {
          font-size: 11pt;
          font-weight: 900;
          color: #FFFFFF !important;
          line-height: 1.1;
        }

        .l3-parcel-box {
          border: 1px dashed #000000;
          padding: 2px 4px;
          margin-top: 2px;
          font-size: 6pt;
        }

        .l3-parcel-title {
          display: flex;
          justify-content: space-between;
          font-weight: 900;
          font-size: 5.5pt;
          margin-bottom: 1px;
        }

        .l3-parcel-desc {
          font-size: 6.2pt;
          font-weight: 700;
          line-height: 1.2;
        }

        .l3-fragile-strip {
          background: #000000;
          color: #FFFFFF;
          text-align: center;
          padding: 2px 3px;
          margin-top: 2px;
        }

        .l3-fragile-main {
          font-size: 7.2pt;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .l3-fragile-sub {
          font-size: 4.8pt;
          font-weight: 700;
          color: #CBD5E1;
        }

        .l3-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1.5px solid #000000;
          padding-top: 2px;
          margin-top: 2px;
          gap: 6px;
        }

        .l3-barcode-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .l3-barcode-col .barcode-svg {
          height: 28px;
          width: auto;
          max-width: 130px;
        }

        .l3-barcode-text {
          font-family: monospace;
          font-size: 6pt;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin-top: 1px;
        }

        .l3-support-col {
          text-align: right;
          font-size: 5.5pt;
          font-weight: 700;
          flex-shrink: 0;
        }

        .l3-sup-title { font-size: 5pt; font-weight: 800; color: #444444; }
        .l3-sup-num { font-size: 6.5pt; font-weight: 900; color: #000000; }
        .l3-sup-url { font-size: 5pt; color: #555555; }

        .label-4x6-card {
          width: 4in;
          height: 6in;
          min-height: 6in;
          max-height: 6in;
          background: #FFFFFF;
          border: 2px solid #000000;
          padding: 4mm 5mm;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
          color: #000000;
          box-sizing: border-box;
        }

        .l4-header {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          border-bottom: 2px solid #000000;
          padding-bottom: 4px;
          gap: 8px;
        }

        .l4-brand-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .l4-logo {
          max-height: 38px;
          max-width: 90px;
          object-fit: contain;
        }

        .l4-brand-title {
          font-size: 10pt;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
        }

        .l4-bin {
          font-size: 6.5pt;
          font-weight: 800;
          color: #000000;
          font-family: monospace;
        }

        .l4-contact {
          font-size: 6.5pt;
          font-weight: 700;
          color: #333333;
        }

        .l4-order-badge {
          background: #000000;
          color: #FFFFFF;
          padding: 3px 8px;
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .l4-badge-tag {
          font-size: 6pt;
          font-weight: 800;
          color: #E2E8F0;
        }

        .l4-badge-num {
          font-size: 12pt;
          font-weight: 900;
          color: #FFFFFF !important;
          line-height: 1.1;
        }

        .l4-badge-date {
          font-size: 6.5pt;
          font-weight: 700;
          color: #CBD5E1;
        }

        .l4-dispatch-strip {
          background: #F1F5F9;
          border: 1px solid #000000;
          padding: 3px 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7pt;
          margin-top: 3px;
        }

        .l4-dispatch-col {
          display: flex;
          flex-direction: column;
        }

        .l4-dispatch-col .l4-label {
          font-size: 5.5pt;
          font-weight: 800;
          color: #475569;
        }

        .l4-dispatch-col .l4-val {
          font-size: 7pt;
          font-weight: 900;
          color: #000000;
        }

        .l4-recipient-section {
          border: 1.5px solid #000000;
          padding: 4px 6px;
          margin-top: 3px;
          background: #FFFFFF;
        }

        .l4-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7pt;
          font-weight: 900;
          border-bottom: 1px solid #CCCCCC;
          padding-bottom: 2px;
          margin-bottom: 3px;
        }

        .l4-tag-zone {
          background: #000000;
          color: #FFFFFF;
          padding: 1px 4px;
          font-size: 6pt;
          font-weight: 900;
        }

        .l4-cust-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .l4-name {
          font-size: 11pt;
          font-weight: 900;
          color: #000000;
          text-transform: capitalize;
        }

        .l4-phone-highlight {
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
          border-bottom: 1.5px solid #000000;
        }

        .l4-phone-tag { font-size: 6.5pt; font-weight: 800; color: #333333; }
        .l4-phone-text { font-size: 11pt; font-weight: 900; color: #000000; }

        .l4-address {
          font-size: 8.5pt;
          font-weight: 700;
          color: #000000;
          line-height: 1.3;
        }

        .l4-note {
          font-size: 7pt;
          font-weight: 700;
          color: #000000;
          font-style: italic;
          background: #F8FAFC;
          padding: 2px 6px;
          border-left: 2px solid #000000;
          margin-top: 2px;
        }

        .l4-payment-section {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          border: 2px solid #000000;
          margin-top: 3px;
          background: #F8FAFC;
        }

        .l4-payment-left {
          padding: 4px 6px;
          flex: 1;
        }

        .l4-pay-status-pill {
          font-size: 8pt;
          font-weight: 900;
          color: #000000;
        }

        .l4-pay-instructions {
          font-size: 6.5pt;
          font-weight: 700;
          color: #333333;
          margin-top: 1px;
        }

        .l4-payment-right {
          background: #000000;
          color: #FFFFFF;
          padding: 4px 8px;
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-shrink: 0;
        }

        .l4-collect-label {
          font-size: 5.5pt;
          font-weight: 800;
          color: #CBD5E1;
        }

        .l4-collect-price {
          font-size: 13pt;
          font-weight: 900;
          color: #FFFFFF !important;
          line-height: 1.1;
        }

        .l4-items-box {
          border: 1px dashed #000000;
          padding: 3px 6px;
          margin-top: 3px;
          font-size: 7pt;
        }

        .l4-items-header {
          display: flex;
          justify-content: space-between;
          font-weight: 900;
          font-size: 6.5pt;
          margin-bottom: 2px;
          border-bottom: 1px dotted #AAAAAA;
          padding-bottom: 1px;
        }

        .l4-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5px;
        }

        .l4-item-line {
          display: flex;
          justify-content: space-between;
          font-size: 7pt;
          font-weight: 700;
        }

        .l4-fragile-box {
          background: #000000;
          color: #FFFFFF;
          text-align: center;
          padding: 2.5px 4px;
          margin-top: 3px;
        }

        .l4-fragile-text {
          font-size: 8.5pt;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .l4-fragile-sub {
          font-size: 5.5pt;
          font-weight: 700;
          color: #CBD5E1;
        }

        .l4-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #000000;
          padding-top: 3px;
          margin-top: 3px;
          gap: 8px;
        }

        .l4-barcode-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .l4-barcode-col .barcode-svg {
          height: 34px;
          width: auto;
          max-width: 170px;
        }

        .l4-barcode-text {
          font-family: monospace;
          font-size: 7pt;
          font-weight: 900;
          letter-spacing: 0.1em;
          margin-top: 1px;
        }

        .l4-support-col {
          text-align: right;
          font-size: 6.5pt;
          font-weight: 700;
          flex-shrink: 0;
        }

        .l4-sup-tag { font-size: 5.5pt; font-weight: 800; color: #444444; }
        .l4-sup-phone { font-size: 7.5pt; font-weight: 900; color: #000000; }
        .l4-sup-email { font-size: 5.5pt; color: #555555; }
      `}</style>
    </>
  );
});

export default ShippingStyles;
