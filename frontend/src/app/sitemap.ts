import { MetadataRoute } from 'next';
import { fetchApi } from '../lib/api';
import { resolveSiteUrl } from '../lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await resolveSiteUrl();
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/track`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/return-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchApi('/products?status=active&limit=500', { cache: 'no-store' }).catch(() => ({ products: [] })),
      fetchApi('/categories?activeOnly=true', { cache: 'no-store' }).catch(() => []),
    ]);

    const products = productsRes?.products || productsRes?.items || (Array.isArray(productsRes) ? productsRes : []);
    const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

    productRoutes = products
      .filter((p: any) => p && p.slug)
      .map((p: any) => ({
        url: `${siteUrl}/products/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));

    categoryRoutes = categories
      .filter((c: any) => c && c.slug)
      .map((c: any) => ({
        url: `${siteUrl}/search?category=${encodeURIComponent(c.slug)}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.warn('[SEO] Dynamic sitemap generation fallback notice:', err);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
