'use client';

import React from 'react';
import NextLink from 'next/link';
import { useAdminPrefix } from '@/lib/useAdminPrefix';

export const DashboardHeader = React.memo(function DashboardHeader() {
  const prefix = useAdminPrefix();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time overview of store performance and order flow</p>
      </div>
      <NextLink
        href={`${prefix}/orders`}
        className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
      >
        Manage Orders
      </NextLink>
    </div>
  );
});
