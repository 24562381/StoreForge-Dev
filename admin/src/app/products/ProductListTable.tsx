'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Edit, Trash2, Star } from 'lucide-react';
import { useAdminPrefix } from '@/lib/useAdminPrefix';

interface ProductListTableProps {
  products: any[];
  loading: boolean;
  onDelete: (id: number, name: string) => void;
  onToggleExclusive?: (id: number, currentExclusive: boolean) => void;
  togglingId?: number | null;
}

export const ProductListTable = React.memo(function ProductListTable({
  products,
  loading,
  onDelete,
  onToggleExclusive,
  togglingId,
}: ProductListTableProps) {
  const prefix = useAdminPrefix();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Loading product catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <Package className="w-10 h-10 mx-auto text-slate-400" />
          <p className="text-sm font-medium">No products found in the catalog.</p>
          <Link
            href={`${prefix}/products/add`}
            className="inline-block px-4 py-2 rounded-xl bg-[#c08a46] text-white font-bold text-xs"
          >
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="p-4 whitespace-nowrap">Image</th>
                <th className="p-4 whitespace-nowrap min-w-[160px]">Name</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th className="p-4 whitespace-nowrap">Variants</th>
                <th className="p-4 whitespace-nowrap">Starting Price</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-center whitespace-nowrap">Exclusive</th>
                <th className="p-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => {
                const primaryImg =
                  p.images?.find((img: any) => img.isPrimary) || p.images?.[0];
                const minPrice = p.variants?.length
                  ? Math.min(...p.variants.map((v: any) => Number(v.price) || 0))
                  : p.min_price || 0;

                const isEx = Boolean(p.isExclusive || p.is_exclusive);
                const isToggling = togglingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {primaryImg?.imageUrl ? (
                          <img
                            src={primaryImg.imageUrl}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/no-image.svg';
                            }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 min-w-[160px]">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">/{p.slug}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 whitespace-nowrap">
                      {p.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {p.variants?.length || 0} variants
                    </td>
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                      ৳{Number(minPrice).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap inline-flex items-center ${
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleExclusive?.(p.id, isEx)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isEx
                            ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 shadow-xs'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/80 hover:text-slate-700'
                        } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                        title={
                          isEx
                            ? 'Exclusive spotlight active (click to remove)'
                            : 'Standard product (click to mark as Exclusive)'
                        }
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isEx ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span>{isEx ? 'Exclusive' : 'Standard'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <Link
                          href={`${prefix}/products/${p.id}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-700 font-bold transition-colors inline-block"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(p.id, p.name)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold transition-colors cursor-pointer"
                          title="Delete Product"
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
  );
});
