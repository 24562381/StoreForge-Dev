'use client';

import React from 'react';
import {
  X,
  Plus,
  Edit2,
  Check,
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

interface PromoCodeModalProps {
  isOpen: boolean;
  editingPromo: PromoCode | null;
  code: string;
  setCode: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  discountType: 'fixed' | 'percentage';
  setDiscountType: (v: 'fixed' | 'percentage') => void;
  discountValue: number | string;
  setDiscountValue: (v: number | string) => void;
  minOrderAmount: number | string;
  setMinOrderAmount: (v: number | string) => void;
  maxDiscountAmount: number | string;
  setMaxDiscountAmount: (v: number | string) => void;
  usageLimit: number | string;
  setUsageLimit: (v: number | string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PromoCodeModal = React.memo(function PromoCodeModal({
  isOpen,
  editingPromo,
  code,
  setCode,
  description,
  setDescription,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  minOrderAmount,
  setMinOrderAmount,
  maxDiscountAmount,
  setMaxDiscountAmount,
  usageLimit,
  setUsageLimit,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isActive,
  setIsActive,
  submitting,
  onClose,
  onSubmit,
}: PromoCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-[#c08a46]">
              {editingPromo ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                {editingPromo ? `Edit Promo Code: ${editingPromo.code}` : 'Create New Promo Code'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set discounts, validity duration, and minimum checkout thresholds
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form with Fixed Footer */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. WOODEN20"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    discountType === 'fixed'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Fixed (৳)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    discountType === 'percentage'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Percent (%)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {discountType === 'fixed' ? 'Discount Amount (৳) *' : 'Discount Percentage (%) *'}
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'fixed' ? '100' : '15'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Order Amount (৳)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0 (No minimum)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            {discountType === 'percentage' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maximum Discount Cap (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="Leave empty for uncapped"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Usage Limit</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave empty for unlimited"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry / End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Description / Campaign Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Eid Mega Sale Campaign"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c08a46] focus:ring-amber-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Enable promo code immediately on storefront
                </span>
              </label>
            </div>
          </div>
          </div>

          {/* Fixed Footer Bar */}
          <div className="p-4 sm:p-5 sm:px-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : editingPromo ? 'Update Promo Code' : 'Save Promo Code'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default PromoCodeModal;
