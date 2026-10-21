'use client';

import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/LanguageContext';
import { useCart } from '../../lib/CartContext';
import { fetchApi } from '../../lib/api';
import { ProductsExclusiveSection } from './ProductsExclusiveSection';
import { ProductsFilterToolbar } from './ProductsFilterToolbar';
import { ProductsGridSection } from './ProductsGridSection';
import { ProductsPagination } from './ProductsPagination';

interface CatalogWrapperProps {
  initialProducts?: any[];
  initialTotal?: number;
  initialExclusiveProducts?: any[];
}

function ProductsPageContent({
  initialProducts = [],
  initialTotal = 0,
  initialExclusiveProducts = [],
}: CatalogWrapperProps) {
  const { t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const priceRange = searchParams.get('price_range') || '';
  const sort = searchParams.get('sort') || 'popular';
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [exclusiveProducts, setExclusiveProducts] = useState<any[]>(initialExclusiveProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [totalPages, setTotalPages] = useState(() => Math.ceil((initialTotal || initialProducts.length || 1) / 12) || 1);
  const [totalProducts, setTotalProducts] = useState(initialTotal || initialProducts.length);

  const currency = '৳';

  // Load Exclusive products independently once on mount if not pre-fetched
  useEffect(() => {
    if (initialExclusiveProducts && initialExclusiveProducts.length > 0) {
      return;
    }
    fetchApi('/products?isExclusive=true&limit=10')
      .then((data) => {
        const list = data?.products || data?.items || (Array.isArray(data) ? data : []);
        setExclusiveProducts(list);
      })
      .catch(() => {
        setExclusiveProducts([]);
      });
  }, [initialExclusiveProducts]);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // OPTIMIZATION: If SSR data was preloaded for the current page and filters, skip initial client fetch
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialProducts.length > 0) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const query = new URLSearchParams();
    if (sort && sort !== 'popular') query.set('sort', sort);

    if (priceRange) {
      if (priceRange === 'under-2000') query.set('maxPrice', '2000');
      else if (priceRange === '2000-5000') {
        query.set('minPrice', '2000');
        query.set('maxPrice', '5000');
      } else if (priceRange === '5000-15000') {
        query.set('minPrice', '5000');
        query.set('maxPrice', '15000');
      } else if (priceRange === 'above-15000') {
        query.set('minPrice', '15000');
      }
    }

    query.set('page', String(page));
    query.set('limit', '12');

    fetchApi(`/products?${query.toString()}`)
      .then((data) => {
        const prodList = data?.products || data?.items || (Array.isArray(data) ? data : []);
        setProducts(prodList);
        setTotalProducts(data?.total ?? prodList.length);
        setTotalPages(data?.totalPages || Math.ceil((data?.total ?? prodList.length) / 12) || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [priceRange, sort, page, initialProducts]);

  const updateParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      if (!value || (name === 'sort' && value === 'popular')) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  const getPageUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      return `/products?${params.toString()}`;
    },
    [searchParams],
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

  const hasActiveFilters = useMemo(
    () => Boolean(priceRange || (sort && sort !== 'popular')),
    [priceRange, sort],
  );

  const paginationPages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  return (
    <div className="products-page-container">
      {page === 1 && (
        <ProductsExclusiveSection
          exclusiveProducts={exclusiveProducts}
          currency={currency}
          onAddToCart={handleAddToCart}
        />
      )}

      <section className="catalog-section products-catalog-section py-8">
        <div className="container">
          <ProductsFilterToolbar
            totalProducts={totalProducts}
            productsCount={products.length}
            priceRange={priceRange}
            sort={sort}
            hasActiveFilters={hasActiveFilters}
            onUpdateParam={updateParam}
            onReset={() => router.push('/products')}
          />

          <ProductsGridSection
            products={products}
            loading={loading}
            currency={currency}
            onAddToCart={handleAddToCart}
          />

          <ProductsPagination
            page={page}
            totalPages={totalPages}
            paginationPages={paginationPages}
            getPageUrl={getPageUrl}
          />
        </div>
      </section>
    </div>
  );
}

export default function Wrapper(props: CatalogWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#faf7f2]">
          <div className="w-8 h-8 border-3 border-[#8e5a35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsPageContent {...props} />
    </Suspense>
  );
}
