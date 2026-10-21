'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';

interface ProductsFilterToolbarProps {
  totalProducts: number;
  productsCount: number;
  priceRange: string;
  sort: string;
  hasActiveFilters: boolean;
  onUpdateParam: (name: string, value: string) => void;
  onReset: () => void;
}

export const ProductsFilterToolbar = React.memo(function ProductsFilterToolbar({
  totalProducts,
  productsCount,
  priceRange,
  sort,
  hasActiveFilters,
  onUpdateParam,
  onReset,
}: ProductsFilterToolbarProps) {
  const { t, formatNum } = useLanguage();

  return (
    <div className="products-section-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7 pb-4 border-b border-[#ece5dc]">
      {/* Title & Product Count Badge */}
      <div className="products-header-text flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full md:w-auto">
        <h2 className="products-catalog-title text-base sm:text-xl md:text-2xl font-extrabold text-[#203b35] m-0 leading-tight">
          <span>{t('all_products_heading', 'All Handcrafted Wooden Products')}</span>
        </h2>
        <span className="products-count-badge text-[11px] sm:text-xs font-bold text-[#8e5a35] bg-[#f5eee6] border border-[#ebdccf] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
          {formatNum(totalProducts || productsCount)} {t('search_results_count', 'products found')}
        </span>
      </div>

      {/* Two Dropdown Filters Toolbar + Reset Button (Always in One Row on Mobile) */}
      <div className="products-filter-toolbar flex items-end sm:items-center gap-2 sm:gap-3 flex-nowrap shrink-0 w-full md:w-auto">
        {/* 1. Price Filtering */}
        <div className="toolbar-filter-item flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 flex-1 sm:flex-initial min-w-0">
          <label htmlFor="filterPriceRange" className="toolbar-label text-xs font-bold text-[#4a514d] flex items-center gap-1.5 whitespace-nowrap truncate max-w-full">
            <i className="fa-solid fa-tag text-[#8e5a35] text-[0.8rem] shrink-0"></i>
            <span className="truncate">{t('filter_price_title', 'Price Range')}</span>
          </label>
          <div className="toolbar-select-wrap relative w-full sm:w-auto sm:min-w-[135px] sm:max-w-[175px] min-w-0">
            <select
              id="filterPriceRange"
              name="price_range"
              className="toolbar-select w-full min-h-[38px] py-1.5 pl-2 sm:pl-3 pr-6 sm:pr-7 border border-[#dcd5cc] rounded-lg bg-white text-[#202b26] text-xs sm:text-[0.84rem] font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#8e5a35] shadow-2xs hover:border-[#baa996] transition-all truncate"
              value={priceRange}
              onChange={(e) => onUpdateParam('price_range', e.target.value)}
            >
              <option value="">{t('all_prices', 'All Prices')}</option>
              <option value="under-2000">{t('price_under_2000', 'Under ৳2,000')}</option>
              <option value="2000-5000">{t('price_2000_5000', '৳ 2,000 - ৳ 5,000')}</option>
              <option value="5000-15000">{t('price_5000_15000', '৳ 5,000 - ৳ 15,000')}</option>
              <option value="above-15000">{t('price_above_15000', '৳ 15,000+')}</option>
            </select>
            <i className="fa-solid fa-chevron-down toolbar-chevron absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8e5a35] text-[0.7rem]" aria-hidden="true"></i>
          </div>
        </div>

        {/* 2. Sales / Popularity Filter */}
        <div className="toolbar-filter-item flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 flex-1 sm:flex-initial min-w-0">
          <label htmlFor="filterSort" className="toolbar-label text-xs font-bold text-[#4a514d] flex items-center gap-1.5 whitespace-nowrap truncate max-w-full">
            <i className="fa-solid fa-arrow-down-short-wide text-[#8e5a35] text-[0.8rem] shrink-0"></i>
            <span className="truncate">{t('filter_sort_title', 'Sort By')}</span>
          </label>
          <div className="toolbar-select-wrap relative w-full sm:w-auto sm:min-w-[135px] sm:max-w-[175px] min-w-0">
            <select
              id="filterSort"
              name="sort"
              className="toolbar-select w-full min-h-[38px] py-1.5 pl-2 sm:pl-3 pr-6 sm:pr-7 border border-[#dcd5cc] rounded-lg bg-white text-[#202b26] text-xs sm:text-[0.84rem] font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#8e5a35] shadow-2xs hover:border-[#baa996] transition-all truncate"
              value={sort}
              onChange={(e) => onUpdateParam('sort', e.target.value)}
            >
              <option value="popular">{t('sort_popular', 'Most Popular')}</option>
              <option value="best_selling">{t('sort_best_selling', 'Best Selling')}</option>
              <option value="trending">{t('sort_trending', 'Trending')}</option>
              <option value="newest">{t('sort_newest', 'Newest')}</option>
              <option value="top_rated">{t('sort_top_rated', 'Top Rated')}</option>
              <option value="price_asc">{t('sort_price_asc', 'Price: Low to High')}</option>
              <option value="price_desc">{t('sort_price_desc', 'Price: High to Low')}</option>
            </select>
            <i className="fa-solid fa-chevron-down toolbar-chevron absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8e5a35] text-[0.7rem]" aria-hidden="true"></i>
          </div>
        </div>

        {/* 3. Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="toolbar-reset-link inline-flex items-center justify-center gap-1 text-xs font-bold text-[#6a625b] hover:text-[#8e5a35] py-2 px-2.5 min-h-[38px] rounded-lg bg-[#f4ece2] hover:bg-[#ebdccf] border border-[#ebdccf] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            title={t('reset_filters', 'Reset')}
          >
            <i className="fa-solid fa-rotate-left text-[0.75rem]"></i>
            <span className="hidden sm:inline">{t('search_reset', 'Reset')}</span>
          </button>
        )}
      </div>
    </div>
  );
});
