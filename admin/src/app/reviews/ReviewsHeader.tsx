'use client';

import React from 'react';
import { Star, Plus } from 'lucide-react';

interface ReviewsHeaderProps {
  onOpenAddModal?: () => void;
}

export const ReviewsHeader = React.memo(function ReviewsHeader({ onOpenAddModal }: ReviewsHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60 shrink-0">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve, feature on store homepage, or add verified product reviews
          </p>
        </div>
      </div>

      {onOpenAddModal && (
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dummy Review</span>
        </button>
      )}
    </div>
  );
});

export default ReviewsHeader;
