'use client';

import React from 'react';

export const SettingsHeader = React.memo(function SettingsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Controls</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            v2.0 Pro
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete management of branding, logistics, bKash PGW, SMS gateways, SEO pixels, and multi-agent AI
        </p>
      </div>
    </div>
  );
});

export default SettingsHeader;
