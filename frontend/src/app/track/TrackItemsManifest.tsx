'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';

interface TrackItemsManifestProps {
  order: any;
  currency: string;
  reviewedProductIds: number[];
  onOpenReviewModal: (item: any) => void;
}

function parseDisplayColor(colorStr?: string): string {
  if (!colorStr) return '';
  try {
    if (colorStr.startsWith('[') && colorStr.endsWith(']')) {
      const parsed = JSON.parse(colorStr);
      if (Array.isArray(parsed)) return parsed[0] || '';
    }
  } catch {
    // fallback to original
  }
  return colorStr;
}

export const TrackItemsManifest = React.memo(function TrackItemsManifest({
  order,
  currency,
  reviewedProductIds,
  onOpenReviewModal,
}: TrackItemsManifestProps) {
  const { t, formatNum } = useLanguage();
  const items = order.items || [];
  const isDelivered = order.status === 'delivered';

  return (
    <div className="track-card">
      <div className="track-card-header">
        <div className="track-card-title">
          <i className="fa-solid fa-box-open"></i>
          <span>
            {t('order_package_items', 'অর্ডারের পণ্যসমূহ')} ({items.length}{' '}
            {t('items_count_label', 'টি পণ্য')})
          </span>
        </div>
        {isDelivered && (
          <span className="verified-badge">
            <i className="fa-solid fa-shield-check text-emerald-600"></i> {t('track_verified_parcel', 'ভেরিফাইড পার্সেল')}
          </span>
        )}
      </div>

      <div className="items-list-grid">
        {items.map((it: any) => {
          const itImg =
            it.imageUrl ||
            it.product?.images?.[0]?.imageUrl ||
            it.product?.images?.[0]?.thumbnailUrl ||
            it.product?.imageUrl ||
            '/images/no-image.svg';

          const displayColor = parseDisplayColor(it.colour);
          const isReviewed = reviewedProductIds.includes(it.productId) || reviewedProductIds.includes(it.id);

          return (
            <div key={it.id} className="item-detail-card">
              <div className="item-img-wrap">
                <img
                  src={itImg}
                  alt={it.productName}
                  className="item-thumbnail"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/no-image.svg';
                  }}
                />
              </div>

              <div className="item-content-body">
                <h4 className="item-title">{it.productName}</h4>
                <div className="item-specs-wrap">
                  {it.sizeName && <span className="spec-pill size-pill">{it.sizeName}</span>}
                  {displayColor && <span className="spec-pill color-pill">{displayColor}</span>}
                  <span className="spec-qty">
                    {t('order_label_quantity', 'পরিমাণ:')} <strong>{formatNum(it.quantity)}</strong>
                  </span>
                </div>
              </div>

              <div className="item-price-actions">
                <div className="item-price-tag">
                  <span className="price-curr">{currency}</span>
                  <span className="price-val">{formatNum(it.totalPrice || it.price * it.quantity)}</span>
                </div>

                {isDelivered &&
                  (isReviewed ? (
                    <span className="reviewed-badge">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>{t('track_reviewed_badge', 'রিভিউ জমা হয়েছে')}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(it)}
                      className="btn-item-review"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{t('track_btn_review', 'রিভিউ দিন')}</span>
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
