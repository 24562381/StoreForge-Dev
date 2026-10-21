import { MetadataRoute } from 'next';
import { resolveSiteUrl } from '../lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await resolveSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout',
          '/order/confirmation',
          '/order/confirmation/',
          '/payment/',
          '/cart',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
