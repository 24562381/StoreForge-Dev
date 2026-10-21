'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../lib/LanguageContext';
import { useCart } from '../../../lib/CartContext';
import { fetchApi } from '../../../lib/api';
import { ProductBreadcrumbs } from './ProductBreadcrumbs';
import { ProductGallerySection } from './ProductGallerySection';
import { ProductInfoSidebar } from './ProductInfoSidebar';
import { ProductTabsSection } from './ProductTabsSection';
import { ProductSimilarSection } from './ProductSimilarSection';

interface ProductWrapperProps {
  initialProduct?: any;
  initialReviews?: any[];
  initialRelatedProducts?: any[];
}

export default function Wrapper({
  initialProduct = null,
  initialReviews = [],
  initialRelatedProducts = [],
}: ProductWrapperProps) {
  const { lang, t, formatNum } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => {
    const defaultVar = initialProduct?.variants?.find((v: any) => v.isDefault) || initialProduct?.variants?.[0];
    return defaultVar ? defaultVar.id : null;
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'Description' | 'Specifications' | 'Features' | 'Reviews' | 'Shipping'>('Description');
  const [addedMessage, setAddedMessage] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewOrderNumber, setReviewOrderNumber] = useState('');
  const [reviewPhone, setReviewPhone] = useState('');
  const [reviewSecretToken, setReviewSecretToken] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<any[]>(initialRelatedProducts);

  useEffect(() => {
    // OPTIMIZATION: If product was preloaded during SSR and matches current route slug, use it directly!
    if (initialProduct && initialProduct.id && initialProduct.slug === slug) {
      setProduct(initialProduct);
      const defaultVar = initialProduct.variants?.find((v: any) => v.isDefault) || initialProduct.variants?.[0];
      if (defaultVar) setSelectedVariantId(defaultVar.id);
      setReviews(initialReviews || []);
      setRelatedProducts(initialRelatedProducts || []);
      setLoading(false);
      return;
    }

    if (!slug) return;
    setLoading(true);
    fetchApi(`/products/slug/${slug}`)
      .then((data) => {
        if (data && data.id) {
          setProduct(data);
          const defaultVar = data.variants?.find((v: any) => v.isDefault) || data.variants?.[0];
          setSelectedVariantId(defaultVar ? defaultVar.id : null);
          setSelectedImageIndex(0);
          setSelectedColorIndex(0);
          setQuantity(1);

          // Fetch reviews for this product
          fetchApi(`/reviews?productId=${data.id}&limit=50`)
            .then((res) => {
              if (Array.isArray(res)) setReviews(res);
              else if (res?.reviews) setReviews(res.reviews);
            })
            .catch(() => {});

          // Fetch category-matched and active similar products
          const catUrl = data.categoryId
            ? `/products?categoryId=${data.categoryId}&status=active&limit=8`
            : '/products?status=active&limit=8';

          fetchApi(catUrl)
            .then(async (res) => {
              let list = (res?.products || res || []).filter((p: any) => p.id !== data.id);
              if (list.length < 4 && data.categoryId) {
                const fallbackRes = await fetchApi('/products?status=active&limit=8').catch(() => []);
                const extra = (fallbackRes?.products || fallbackRes || []).filter(
                  (p: any) => p.id !== data.id && !list.some((existing: any) => existing.id === p.id),
                );
                list = [...list, ...extra];
              }
              setRelatedProducts(list.slice(0, 4));
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, initialProduct, initialReviews, initialRelatedProducts]);

  const variants = product?.variants || [];
  const colors = product?.colors || [];
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || variants[0] || {};

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
    if (colors.length > 0) {
      return availableVariantColorNames.length > 0
        ? colors.filter((c: any) => availableVariantColorNames.includes(c.name))
        : colors;
    }
    return availableVariantColorNames.length > 0
      ? availableVariantColorNames.map((name, i) => ({
          id: `var-col-${i}`,
          name,
          colourHex: '#8E5A35',
          priceAdjustment: 0,
        }))
      : [];
  }, [colors, availableVariantColorNames]);

  if (loading) {
    return (
      <div
        className="container py-12 text-center"
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ fontSize: '1.2rem', color: '#8e5a35' }}>
          <i className="fa-solid fa-spinner fa-spin me-2"></i> {t('loading', 'Loading product...')}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center" style={{ minHeight: '60vh' }}>
        <h2>{t('product_not_found', 'Product not found')}</h2>
        <Link href="/products" className="btn btn-primary mt-4">
          <i className="fa-solid fa-arrow-left"></i> {t('home_browse', 'Browse Products')}
        </Link>
      </div>
    );
  }

  const selectedColor = displayedColors[selectedColorIndex] || displayedColors[0] || null;
  const rawImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.imageUrl || product.image_url)
        ? [{ imageUrl: product.imageUrl || product.image_url, altText: product.name }]
        : [{ imageUrl: '/images/no-image.svg', altText: product.name || 'No image' }];
  const images = rawImages;
  const currentImage = images[selectedImageIndex] || images[0] || { imageUrl: '/images/no-image.svg', altText: product.name || 'No image' };

  const currency = '৳';
  const colorAdjustment = selectedColor ? Number(selectedColor.priceAdjustment || 0) : 0;
  const unitPrice = Number(selectedVariant.price || 4500) + colorAdjustment;
  const rawOrigPrice = Number(selectedVariant.originalPrice || selectedVariant.original_price || 0);
  const origPrice = rawOrigPrice ? rawOrigPrice + colorAdjustment : 0;
  const discountPct = origPrice > unitPrice ? Math.round(((origPrice - unitPrice) / origPrice) * 100) : 0;

  // Translated strings
  const translatedName = t(`product.${product.slug}.name`, product.name);
  const translatedTagline = t(`product.${product.slug}.tagline`, product.tagline || '');
  const translatedShortDesc = t(`product.${product.slug}.short_desc`, product.shortDescription || '');
  const translatedFullDesc = t(
    `product.${product.slug}.full_desc`,
    product.fullDescription || product.shortDescription || '',
  );
  const translatedWarning = t(
    `product.${product.slug}.warning`,
    product.warningText || product.warning_text || '',
  );

  // Review calculations
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratingCounts[star] || 0,
    percentage:
      totalReviewsCount > 0
        ? Math.round(((ratingCounts[star] || 0) / totalReviewsCount) * 100)
        : star === 5
        ? 100
        : 0,
  }));

  const handleSelectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    setSelectedColorIndex(0);
  };

  const handleAddToCart = (openCart: boolean = true) => {
    const chosenColorName = selectedColor?.name || availableVariantColorNames[0] || '';
    const chosenColorHex = selectedColor?.colourHex || undefined;

    addToCart(
      {
        id: `${product.id}-${selectedVariant.id || 'default'}-${chosenColorName}`,
        productId: product.id,
        variantId: selectedVariant.id,
        productName: translatedName,
        variantName: selectedVariant.sizeName || selectedVariant.size_name || 'Standard',
        colour: chosenColorName,
        colourHex: chosenColorHex,
        price: unitPrice,
        originalPrice: origPrice || undefined,
        quantity,
        imageUrl: currentImage?.imageUrl || currentImage?.image_url || '/images/no-image.svg',
      },
      openCart
    );
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleAddRelatedToCart = (e: React.MouseEvent, rel: any) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVar = rel.variants?.find((v: any) => v.isDefault) || rel.variants?.[0] || {};
    const primaryImg = rel.images?.find((img: any) => img.isPrimary) || rel.images?.[0] || {};
    const price = Number(defaultVar.price || rel.min_price || 4500);

    addToCart({
      id: `${rel.id}-${defaultVar.id || 'std'}`,
      productId: rel.id,
      variantId: defaultVar.id || 1,
      productName: t(`product_${rel.id}_name`, t(`product.${rel.slug}.name`, rel.name)),
      variantName: defaultVar.sizeName || defaultVar.size_name || 'Standard',
      colour: defaultVar.colour,
      colourHex: defaultVar.colourHex,
      price: price,
      originalPrice: defaultVar.originalPrice ? Number(defaultVar.originalPrice) : undefined,
      quantity: 1,
      imageUrl: primaryImg.imageUrl || primaryImg.image_url || rel.imageUrl || '/images/no-image.svg',
    });
    setIsCartOpen(true);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(null);
    setReviewError(null);

    if (!reviewName.trim()) {
      setReviewError(t('review_err_name_required', 'অনুগ্রহ করে আপনার নাম লিখুন।'));
      return;
    }
    if (!reviewOrderNumber.trim()) {
      setReviewError(t('review_err_order_required', 'অনুগ্রহ করে আপনার অর্ডার নম্বর দিন।'));
      return;
    }
    if (!reviewPhone.trim()) {
      setReviewError(t('review_err_phone_required', 'অনুগ্রহ করে অর্ডারে ব্যবহৃত মোবাইল নম্বর দিন।'));
      return;
    }
    if (!reviewSecretToken.trim()) {
      setReviewError(t('review_err_token_required', 'অনুগ্রহ করে আপনার অর্ডারের সিক্রেট টোকেন দিন।'));
      return;
    }
    if (!reviewText.trim()) {
      setReviewError(t('review_err_text_required', 'অনুগ্রহ করে আপনার মতামত লিখুন।'));
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        productId: product.id,
        customerName: reviewName.trim(),
        orderNumber: reviewOrderNumber.trim(),
        phone: reviewPhone.trim(),
        secretToken: reviewSecretToken.trim(),
        rating: reviewRating,
        reviewText: reviewText.trim(),
      };

      const res = await fetchApi('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res && (res.id || res.success)) {
        setReviewSuccess(t('review_success_submitted', 'আপনার রিভিউটি সফলভাবে জমা নেওয়া হয়েছে! ধন্যবাদ।'));
        setReviewName('');
        setReviewOrderNumber('');
        setReviewPhone('');
        setReviewSecretToken('');
        setReviewText('');
        setReviewRating(5);
        fetchApi(`/reviews?productId=${product.id}&limit=50`)
          .then((data) => {
            if (Array.isArray(data)) setReviews(data);
            else if (data?.reviews) setReviews(data.reviews);
          })
          .catch(() => {});
      } else {
        setReviewError(
          res?.message || t('review_err_generic', 'রিভিউ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'),
        );
      }
    } catch (err: any) {
      setReviewError(
        err.message ||
          t('network_error_retry', 'সার্ভার সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'),
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const ratingTexts: Record<number, string> = {
    5: t('rating_text_5', lang === 'bn' ? 'অসাধারণ ও নিখুঁত!' : 'Outstanding & Perfect!'),
    4: t('rating_text_4', lang === 'bn' ? 'খুবই ভালো!' : 'Very Good!'),
    3: t('rating_text_3', lang === 'bn' ? 'সন্তোষজনক' : 'Satisfactory'),
    2: t('rating_text_2', lang === 'bn' ? 'প্রত্যাশার চেয়ে কম' : 'Below Expectations'),
    1: t('rating_text_1', lang === 'bn' ? 'সন্তুষ্ট নই' : 'Disappointed'),
  };

  return (
    <div className="product-details-container container py-5">
      <ProductBreadcrumbs product={product} translatedName={translatedName} />

      <section className="details-main-section">
        <ProductGallerySection
          images={images}
          currentImage={currentImage}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          discountPct={discountPct}
          translatedName={translatedName}
          warningText={translatedWarning}
        />

        <ProductInfoSidebar
          product={product}
          warningText={translatedWarning}
          translatedName={translatedName}
          translatedTagline={translatedTagline}
          translatedShortDesc={translatedShortDesc}
          avgRating={avgRating}
          totalReviewsCount={totalReviewsCount}
          currency={currency}
          unitPrice={unitPrice}
          origPrice={origPrice}
          discountPct={discountPct}
          variants={variants}
          selectedVariantId={selectedVariantId}
          selectedVariant={selectedVariant}
          onSelectVariant={handleSelectVariant}
          displayedColors={displayedColors}
          selectedColor={selectedColor}
          selectedColorIndex={selectedColorIndex}
          onSelectColorIndex={setSelectedColorIndex}
          quantity={quantity}
          setQuantity={setQuantity}
          onBuyNow={handleBuyNow}
          onAddToCart={handleAddToCart}
          addedMessage={addedMessage}
          onOpenReviewsTab={() => setActiveTab('Reviews')}
        />
      </section>

      <ProductTabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        features={product?.features || []}
        slug={product?.slug || ''}
        translatedFullDesc={translatedFullDesc}
        variants={variants}
        selectedColor={selectedColor}
        currency={currency}
        colorAdjustment={colorAdjustment}
        totalReviewsCount={totalReviewsCount}
        avgRating={avgRating}
        ratingBreakdown={ratingBreakdown}
        reviews={reviews}
        reviewName={reviewName}
        setReviewName={setReviewName}
        reviewOrderNumber={reviewOrderNumber}
        setReviewOrderNumber={setReviewOrderNumber}
        reviewPhone={reviewPhone}
        setReviewPhone={setReviewPhone}
        reviewSecretToken={reviewSecretToken}
        setReviewSecretToken={setReviewSecretToken}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        hoverRating={hoverRating}
        setHoverRating={setHoverRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        submittingReview={submittingReview}
        reviewSuccess={reviewSuccess}
        reviewError={reviewError}
        onReviewSubmit={handleReviewSubmit}
        ratingTexts={ratingTexts}
      />

      <ProductSimilarSection
        relatedProducts={relatedProducts}
        currency={currency}
        onAddRelatedToCart={handleAddRelatedToCart}
      />
    </div>
  );
}
