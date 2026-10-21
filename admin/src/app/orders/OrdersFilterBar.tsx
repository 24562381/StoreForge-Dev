'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface OrdersFilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (v: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (v: string) => void;
  districtFilter: string;
  setDistrictFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (v: boolean) => void;
  onResetFilters: () => void;
}

export const OrdersFilterBar = React.memo(function OrdersFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  districtFilter,
  setDistrictFilter,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  onResetFilters,
}: OrdersFilterBarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number (#...), customer name, phone, address..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#c08a46]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#c08a46]"
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAdvancedFilters
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvancedFilters && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
            >
              <option value="all">All Methods</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bkash">bKash Payment Gateway</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">District / Region</label>
            <input
              type="text"
              value={districtFilter === 'all' ? '' : districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value || 'all')}
              placeholder="e.g. Dhaka, Chittagong..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Sort Orders By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="total_desc">Highest Amount</option>
              <option value="total_asc">Lowest Amount</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
