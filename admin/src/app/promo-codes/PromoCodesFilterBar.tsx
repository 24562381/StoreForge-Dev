'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface PromoCodesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'all' | 'active' | 'inactive' | 'expired';
  setStatusFilter: (s: 'all' | 'active' | 'inactive' | 'expired') => void;
  totalCount: number;
}

export const PromoCodesFilterBar = React.memo(function PromoCodesFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
}: PromoCodesFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px] w-full md:w-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search promo codes or descriptions..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#c08a46] focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-white text-emerald-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('inactive')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'inactive'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inactive
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('expired')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-white text-rose-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Expired
        </button>
      </div>
    </div>
  );
});

export default PromoCodesFilterBar;
