'use client';

import React from 'react';
import {
  TicketPercent,
  Copy,
  Check,
  Edit2,
  Trash2,
  Percent,
  Coins,
} from 'lucide-react';

interface PromoCode {
  id: number;
  code: string;
  description: string | null;
  discountType: 'fixed' | 'percentage';
  discountValue: string | number;
  minOrderAmount: string | number | null;
  maxDiscountAmount: string | number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface PromoCodesTableProps {
  promos: PromoCode[];
  loading: boolean;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onEdit: (promo: PromoCode) => void;
  onDelete: (id: number, code: string) => void;
}

export const PromoCodesTable = React.memo(function PromoCodesTable({
  promos,
  loading,
  copiedCode,
  onCopyCode,
  onEdit,
  onDelete,
}: PromoCodesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-500 shadow-sm">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading promo codes catalog...</p>
      </div>
    );
  }

  if (promos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm space-y-2">
        <TicketPercent className="w-10 h-10 mx-auto opacity-40 text-[#c08a46]" />
        <p className="font-semibold text-sm text-slate-700">No promo codes found</p>
        <p className="text-xs text-slate-400">Create your first coupon code to start offering customer discounts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
            <tr>
              <th className="p-4 whitespace-nowrap min-w-[150px]">Coupon Code</th>
              <th className="p-4 whitespace-nowrap">Discount</th>
              <th className="p-4 whitespace-nowrap">Min. Spend</th>
              <th className="p-4 whitespace-nowrap">Usage Count</th>
              <th className="p-4 whitespace-nowrap">Validity</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 text-right whitespace-nowrap min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {promos.map((p) => {
              const isExpired = p.endDate ? new Date(p.endDate).getTime() < Date.now() : false;

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 min-w-[150px]">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="font-mono font-black text-sm text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                        {p.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(p.code)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        title="Copy coupon code"
                      >
                        {copiedCode === p.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {p.description && (
                      <div className="text-[11px] text-slate-400 mt-1 max-w-xs truncate">
                        {p.description}
                      </div>
                    )}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      {p.discountType === 'percentage' ? (
                        <>
                          <Percent className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{p.discountValue}% OFF</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>৳{Number(p.discountValue).toLocaleString()} OFF</span>
                        </>
                      )}
                    </div>
                    {p.maxDiscountAmount && Number(p.maxDiscountAmount) > 0 && (
                      <div className="text-[10px] text-slate-400">
                        Cap: ৳{Number(p.maxDiscountAmount).toLocaleString()}
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {Number(p.minOrderAmount) > 0 ? `৳${Number(p.minOrderAmount).toLocaleString()}` : 'No Min'}
                  </td>

                  <td className="p-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {p.usedCount} / {p.usageLimit || '∞'}
                  </td>

                  <td className="p-4 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                    {p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB') : 'Never Expires'}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center ${
                        isExpired
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : p.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isExpired ? 'Expired' : p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-700 transition-colors"
                        title="Edit Promo Code"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id, p.code)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                        title="Delete Promo Code"
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
    </div>
  );
});

export default PromoCodesTable;
