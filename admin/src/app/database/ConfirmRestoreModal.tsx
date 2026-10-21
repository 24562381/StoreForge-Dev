'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, RefreshCw, FileCode, FileJson } from 'lucide-react';
import { BackupItem } from './BackupsTable';

interface ConfirmRestoreModalProps {
  backup: BackupItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fileName: string, takeSafetyBackup: boolean) => Promise<void>;
  loading: boolean;
}

export const ConfirmRestoreModal = React.memo(function ConfirmRestoreModal({
  backup,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: ConfirmRestoreModalProps) {
  const [takeSafetyBackup, setTakeSafetyBackup] = useState<boolean>(true);
  const [confirmText, setConfirmText] = useState<string>('');

  if (!isOpen || !backup) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'RESTORE';
  const isSql = backup.type === 'sql';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;
    await onConfirm(backup.fileName, takeSafetyBackup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden scale-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-amber-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Restore Database Snapshot</h3>
              <p className="text-xs text-slate-500">Confirm target file and safety settings</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-800 shrink-0">
              {isSql ? (
                <FileCode className="w-5 h-5 text-blue-600" />
              ) : (
                <FileJson className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-slate-900 truncate">
                {backup.fileName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {backup.fileSizeFormatted} · Created {new Date(backup.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">⚠️ Overwrite Notice</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Restoring this snapshot will replace current database tables with the records from this backup file.
            </p>
          </div>

          {/* Safety Backup Checkbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-safety-checkbox"
              checked={takeSafetyBackup}
              onChange={(e) => setTakeSafetyBackup(e.target.checked)}
              disabled={loading}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#c08a46] focus:ring-[#c08a46]/20 cursor-pointer"
            />
            <label htmlFor="confirm-safety-checkbox" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Create an automatic safety backup before restoring (Recommended)
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Takes a zero-downtime snapshot of your current database right now before applying the restoration.
              </span>
            </label>
          </div>

          {/* Type RESTORE */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Type <span className="text-amber-700 font-black">RESTORE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESTORE"
              disabled={loading}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#c08a46]"
            />
          </div>

          </div>

          {/* Fixed Modal Footer Toolbar */}
          <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 sm:px-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isConfirmed || loading}
              className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Restoring Database...</span>
                </>
              ) : (
                <span>Confirm & Restore</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
