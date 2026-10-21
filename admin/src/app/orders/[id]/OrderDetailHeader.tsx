'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, RotateCcw, ExternalLink, Key, Copy, Check } from 'lucide-react';
import { useStoreUrl } from '@/lib/storeUrl';

interface OrderDetailHeaderProps {
  order: any;
  prefix: string;
  currentStatusObj: { key: string; label: string; color: string };
  openShippingLabelPopup: () => void;
  handleSwitchToCod: () => void;
}

export const OrderDetailHeader = React.memo(function OrderDetailHeader({
  order,
  prefix,
  currentStatusObj,
  openShippingLabelPopup,
  handleSwitchToCod,
}: OrderDetailHeaderProps) {
  const storeUrl = useStoreUrl();
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
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <Link
          href={`${prefix}/orders`}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              Order <span className="text-[#c08a46] font-mono font-black">{order.orderNumber}</span>
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentStatusObj.color}`}>
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1.5 flex-wrap">
            <span>
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>

            {order.accessToken && (
              <>
                <span className="text-slate-300">•</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-950 font-medium shadow-xs max-w-full overflow-hidden flex-wrap">
                  <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-600 font-semibold text-[11px]">Tracking Secret:</span>
                  <code className="font-mono font-black text-amber-900 bg-white/90 px-1.5 py-0.5 rounded border border-amber-200 text-xs tracking-wider select-all">
                    {order.accessToken}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 hover:bg-amber-100 rounded text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
                    title={copied ? 'Copied to clipboard!' : 'Copy tracking secret code'}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full lg:w-auto">
        <button
          type="button"
          onClick={openShippingLabelPopup}
          className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Shipping Label</span>
        </button>

        {order.paymentMethod === 'bkash' && order.paymentStatus !== 'paid' && (
          <button
            onClick={handleSwitchToCod}
            className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Switch to COD</span>
          </button>
        )}

        <a
          href={`${(storeUrl || '').replace(/\/+$/, '')}/track?orderNumber=${order.orderNumber}&token=${order.accessToken}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Customer Track</span>
        </a>
      </div>
    </div>
  );
});

export default OrderDetailHeader;
