import Wrapper from './wrapper';
import { fetchApi } from '../../lib/api';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  const category = resolvedParams?.category || '';
  const size = resolvedParams?.size || '';
  const color = resolvedParams?.color || '';
  const sort = resolvedParams?.sort || 'newest';
  const minPrice = resolvedParams?.min_price || '';
  const maxPrice = resolvedParams?.max_price || '';

  const query = new URLSearchParams();
  if (q.trim()) query.set('q', q.trim());
  if (category.trim()) query.set('category', category.trim());
  if (size.trim()) query.set('size', size.trim());
  if (color.trim()) query.set('color', color.trim());
  if (sort.trim()) query.set('sort', sort.trim());
  if (minPrice.trim()) {
    query.set('min_price', minPrice.trim());
    query.set('minPrice', minPrice.trim());
  }
  if (maxPrice.trim()) {
    query.set('max_price', maxPrice.trim());
    query.set('maxPrice', maxPrice.trim());
  }
  query.set('limit', '50');

  let initialProducts: any[] = [];
  try {
    const data = await fetchApi(`/products?${query.toString()}`).catch(() => null);
    initialProducts = data?.products || data?.items || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn('SSR search pre-fetch notice:', err);
  }

  const searchKey = `${q}_${category}_${size}_${color}_${sort}_${minPrice}_${maxPrice}`;

  return (
    <Wrapper
      key={searchKey}
      initialProducts={initialProducts}
    />
  );
}
