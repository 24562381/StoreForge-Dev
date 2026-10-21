'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { DashboardRecentOrders } from './DashboardRecentOrders';

export default function Wrapper() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/orders/admin/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading Dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Dashboard Header */}
      <DashboardHeader />

      {/* 3. Stats Grid */}
      <DashboardStatsGrid stats={stats} />

      {/* 4. Recent Orders Table */}
      <DashboardRecentOrders orders={stats?.recent_orders || []} />
    </div>
  );
}
