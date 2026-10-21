'use client';

import React from 'react';
import { ShoppingBag, DollarSign, CheckCircle2, Truck } from 'lucide-react';

interface DashboardStatsGridProps {
  stats: any;
}

export const DashboardStatsGrid = React.memo(function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const statCards = React.useMemo(() => [
    {
      title: 'Total Revenue',
      value: `৳${Number(stats?.total_revenue || 0).toLocaleString()}`,
      sub: `${stats?.paid_count || 0} Paid Orders`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      sub: `${stats?.pending_count || 0} Pending Verification`,
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Delivered Revenue',
      value: `৳${Number(stats?.delivered_revenue || 0).toLocaleString()}`,
      sub: `${stats?.delivered_count || 0} Completed Orders`,
      icon: CheckCircle2,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Active Processing',
      value: (stats?.confirmed_count || 0) + (stats?.processing_count || 0) + (stats?.shipped_count || 0),
      sub: `${stats?.shipped_count || 0} Currently in Transit`,
      icon: Truck,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ], [stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const IconComp = card.icon;
        return (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
              <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                <IconComp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{card.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
