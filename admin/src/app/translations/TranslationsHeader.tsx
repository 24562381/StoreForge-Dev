'use client';

import React from 'react';
import { Globe, Plus, RefreshCw } from 'lucide-react';

interface TranslationsHeaderProps {
  onOpenAddModal: () => void;
  onSyncCache: () => void;
  syncing: boolean;
}

export const TranslationsHeader = React.memo(function TranslationsHeader({
  onOpenAddModal,
  onSyncCache,
  syncing,
}: TranslationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Storefront Translations & i18n
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage bilingual dictionary (English & বাংলা) with instant real-time synchronization
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onSyncCache}
          disabled={syncing}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Clear translation cache and reload live dictionary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>Sync Cache</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Translation Key</span>
        </button>
      </div>
    </div>
  );
});

export default TranslationsHeader;
