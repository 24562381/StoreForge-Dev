'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface InvoicePrintSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const InvoicePrintSection = React.memo(function InvoicePrintSection({ settings, handleChange }: InvoicePrintSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
        <Printer className="w-5 h-5 text-amber-700" />
        <span className="text-base">Customer Invoice, Barcode & Packing Slip Configuration</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Invoice Header Brand Title</label>
          <input
            type="text"
            value={settings.invoice_header_title !== undefined ? settings.invoice_header_title : (settings.store_name_en || settings.store_name || 'STOREFORGE')}
            onChange={(e) => handleChange('invoice_header_title', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-amber-700"
            placeholder={settings.store_name_en || settings.store_name || 'STOREFORGE'}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Company BIN / Trade License No</label>
          <input
            type="text"
            value={settings.invoice_bin_no || 'BIN: 004829103-0101'}
            onChange={(e) => handleChange('invoice_bin_no', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-amber-700"
            placeholder="BIN: 004829103-0101"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Invoice Signature Label</label>
          <input
            type="text"
            value={settings.invoice_sign_label || 'Authorized Store Signature'}
            onChange={(e) => handleChange('invoice_sign_label', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-amber-700"
            placeholder="Authorized Store Signature"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Code128 Barcode Prefix</label>
          <input
            type="text"
            value={settings.barcode_prefix || 'SF'}
            onChange={(e) => handleChange('barcode_prefix', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:border-amber-700"
            placeholder="SF"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Invoice Footer Terms & Instant Replacement Guarantee Note
          </label>
          <textarea
            rows={3}
            value={
              settings.invoice_footer_note ||
              'Thank you for your purchase! 100% replacement guarantee if damaged during courier transit. For customer care support, call +880 1700-000000 or WhatsApp.'
            }
            onChange={(e) => handleChange('invoice_footer_note', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-amber-700"
          />
        </div>
      </div>
    </div>
  );
});

export default InvoicePrintSection;
