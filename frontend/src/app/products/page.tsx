import Wrapper from './wrapper';
import { fetchApi } from '../../lib/api';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(resolvedParams?.page || 1));
  const sort = resolvedParams?.sort || 'popular';
  const priceRange = resolvedParams?.price_range || '';

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

  let initialProducts: any[] = [];
  let initialExclusive: any[] = [];
  let total = 0;

  try {
    const [prodData, exclusiveData] = await Promise.all([
      fetchApi(`/products?${query.toString()}`).catch(() => ({ products: [], total: 0 })),
      page === 1
        ? fetchApi('/products?isExclusive=true&limit=10').catch(() => ({ products: [] }))
        : Promise.resolve({ products: [] }),
    ]);

    initialProducts = prodData?.products || prodData?.items || (Array.isArray(prodData) ? prodData : []);
    total = prodData?.total ?? initialProducts.length;
    initialExclusive = exclusiveData?.products || exclusiveData?.items || (Array.isArray(exclusiveData) ? exclusiveData : []);
  } catch (err) {
    console.warn('SSR catalog pre-fetch notice:', err);
  }

  return (
    <Wrapper
      key={`${page}_${sort}_${priceRange}`}
      initialProducts={initialProducts}
      initialTotal={total}
      initialExclusiveProducts={initialExclusive}
    />
  );
}
