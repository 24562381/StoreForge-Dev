'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
}

export const OrdersPagination = React.memo(function OrdersPagination({
  page,
  totalPages,
  totalCount,
  limit,
  setPage,
  setLimit,
}: OrdersPaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <span>Showing {Math.min((page - 1) * limit + 1, totalCount)} to {Math.min(page * limit, totalCount)} of {totalCount} orders</span>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800"
        >
          <option value="15">15 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 font-bold text-slate-900 font-mono">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
