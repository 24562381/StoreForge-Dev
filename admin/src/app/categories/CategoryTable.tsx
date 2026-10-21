'use client';

import React from 'react';
import { FolderTree, Image as ImageIcon, Edit3, Trash2 } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  sortOrder: number;
  _count?: { products: number };
  nameBn?: string;
  descriptionBn?: string;
}

interface CategoryTableProps {
  categories: CategoryItem[];
  loading: boolean;
  editingId: number | null;
  onStartEdit: (c: CategoryItem) => void;
  onDelete: (id: number, name: string) => void;
}

export const CategoryTable = React.memo(function CategoryTable({
  categories,
  loading,
  editingId,
  onStartEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Existing Categories ({categories.length})
          </h2>
          <p className="text-[11px] text-slate-500">Click edit to modify images or bilingual translations</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No categories created yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="p-3.5 whitespace-nowrap min-w-[140px]">Category</th>
                <th className="p-3.5 whitespace-nowrap min-w-[150px]">Bilingual Name</th>
                <th className="p-3.5 whitespace-nowrap">Products</th>
                <th className="p-3.5 whitespace-nowrap">Status</th>
                <th className="p-3.5 text-right whitespace-nowrap min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-amber-50/20 transition-colors ${
                    editingId === c.id ? 'bg-amber-50/50 border-l-4 border-l-[#c08a46]' : ''
                  }`}
                >
                  {/* Image & Name */}
                  <td className="p-3.5 min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">/{c.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Bilingual Bengali Name */}
                  <td className="p-3.5 min-w-[150px]">
                    {c.nameBn ? (
                      <div className="text-emerald-800 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <span>{c.nameBn}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No translation</span>
                    )}
                    {c.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">{c.description}</p>
                    )}
                  </td>

                  {/* Product Count */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 whitespace-nowrap inline-flex items-center">
                      {c._count?.products || 0} items
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap inline-flex items-center ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onStartEdit(c)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-600 transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default CategoryTable;
