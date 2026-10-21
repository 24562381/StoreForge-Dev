'use client';

import React from 'react';
import { useLanguage } from '../../../lib/LanguageContext';
import { StoreGuaranteeBadges } from './StoreGuaranteeBadges';
import { ProductWarningCard } from './ProductWarningCard';

interface ProductGallerySectionProps {
  images: any[];
  currentImage: any;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  discountPct: number;
  translatedName: string;
  warningText?: string;
}

export const ProductGallerySection = React.memo(function ProductGallerySection({
  images,
  currentImage,
  selectedImageIndex,
  setSelectedImageIndex,
  discountPct,
  translatedName,
  warningText,
}: ProductGallerySectionProps) {
  const { t } = useLanguage();

  return (
    <div className="details-gallery-column">
      <div className="gallery-sticky-wrapper">
        <div className="gallery-main-viewport" id="galleryMainViewport">
          <div className="gallery-badges-overlay">
            {discountPct > 0 && (
              <span className="badge-discount" id="galleryDiscountBadge">
                <i className="fa-solid fa-tag"></i> -{discountPct}% OFF
              </span>
            )}
            <span className="badge-stock-floating badge-in" id="galleryStockBadge">
              <i className="fa-solid fa-circle-check"></i>
              <span>{t('product_in_stock', 'In Stock')}</span>
            </span>
          </div>

          <div className="main-image-container" id="mainImageContainer">
            <img
              className="details-main-image"
              id="detailsMainImage"
              src={currentImage?.imageUrl || currentImage?.image_url || '/images/no-image.svg'}
              alt={currentImage?.altText || translatedName || 'Product image'}
              onError={(e) => {
                e.currentTarget.src = '/images/no-image.svg';
              }}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-nav-btn gallery-prev"
                onClick={() =>
                  setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
                }
                aria-label="Previous Image"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="gallery-nav-btn gallery-next"
                onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                aria-label="Next Image"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        {Array.isArray(images) && images.length > 1 && (
          <div className="details-thumbnails-strip" id="thumbnailsStrip" role="tablist">
            {images.map((img: any, idx: number) => (
              <button
                key={img?.id || idx}
                type="button"
                className={`details-thumb ${idx === selectedImageIndex ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={img?.title || 'Product thumb'}
              >
                <img
                  src={img?.thumbnailUrl || img?.imageUrl || img?.image_url || '/images/no-image.svg'}
                  alt={img?.altText || translatedName || 'Product thumb'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/no-image.svg';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Store Guarantee Badges (Desktop Only) */}
        <StoreGuaranteeBadges className="store-guarantees-desktop" />

        {/* Warning / Craftsmanship Notice Under Badges (Desktop) */}
        <ProductWarningCard warningText={warningText} className="product-warning-desktop" />
      </div>
    </div>
  );
});
