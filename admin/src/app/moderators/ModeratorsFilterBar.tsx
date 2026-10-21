'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface ModeratorsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: 'all' | 'admin' | 'moderator';
  setRoleFilter: (r: 'all' | 'admin' | 'moderator') => void;
  statusFilter: 'all' | 'active' | 'suspended';
  setStatusFilter: (s: 'all' | 'active' | 'suspended') => void;
  totalStaff: number;
}

export const ModeratorsFilterBar = React.memo(function ModeratorsFilterBar({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  totalStaff,
}: ModeratorsFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px] w-full md:w-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone, or NID..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#c08a46] focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap">
        {/* Role Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roles ({totalStaff})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('moderator')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'moderator'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Moderators
          </button>
        </div>

        {/* Status Filter */}
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
            All
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
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'suspended'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suspended
          </button>
        </div>
      </div>
    </div>
  );
});

export default ModeratorsFilterBar;
