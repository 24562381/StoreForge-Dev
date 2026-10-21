import { Metadata } from 'next';
import Wrapper from './wrapper';
import { fetchApi } from '../lib/api';
import { resolveSiteUrl, getAbsoluteImageUrl, stripHtmlToText } from '../lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await resolveSiteUrl();
  const settings = await fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({}));
  const storeTitle = (settings.store_name || settings.site_name || settings.site_title || 'StoreForge').trim();
  const storeTagline = (settings.store_tagline || settings.site_subtitle || settings.store_tagline_en || 'Handcrafted Luxury Home Decor').trim();
  const rawDesc = settings.site_description || settings.meta_description || 'Exquisite handcrafted wooden maps, home decor, and bespoke artisanal wall art.';
  const siteDesc = stripHtmlToText(rawDesc, 160);
  const ogImage = getAbsoluteImageUrl(settings.store_og_image || settings.home_banner_image || '/images/product-main.jpg', siteUrl);

  return {
    title: `${storeTitle} | ${storeTagline}`,
    description: siteDesc,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: 'website',
      url: siteUrl,
      title: `${storeTitle} | ${storeTagline}`,
      description: siteDesc,
      siteName: storeTitle,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: storeTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${storeTitle} | ${storeTagline}`,
      description: siteDesc,
      images: [ogImage],
    },
  };
}

export default async function Page() {
  const siteUrl = await resolveSiteUrl();
  let initialProducts: any[] = [];
  let initialFaqs: any[] = [];
  let initialReviews: any[] = [];
  let initialFeaturedProduct: any = null;
  let settings: Record<string, string> = {};

  try {
    const [productsData, faqsData, reviewsData, settingsData] = await Promise.all([
      fetchApi('/products?status=active&limit=8').catch(() => ({ products: [] })),
      fetchApi('/faqs?published=true').catch(() => []),
      fetchApi('/reviews?featured=true&limit=6').catch(() => []),
      fetchApi('/settings/public').catch(() => ({})),
    ]);

    initialProducts = productsData?.products || productsData?.items || (Array.isArray(productsData) ? productsData : []);
    initialFaqs = Array.isArray(faqsData) ? faqsData : faqsData?.faqs || [];
    initialReviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews || [];
    settings = settingsData || {};

    if (initialProducts.length > 0) {
      initialFeaturedProduct = await fetchApi(`/products/${initialProducts[0].id}`).catch(() => initialProducts[0]);
    }
  } catch (err) {
    console.warn('SSR homepage pre-fetch notice:', err);
  }

  const storeName = (settings.store_name || settings.site_name || 'StoreForge').trim();
  const logoUrl = getAbsoluteImageUrl(settings.store_logo_url || settings.store_favicon_url || '/icons/icon-512x512.png', siteUrl);

  // Structured Data (JSON-LD) for Google Rich Snippets & Search Box
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdStore = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storeName,
    url: siteUrl,
    image: logoUrl,
    description: stripHtmlToText(settings.site_description || 'Modern Handcrafted E-Commerce Store', 250),
    priceRange: '৳৳',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStore) }}
      />
      <Wrapper
        initialProducts={initialProducts}
        initialFaqs={initialFaqs}
        initialReviews={initialReviews}
        initialFeaturedProduct={initialFeaturedProduct}
      />
    </>
  );
}
