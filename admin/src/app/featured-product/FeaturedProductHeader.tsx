'use client';

import React from 'react';
import { Sparkles, ExternalLink, Save } from 'lucide-react';
import { useStoreUrl } from '@/lib/storeUrl';

interface FeaturedProductHeaderProps {
  onSave: () => void;
  saving: boolean;
}

export const FeaturedProductHeader = React.memo(function FeaturedProductHeader({ onSave, saving }: FeaturedProductHeaderProps) {
  const storeUrl = useStoreUrl();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#b8892d] to-[#dfc276] text-[#121519] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Premium Exclusive Product Showcase</h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure the dedicated high-converting 2-row showcase with 1-click AI translation
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <a
          href={`${(storeUrl || '').replace(/\/+$/, '')}/#featured-exclusive`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>View on Home</span>
        </a>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 sm:flex-none justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a67435] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
});

export default FeaturedProductHeader;
