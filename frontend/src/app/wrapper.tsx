'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/SettingsContext';
import { useCart } from '@/lib/CartContext';
import { fetchApi } from '@/lib/api';

import { HeroBannerSection } from './HeroBannerSection';
import { CategoryGridSection } from './CategoryGridSection';
import { WorldMapFeaturedSection } from './WorldMapFeaturedSection';
import { WhyUsSection } from './WhyUsSection';
import { TopSellingProductsSection } from './TopSellingProductsSection';
import { HowToOrderSection } from './HowToOrderSection';
import { CustomerReviewsSection } from './CustomerReviewsSection';
import { FaqSection } from './FaqSection';

interface WrapperProps {
  initialProducts?: any[];
  initialFaqs?: any[];
  initialReviews?: any[];
  initialFeaturedProduct?: any;
}

export default function Wrapper({
  initialProducts = [],
  initialFaqs = [],
  initialReviews = [],
  initialFeaturedProduct = null,
}: WrapperProps) {
  const { t } = useLanguage();
  const { settings: contextSettings, categories: contextCategories } = useSettings();
  const { addToCart, setIsCartOpen } = useCart();

  const [settings, setSettings] = useState<Record<string, string>>(contextSettings);
  const [categories, setCategories] = useState<any[]>(contextCategories);
  const [featuredProduct, setFeaturedProduct] = useState<any>(initialFeaturedProduct);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [faqs, setFaqs] = useState<any[]>(initialFaqs);
  const [reviews, setReviews] = useState<any[]>(initialReviews);

  useEffect(() => {
    if (contextSettings && Object.keys(contextSettings).length > 0) {
      setSettings(contextSettings);
    }
    if (contextCategories && contextCategories.length > 0) {
      setCategories(contextCategories);
    }
  }, [contextSettings, contextCategories]);

  const handleAddToCart = useCallback((e: React.MouseEvent, prod: any) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVar = prod.variants?.find((v: any) => v.isDefault) || prod.variants?.[0] || {};
    const primaryImg = prod.images?.find((img: any) => img.isPrimary) || prod.images?.[0] || {};
    const price = Number(defaultVar.price || prod.min_price || 4500);

    addToCart({
      id: `${prod.id}-${defaultVar.id || 'std'}`,
      productId: prod.id,
      variantId: defaultVar.id || 1,
      productName: t(`product_${prod.id}_name`, prod.name),
      variantName: defaultVar.sizeName || defaultVar.size_name || 'Standard',
      colour: defaultVar.colour,
      colourHex: defaultVar.colourHex,
      price: price,
      originalPrice: defaultVar.originalPrice ? Number(defaultVar.originalPrice) : undefined,
      quantity: 1,
      imageUrl: primaryImg.imageUrl || primaryImg.image_url || prod.imageUrl || '/images/no-image.svg',
    });
    setIsCartOpen(true);
  }, [addToCart, setIsCartOpen, t]);

  useEffect(() => {
    // OPTIMIZATION: If SSR pre-fetched the homepage data, eliminate all client-side API calls.
    // Protects user-side latency and prevents duplicate HTTP requests to backend.
    if (initialProducts && initialProducts.length > 0) {
      return;
    }

    Promise.all([
      fetchApi('/products?status=active&limit=8').catch(() => ({ products: [] })),
      fetchApi('/faqs?published=true').catch(() => []),
      fetchApi('/reviews?featured=true&limit=6').catch(() => []),
    ]).then(([productsData, faqsData, reviewsData]) => {
      const prods = productsData?.products || productsData?.items || (Array.isArray(productsData) ? productsData : []);
      setProducts(prods);
      setFaqs(Array.isArray(faqsData) ? faqsData : faqsData?.faqs || []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews || []);

      if (prods.length > 0 && !featuredProduct) {
        fetchApi(`/products/${prods[0].id}`)
          .then((p) => setFeaturedProduct(p))
          .catch(() => setFeaturedProduct(prods[0]));
      }
    });
  }, [initialProducts, featuredProduct]);

  return (
    <div className="home-page">
      {/* 1. HERO & BANNER SECTION */}
      <HeroBannerSection settings={settings} />

      {/* 2. CATEGORY SECTION */}
      <CategoryGridSection
        categories={categories}
        cardStyle={settings?.category_card_style || 'capsule'}
      />

      {/* 3. WORLD MAP / FEATURED PRODUCT EXCLUSIVE */}
      {featuredProduct ? (
        <WorldMapFeaturedSection featuredProduct={featuredProduct} settings={settings} />
      ) : null}

      {/* 4. WHY US / WHY WOODEN MAP SECTION */}
      <WhyUsSection settings={settings} />

      {/* 5. TOP SELLING PRODUCTS SECTION */}
      <TopSellingProductsSection products={products} onAddToCart={handleAddToCart} />

      {/* 6. HOW TO PLACE AN ORDER GUIDE */}
      <HowToOrderSection settings={settings} />

      {/* 7. CUSTOMER REVIEWS & TESTIMONIALS */}
      {reviews && reviews.length > 0 ? <CustomerReviewsSection reviews={reviews} /> : null}

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      {faqs && faqs.length > 0 ? <FaqSection faqs={faqs} settings={settings} /> : null}
    </div>
  );
}
