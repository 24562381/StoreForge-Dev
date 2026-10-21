'use client';

import React from 'react';
import {
  Download,
  RotateCcw,
  Trash2,
  FileCode,
  FileJson,
  HardDriveDownload,
  Plus
} from 'lucide-react';

export interface BackupItem {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  createdAt: string;
  type: 'sql' | 'json';
}

interface BackupsTableProps {
  backups: BackupItem[];
  loading: boolean;
  onDownload: (fileName: string) => void;
  onRequestRestore: (backup: BackupItem) => void;
  onRequestDelete: (fileName: string) => void;
  onQuickBackup: (format: 'sql' | 'json') => void;
  creatingBackup: boolean;
}

export const BackupsTable = React.memo(function BackupsTable({
  backups,
  loading,
  onDownload,
  onRequestRestore,
  onRequestDelete,
  onQuickBackup,
  creatingBackup,
}: BackupsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span>Stored Database Snapshots</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {backups.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Full dumps and portable snapshots ready to download, inspect, or restore.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onQuickBackup('sql')}
            disabled={creatingBackup}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Export Native SQL Dump via pg_dump"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick SQL Export</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickBackup('json')}
            disabled={creatingBackup}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Export Portable JSON Snapshot via Prisma"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick JSON Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading database snapshots...</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#c08a46] mx-auto mb-3">
            <HardDriveDownload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No snapshots created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create your first database backup to protect your catalog, orders, translations, and store settings.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => onQuickBackup('sql')}
              disabled={creatingBackup}
              className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Initial Backup</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="p-3.5 whitespace-nowrap min-w-[200px]">Backup File</th>
                <th className="p-3.5 whitespace-nowrap">Type</th>
                <th className="p-3.5 whitespace-nowrap">File Size</th>
                <th className="p-3.5 whitespace-nowrap">Creation Timestamp</th>
                <th className="p-3.5 text-right whitespace-nowrap min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {backups.map((b) => {
                const isSql = b.type === 'sql';
                const createdDate = new Date(b.createdAt);

                return (
                  <tr
                    key={b.fileName}
                    className="hover:bg-amber-50/20 transition-colors group"
                  >
                    <td className="p-3.5 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSql
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {isSql ? (
                            <FileCode className="w-4 h-4" />
                          ) : (
                            <FileJson className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#c08a46] transition-colors font-mono text-xs truncate max-w-[240px]">
                            {b.fileName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                            {isSql
                              ? 'PostgreSQL native dump (DDL, constraints & data)'
                              : 'Prisma ORM JSON snapshot (portable schema)'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
                          isSql
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {b.type.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-600 whitespace-nowrap">
                      {b.fileSizeFormatted}
                    </td>

                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{createdDate.toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Download */}
                        <button
                          type="button"
                          onClick={() => onDownload(b.fileName)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Download Backup to Disk"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Restore */}
                        <button
                          type="button"
                          onClick={() => onRequestRestore(b)}
                          className="p-2 rounded-xl hover:bg-amber-50 text-slate-500 hover:text-[#c08a46] transition-colors cursor-pointer"
                          title="Restore Database from this Snapshot"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onRequestDelete(b.fileName)}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Backup File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
