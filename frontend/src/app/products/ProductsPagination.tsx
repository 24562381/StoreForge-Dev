'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/LanguageContext';

interface ProductsPaginationProps {
  page: number;
  totalPages: number;
  paginationPages: number[];
  getPageUrl: (page: number) => string;
}

export const ProductsPagination = React.memo(function ProductsPagination({
  page,
  totalPages,
  paginationPages,
  getPageUrl,
}: ProductsPaginationProps) {
  const { t, formatNum } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <nav className="products-pagination-nav" aria-label="Products pagination">
      <ul className="products-pagination">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          {page > 1 ? (
            <Link href={getPageUrl(page - 1)} className="page-link prev-link">
              <i className="fa-solid fa-chevron-left"></i>
              <span>{t('prev_page', 'Previous')}</span>
            </Link>
          ) : (
            <span className="page-link prev-link disabled">
              <i className="fa-solid fa-chevron-left"></i>
              <span>{t('prev_page', 'Previous')}</span>
            </span>
          )}
        </li>

        {paginationPages.map((p) => {
          const isCurrent = p === page;
          return (
            <li key={p} className={`page-item ${isCurrent ? 'active' : ''}`}>
              {isCurrent ? (
                <span className="page-link current-page">{formatNum(p)}</span>
              ) : (
                <Link href={getPageUrl(p)} className="page-link">
                  {formatNum(p)}
                </Link>
              )}
            </li>
          );
        })}

        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          {page < totalPages ? (
            <Link href={getPageUrl(page + 1)} className="page-link next-link">
              <span>{t('next_page', 'Next')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          ) : (
            <span className="page-link next-link disabled">
              <span>{t('next_page', 'Next')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
});
