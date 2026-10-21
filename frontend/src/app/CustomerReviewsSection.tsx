'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface CustomerReviewsSectionProps {
  reviews: any[];
}

export const CustomerReviewsSection = React.memo(function CustomerReviewsSection({ reviews }: CustomerReviewsSectionProps) {
  const { t } = useLanguage();

  // If there are no reviews from the database (or no featured reviews selected), do not show the section on the home page
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section
      className="home-section home-reviews-section"
      id="customer-reviews"
      aria-label={t('home_reviews_title', 'গ্রাহকদের রিভিউ')}
    >
      <div className="container">
        <div className="home-section-head text-center">
          <div className="home-section-badge badge-gold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{t('home_reviews_rating_badge', '৪.৯ / ৫.০ স্টার রেটিং')}</span>
          </div>
          <h2 className="home-section-title">{t('home_reviews_title', 'আমাদের সম্মানিত গ্রাহকদের মতামত')}</h2>
          <p className="home-section-sub">
            {t('home_reviews_sub', 'সারা দেশের শত শত পরিবারের ভালোবাসায় সাজানো অভিজ্ঞতা')}
          </p>
        </div>

        <div className="home-reviews-grid">
          {reviews.map((rev) => (
            <article key={rev.id} className="home-review-card">
              <div className="home-review-card-top">
                <div className="flex items-center gap-0.5" aria-label={`${rev.rating || 5} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (rev.rating || 5)
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-100 text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="verified-buyer-badge">
                  <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                  {t('review_verified_buyer', 'ভেরিফাইড ক্রেতা')}
                </span>
              </div>

              <blockquote className="home-review-quote">
                "{rev.reviewText || rev.review_text}"
              </blockquote>

              <div className="home-review-footer">
                <div className="home-review-author-avatar">
                  <span>{(rev.customerName || rev.customer_name || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="home-review-author-info">
                  <strong className="home-review-author-name">
                    {rev.customerName || rev.customer_name}
                  </strong>
                  {(rev.location || rev.product?.name) && (
                    <span className="home-review-location">
                      <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                      {rev.location || rev.product?.name}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="home-reviews-trust-strip">
          <div className="trust-strip-item">
            <i className="fa-solid fa-shield-halved text-accent" aria-hidden="true"></i>
            <div>
              <strong>{t('trust_real_reviews', '১০০% আসল ও ভেরিফাইড রিভিউ')}</strong>
              <span>{t('trust_real_reviews_sub', 'কেবলমাত্র প্রকৃত ক্রেতাদের অভিজ্ঞতা')}</span>
            </div>
          </div>
          <div className="trust-strip-item">
            <i className="fa-solid fa-box-open text-accent" aria-hidden="true"></i>
            <div>
              <strong>{t('trust_cod_inspect', 'পণ্য দেখে মূল্য পরিশোধ')}</strong>
              <span>{t('trust_cod_inspect_sub', '১০০% ক্যাশ অন ডেলিভারি সুরক্ষা')}</span>
            </div>
          </div>
          <div className="trust-strip-item">
            <i className="fa-solid fa-rotate-left text-accent" aria-hidden="true"></i>
            <div>
              <strong>{t('trust_replacement', '৭ দিনের ফ্রি রিপ্লেসমেন্ট')}</strong>
              <span>{t('trust_replacement_sub', 'ডেলিভারিতে ক্ষতি হলে তাৎক্ষণিক সমাধান')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
