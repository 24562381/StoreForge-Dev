'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';

interface TrackReviewModalProps {
  reviewModalProduct: any;
  onClose: () => void;
  reviewRating: number;
  setReviewRating: (val: number) => void;
  hoverRating: number;
  setHoverRating: (val: number) => void;
  reviewText: string;
  setReviewText: (val: string) => void;
  submittingReview: boolean;
  reviewSuccess: string;
  reviewError: string;
  onSubmitReview: (e: React.FormEvent) => void;
}

const STARS_LIST = [1, 2, 3, 4, 5] as const;

function getRatingLabel(stars: number, lang: string, t: (k: string, fb: string) => string): string {
  switch (stars) {
    case 5:
      return t('track_rating_5', lang === 'bn' ? '৫ ★★★★★ - অসাধারণ ও নিখুঁত!' : '5 ★★★★★ - Excellent & Perfect!');
    case 4:
      return t('track_rating_4', lang === 'bn' ? '৪ ★★★★☆ - খুব ভালো!' : '4 ★★★★☆ - Very Good!');
    case 3:
      return t('track_rating_3', lang === 'bn' ? '৩ ★★★☆☆ - মোটামুটি ভালো' : '3 ★★★☆☆ - Average');
    case 2:
      return t('track_rating_2', lang === 'bn' ? '২ ★★☆☆☆ - সন্তোষজনক নয়' : '2 ★★☆☆☆ - Below Expectations');
    case 1:
    default:
      return t('track_rating_1', lang === 'bn' ? '১ ★☆☆☆☆ - একেবারেই ভালো লাগেনি' : '1 ★☆☆☆☆ - Poor Quality');
  }
}

export const TrackReviewModal = React.memo(function TrackReviewModal({
  reviewModalProduct,
  onClose,
  reviewRating,
  setReviewRating,
  hoverRating,
  setHoverRating,
  reviewText,
  setReviewText,
  submittingReview,
  reviewSuccess,
  reviewError,
  onSubmitReview,
}: TrackReviewModalProps) {
  const { lang, t } = useLanguage();

  if (!reviewModalProduct) return null;

  const currentLabel = getRatingLabel(hoverRating || reviewRating, lang, t);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in fade-in zoom-95 duration-200">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>
              {reviewModalProduct.productName} {t('track_modal_title', 'এর রিভিউ')}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {reviewSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
            <span>{reviewSuccess}</span>
          </div>
        )}

        {reviewError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-red-600 text-base"></i>
            <span>{reviewError}</span>
          </div>
        )}

        <form onSubmit={onSubmitReview} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                {t('track_modal_rating_label', 'রেটিং নির্বাচন করুন:')}
              </label>
              <span className="text-[11px] font-bold text-amber-700">
                {currentLabel}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 justify-center">
              {STARS_LIST.map((s) => {
                const effectiveRating = hoverRating || reviewRating;
                const isFilled = s <= effectiveRating;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer hover:scale-125 transition-transform p-1 focus:outline-none"
                    title={`${s} Star${s > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${isFilled
                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                        : 'fill-stone-100 text-stone-300 hover:text-stone-400'
                        }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {t('track_modal_review_label', 'আপনার রিভিউ লিখুন:')}
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t(
                'track_modal_review_placeholder',
                'পণ্যটির ফিনিশিং, কোয়ালিটি ও প্যাকেজিং সম্পর্কে আপনার অনুভূতি লিখুন...',
              )}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-700 focus:bg-white transition-all resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {t('track_modal_cancel_btn', 'বাতিল')}
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submittingReview ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-paper-plane"></i>
              )}
              <span>{t('track_modal_submit_btn', 'জমা দিন')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
