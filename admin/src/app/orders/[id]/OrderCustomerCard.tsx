'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, Phone, MessageSquare, Key, Copy, Check } from 'lucide-react';

interface OrderCustomerCardProps {
  order: any;
  cleanPhone: string;
}

export const OrderCustomerCard = React.memo(function OrderCustomerCard({ order, cleanPhone }: OrderCustomerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySecret = useCallback(() => {
    if (!order?.accessToken) return;
    try {
      navigator.clipboard.writeText(order.accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [order?.accessToken]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#c08a46]" /> Customer & Delivery Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-slate-500 uppercase font-bold text-[10px] block">Customer Contact</span>
          <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
          <div className="flex items-center gap-2 pt-2">
            <a
              href={`tel:${order.phone}`}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{order.phone}</span>
            </a>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm transition-colors"
                title="Open WhatsApp Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-slate-500 uppercase font-bold text-[10px] block">Delivery Location</span>
          <div className="text-slate-900 font-medium leading-relaxed">{order.address}</div>
          <div className="text-slate-600 font-bold">District: {order.district}</div>
        </div>
      </div>

      {order.accessToken && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              Customer Tracking Secret Code:
            </span>
            <code className="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-slate-200 tracking-wider text-xs select-all">
              {order.accessToken}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopySecret}
            className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      )}

      {order.notes && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
          <span className="text-amber-800 uppercase font-bold text-[10px] block mb-0.5">Customer Note</span>
          <p className="text-amber-900 italic">"{order.notes}"</p>
        </div>
      )}
    </div>
  );
});

export default OrderCustomerCard;
