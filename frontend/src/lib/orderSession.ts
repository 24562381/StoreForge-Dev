'use client';

export interface SavedOrderSession {
  orderNumber: string;
  accessToken: string;
  cachedOrder?: any;
}

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
let inMemorySessionCache: { session: SavedOrderSession | null; rawCookie: string } | null = null;

export function saveOrderSession(order: {
  orderNumber: string;
  accessToken?: string;
  [key: string]: any;
}) {
  if (typeof window === 'undefined') return;

  const orderNum = order.orderNumber || '';
  const token = order.accessToken || '';

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';

  // 1. Save in Cookies (Valid for 7 days, SameSite Lax, Secure on HTTPS)
  document.cookie = `sf_last_order_num=${encodeURIComponent(orderNum)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
  if (token) {
    document.cookie = `sf_last_order_token=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
  }

  // 2. Save in Session Storage for instant seamless hydration
  try {
    sessionStorage.setItem('sf_latest_order', JSON.stringify(order));
  } catch {}

  // Invalidate in-memory cache
  inMemorySessionCache = null;
}

export function getOrderSession(): SavedOrderSession | null {
  if (typeof window === 'undefined') return null;

  const currentCookie = document.cookie;
  if (inMemorySessionCache && inMemorySessionCache.rawCookie === currentCookie) {
    return inMemorySessionCache.session;
  }

  let orderNumber = '';
  let accessToken = '';

  // Check Cookies first
  const cookiePairs = currentCookie.split(';');
  for (let i = 0; i < cookiePairs.length; i++) {
    const pair = cookiePairs[i];
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = pair.substring(0, eqIdx).trim();
    const val = pair.substring(eqIdx + 1).trim();
    if (key === 'sf_last_order_num') {
      orderNumber = decodeURIComponent(val);
    } else if (key === 'sf_last_order_token') {
      accessToken = decodeURIComponent(val);
    }
  }

  // Check Session Storage
  let cachedOrder: any = null;
  try {
    const raw = sessionStorage.getItem('sf_latest_order');
    if (raw) {
      cachedOrder = JSON.parse(raw);
      if (!orderNumber && cachedOrder?.orderNumber) {
        orderNumber = cachedOrder.orderNumber;
      }
      if (!accessToken && cachedOrder?.accessToken) {
        accessToken = cachedOrder.accessToken;
      }
    }
  } catch {}

  if (!orderNumber) {
    inMemorySessionCache = { session: null, rawCookie: currentCookie };
    return null;
  }

  const sessionResult: SavedOrderSession = {
    orderNumber,
    accessToken,
    cachedOrder,
  };

  inMemorySessionCache = { session: sessionResult, rawCookie: currentCookie };
  return sessionResult;
}

export function clearOrderSession() {
  if (typeof window === 'undefined') return;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';
  document.cookie = `sf_last_order_num=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
  document.cookie = `sf_last_order_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
  try {
    sessionStorage.removeItem('sf_latest_order');
  } catch {}
  inMemorySessionCache = null;
}
