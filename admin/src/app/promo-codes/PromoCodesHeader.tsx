'use client';

import React from 'react';
import { TicketPercent, Plus } from 'lucide-react';

interface PromoCodesHeaderProps {
  onOpenCreate: () => void;
}

export const PromoCodesHeader = React.memo(function PromoCodesHeader({ onOpenCreate }: PromoCodesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
          <TicketPercent className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Promo Codes & Discounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage percentage or fixed discounts for customer checkout
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCreate}
        className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Create Promo Code</span>
      </button>
    </div>
  );
});

export default PromoCodesHeader;
