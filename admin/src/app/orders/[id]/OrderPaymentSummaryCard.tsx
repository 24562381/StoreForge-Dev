'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

interface OrderPaymentSummaryCardProps {
  order: any;
}

export const OrderPaymentSummaryCard = React.memo(function OrderPaymentSummaryCard({ order }: OrderPaymentSummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-[#c08a46]" /> Payment & Totals
      </h2>

      <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Method</span>
          <span className="font-bold uppercase text-slate-900">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Status</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
        {order.trxId && (
          <div className="flex justify-between">
            <span className="text-slate-500">bKash TRX ID</span>
            <span className="font-mono text-emerald-600 font-bold">{order.trxId}</span>
          </div>
        )}
      </div>

      <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span>৳{Number(order.subtotal).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Delivery Fee</span>
          <span>৳{Number(order.deliveryCharge || order.deliveryFee || 0).toLocaleString()}</span>
        </div>
        {(Number(order.discountAmount || order.discount || 0) > 0 || order.promoCode) && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Promo Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
            <span>-৳{Number(order.discountAmount || order.discount || 0).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-base font-black">
        <span className="text-slate-900">Amount to Collect</span>
        <span className="text-[#c08a46] text-xl">৳{Number(order.total).toLocaleString()}</span>
      </div>
    </div>
  );
});

export default OrderPaymentSummaryCard;
