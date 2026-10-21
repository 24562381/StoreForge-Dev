'use client';

import React, { useState } from 'react';
import { X, FileCode, FileJson, ShieldCheck, RefreshCw } from 'lucide-react';

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (format: 'sql' | 'json') => Promise<void>;
  loading: boolean;
}

export const CreateBackupModal = React.memo(function CreateBackupModal({
  isOpen,
  onClose,
  onCreate,
  loading,
}: CreateBackupModalProps) {
  const [format, setFormat] = useState<'sql' | 'json'>('sql');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(format);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden scale-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-[#c08a46]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Create Database Backup</h3>
              <p className="text-xs text-slate-500">Choose snapshot format and compression</p>
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

        {/* Modal Form with Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
            {/* SQL Option */}
            <label
              onClick={() => setFormat('sql')}
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                format === 'sql'
                  ? 'border-[#c08a46] bg-amber-50/30 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="backup-format"
                value="sql"
                checked={format === 'sql'}
                onChange={() => setFormat('sql')}
                className="mt-1 text-[#c08a46] focus:ring-[#c08a46]/20 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Native PostgreSQL Dump (.sql)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Extracts complete schema DDL, sequences, indices, constraints, and table rows using PostgreSQL pg_dump. Ideal for full server migrations and exact recovery.
                </p>
              </div>
            </label>

            {/* JSON Option */}
            <label
              onClick={() => setFormat('json')}
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                format === 'json'
                  ? 'border-[#c08a46] bg-amber-50/30 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="backup-format"
                value="json"
                checked={format === 'json'}
                onChange={() => setFormat('json')}
                className="mt-1 text-[#c08a46] focus:ring-[#c08a46]/20 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Portable ORM Snapshot (.json)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Extracts all records across all tables into structured JSON. Convenient for inspecting specific records and moving data between local development and cloud servers.
                </p>
              </div>
            </label>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            Snapshot files are saved with timestamps directly in your server&apos;s protected{' '}
            <code className="text-[#c08a46] font-mono font-bold">backups/</code> directory.
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Snapshot...</span>
                </>
              ) : (
                <span>Generate Snapshot</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
