'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface CategoryGridSectionProps {
  categories: any[];
  cardStyle?: 'capsule' | 'grid' | string;
}

export const CategoryGridSection = React.memo(function CategoryGridSection({
  categories,
  cardStyle = 'capsule',
}: CategoryGridSectionProps) {
  const { t, formatNum } = useLanguage();

  if (!categories || categories.length === 0) return null;

  const isCapsule = cardStyle !== 'grid'; // 'capsule' is the new default

  return (
    <section className="home-section home-categories-section pt-0 sm:pt-12" id="categories">
      <div className="container mx-auto px-4">
        <div className="home-section-head text-center mb-6 sm:mb-8">
          <h2 className="home-section-title text-2xl sm:text-3xl font-extrabold text-[#2C1810]">
            {t('home_categories_title', 'ক্যাটাগরি')}
          </h2>

          <p className="home-section-sub text-sm sm:text-base text-stone-500">
            {t('home_categories_sub', 'আপনার পছন্দের সংগ্রহ খুঁজে নিন')}
          </p>
        </div>

        {isCapsule ? (
          /* Modern Horizontal Capsule Style (New Default) */
          <div
            className="home-category-capsules flex flex-wrap items-stretch gap-3.5 sm:gap-4 w-full mx-auto"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '16px', width: '100%' }}
          >
            {categories.map((cat) => {
              const count = categories.length;
              const flexVal = count === 1 ? '1 1 100%' : count === 2 ? '1 1 calc(50% - 16px)' : count === 3 ? '1 1 calc(33.333% - 16px)' : '1 1 calc(25% - 16px)';
              return (
                <Link
                  key={cat.id}
                  className="home-category-capsule group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF6F0] border border-[#EADBCE] hover:border-[#C08A46]/70 shadow-[0_2px_8px_rgba(43,29,20,0.04)] hover:shadow-[0_8px_20px_rgba(43,29,20,0.08)] transition-all duration-200 cursor-pointer no-underline"
                  style={{
                    flex: flexVal,
                    width: count === 1 ? '100%' : 'auto',
                    minWidth: count === 1 ? '100%' : '220px',
                    maxWidth: '100%',
                  }}
                  href={`/search?category=${encodeURIComponent(cat.slug)}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="home-category-capsule-icon w-11 h-11 min-w-[44px] rounded-xl bg-[#FAF3EB] border border-[#E8DEC8] flex items-center justify-center overflow-hidden text-[#8E5A35] shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/no-image.svg';
                          }}
                        />
                      ) : (
                        <Layers className="w-5 h-5 text-[#8E5A35]" />
                      )}
                    </span>
                    <div className="home-category-capsule-info flex flex-col min-w-0">
                      <span className="home-category-capsule-title text-sm sm:text-base font-bold text-[#2C1810] group-hover:text-[#8E5A35] transition-colors truncate">
                        {t(`category.${cat.slug}.name`, t(`category_${cat.slug}`, cat.name))}
                      </span>
                      <span className="home-category-capsule-count text-xs text-[#7E6E62] mt-0.5 font-medium truncate">
                        {formatNum(cat._count?.products || 1)} {t('home_category_items', 'টি পণ্য')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="home-category-capsule-badge px-2.5 py-0.5 rounded-full bg-[#FAF3EB] border border-[#E8DEC8]/80 text-[#8E5A35] text-xs font-semibold">
                      {formatNum(cat._count?.products || 1)}
                    </span>
                    <span className="home-category-capsule-chevron text-[#C5B7A8] group-hover:text-[#8E5A35] group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Classic Vertical Card Style */
          <div className="home-category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                className="home-category-card"
                href={`/search?category=${encodeURIComponent(cat.slug)}`}
              >
                <span className="home-category-media">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/no-image.svg';
                      }}
                    />
                  ) : (
                    <i className="fa-solid fa-folder-open" aria-hidden="true"></i>
                  )}
                </span>
                <span className="home-category-name">{t(`category.${cat.slug}.name`, t(`category_${cat.slug}`, cat.name))}</span>
                <span className="home-category-count">
                  {formatNum(cat._count?.products || 1)} {t('home_category_items', 'টি পণ্য')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
