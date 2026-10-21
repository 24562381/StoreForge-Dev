'use client';

import React from 'react';
import { Search, Edit3, Trash2, AlertCircle } from 'lucide-react';

export interface TranslationItem {
  id: number;
  key: string;
  category: string;
  subCategory?: string;
  description?: string;
  bn: string;
  en: string;
}

interface TranslationsTableProps {
  filteredItems: TranslationItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  onEdit: (item: TranslationItem) => void;
  onDelete: (item: TranslationItem) => void;
  categoryLabel: string;
  getSubcategoryInfo: (category: string, key: string) => { id: string; label: string };
}

export const TranslationsTable = React.memo(function TranslationsTable({
  filteredItems,
  searchQuery,
  setSearchQuery,
  loading,
  onEdit,
  onDelete,
  categoryLabel,
  getSubcategoryInfo,
}: TranslationsTableProps) {
  return (
    <div className="lg:col-span-8 space-y-4">
      {/* Search Bar & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by key, text, or context..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filteredItems.length}</strong> items in{' '}
          <span className="text-amber-800 font-semibold">{categoryLabel}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading translations...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No translations found.</p>
            <p className="text-xs text-slate-400">Try adjusting your category selection or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold">
                <tr>
                  <th className="p-4 whitespace-nowrap min-w-[160px]">Key & Context</th>
                  <th className="p-4 min-w-[200px]">বাংলা (Bangla)</th>
                  <th className="p-4 min-w-[200px]">English</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => {
                  const subInfo = getSubcategoryInfo(item.category || 'header_navigation', item.key);
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="p-4 align-top">
                        <div className="font-mono text-slate-900 font-bold text-[11px] group-hover:text-amber-800 transition-colors">
                          {item.key}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                            {subInfo.label}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-slate-400 mt-1">{item.description}</p>
                        )}
                      </td>
                      <td className="p-4 align-top font-medium text-slate-900 leading-relaxed font-sans">
                        {item.bn}
                      </td>
                      <td className="p-4 align-top text-slate-600 leading-relaxed font-sans">
                        {item.en}
                      </td>
                      <td className="p-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Edit translation"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
});

export default TranslationsTable;
