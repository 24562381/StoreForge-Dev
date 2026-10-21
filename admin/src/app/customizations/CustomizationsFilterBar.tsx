'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CustomizationsFilterBarProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  search: string;
  setSearch: (query: string) => void;
  stats: {
    total: number;
    pending: number;
    contacted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export const CustomizationsFilterBar = React.memo(function CustomizationsFilterBar({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  stats,
}: CustomizationsFilterBarProps) {
  const tabs = [
    { id: 'all', label: 'All Requests', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'contacted', label: 'Contacted', count: stats.contacted },
    { id: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#c08a46] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, size..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default CustomizationsFilterBar;
