'use client';

import React from 'react';
import { Palette, RotateCcw, Clock, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface CustomizationsHeaderProps {
  stats: {
    total: number;
    pending: number;
    contacted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  onRefresh: () => void;
}

export const CustomizationsHeader = React.memo(function CustomizationsHeader({
  stats,
  onRefresh,
}: CustomizationsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Custom Orders & Requests</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage custom size measurements, wood stain choices, reference photos, and customer contact details
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Requests</span>
            <Palette className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider">
            <span>New Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.pending}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 uppercase tracking-wider">
            <span>In Progress</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{stats.inProgress}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.completed}</div>
        </div>
      </div>
    </div>
  );
});

export default CustomizationsHeader;
