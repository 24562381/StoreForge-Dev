'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/LanguageContext';
import { useSettings } from '../../lib/SettingsContext';
import { useCart } from '../../lib/CartContext';
import { fetchApi } from '../../lib/api';
import { SearchSidebarFilters } from './SearchSidebarFilters';
import { SearchResultsGrid } from './SearchResultsGrid';

interface SearchWrapperProps {
  initialProducts?: any[];
}

function SearchPageContent({ initialProducts = [] }: SearchWrapperProps) {
  const { t } = useLanguage();
  const { categories: contextCategories } = useSettings();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';

  // Local Form State
  const [q, setQ] = useState(qParam);
  const [category, setCategory] = useState(categoryParam);
  const [size, setSize] = useState(sizeParam);
  const [color, setColor] = useState(colorParam);
  const [sort, setSort] = useState(sortParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<any[]>(contextCategories || []);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [bounds, setBounds] = useState({ boundMin: 1000, boundMax: 25000 });

  const isFirstRender = React.useRef(true);
  const currency = '৳';

  useEffect(() => {
    if (contextCategories && contextCategories.length > 0) {
      setCategories((prev) => (prev.length === 0 ? contextCategories : prev));
    }
  }, [contextCategories]);

  // Keep form in sync when URL changes
  useEffect(() => {
    setQ(qParam);
    setCategory(categoryParam);
    setSize(sizeParam);
    setColor(colorParam);
    setSort(sortParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
  }, [qParam, categoryParam, sizeParam, colorParam, sortParam, minPriceParam, maxPriceParam]);

  // Load initial global metadata (all available sizes, colors, and price bounds)
  // OPTIMIZATION: Read from sessionStorage or cache after single fetch to eliminate 100-product client transfer on every visit
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('sf_search_filter_meta');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.sizes?.length) setSizes(parsed.sizes);
        if (parsed.colors?.length) setColors(parsed.colors);
        if (parsed.bounds) setBounds(parsed.bounds);
        return;
      }
    } catch {}

    fetchApi('/products?status=active&limit=50').then((prodData) => {
      const allProds =
        prodData?.products || prodData?.items || (Array.isArray(prodData) ? prodData : []);
      const sSet = new Set<string>();
      const cSet = new Set<string>();
      const allPrices: number[] = [];

      for (let i = 0; i < allProds.length; i++) {
        const p = allProds[i];
        if (p.min_price) allPrices.push(Number(p.min_price));
        if (p.max_price) allPrices.push(Number(p.max_price));

        const pColors = p.colors || [];
        for (let j = 0; j < pColors.length; j++) {
          const c = pColors[j];
          if (c.name && c.name.trim()) cSet.add(c.name.trim());
        }

        const pVariants = p.variants || [];
        for (let k = 0; k < pVariants.length; k++) {
          const v = pVariants[k];
          if (v.price) allPrices.push(Number(v.price));
          const sName = v.sizeName || v.size_name;
          if (sName && sName.trim()) sSet.add(sName.trim());
          if (v.colour) {
            try {
              const parsed = JSON.parse(v.colour);
              if (Array.isArray(parsed)) {
                for (let m = 0; m < parsed.length; m++) {
                  if (parsed[m]) cSet.add(parsed[m].trim());
                }
              } else if (typeof parsed === 'string' && parsed.trim()) {
                cSet.add(parsed.trim());
              }
            } catch {
              if (v.colour.includes(',')) {
                const parts = v.colour.split(',');
                for (let m = 0; m < parts.length; m++) {
                  if (parts[m]) cSet.add(parts[m].trim());
                }
              } else if (v.colour.trim()) {
                cSet.add(v.colour.trim());
              }
            }
          }
        }
      }

      const extractedSizes = Array.from(sSet);
      const extractedColors = Array.from(cSet);
      if (extractedSizes.length > 0) setSizes(extractedSizes);
      if (extractedColors.length > 0) setColors(extractedColors);

      let computedBounds = { boundMin: 1000, boundMax: 25000 };
      const validPrices = allPrices.filter((v) => Number.isFinite(v) && v > 0);
      if (validPrices.length) {
        const minP = Math.floor(Math.min(...validPrices));
        const maxP = Math.ceil(Math.max(...validPrices));
        computedBounds = {
          boundMin: minP,
          boundMax: maxP > minP ? maxP : 25000,
        };
        setBounds(computedBounds);
      }

      try {
        sessionStorage.setItem(
          'sf_search_filter_meta',
          JSON.stringify({
            sizes: extractedSizes,
            colors: extractedColors,
            bounds: computedBounds,
          }),
        );
      } catch {}
    }).catch(() => {});
  }, []);

  // Fetch products based on active URL search params
  useEffect(() => {
    // OPTIMIZATION: If initialProducts was preloaded during SSR on first render, skip client fetch
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialProducts.length > 0) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const query = new URLSearchParams();
    if (qParam.trim()) query.set('q', qParam.trim());
    if (categoryParam.trim()) query.set('category', categoryParam.trim());
    if (sizeParam.trim()) query.set('size', sizeParam.trim());
    if (colorParam.trim()) query.set('color', colorParam.trim());
    if (sortParam.trim()) query.set('sort', sortParam.trim());
    if (minPriceParam.trim()) {
      query.set('min_price', minPriceParam.trim());
      query.set('minPrice', minPriceParam.trim());
    }
    if (maxPriceParam.trim()) {
      query.set('max_price', maxPriceParam.trim());
      query.set('maxPrice', maxPriceParam.trim());
    }
    query.set('limit', '50');

    fetchApi(`/products?${query.toString()}`)
      .then((data) => {
        const prodList = data?.products || data?.items || (Array.isArray(data) ? data : []);
        setProducts(prodList);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [qParam, categoryParam, sizeParam, colorParam, sortParam, minPriceParam, maxPriceParam, initialProducts]);

  useEffect(() => {
    if (!minPriceParam && !maxPriceParam && products.length > 0) {
      const allPrices: number[] = [];
      products.forEach((p) => {
        if (p.min_price) allPrices.push(Number(p.min_price));
        if (p.max_price) allPrices.push(Number(p.max_price));
        (p.variants || []).forEach((v: any) => {
          if (v.price) allPrices.push(Number(v.price));
        });
      });
      const valid = allPrices.filter((v) => Number.isFinite(v) && v > 0);
      if (valid.length) {
        const minP = Math.floor(Math.min(...valid));
        const maxP = Math.ceil(Math.max(...valid));
        setBounds({
          boundMin: minP,
          boundMax: maxP > minP ? maxP : 25000,
        });
      }
    }
  }, [products, minPriceParam, maxPriceParam]);

  const { boundMin, boundMax } = bounds;
  const numMin = minPrice !== '' ? Number(minPrice) : boundMin;
  const numMax = maxPrice !== '' ? Number(maxPrice) : boundMax;
  const validMin = Number.isFinite(numMin) ? numMin : boundMin;
  const validMax = Number.isFinite(numMax) ? numMax : boundMax;

  const selMin = Math.min(Math.max(validMin, boundMin), boundMax);
  const selMax = Math.max(Math.min(Math.max(validMax, boundMin), boundMax), selMin);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (qParam.trim()) count++;
    if (categoryParam.trim()) count++;
    if (sizeParam.trim()) count++;
    if (colorParam.trim()) count++;
    if (minPriceParam && Number(minPriceParam) > boundMin) count++;
    if (maxPriceParam && Number(maxPriceParam) < boundMax) count++;
    if (sortParam && sortParam !== 'newest') count++;
    return count;
  }, [
    qParam,
    categoryParam,
    sizeParam,
    colorParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
    boundMin,
    boundMax,
  ]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (category) params.set('category', category);
      if (size) params.set('size', size);
      if (color) params.set('color', color);
      if (sort && sort !== 'newest') params.set('sort', sort);
      if (minPrice !== '' && Number(minPrice) > boundMin) params.set('min_price', minPrice);
      if (maxPrice !== '' && Number(maxPrice) < boundMax) params.set('max_price', maxPrice);

      router.push(`/search?${params.toString()}`);
      setMobileExpanded(false);
    },
    [q, category, size, color, sort, minPrice, maxPrice, boundMin, boundMax, router],
  );

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setQ('');
      setCategory('');
      setSize('');
      setColor('');
      setSort('newest');
      setMinPrice('');
      setMaxPrice('');
      router.push('/search');
    },
    [router],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent, prod: any) => {
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
    },
    [addToCart, setIsCartOpen, t],
  );

  return (
    <section className="catalog-section search-section py-8">
      <div className="container search-layout">
        <SearchSidebarFilters
          mobileExpanded={mobileExpanded}
          setMobileExpanded={setMobileExpanded}
          activeFilterCount={activeFilterCount}
          q={q}
          setQ={setQ}
          category={category}
          setCategory={setCategory}
          categories={categories}
          size={size}
          setSize={setSize}
          sizes={sizes}
          color={color}
          setColor={setColor}
          colors={colors}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          boundMin={boundMin}
          boundMax={boundMax}
          selMin={selMin}
          selMax={selMax}
          sort={sort}
          setSort={setSort}
          currency={currency}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <SearchResultsGrid
          products={products}
          loading={loading}
          activeFilterCount={activeFilterCount}
          currency={currency}
          onAddToCart={handleAddToCart}
          onReset={handleReset}
        />
      </div>
    </section>
  );
}

export default function Wrapper(props: SearchWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#faf7f2]">
          <div className="w-8 h-8 border-3 border-[#8e5a35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent {...props} />
    </Suspense>
  );
}
