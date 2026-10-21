'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, ArrowRight, Check, Sparkles, Wand2, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { CustomMapModal } from './CustomMapModal';

interface WorldMapFeaturedSectionProps {
  featuredProduct: any;
  settings: Record<string, string>;
}

export const WorldMapFeaturedSection = React.memo(function WorldMapFeaturedSection({
  featuredProduct,
  settings,
}: WorldMapFeaturedSectionProps) {
  const { lang, t, formatNum } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const currency = '৳';

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const isBn = lang === 'bn';

  // 1. Resolve Variants & Options
  const variants = featuredProduct?.variants || [];
  const defaultVar =
    variants.find((v: any) => v.isDefault) ||
    variants[0] ||
    {};

  const [selectedVariantId, setSelectedVariantId] = useState<number>(defaultVar.id || 1);
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || defaultVar;

  // Synchronize variant if prop changes
  useEffect(() => {
    if (defaultVar?.id && (!selectedVariantId || !variants.some((v: any) => v.id === selectedVariantId))) {
      setSelectedVariantId(defaultVar.id);
    }
  }, [defaultVar?.id, variants, selectedVariantId]);

  // 2. Resolve Colors
  const rawColors = featuredProduct?.colors || [];
  const availableVariantColorNames: string[] = useMemo(() => {
    const raw = selectedVariant?.colour;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      } catch {
        if (raw.includes(',')) {
          return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        return [raw.trim()].filter(Boolean);
      }
    }
    return [];
  }, [selectedVariant?.colour]);

  const displayedColors = useMemo(() => {
    if (rawColors.length > 0) {
      return availableVariantColorNames.length > 0
        ? rawColors.filter((c: any) => availableVariantColorNames.includes(c.name))
        : rawColors;
    }
    if (availableVariantColorNames.length > 0) {
      return availableVariantColorNames.map((name, i) => ({
        id: `var-col-${i}`,
        name,
        colourHex: selectedVariant?.colourHex || '#8E5A35',
        priceAdjustment: 0,
      }));
    }
    if (selectedVariant?.colour && typeof selectedVariant.colour === 'string') {
      return [
        {
          id: `var-col-${selectedVariant.id || 0}`,
          name: selectedVariant.colour,
          colourHex: selectedVariant.colourHex || '#8E5A35',
          priceAdjustment: 0,
        },
      ];
    }
    return [];
  }, [rawColors, availableVariantColorNames, selectedVariant?.colour, selectedVariant?.colourHex, selectedVariant?.id]);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const selectedColor = displayedColors[selectedColorIndex] || displayedColors[0] || null;

  // 3. Resolve Images & Gallery
  const primaryImg =
    (featuredProduct?.images || []).find((img: any) => img.isPrimary) ||
    (featuredProduct?.images || [])[0] ||
    { imageUrl: '/images/product-main.jpg', altText: 'Featured Product' };

  const initialHeroImg =
    settings?.featured_product_image ||
    primaryImg.imageUrl ||
    featuredProduct?.imageUrl ||
    '/images/product-main.jpg';

  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(initialHeroImg);

  // Synchronize active photo when initial hero image changes
  useEffect(() => {
    if (initialHeroImg) {
      setActivePhotoUrl(initialHeroImg);
    }
  }, [initialHeroImg]);

  const allImages: string[] = useMemo(() => {
    const list: string[] = [];
    if (settings.featured_product_image) {
      list.push(settings.featured_product_image);
    }
    (featuredProduct?.images || []).forEach((img: any) => {
      if (img.imageUrl && !list.includes(img.imageUrl)) {
        list.push(img.imageUrl);
      }
    });
    if (list.length === 0) {
      list.push(initialHeroImg);
    }
    return list;
  }, [featuredProduct?.images, settings.featured_product_image, initialHeroImg]);

  // 4. Admin Content & Bilingual Translations (No hardcoded strings)
  const sectionHeading = isBn
    ? (settings.featured_product_section_title_bn || settings.featured_product_section_title || t('home_featured_title', ''))
    : (settings.featured_product_section_title_en || settings.featured_product_section_title || t('home_featured_title', ''));

  const sectionSub = isBn
    ? (settings.featured_product_section_sub_bn || settings.featured_product_section_sub || settings.featured_product_section_subtitle || '')
    : (settings.featured_product_section_sub_en || settings.featured_product_section_sub || settings.featured_product_section_subtitle || '');

  const displayTitle = isBn
    ? (settings.featured_product_title_bn || settings.featured_product_title || (featuredProduct ? t(`product_${featuredProduct.id}_name`, featuredProduct.name) : ''))
    : (settings.featured_product_title_en || settings.featured_product_title || (featuredProduct ? t(`product_${featuredProduct.id}_name`, featuredProduct.name) : ''));

  const displayTagline = isBn
    ? (settings.featured_product_tagline_bn || settings.featured_product_tagline || featuredProduct?.subtitle || featuredProduct?.tagline || '')
    : (settings.featured_product_tagline_en || settings.featured_product_tagline || featuredProduct?.subtitle || featuredProduct?.tagline || '');

  const badgeLabel = isBn
    ? (settings.featured_product_badge_bn || settings.featured_product_badge || '')
    : (settings.featured_product_badge_en || settings.featured_product_badge || '');

  const priceNote = isBn
    ? (settings.featured_product_price_note_bn || settings.featured_product_price_note || '')
    : (settings.featured_product_price_note_en || settings.featured_product_price_note || '');

  // Short summary from product management page (under the Title in Col 2 Row 1)
  const shortSummary = isBn
    ? (featuredProduct?.shortDescriptionBn || featuredProduct?.shortDescription || featuredProduct?.short_description || '')
    : (featuredProduct?.shortDescriptionEn || featuredProduct?.shortDescription || featuredProduct?.short_description || '');

  // Custom description from Featured Product Management Page (Settings)
  const customDescBn = (settings.featured_product_description_bn || settings.featured_product_description || '').trim();
  const customDescEn = (settings.featured_product_description_en || settings.featured_product_description || '').trim();
  const customDesc = isBn ? (customDescBn || customDescEn) : (customDescEn || customDescBn);

  // Original product description from product management catalog
  const productDescBn = (featuredProduct?.fullDescriptionBn || featuredProduct?.fullDescription || featuredProduct?.full_description || featuredProduct?.description || '').trim();
  const productDescEn = (featuredProduct?.fullDescriptionEn || featuredProduct?.fullDescription || featuredProduct?.full_description || featuredProduct?.description || '').trim();
  const productOriginalDesc = isBn ? (productDescBn || productDescEn) : (productDescEn || productDescBn);

  // Priority: Custom description from Admin Panel -> Featured Product Management page FIRST.
  // Product's original description will only be shown if and only if custom description is not set.
  const hasCustomDesc = Boolean(customDesc && customDesc !== '<p></p>' && customDesc !== '<p><br></p>');
  const fullDesc = hasCustomDesc ? customDesc : productOriginalDesc;

  const rawHighlights = isBn
    ? (settings.featured_product_highlights_bn !== undefined ? settings.featured_product_highlights_bn : settings.featured_product_highlights)
    : (settings.featured_product_highlights_en !== undefined ? settings.featured_product_highlights_en : settings.featured_product_highlights);

  let customHighlights: string[] = [];
  if (rawHighlights) {
    try {
      const parsed = typeof rawHighlights === 'string' ? JSON.parse(rawHighlights) : rawHighlights;
      if (Array.isArray(parsed)) {
        customHighlights = parsed.filter(Boolean);
      }
    } catch {
      customHighlights = String(rawHighlights)
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // 4b. Description clamping & Column height synchronization (left column can never exceed right column)
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [isDescOverflowing, setIsDescOverflowing] = useState<boolean>(true);

  useEffect(() => {
    const syncHeights = () => {
      const rightEl = rightColRef.current;
      const leftEl = leftColRef.current;
      if (!rightEl || !leftEl) return;

      if (window.innerWidth > 860) {
        // Measure exact content bottom of the right column (at the bottom of action buttons)
        const actionsBox = rightEl.querySelector<HTMLElement>('.home-featured-actions-box');
        const rightTop = rightEl.getBoundingClientRect().top;
        const rightBottom = actionsBox
          ? actionsBox.getBoundingClientRect().bottom
          : rightEl.getBoundingClientRect().bottom;

        const trueContentHeight = Math.max(0, Math.round(rightBottom - rightTop));

        if (trueContentHeight > 100) {
          leftEl.style.maxHeight = `${trueContentHeight}px`;
          leftEl.style.setProperty('--right-col-height', `${trueContentHeight}px`);
        }
      } else {
        leftEl.style.maxHeight = '';
        leftEl.style.removeProperty('--right-col-height');
      }

      if (descRef.current) {
        const descEl = descRef.current;
        setIsDescOverflowing(descEl.scrollHeight > descEl.clientHeight + 2);
      }
    };

    syncHeights();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && rightColRef.current) {
      ro = new ResizeObserver(syncHeights);
      ro.observe(rightColRef.current);
    }

    window.addEventListener('resize', syncHeights);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, [fullDesc, customHighlights.length, selectedVariantId, selectedColor?.name]);

  // 5. Pricing calculation based on selected variant
  const colorAdjustment = Number(selectedColor?.priceAdjustment || 0);
  const basePrice = Number(selectedVariant?.price || featuredProduct?.min_price || 0);
  const price = basePrice + colorAdjustment;
  const originalPrice = selectedVariant.originalPrice ? Number(selectedVariant.originalPrice) + colorAdjustment : undefined;
  const savingsAmount = originalPrice && originalPrice > price ? originalPrice - price : 0;
  const savingsPercent = originalPrice && originalPrice > price ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  const btnViewText = isBn
    ? (settings.featured_product_btn_view_bn || settings.featured_product_btn_view || t('home_featured_view_details', 'View Full Details'))
    : (settings.featured_product_btn_view_en || settings.featured_product_btn_view || t('home_featured_view_details', 'View Full Details'));

  const btnBuyText = isBn
    ? (settings.featured_product_btn_buy_bn || settings.featured_product_btn_buy || t('home_featured_buy_now', 'Order Now'))
    : (settings.featured_product_btn_buy_en || settings.featured_product_btn_buy || t('home_featured_buy_now', 'Order Now'));

  const ratingChipText = t('featured_product_rating_chip', isBn ? '৪.৯ (১২০+ রিভিউ)' : '4.9 (120+ Reviews)');
  const stockChipText = t('featured_product_stock_chip', isBn ? 'ইন-স্টক • ফাস্ট ডেলিভারি' : 'In Stock • Fast Dispatch');
  const sizeOptionLabel = t('product_select_size_label', isBn ? 'সাইজ বেছে নিন:' : 'Select Size:');
  const colorOptionLabel = t('product_select_color_label', isBn ? 'কালার ও ফিনিশ:' : 'Color & Finish:');

  const defaultBannerTitle = isBn
    ? 'আপনার পছন্দের কাস্টম কাঠের মানচিত্র তৈরি করুন'
    : 'Customize Your Bespoke Wooden Map';

  const defaultBannerSub = isBn
    ? 'আপনার দেয়ালের মাপ এবং পছন্দের রঙ অনুসারে তৈরি করুন কাস্টম কাঠের মানচিত্র'
    : 'Tailor dimensions, custom colors, and personalized engravings to match your interior space.';

  const defaultBannerBtn = isBn ? 'কাস্টম রিকোয়েস্ট পাঠান' : 'Request Custom Map';

  const bannerTitle = isBn
    ? (settings.custom_map_banner_title_bn || settings.custom_map_banner_title || t('custom_map_banner_title', defaultBannerTitle))
    : (settings.custom_map_banner_title_en || settings.custom_map_banner_title || t('custom_map_banner_title', defaultBannerTitle));

  const bannerSub = isBn
    ? (settings.custom_map_banner_sub_bn || settings.custom_map_banner_sub || t('custom_map_banner_sub', defaultBannerSub))
    : (settings.custom_map_banner_sub_en || settings.custom_map_banner_sub || t('custom_map_banner_sub', defaultBannerSub));

  const bannerBtnText = isBn
    ? (settings.custom_map_banner_btn_bn || settings.custom_map_banner_btn || t('custom_map_banner_btn', defaultBannerBtn))
    : (settings.custom_map_banner_btn_en || settings.custom_map_banner_btn || t('custom_map_banner_btn', defaultBannerBtn));

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(
      {
        id: `${featuredProduct.id}-${selectedVariant.id || 'std'}-${selectedColor?.id || 'col'}`,
        productId: featuredProduct.id,
        variantId: selectedVariant.id || 1,
        productName: displayTitle,
        variantName: selectedVariant.sizeName || selectedVariant.size_name || 'Standard',
        sizeName: selectedVariant.sizeName || selectedVariant.size_name || 'Standard',
        colour: selectedColor?.name || selectedVariant.colour,
        colourHex: selectedColor?.colourHex || selectedVariant.colourHex,
        price: price,
        unitPrice: price,
        originalPrice: originalPrice,
        quantity: 1,
        imageUrl: activePhotoUrl,
      },
      false
    );
    setIsCartOpen(false);
    router.push('/checkout');
  };

  if (!featuredProduct || settings?.featured_product_enabled === 'false') {
    return null;
  }

  return (
    <section className="home-section home-featured-section" id="featured-exclusive">
      <div className="container max-w-7xl mx-auto px-2 sm:px-6">
        {/* Section Heading */}
        <div className="home-section-head text-center mb-8">
          <h2 className="home-section-title tracking-tight">
            {sectionHeading}
          </h2>
          {sectionSub && (
            <p className="home-section-sub mt-2">
              {sectionSub}
            </p>
          )}
        </div>

        {/* MAIN FEATURED CARD */}
        <div className="home-featured-card">
          <div className="home-featured-layout">
            {/* =========================================================
                COLUMN 1 (LEFT COLUMN):
                - Media (Photo)
                - Artisan Craftsmanship Box (sits directly under image)
               ========================================================= */}
            <div className="home-featured-col-left" ref={leftColRef}>
              {/* 1. Primary Photo */}
              <div className="home-featured-media-box">
                <Link
                  className="home-featured-media group"
                  href={`/products/${featuredProduct.slug}`}
                  title={displayTitle}
                >
                  {badgeLabel && (
                    <span className="featured-badge-pill">
                      {badgeLabel}
                    </span>
                  )}
                  <img
                    src={activePhotoUrl}
                    alt={displayTitle}
                    loading="lazy"
                    className="home-featured-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/no-image.svg';
                    }}
                  />
                </Link>
              </div>

              {/* 2. Artisan Craftsmanship Box */}
              <div className="home-featured-artisan-box">
                <div className="home-featured-story-panel">
                  {displayTagline && (
                    <div className="flex flex-col gap-1">
                      <span className="home-featured-tagline-badge">
                        <Sparkles className="w-3 h-3 text-[#8E5A35]" />
                        <span>{t('artisan_craftsmanship_badge', isBn ? 'কারিগরী বৈশিষ্ট্য' : 'Artisan Craftsmanship')}</span>
                      </span>
                      <h4 className="home-featured-tagline">
                        {displayTagline}
                      </h4>
                    </div>
                  )}

                  {fullDesc && (
                    <div
                      ref={descRef}
                      className={`home-featured-desc-wrapper clamp-3 ${isDescOverflowing ? 'has-fade' : ''}`}
                    >
                      <div
                        className="home-featured-desc"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(fullDesc),
                        }}
                      />
                      {isDescOverflowing && (
                        <div className="home-featured-desc-fade-overlay" aria-hidden="true" />
                      )}
                    </div>
                  )}

                  {customHighlights.length > 0 && (
                    <div className="home-featured-highlights-section">
                      <div className="home-featured-tags-grid">
                        {customHighlights.map((hl, idx) => (
                          <div key={idx} className="home-featured-tag-card">
                            <div className="home-featured-tag-icon-box">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="home-featured-tag-text">{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =========================================================
                COLUMN 2 (RIGHT COLUMN):
                - Header info (Chips, Title, Short Summary)
                - Selectors Box (Size & Color)
                - Pricing & CTA Action Buttons
               ========================================================= */}
            <div className="home-featured-col-right" ref={rightColRef}>
              {/* 3. Header info */}
              <div className="home-featured-header-box">
                <div className="flex flex-col gap-2.5">
                  {/* Meta Chips */}
                  <div className="featured-top-meta">
                    <span className="featured-rating-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{ratingChipText}</span>
                    </span>
                    <span className="featured-stock-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <i className="fa-solid fa-bolt text-emerald-600" aria-hidden="true"></i>
                      <span>{stockChipText}</span>
                    </span>
                    {priceNote && (
                      <span className="featured-discount-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span>{priceNote}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="home-featured-name">
                    <Link
                      href={`/products/${featuredProduct.slug}`}
                      title={displayTitle}
                    >
                      {displayTitle}
                    </Link>
                  </h3>

                  {/* Short Summary under Title */}
                  {shortSummary && (
                    <p className="home-featured-short-summary">
                      {shortSummary}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Size and Color Selectors Card */}
              <div className="home-featured-selectors-box">
                <div className="featured-selectors-card">
                  {/* Size Selector */}
                  {variants.length > 0 && (
                    <div className="featured-size-selection flex flex-col gap-2">
                      <div className="featured-option-label">
                        <span className="featured-label-title">
                          <span>{sizeOptionLabel}</span>
                        </span>
                        {selectedVariant?.sizeName && (
                          <span className="featured-label-val">
                            <span>{selectedVariant.sizeName}</span>
                            {selectedVariant.dimensions && (
                              <span className="featured-dim-inline hidden md:inline">
                                {` (${selectedVariant.dimensions})`}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="size-cards-grid">
                        {variants.map((v: any) => {
                          const isSelected = v.id === selectedVariantId;
                          return (
                            <label
                              key={v.id}
                              className={`size-option-card ${isSelected ? 'active' : ''}`}
                              onClick={() => setSelectedVariantId(v.id)}
                            >
                              <input
                                type="radio"
                                name="featured_variant_size"
                                value={v.id}
                                checked={isSelected}
                                onChange={() => setSelectedVariantId(v.id)}
                                className="sr-only"
                              />
                              <span className="size-card-name">
                                {v.sizeName}
                              </span>
                              {v.dimensions && (
                                <span className="size-card-dim">
                                  {v.dimensions}
                                </span>
                              )}
                              {isSelected && (
                                <div className="size-card-check">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Selector */}
                  {displayedColors.length > 0 && (
                    <div className="featured-color-selection flex flex-col gap-2">
                      <div className="featured-option-label">
                        <span className="featured-label-title">
                          <span>{colorOptionLabel}</span>
                        </span>
                        {selectedColor?.name && (
                          <span className="featured-label-val">
                            <span>{selectedColor.name}</span>
                          </span>
                        )}
                      </div>

                      <div className="color-swatches-grid">
                        {displayedColors.map((c: any, idx: number) => {
                          const isSelected = selectedColor?.name === c.name || idx === selectedColorIndex;
                          return (
                            <button
                              key={c.id || c.name || idx}
                              type="button"
                              onClick={() => {
                                setSelectedColorIndex(idx);
                                const matchingImg = featuredProduct.images?.find(
                                  (img: any) => img.colorId === c.id || img.altText?.includes(c.name)
                                );
                                if (matchingImg?.imageUrl) {
                                  setActivePhotoUrl(matchingImg.imageUrl);
                                }
                              }}
                              className={`color-swatch-chip ${isSelected ? 'active' : ''}`}
                              title={c.name}
                              aria-label={c.name}
                            >
                              <span
                                className="swatch-circle-inner"
                                style={{ backgroundColor: c.colourHex || '#8E5A35' }}
                              />
                              <span className="swatch-name">{c.name}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#8E5A35] stroke-[2.5]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Pricing & CTA Action Buttons */}
              <div className="home-featured-actions-box">
                <div className="home-featured-pricing">
                  <span className="featured-current-price">
                    {currency} {formatNum(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="featured-orig-price">
                      {currency} {formatNum(originalPrice)}
                    </span>
                  )}
                  {savingsAmount > 0 && (
                    <span className="featured-save-badge">
                      <i className="fa-solid fa-tag text-[11px]" aria-hidden="true"></i>
                      <span className="save-amount-text">
                        {isBn
                          ? `৳ ${formatNum(savingsAmount)} ছাড় `
                          : `৳ ${formatNum(savingsAmount)} OFF `}
                      </span>
                      <span className="save-percent-text">
                        <span className="save-paren-open">(</span>
                        {formatNum(savingsPercent)}% OFF
                        <span className="save-paren-close">)</span>
                      </span>
                    </span>
                  )}
                </div>

                <div className="home-featured-stacked-actions">
                  {btnBuyText && (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="home-featured-btn-buy"
                    >
                      <i className="fa-solid fa-bag-shopping text-lg" aria-hidden="true"></i>
                      <span>{btnBuyText}</span>
                    </button>
                  )}

                  {btnViewText && (
                    <Link
                      href={`/products/${featuredProduct.slug}`}
                      className="home-featured-btn-view"
                    >
                      <span>{btnViewText}</span>
                      <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true"></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            OUTSIDE HOME-FEATURED-CARD:
            "CUSTOM YOUR MAP" BANNER
           ========================================================= */}
        <div className="custom-map-banner-container mt-8 sm:mt-10 mb-8 sm:mb-10">
          <div className="custom-map-banner">
            <div className="custom-map-banner-content">
              <div className="custom-map-icon-box">
                <Wand2 className="w-7 h-7 text-white stroke-[2.5]" />
              </div>
              <div className="custom-map-banner-text">
                <span className="custom-map-pill-badge">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-500 animate-pulse" />
                  <span>{t('custom_map_badge', isBn ? 'বিশেষ কাস্টমাইজেশন সেবা' : 'Bespoke Custom Service')}</span>
                </span>
                <h3 className="custom-map-banner-title">
                  {bannerTitle}
                </h3>
                {bannerSub && (
                  <p className="custom-map-banner-subtitle">
                    {bannerSub}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="custom-map-banner-btn group"
            >
              <Sparkles className="w-5 h-5 text-amber-200 fill-amber-100 transition-transform group-hover:rotate-12" />
              <span>{bannerBtnText}</span>
              <ArrowRight className="w-4 h-4 text-white/90 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL FOR CUSTOM MAP REQUEST */}
      <CustomMapModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        defaultSize={selectedVariant?.sizeName}
        defaultColor={selectedColor?.name}
        settings={settings}
      />
    </section>
  );
});

export default WorldMapFeaturedSection;
