import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './tailwind.css';
import { LanguageProvider } from '../lib/LanguageContext';
import { SettingsProvider } from '../lib/SettingsContext';
import { CartProvider } from '../lib/CartContext';
import { CustomerShell } from '../components/CustomerShell';
import { DynamicFavicon } from '../components/DynamicFavicon';
import { PwaRegister } from '../components/PwaRegister';
import { fetchApi } from '../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { resolveSiteUrl, getAbsoluteImageUrl } from '../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await resolveSiteUrl();

  try {
    const settings = await fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({}));
    const storeTitle = (settings.store_name || settings.site_name || settings.site_title || 'StoreForge').trim();
    const storeTagline = (settings.store_tagline || settings.site_subtitle || settings.store_tagline_en || 'Modern E-Commerce Platform').trim();
    const siteDesc = (settings.site_description || settings.meta_description || 'StoreForge - Modern E-Commerce Platform. Fast delivery, secure checkout, and premium quality products.').trim();
    const favicon = settings.store_favicon_url || '/icons/icon.svg';
    const ogImage = getAbsoluteImageUrl(settings.store_og_image || settings.store_banner_image || settings.home_banner_image || '/images/product-main.jpg', siteUrl);

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: `${storeTitle} | ${storeTagline}`,
        template: `%s | ${storeTitle}`,
      },
      description: siteDesc,
      manifest: '/manifest.webmanifest',
      alternates: {
        canonical: '/',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'website',
        locale: 'bn_BD',
        url: siteUrl,
        siteName: storeTitle,
        title: `${storeTitle} | ${storeTagline}`,
        description: siteDesc,
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
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: storeTitle,
      },
      icons: {
        icon: favicon,
        apple: '/icons/apple-touch-icon.png',
      },
    };
  } catch {
    return {
      metadataBase: new URL(siteUrl),
      title: 'StoreForge | Modern E-Commerce Platform',
      description: 'StoreForge - Modern E-Commerce Platform.',
      manifest: '/manifest.json',
      alternates: {
        canonical: '/',
      },
      robots: {
        index: true,
        follow: true,
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'StoreForge',
      },
      icons: {
        icon: '/icons/icon.svg',
        apple: '/icons/apple-touch-icon.png',
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let savedLang: 'bn' | 'en' | undefined;
  try {
    const cookieStore = await cookies();
    savedLang = cookieStore.get('sf_lang')?.value as 'bn' | 'en' | undefined;
  } catch { }

  let initialSettings: Record<string, string> = {};
  let initialCategories: any[] = [];
  let initialDictionary: Record<string, string> = {};

  try {
    const [settingsData, categoriesData] = await Promise.all([
      fetchApi('/settings/public', { cache: 'no-store' }).catch(() => ({})),
      fetchApi('/categories?activeOnly=true', { cache: 'no-store' }).catch(() => []),
    ]);

    initialSettings = settingsData || {};
    initialCategories = Array.isArray(categoriesData) ? categoriesData : [];

    const effectiveLang = (savedLang === 'en' || savedLang === 'bn')
      ? savedLang
      : (initialSettings.default_language === 'en' ? 'en' : 'bn');

    initialDictionary = await fetchApi(`/translations/dictionary?lang=${effectiveLang}`).catch(() => ({}));
  } catch (err) {
    console.warn('SSR layout data pre-fetch error:', err);
  }

  const effectiveLang = (savedLang === 'en' || savedLang === 'bn')
    ? savedLang
    : (initialSettings.default_language === 'en' ? 'en' : 'bn');

  return (
    <html lang={effectiveLang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Core Global Foundation & Icons */}
        <link rel="preload" as="image" href="/no-image.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/css/globals.css?v=21.0" />
        <link rel="stylesheet" href="/css/icons.css?v=25.0" />
        <link rel="stylesheet" href="/css/site/header-footer.css?v=57.0" />

        <link rel="stylesheet" href="/css/site/home.css?v=63.0" />
        <link rel="stylesheet" href="/css/site/products.css?v=49.0" />
        <link rel="stylesheet" href="/css/site/product-details.css?v=52.0" />
        <link rel="stylesheet" href="/css/site/search.css?v=48.0" />
        <link rel="stylesheet" href="/css/site/cart.css?v=21.0" />
        <link rel="stylesheet" href="/css/site/checkout.css?v=23.0" />
        <link rel="stylesheet" href="/css/site/confirmation.css?v=56.0" />
        <link rel="stylesheet" href="/css/site/track.css?v=21.0" />
        <link rel="stylesheet" href="/css/site/payment.css?v=21.0" />
        <link rel="stylesheet" href="/css/site/policy.css?v=21.0" />
        {/* PWA Manifest & App Meta */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8E5A35" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={initialSettings.store_name || initialSettings.site_name || 'StoreForge'} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <PwaRegister />
        <DynamicFavicon />
        <SettingsProvider initialSettings={initialSettings} initialCategories={initialCategories}>
          <LanguageProvider initialLang={effectiveLang} initialDictionary={initialDictionary}>
            <CartProvider>
              <CustomerShell>
                {children}
              </CustomerShell>
            </CartProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
