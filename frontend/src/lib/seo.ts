import { headers } from 'next/headers';
import { getFrontendUrl, normalizeSecureUrl } from './urls';

export function normalizeDomainUrl(rawUrlOrDomain: string): string {
  return normalizeSecureUrl(rawUrlOrDomain, 3000);
}

/**
 * Synchronous site URL resolver for static contexts.
 * Prioritizes explicit host, live window origin, and configured custom domain over HTTPS.
 */
export function getSiteUrl(explicitHost?: string): string {
  return getFrontendUrl({ explicitHost });
}

/**
 * Fully dynamic asynchronous site URL resolver for Server Components, SSR & Metadata.
 * Extracts the live incoming custom domain and protocol directly from request headers.
 * Guaranteed to return the custom domain over HTTPS when running on a live server.
 */
export async function resolveSiteUrl(explicitHost?: string): Promise<string> {
  if (explicitHost && typeof explicitHost === 'string' && explicitHost.trim()) {
    return normalizeDomainUrl(explicitHost);
  }

  try {
    const headerList = await headers();
    const forwardedHost = headerList.get('x-forwarded-host');
    const hostHeader = headerList.get('host');
    const incomingHost = (forwardedHost || hostHeader || '').trim();

    if (incomingHost) {
      const forwardedProto = headerList.get('x-forwarded-proto');
      const isLocal = incomingHost.startsWith('localhost') || incomingHost.startsWith('127.0.0.1');
      const proto = forwardedProto || (isLocal ? 'http' : 'https');
      return `${proto}://${incomingHost.replace(/\/+$/, '')}`;
    }
  } catch {
    // headers() unavailable in static build context, fallback to configured domain
  }

  return getSiteUrl();
}

/**
 * Strips HTML formatting and truncates text cleanly for search engine meta descriptions.
 */
export function stripHtmlToText(rawHtml: string, maxLength: number = 160): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  const clean = rawHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Resolves absolute image URLs required by OpenGraph, Twitter, and Schema.org rich results.
 */
export function getAbsoluteImageUrl(imageUrl?: string | null, siteBaseUrl?: string): string {
  const base = siteBaseUrl || getSiteUrl();
  if (!imageUrl || typeof imageUrl !== 'string') {
    return `${base}/icons/icon-512x512.png`;
  }
  const clean = imageUrl.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return `${base}${clean.startsWith('/') ? clean : `/${clean}`}`;
}
