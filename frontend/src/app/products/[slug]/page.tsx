import { Metadata } from 'next';
import Wrapper from './wrapper';
import { fetchApi } from '../../../lib/api';
import { resolveSiteUrl, getAbsoluteImageUrl, stripHtmlToText } from '../../../lib/seo';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const siteUrl = await resolveSiteUrl();

  if (!slug) {
    return {
      title: 'Product Details',
    };
  }

  try {
    const [product, settings] = await Promise.all([
      fetchApi(`/products/slug/${slug}`, { cache: 'no-store' }).catch(() => null),
      fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({})),
    ]);

    if (!product) {
      return {
        title: 'Product Not Found',
        robots: { index: false, follow: true },
      };
    }

    const storeTitle = (settings.store_name || settings.site_name || 'StoreForge').trim();
    const productName = product.name || 'Handcrafted Product';
    const rawDesc = product.shortDescription || product.fullDescription || `${productName} handcrafted luxury collection.`;
    const cleanDesc = stripHtmlToText(rawDesc, 160);

    const primaryImg =
      (product.images || []).find((img: any) => img.isPrimary) ||
      (product.images || [])[0] ||
      {};
    const ogImage = getAbsoluteImageUrl(primaryImg.imageUrl || product.imageUrl, siteUrl);
    const productUrl = `${siteUrl}/products/${encodeURIComponent(slug)}`;

    return {
      title: `${productName} | ${storeTitle}`,
      description: cleanDesc,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        type: 'website',
        url: productUrl,
        title: `${productName} | ${storeTitle}`,
        description: cleanDesc,
        siteName: storeTitle,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: productName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | ${storeTitle}`,
        description: cleanDesc,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: 'Product Details',
    };
  }
}

export default async function Page({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const siteUrl = await resolveSiteUrl();

  let initialProduct: any = null;
  let initialReviews: any[] = [];
  let initialRelated: any[] = [];
  let settings: Record<string, string> = {};

  if (slug) {
    try {
      const [prodData, settingsData] = await Promise.all([
        fetchApi(`/products/slug/${slug}`, { cache: 'no-store' }).catch(() => null),
        fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({})),
      ]);

      initialProduct = prodData;
      settings = settingsData || {};

      if (initialProduct && initialProduct.id) {
        const [reviewsRes, relatedRes] = await Promise.all([
          fetchApi(`/reviews?productId=${initialProduct.id}&limit=50`, { cache: 'no-store' }).catch(() => []),
          fetchApi(
            initialProduct.categoryId
              ? `/products?categoryId=${initialProduct.categoryId}&status=active&limit=8`
              : '/products?status=active&limit=8',
            { cache: 'no-store' }
          ).catch(() => []),
        ]);

        initialReviews = Array.isArray(reviewsRes) ? reviewsRes : reviewsRes?.reviews || [];
        const rawRelated = (relatedRes?.products || relatedRes || []).filter((p: any) => p.id !== initialProduct.id);
        initialRelated = rawRelated.slice(0, 4);
      }
    } catch (err) {
      console.warn('SSR product details pre-fetch notice:', err);
    }
  }

  // Schema.org Product & Breadcrumb JSON-LD
  let jsonLdProduct: any = null;
  let jsonLdBreadcrumb: any = null;

  if (initialProduct) {
    const storeName = (settings.store_name || settings.site_name || 'StoreForge').trim();
    const primaryImg =
      (initialProduct.images || []).find((img: any) => img.isPrimary) ||
      (initialProduct.images || [])[0] ||
      {};
    const ogImage = getAbsoluteImageUrl(primaryImg.imageUrl || initialProduct.imageUrl, siteUrl);
    const productUrl = `${siteUrl}/products/${encodeURIComponent(slug || '')}`;

    const defaultVar = (initialProduct.variants || []).find((v: any) => v.isDefault) || (initialProduct.variants || [])[0] || {};
    const price = Number(defaultVar.price || initialProduct.min_price || 0);

    jsonLdProduct = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: initialProduct.name,
      image: [ogImage],
      description: stripHtmlToText(initialProduct.shortDescription || initialProduct.fullDescription || initialProduct.name, 250),
      sku: `PROD-${initialProduct.id}`,
      brand: {
        '@type': 'Brand',
        name: storeName,
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'BDT',
        price: price > 0 ? price : 1000,
        itemCondition: 'https://schema.org/NewCondition',
        availability: initialProduct.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };

    if (initialReviews.length > 0) {
      const totalScore = initialReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 5), 0);
      const avgScore = Number((totalScore / initialReviews.length).toFixed(1));
      jsonLdProduct.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgScore,
        reviewCount: initialReviews.length,
      };
    }

    jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${siteUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: initialProduct.name,
          item: productUrl,
        },
      ],
    };
  }

  return (
    <>
      {jsonLdProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
      )}
      {jsonLdBreadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />
      )}
      <Wrapper
        key={slug || 'product-details'}
        initialProduct={initialProduct}
        initialReviews={initialReviews}
        initialRelatedProducts={initialRelated}
      />
    </>
  );
}
