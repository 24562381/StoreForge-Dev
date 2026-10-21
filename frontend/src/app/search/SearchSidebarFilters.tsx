'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { PriceRangeSlider } from './PriceRangeSlider';

interface SearchSidebarFiltersProps {
  mobileExpanded: boolean;
  setMobileExpanded: (val: boolean) => void;
  activeFilterCount: number;
  q: string;
  setQ: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: any[];
  size: string;
  setSize: (val: string) => void;
  sizes: string[];
  color: string;
  setColor: (val: string) => void;
  colors: string[];
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  boundMin: number;
  boundMax: number;
  selMin: number;
  selMax: number;
  sort: string;
  setSort: (val: string) => void;
  currency: string;
  onSubmit: (e: React.FormEvent) => void;
  onReset: (e: React.MouseEvent) => void;
}

export const SearchSidebarFilters = React.memo(function SearchSidebarFilters({
  mobileExpanded,
  setMobileExpanded,
  activeFilterCount,
  q,
  setQ,
  category,
  setCategory,
  categories,
  size,
  setSize,
  sizes,
  color,
  setColor,
  colors,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  boundMin,
  boundMax,
  selMin,
  selMax,
  sort,
  setSort,
  currency,
  onSubmit,
  onReset,
}: SearchSidebarFiltersProps) {
  const { lang, t, formatNum } = useLanguage();

  return (
    <aside className="search-sidebar" aria-label={t('search_filters_heading', 'Filters')}>
      <form
        className={`catalog-filters ${mobileExpanded ? 'is-expanded' : ''}`}
        onSubmit={onSubmit}
      >
        {/* Search Query Input Row: Always visible on both mobile and desktop */}
        <div className="search-query-row">
          <label htmlFor="filterSearchInput" className="filter-label search-field-label">
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>{t('search_query_label', 'Search')}</span>
          </label>
          <div className="search-input-action-group">
            <div className="filter-input-wrap search-input-flex-wrap">
              <input
                type="search"
                id="filterSearchInput"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('search_query_placeholder', 'Name or description')}
                className="filter-input"
              />
            </div>
            {/* Search Submit Button - Visible on Mobile, Hidden on Desktop */}
            <button
              type="submit"
              className="search-mobile-submit-btn"
              title={t('search_action', lang === 'bn' ? 'অনুসন্ধান করুন' : 'Search')}
              aria-label={t('search_action', lang === 'bn' ? 'অনুসন্ধান করুন' : 'Search')}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>{t('search_submit_button', lang === 'bn' ? 'অনুসন্ধান' : 'Search')}</span>
            </button>
          </div>
        </div>

        {/* Filter Title / Mobile Toggle Header */}
        <button
          type="button"
          className="filter-sidebar-title"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          aria-expanded={mobileExpanded}
        >
          <div className="filter-title-left">
            <i className="fa-solid fa-sliders"></i>
            <span>{t('search_filters_heading', lang === 'bn' ? 'ফিল্টার' : 'Filters')}</span>
          </div>
          <div className="filter-title-right">
            {activeFilterCount > 0 && (
              <span
                className="filter-active-pill"
                title={`${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''} applied`}
              >
                {formatNum(activeFilterCount)}{' '}
                {t('search_filter_active_count', lang === 'bn' ? 'টি সক্রিয়' : 'active')}
              </span>
            )}
            <span className="filter-mobile-chevron" aria-hidden="true">
              <i className="fa-solid fa-chevron-down"></i>
            </span>
          </div>
        </button>

        {/* Filter Body Controls */}
        <div className="filter-collapse-body">

          {/* Category Select */}
          <div className="filter-field">
            <label htmlFor="filterCategorySelect" className="filter-label">
              <i className="fa-solid fa-layer-group"></i>
              <span>{t('search_category_label', 'Category')}</span>
            </label>
            <div className="filter-select-wrap">
              <select
                id="filterCategorySelect"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">{t('search_all_categories', 'All categories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {t(`category_${cat.slug}`, cat.name)}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-chevron" aria-hidden="true"></i>
            </div>
          </div>

          {/* Size Select */}
          <div className="filter-field">
            <label htmlFor="filterSizeSelect" className="filter-label">
              <i className="fa-solid fa-ruler-combined"></i>
              <span>{t('search_size_label', 'Size')}</span>
            </label>
            <div className="filter-select-wrap">
              <select
                id="filterSizeSelect"
                name="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="filter-select"
              >
                <option value="">{t('search_all_sizes', 'All sizes')}</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-chevron" aria-hidden="true"></i>
            </div>
          </div>

          {/* Color Select */}
          <div className="filter-field">
            <label htmlFor="filterColorSelect" className="filter-label">
              <i className="fa-solid fa-palette"></i>
              <span>{t('search_color_label', 'Color')}</span>
            </label>
            <div className="filter-select-wrap">
              <select
                id="filterColorSelect"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="filter-select"
              >
                <option value="">{t('search_all_colors', 'All colors')}</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-chevron" aria-hidden="true"></i>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-field filter-price-field">
            <label className="filter-label">
              <i className="fa-solid fa-tag"></i>
              <span>{t('search_price_heading', 'Price Range')}</span>
            </label>

            <div className="filter-price-group" id="priceFilterGroup">
              {/* Number Input Boxes */}
              <div className="filter-price-row">
                <div className="price-input-box">
                  <span className="price-input-tag">{t('search_min_price', 'Min price')}</span>
                  <div className="price-input-inner">
                    <span className="currency-symbol">{currency}</span>
                    <input
                      type="number"
                      name="min_price"
                      id="priceInputMin"
                      min="0"
                      step="1"
                      placeholder={String(boundMin)}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="filter-input price-num-input"
                      aria-label={t('search_min_price', 'Min price')}
                    />
                  </div>
                </div>

                <div className="price-separator">—</div>

                <div className="price-input-box">
                  <span className="price-input-tag">{t('search_max_price', 'Max price')}</span>
                  <div className="price-input-inner">
                    <span className="currency-symbol">{currency}</span>
                    <input
                      type="number"
                      name="max_price"
                      id="priceInputMax"
                      min="0"
                      step="1"
                      placeholder={String(boundMax)}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="filter-input price-num-input"
                      aria-label={t('search_max_price', 'Max price')}
                    />
                  </div>
                </div>
              </div>

              {/* Dual-Thumb Range Slider */}
              <PriceRangeSlider
                min={boundMin}
                max={boundMax}
                valueMin={selMin}
                valueMax={selMax}
                currency={currency}
                formatNum={formatNum}
                onChange={(newMin, newMax) => {
                  setMinPrice(newMin <= boundMin ? '' : String(newMin));
                  setMaxPrice(newMax >= boundMax ? '' : String(newMax));
                }}
              />
            </div>
          </div>

          {/* Sort By Select */}
          <div className="filter-field">
            <label htmlFor="filterSortSelect" className="filter-label">
              <i className="fa-solid fa-arrow-down-wide-short"></i>
              <span>{t('search_sort_label', 'Sort by')}</span>
            </label>
            <div className="filter-select-wrap">
              <select
                id="filterSortSelect"
                name="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="filter-select"
              >
                <option value="newest">
                  {t('search_sort_newest', lang === 'bn' ? 'নতুন সংযোজন' : 'Newest')}
                </option>
                <option value="price_asc">
                  {t(
                    'search_sort_price_low',
                    lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: low to high',
                  )}
                </option>
                <option value="price_desc">
                  {t(
                    'search_sort_price_high',
                    lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: high to low',
                  )}
                </option>
                <option value="name">
                  {t('search_sort_name', lang === 'bn' ? 'নাম অনুসারে' : 'Name')}
                </option>
              </select>
              <i className="fa-solid fa-chevron-down select-chevron" aria-hidden="true"></i>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="btn btn-primary filter-submit-btn" type="submit">
              <i className="fa-solid fa-sliders"></i>
              <span>
                {t('search_apply', lang === 'bn' ? 'ফিল্টার প্রয়োগ করুন' : 'Apply filters')}
              </span>
            </button>
            <a href="/search" onClick={onReset} className="filter-reset-btn">
              <i className="fa-solid fa-rotate-left"></i>
              <span>{t('search_reset', lang === 'bn' ? 'রিসেট করুন' : 'Reset')}</span>
            </a>
          </div>
        </div>
      </form>
    </aside>
  );
});
