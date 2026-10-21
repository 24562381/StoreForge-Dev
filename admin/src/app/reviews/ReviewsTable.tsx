'use client';

import React from 'react';
import { Star, Trash2 } from 'lucide-react';

interface ReviewsTableProps {
  reviews: any[];
  loading: boolean;
  onTogglePublish: (id: number) => void;
  onToggleFeature: (id: number) => void;
  onDeleteReview?: (id: number, customerName: string) => void;
}

export const ReviewsTable = React.memo(function ReviewsTable({
  reviews,
  loading,
  onTogglePublish,
  onToggleFeature,
  onDeleteReview,
}: ReviewsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-500 shadow-sm">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 shadow-sm">
        <p className="font-semibold text-sm">No customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
            <tr>
              <th className="p-4 whitespace-nowrap min-w-[140px]">Customer</th>
              <th className="p-4 whitespace-nowrap">Rating</th>
              <th className="p-4 min-w-[240px]">Review Content</th>
              <th className="p-4 whitespace-nowrap">Location</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 text-right whitespace-nowrap min-w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reviews.map((rev) => (
              <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900 min-w-[140px]">
                  <div>{rev.customerName}</div>
                  {rev.product?.name ? (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-normal inline-block mt-1">
                      {rev.product.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                      General Store
                    </span>
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{rev.rating}/5</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 italic max-w-sm font-medium leading-relaxed">
                  "{rev.reviewText}"
                </td>
                <td className="p-4 text-slate-500 font-semibold whitespace-nowrap">{rev.location || 'N/A'}</td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                        rev.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {rev.isPublished ? 'Published' : 'Hidden'}
                    </span>
                    {rev.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onTogglePublish(rev.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                        rev.isPublished
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {rev.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFeature(rev.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                        rev.isFeatured
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {rev.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    {onDeleteReview && (
                      <button
                        type="button"
                        onClick={() => onDeleteReview(rev.id, rev.customerName)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer shrink-0"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ReviewsTable;
