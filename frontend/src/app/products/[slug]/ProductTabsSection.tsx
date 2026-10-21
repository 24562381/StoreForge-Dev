'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

interface ProductTabsSectionProps {
  activeTab: 'Description' | 'Specifications' | 'Features' | 'Reviews' | 'Shipping';
  setActiveTab: (tab: 'Description' | 'Specifications' | 'Features' | 'Reviews' | 'Shipping') => void;
  features?: any[];
  slug?: string;
  translatedFullDesc: string;
  variants: any[];
  selectedColor: any;
  currency: string;
  colorAdjustment: number;
  totalReviewsCount: number;
  avgRating: string;
  ratingBreakdown: Array<{ star: number; count: number; percentage: number }>;
  reviews: any[];
  reviewName: string;
  setReviewName: (val: string) => void;
  reviewOrderNumber: string;
  setReviewOrderNumber: (val: string) => void;
  reviewPhone: string;
  setReviewPhone: (val: string) => void;
  reviewSecretToken: string;
  setReviewSecretToken: (val: string) => void;
  reviewRating: number;
  setReviewRating: (val: number) => void;
  hoverRating: number | null;
  setHoverRating: (val: number | null) => void;
  reviewText: string;
  setReviewText: (val: string) => void;
  submittingReview: boolean;
  reviewSuccess: string | null;
  reviewError: string | null;
  onReviewSubmit: (e: React.FormEvent) => void;
  ratingTexts: Record<number, string>;
}

const getFeatureIconClass = (icon?: string) => {
  switch (icon) {
    case 'feather':
      return 'fa-solid fa-feather-pointed';
    case 'layers':
      return 'fa-solid fa-layer-group';
    case 'compass':
      return 'fa-solid fa-compass-drafting';
    case 'shield':
      return 'fa-solid fa-shield-halved';
    case 'sparkles':
      return 'fa-solid fa-wand-magic-sparkles';
    case 'check':
      return 'fa-solid fa-circle-check';
    default:
      return 'fa-solid fa-award';
  }
};

export const ProductTabsSection = React.memo(function ProductTabsSection({
  activeTab,
  setActiveTab,
  features = [],
  slug = '',
  translatedFullDesc,
  variants,
  selectedColor,
  currency,
  colorAdjustment,
  totalReviewsCount,
  avgRating,
  ratingBreakdown,
  reviews,
  reviewName,
  setReviewName,
  reviewOrderNumber,
  setReviewOrderNumber,
  reviewPhone,
  setReviewPhone,
  reviewSecretToken,
  setReviewSecretToken,
  reviewRating,
  setReviewRating,
  hoverRating,
  setHoverRating,
  reviewText,
  setReviewText,
  submittingReview,
  reviewSuccess,
  reviewError,
  onReviewSubmit,
  ratingTexts,
}: ProductTabsSectionProps) {
  const { lang, t, formatNum } = useLanguage();

  return (
    <section className="details-tabs-section mt-5" id="productTabsSection">
      <div className="details-tabs-nav">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'Description' ? 'active' : ''}`}
          onClick={() => setActiveTab('Description')}
          title={t('tab_description', 'বিস্তারিত বিবরণ')}
          aria-label={t('tab_description', 'বিস্তারিত বিবরণ')}
        >
          <i className="fa-solid fa-align-left me-1.5"></i>
          <span>{t('tab_description', 'বিস্তারিত বিবরণ')}</span>
        </button>

        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'Specifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('Specifications')}
          title={t('tab_specifications', 'সাইজ ও স্পেসিফিকেশন')}
          aria-label={t('tab_specifications', 'সাইজ ও স্পেসিফিকেশন')}
        >
          <i className="fa-solid fa-table-list me-1.5"></i>
          <span>{t('tab_specifications', 'সাইজ ও স্পেসিফিকেশন')}</span>
        </button>

        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'Reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('Reviews')}
          title={`${t('tab_reviews', 'গ্রাহকদের রিভিউ')} (${totalReviewsCount})`}
          aria-label={`${t('tab_reviews', 'গ্রাহকদের রিভিউ')} (${totalReviewsCount})`}
        >
          <i className="fa-solid fa-star me-1.5"></i>
          <span>
            {t('tab_reviews', 'গ্রাহকদের রিভিউ')} ({totalReviewsCount})
          </span>
        </button>

        {Array.isArray(features) && features.length > 0 && (
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'Features' ? 'active' : ''}`}
            onClick={() => setActiveTab('Features')}
            title={t('tab_features', lang === 'bn' ? 'প্রধান বৈশিষ্ট্যসমূহ' : 'Key Highlights')}
            aria-label={t('tab_features', lang === 'bn' ? 'প্রধান বৈশিষ্ট্যসমূহ' : 'Key Highlights')}
          >
            <i className="fa-solid fa-wand-magic-sparkles me-1.5"></i>
            <span>
              {t('tab_features', lang === 'bn' ? 'প্রধান বৈশিষ্ট্যসমূহ' : 'Key Highlights')}
            </span>
          </button>
        )}

        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'Shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('Shipping')}
          title={t('tab_shipping', 'শিপিং ও ডেলিভারি')}
          aria-label={t('tab_shipping', 'শিপিং ও ডেলিভারি')}
        >
          <i className="fa-solid fa-box-open me-1.5"></i>
          <span>{t('tab_shipping', 'শিপিং ও ডেলিভারি')}</span>
        </button>
      </div>

      <div className="tab-content py-4">
        {/* TAB 1: Description */}
        {activeTab === 'Description' && (
          <div className="tab-pane active">
            <div className="tab-pane-inner">
              <div
                className="prose text-stone-700 leading-relaxed prose-rich-content tiptap-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(translatedFullDesc) }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Specifications Matrix */}
        {activeTab === 'Specifications' && (
          <div className="tab-pane active">
            <div className="tab-pane-inner">
              <div className="spec-table-wrapper overflow-x-auto">
                <table className="spec-table w-full">
                  <thead>
                    <tr>
                      <th>{t('spec_size', 'সাইজ')}</th>
                      <th>{t('spec_dimensions', 'ডাইমেনশন (দৈর্ঘ্য x প্রস্থ)')}</th>
                      <th>{t('spec_finish', 'কালার / ফিনিশ')}</th>
                      <th>{t('spec_price', 'মূল্য')}</th>
                      <th>{t('spec_status', 'স্টক স্ট্যাটাস')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v: any) => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.sizeName || 'Standard'}</strong>
                        </td>
                        <td>{v.dimensions || '—'}</td>
                        <td>
                          {selectedColor ? (
                            <span className="table-color-chip flex items-center gap-1.5">
                              <span
                                className="mini-swatch inline-block w-3.5 h-3.5 rounded-full border"
                                style={{ backgroundColor: selectedColor.colourHex || '#8e5a35' }}
                              />
                              {selectedColor.name}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong>
                            {currency} {formatNum(Number(v.price) + colorAdjustment)}
                          </strong>
                          {v.originalPrice && Number(v.originalPrice) > Number(v.price) && (
                            <del className="table-orig-price ms-2 text-stone-400 text-xs">
                              {currency} {formatNum(Number(v.originalPrice) + colorAdjustment)}
                            </del>
                          )}
                        </td>
                        <td>
                          <span className="status-badge status-in text-emerald-700 font-bold text-xs">
                            {t('product_in_stock', 'ইন স্টক')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Reviews & Write Review Form */}
        {activeTab === 'Reviews' && (
          <div className="tab-pane active" id="Reviews">
            <div className="tab-pane-inner">
              <div className="reviews-dashboard-grid">
                {/* Reviews Summary Card */}
                <div className="reviews-summary-card">
                  <div className="summary-score-large">{avgRating}</div>
                  <div className="summary-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i
                        key={i}
                        className={`fa-${i <= Math.round(Number(avgRating)) ? 'solid' : 'regular'} fa-star`}
                      ></i>
                    ))}
                  </div>
                  <p className="summary-count-text">
                    Based on {totalReviewsCount} verified customer{' '}
                    {totalReviewsCount === 1 ? 'review' : 'reviews'}
                  </p>

                  {/* Rating Progress Breakdown */}
                  <div className="rating-bars-list">
                    {ratingBreakdown.map((rb) => (
                      <div key={rb.star} className="rating-bar-row">
                        <span className="bar-label">
                          {rb.star} <i className="fa-solid fa-star"></i>
                        </span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${rb.percentage}%` }} />
                        </div>
                        <span className="bar-count">{rb.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews Stream & Add Review Form */}
                <div className="reviews-main-area">
                  {reviews.length > 0 ? (
                    <div className="reviews-stream">
                      {reviews.map((rev: any) => (
                        <div key={rev.id} className="customer-review-card">
                          <div className="review-card-header">
                            <div className="reviewer-avatar">
                              {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="reviewer-details">
                              <div className="reviewer-name-row">
                                <strong>{rev.customerName}</strong>
                                <span className="verified-buyer-badge">
                                  <i className="fa-solid fa-circle-check"></i>{' '}
                                  {t('review_verified_buyer', 'Verified Buyer')}
                                </span>
                              </div>
                              {rev.location && (
                                <span className="reviewer-location">
                                  <i className="fa-solid fa-location-dot"></i> {rev.location}
                                </span>
                              )}
                            </div>
                            <div className="review-stars-gold">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <i
                                  key={s}
                                  className={`fa-${s <= (rev.rating || 5) ? 'solid' : 'regular'} fa-star`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="review-body-text">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-reviews-box">
                      <i className="fa-solid fa-comment-dots"></i>
                      <p>
                        {t(
                          'review_no_reviews_desc',
                          'এখনও কোনো কাস্টমার রিভিউ নেই। আপনার অভিজ্ঞতা সবার সাথে শেয়ার করুন!',
                        )}
                      </p>
                    </div>
                  )}

                  {/* Write a Review Form Card */}
                  <div className="add-review-card">
                    <h4 className="form-title">
                      <i className="fa-solid fa-pen-to-square"></i>
                      {t('heading_write_review', 'আপনার মতামত ও রিভিউ লিখুন')}
                    </h4>

                    {reviewSuccess && (
                      <div className="alert alert-success">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{reviewSuccess}</span>
                      </div>
                    )}

                    {reviewError && (
                      <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{reviewError}</span>
                      </div>
                    )}

                    <form className="review-submission-form" onSubmit={onReviewSubmit}>
                      <div className="form-grid-2">
                        {/* Row 1, Col 1: Full Name */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="reviewCustomerName">
                            <i className="fa-solid fa-user me-1.5"></i>
                            {t('order_label_fullname', 'আপনার পূর্ণ নাম')} <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="reviewCustomerName"
                            className="form-control"
                            placeholder={t('review_placeholder_name', 'আপনার নাম লিখুন')}
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            required
                          />
                        </div>

                        {/* Row 1, Col 2: Order Number */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="reviewOrderNumber">
                            <i className="fa-solid fa-receipt me-1.5"></i>
                            {t('review_label_ordernum', 'অর্ডার নাম্বার')} <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="reviewOrderNumber"
                            className="form-control"
                            placeholder={t('review_placeholder_ordernum', 'যেমন: WM-1001')}
                            value={reviewOrderNumber}
                            onChange={(e) => setReviewOrderNumber(e.target.value)}
                            required
                          />
                          <small className="form-hint">
                            {t(
                              'review_hint_order_required',
                              'ইনভয়েস বা কনফার্মেশন মেসেজে থাকা অর্ডার নম্বর দিন',
                            )}
                          </small>
                        </div>

                        {/* Row 2, Col 1: Mobile Number */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="reviewPhone">
                            <i className="fa-solid fa-phone me-1.5"></i>
                            {t('review_label_phone_req', 'মোবাইল নম্বর (১১ ডিজিট)')} <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="reviewPhone"
                            className="form-control"
                            placeholder={t('review_placeholder_phone_req', 'যেমন: 01700000000')}
                            value={reviewPhone}
                            onChange={(e) => setReviewPhone(e.target.value)}
                            required
                          />
                          <small className="form-hint">
                            {t('review_hint_phone_required', 'অর্ডারে ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বর দিন')}
                          </small>
                        </div>

                        {/* Row 2, Col 2: Secret Token */}
                        <div className="form-group">
                          <label className="form-label" htmlFor="reviewSecretToken">
                            <i className="fa-solid fa-key me-1.5"></i>
                            {t('review_label_secret_token', 'সিক্রেট টোকেন')} <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="reviewSecretToken"
                            className="form-control"
                            placeholder={t('review_placeholder_secret_token', 'যেমন: a1b2c3d4')}
                            value={reviewSecretToken}
                            onChange={(e) => setReviewSecretToken(e.target.value)}
                            required
                          />
                          <small className="form-hint">
                            {t('review_hint_secret_token', 'অর্ডার রসিদ বা ট্র্যাকিং পেজে থাকা সিক্রেট টোকেন দিন')}
                          </small>
                        </div>
                      </div>

                      {/* Interactive Star Rating Selector */}
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fa-solid fa-star me-1.5"></i>
                          {t('track_rating_label', 'রেটিং নির্বাচন করুন')} <span className="required">*</span>
                        </label>
                        <div className="star-rating-picker">
                          <div className="stars-row" onMouseLeave={() => setHoverRating(null)}>
                            {[1, 2, 3, 4, 5].map((s) => {
                              const isFilled =
                                hoverRating !== null ? hoverRating >= s : reviewRating >= s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  className={`star-btn ${isFilled ? 'active' : ''}`}
                                  data-value={s}
                                  onMouseEnter={() => setHoverRating(s)}
                                  onClick={() => setReviewRating(s)}
                                  aria-label={`${s} Stars`}
                                >
                                  <i className="fa-solid fa-star"></i>
                                </button>
                              );
                            })}
                          </div>
                          <span className="star-rating-text">
                            {'★'.repeat(hoverRating || reviewRating)} (
                            {formatNum(hoverRating || reviewRating)}/{formatNum(5)} —{' '}
                            {ratingTexts[hoverRating || reviewRating] || ''})
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reviewText">
                          <i className="fa-solid fa-comment-dots me-1.5"></i>
                          {t('track_review_text_label', 'আপনার মতামত লিখুন')}{' '}
                          <span className="required">*</span>
                        </label>
                        <textarea
                          id="reviewText"
                          rows={4}
                          className="form-control"
                          placeholder={t(
                            'track_review_text_placeholder',
                            'পণ্যটির গুণগত মান, ফিনিশিং এবং ডেলিভারি নিয়ে আপনার বাস্তব অভিজ্ঞতা লিখুন...',
                          )}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn btn-primary submit-review-btn"
                      >
                        <span className="btn-text">
                          <i className="fa-solid fa-paper-plane me-2"></i>
                          {submittingReview
                            ? t('track_btn_submitting', 'জমা দেওয়া হচ্ছে...')
                            : t('track_btn_submit_review', 'রিভিউ জমা দিন')}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Key Highlights & Bullet Specs */}
        {activeTab === 'Features' && Array.isArray(features) && features.length > 0 && (
          <div className="tab-pane active" id="Features">
            <div className="tab-pane-inner space-y-6">
              <div className="features-highlight-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f: any, idx: number) => {
                  const featureTitle = t(`product.${slug}.feature.${idx}.title`, f.title || '');
                  const featureDesc = t(`product.${slug}.feature.${idx}.desc`, f.description || '');
                  return (
                    <div
                      key={f.id || idx}
                      className="feature-card p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-[#8e5a35]/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#8e5a35] border border-amber-200/60 flex items-center justify-center text-lg shadow-2xs">
                            <i className={getFeatureIconClass(f.icon)}></i>
                          </div>
                          <span className="text-[10px] font-bold tracking-wider text-amber-900/60 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/50 uppercase">
                            0{idx + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 leading-snug">
                            {featureTitle}
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed mt-2">
                            {featureDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Shipping, Delivery & Care Guidelines */}
        {activeTab === 'Shipping' && (
          <div className="tab-pane active">
            <div className="tab-pane-inner space-y-6">
              <div className="shipping-info-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="shipping-card p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-truck-fast"></i>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {t('shipping_tab_delivery_title', 'এক্সপ্রেস ডেলিভারি টাইম')}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {t(
                      'shipping_tab_delivery_desc',
                      'ঢাকার ভিতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে পৌঁছে দেওয়া হবে।',
                    )}
                  </p>
                </div>

                <div className="shipping-card p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-box-archive"></i>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {t('shipping_tab_pkg_title', 'নিরাপদ মাল্টি-লেয়ার প্যাকেজিং')}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {t(
                      'shipping_tab_pkg_desc',
                      'প্রতিটি কাঠের টুকরো ভ্যাকুয়াম সিল করা বাবল র্যাপ ও কর্নার প্রোটেক্টর দিয়ে সুরক্ষিত বক্সে প্যাক করা হয় যাতে ১০০% অক্ষতভাবে পৌঁছায়।',
                    )}
                  </p>
                </div>

                <div className="shipping-card p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {t('shipping_tab_care_title', 'যত্ন ও রক্ষণাবেক্ষণ')}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {t(
                      'shipping_tab_care_desc',
                      'পরিষ্কার করার জন্য নরম শুকনো সুতি কাপড় ব্যবহার করুন। প্রাকৃতিক কাঠের উজ্জ্বলতা বজায় রাখতে সরাসরি ভেজা পানি বা ক্ষতিকর রাসায়নিক এড়িয়ে চলুন।',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
