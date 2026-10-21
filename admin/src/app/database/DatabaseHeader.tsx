'use client';

import React from 'react';
import { Database, Plus, RotateCcw, UploadCloud, ShieldCheck } from 'lucide-react';

interface DatabaseHeaderProps {
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onScrollToImport: () => void;
  loading: boolean;
}

export const DatabaseHeader = React.memo(function DatabaseHeader({
  onRefresh,
  onOpenCreateModal,
  onScrollToImport,
  loading,
}: DatabaseHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-amber-100 text-[#c08a46] shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Database Management</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PostgreSQL 18+ Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export full PostgreSQL dumps, create portable ORM snapshots, and safely import backups
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c08a46]' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onScrollToImport}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
          <span>Import / Restore</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Backup</span>
        </button>
      </div>
    </div>
  );
});
