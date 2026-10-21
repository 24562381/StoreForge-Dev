'use client';

import React from 'react';
import { Save, CheckCircle2, RefreshCw } from 'lucide-react';

interface SettingsFloatingBarProps {
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  savedSuccess: boolean;
}

export const SettingsFloatingBar = React.memo(function SettingsFloatingBar({ onSave, saving, savedSuccess }: SettingsFloatingBarProps) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 z-40 max-w-[calc(100vw-2rem)]">
      <div className="bg-slate-950/95 backdrop-blur-md text-white p-2.5 pl-4 pr-2.5 rounded-2xl shadow-2xl border border-slate-800/80 flex items-center gap-3.5 ring-1 ring-white/10">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 pr-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">System Configuration</span>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b8892d] to-[#c08a46] hover:from-[#a06828] hover:to-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {savedSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : savedSuccess ? 'All Changes Saved!' : 'Save All Settings'}</span>
        </button>
      </div>
    </div>
  );
});

export default SettingsFloatingBar;
