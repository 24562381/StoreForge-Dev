'use client';

import React from 'react';
import NextLink from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAdminPrefix } from '@/lib/useAdminPrefix';

interface DashboardRecentOrdersProps {
  orders: any[];
}

export const DashboardRecentOrders = React.memo(function DashboardRecentOrders({ orders }: DashboardRecentOrdersProps) {
  const prefix = useAdminPrefix();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Store Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">Latest customer inquiries and orders placed</p>
        </div>
        <NextLink
          href={`${prefix}/orders`}
          className="text-xs text-[#c08a46] hover:text-[#8e5a35] flex items-center gap-1 font-bold"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NextLink>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
            <tr>
              <th className="p-4 whitespace-nowrap">Order #</th>
              <th className="p-4 whitespace-nowrap min-w-[130px]">Customer</th>
              <th className="p-4 whitespace-nowrap">Contact</th>
              <th className="p-4 whitespace-nowrap">District</th>
              <th className="p-4 whitespace-nowrap">Total</th>
              <th className="p-4 whitespace-nowrap">Payment</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 text-right whitespace-nowrap min-w-[80px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders?.map((ord: any) => (
              <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono font-bold text-[#c08a46] whitespace-nowrap">
                  <NextLink href={`${prefix}/orders/${ord.id}`} className="hover:underline">
                    {ord.orderNumber}
                  </NextLink>
                </td>
                <td className="p-4 font-semibold text-slate-900 min-w-[130px]">{ord.customerName}</td>
                <td className="p-4 font-mono text-slate-500 whitespace-nowrap">{ord.phone}</td>
                <td className="p-4 text-slate-600 whitespace-nowrap">{ord.district}</td>
                <td className="p-4 font-bold text-slate-900 whitespace-nowrap">৳{Number(ord.total).toLocaleString()}</td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center ${
                    ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {ord.paymentMethod} ({ord.paymentStatus})
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap inline-flex items-center">
                    {ord.status}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <NextLink
                    href={`${prefix}/orders/${ord.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-700 font-bold transition-colors inline-block whitespace-nowrap"
                    title="View Details"
                  >
                    View
                  </NextLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
