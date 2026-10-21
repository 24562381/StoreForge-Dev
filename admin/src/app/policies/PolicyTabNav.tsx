'use client';

import React from 'react';

export interface PolicyPageConfig {
  id: string;
  label: string;
  labelBn: string;
  icon: any;
  slug: string;
  titleKeyBn: string;
  titleKeyEn: string;
  subKeyBn: string;
  subKeyEn: string;
  contentKeyBn: string;
  contentKeyEn: string;
  defaultTitleBn: string;
  defaultTitleEn: string;
  defaultSubBn: string;
  defaultSubEn: string;
  defaultContentBn: string;
  defaultContentEn: string;
}

interface PolicyTabNavProps {
  policyPages: PolicyPageConfig[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PolicyTabNav = React.memo(function PolicyTabNav({ policyPages, activeTab, setActiveTab }: PolicyTabNavProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-sm flex flex-wrap items-center gap-2">
      {policyPages.map((page) => {
        const Icon = page.icon;
        const isActive = activeTab === page.id;
        return (
          <button
            type="button"
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            className={`flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{page.label}</span>
            <span className={`text-[11px] font-normal ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
              ({page.labelBn})
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default PolicyTabNav;
