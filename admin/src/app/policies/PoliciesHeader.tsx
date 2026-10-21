'use client';

import React from 'react';
import { FileText, Eye, ExternalLink, Save } from 'lucide-react';
import { useStoreUrl } from '@/lib/storeUrl';

interface PoliciesHeaderProps {
  currentSlug: string;
  onSave: () => void;
  saving: boolean;
}

export const PoliciesHeader = React.memo(function PoliciesHeader({ currentSlug, onSave, saving }: PoliciesHeaderProps) {
  const storeUrl = useStoreUrl();
  const cleanBase = (storeUrl || '').replace(/\/+$/, '');
  const liveSlug = currentSlug.startsWith('/') ? currentSlug : `/${currentSlug}`;
  const liveUrl = `${cleanBase}${liveSlug}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Policy & Information Pages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit and customize content, titles, and bilingual translations for Privacy Policy, Terms, and Return policies
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Live Page</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
});

export default PoliciesHeader;
