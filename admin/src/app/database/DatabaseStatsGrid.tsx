'use client';

import React from 'react';
import { HardDrive, Clock, Layers, Activity } from 'lucide-react';

interface DatabaseStatsGridProps {
  stats: {
    engine: string;
    status: string;
    databaseName: string;
    totalBackups: number;
    lastBackupTime: string | null;
    latencyMs?: number;
    counts: {
      products: number;
      categories: number;
      orders: number;
      users: number;
      reviews: number;
      settings: number;
      translations: number;
    };
  } | null;
  totalStorageFormatted: string;
}

export const DatabaseStatsGrid = React.memo(function DatabaseStatsGrid({
  stats,
  totalStorageFormatted,
}: DatabaseStatsGridProps) {
  const isConnected = stats?.status === 'connected';

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'None';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  const totalRecords =
    (stats?.counts.products || 0) +
    (stats?.counts.categories || 0) +
    (stats?.counts.orders || 0) +
    (stats?.counts.users || 0) +
    (stats?.counts.reviews || 0) +
    (stats?.counts.settings || 0) +
    (stats?.counts.translations || 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {/* 1. Database Engine */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="truncate">DB Engine</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {stats?.latencyMs !== undefined && stats.latencyMs >= 0 && (
              <span
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 lowercase"
                title={`Database response latency: ${stats.latencyMs}ms`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {stats.latencyMs}ms
              </span>
            )}
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-xs shadow-emerald-500/40' : 'bg-red-500 shadow-xs shadow-red-500/40'
              }`}
            />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
              <span>PostgreSQL</span>
            </div>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>
              Status: <span className="text-emerald-600 font-bold">{isConnected ? 'Active' : 'Disconnected'}</span>
              <span className="hidden md:inline font-normal text-emerald-600"> & ACID</span>
            </span>
            {stats?.latencyMs !== undefined && stats.latencyMs >= 0 && (
              <span className="text-slate-400 font-medium sm:hidden">· {stats.latencyMs}ms</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stored Snapshots */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="truncate">Snapshots</span>
          <HardDrive className="w-4 h-4 text-[#c08a46] shrink-0" />
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats?.totalBackups ?? 0}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate">
            Disk: <span className="font-bold text-slate-700">{totalStorageFormatted}</span>
          </div>
        </div>
      </div>

      {/* 3. Latest Backup */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="truncate">Latest Backup</span>
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatRelativeTime(stats?.lastBackupTime || null)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate" title={stats?.lastBackupTime || ''}>
            {stats?.lastBackupTime
              ? new Date(stats.lastBackupTime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'No snapshots'}
          </div>
        </div>
      </div>

      {/* 4. Total Records */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="truncate">Catalog & Orders</span>
          <Layers className="w-4 h-4 text-purple-500 shrink-0" />
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalRecords.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            {stats?.counts.products ?? 0} items · {stats?.counts.orders ?? 0} orders
          </div>
        </div>
      </div>
    </div>
  );
});
