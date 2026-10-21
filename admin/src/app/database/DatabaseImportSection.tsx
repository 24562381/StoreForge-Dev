'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCode,
  FileJson,
  AlertTriangle,
  ShieldCheck,
  X,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useAdminModal } from '@/lib/AdminModalContext';

interface DatabaseImportSectionProps {
  onImportFile: (file: File, takeSafetyBackup: boolean) => Promise<void>;
  importing: boolean;
}

export const DatabaseImportSection = React.memo(function DatabaseImportSection({
  onImportFile,
  importing,
}: DatabaseImportSectionProps) {
  const { showError, showWarning } = useAdminModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [takeSafetyBackup, setTakeSafetyBackup] = useState<boolean>(true);
  const [confirmText, setConfirmText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'sql' && ext !== 'json') {
      showError('Only .sql or .json backup files are supported for import.', 'Unsupported File Format');
      return;
    }
    setSelectedFile(file);
    setConfirmText('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setConfirmText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (confirmText.trim().toUpperCase() !== 'RESTORE') {
      showWarning('Please type RESTORE in the confirmation field to proceed.', 'Confirmation Required');
      return;
    }
    await onImportFile(selectedFile, takeSafetyBackup);
    handleClear();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isConfirmed = confirmText.trim().toUpperCase() === 'RESTORE';

  return (
    <div id="import-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload & Restore Form */}
      <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3 text-base">
          <UploadCloud className="w-5 h-5 text-[#c08a46]" />
          <span>Import & Restore Database Snapshot</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.json"
            onChange={handleFileChange}
            className="hidden"
            id="backup-file-input"
          />

          {!selectedFile ? (
            <label
              htmlFor="backup-file-input"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#c08a46] bg-amber-50/30 scale-[0.99]'
                  : 'border-slate-200 hover:border-[#c08a46] bg-slate-50/50 hover:bg-amber-50/20'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#c08a46] mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drop your backup file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PostgreSQL dump (<code className="font-mono text-slate-700">.sql</code>) or StoreForge snapshot (<code className="font-mono text-slate-700">.json</code>) up to 100MB
              </p>
            </label>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-800 shrink-0">
                  {selectedFile.name.endsWith('.sql') ? (
                    <FileCode className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FileJson className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate font-mono">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatFileSize(selectedFile.size)} · Ready to import
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClear}
                disabled={importing}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Choose different file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Safety Checkbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="safety-checkbox"
              checked={takeSafetyBackup}
              onChange={(e) => setTakeSafetyBackup(e.target.checked)}
              disabled={importing}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#c08a46] focus:ring-[#c08a46]/20 cursor-pointer"
            />
            <label htmlFor="safety-checkbox" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Create an automatic safety backup before restoring (Recommended)
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Takes a zero-downtime snapshot of your current database right now before applying new data.
              </span>
            </label>
          </div>

          {/* Safety Warning & Confirmation */}
          {selectedFile && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Caution: Database Overwrite</span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Restoring from this backup will overwrite existing records with the data inside <span className="font-mono font-bold text-slate-900">{selectedFile.name}</span>.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type <span className="text-amber-700 font-black">RESTORE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="RESTORE"
                  disabled={importing}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {selectedFile && (
              <button
                type="button"
                onClick={handleClear}
                disabled={importing}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedFile || !isConfirmed || importing}
              className="px-6 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Restoring Database...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Restore Database Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CLI & Automation Guide Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-[#c08a46]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">CLI & Automation</h3>
              <p className="text-[11px] text-slate-400">Terminal commands & Cron jobs</p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                1. Take a Backup via Terminal:
              </span>
              <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 font-semibold flex items-center justify-between">
                <span>npm run db:backup</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                2. Non-Destructive Schema Sync:
              </span>
              <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 font-semibold flex items-center justify-between">
                <span>npm run db:sync</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                3. Explicit Schema Merge (Force):
              </span>
              <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 font-semibold flex items-center justify-between">
                <span>npm run db:merge -- --force</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-[#c08a46] block text-[11px]">💡 Dual Automated Cron Protection</span>
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold text-slate-800">1. Built-in:</span> StoreForge automatically takes a daily background snapshot every 24h as long as the server is running.
              </p>
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold text-slate-800">2. VPS Crontab:</span> Add this to your Linux <code className="bg-white px-1 rounded border border-amber-200 font-mono text-slate-800">crontab -e</code> for an independent system cron:
                <code className="block mt-1 p-1.5 rounded bg-white border border-amber-200 font-mono text-[10px] text-slate-800 overflow-x-auto">
                  0 3 * * * cd /path/to/project && npm run db:backup &gt;&gt; logs/backup.log 2&gt;&amp;1
                </code>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Storage: <code className="font-mono text-[#c08a46]">backups/</code></span>
          <span>Security: <code className="font-mono text-emerald-600 font-bold">AES-256</code></span>
        </div>
      </div>
    </div>
  );
});
