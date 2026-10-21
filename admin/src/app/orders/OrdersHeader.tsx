'use client';

import React from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle2, RotateCcw, FileSpreadsheet } from 'lucide-react';

interface OrdersHeaderProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    paidOrders: number;
  };
  onRefresh: () => void;
  onOpenExportModal?: () => void;
}

export const OrdersHeader = React.memo(function OrdersHeader({
  stats,
  onRefresh,
  onOpenExportModal,
}: OrdersHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment tracking, payments, invoices, and logistics management
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Export Excel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            title="Refresh orders list"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 sm:mt-2 truncate">{stats.totalOrders}</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 sm:mt-2 truncate">
            ৳{Number(stats.totalRevenue).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1.5 sm:mt-2 truncate">{stats.pendingOrders}</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1.5 sm:mt-2 truncate">{stats.deliveredOrders}</div>
        </div>
      </div>
    </div>
  );
});
