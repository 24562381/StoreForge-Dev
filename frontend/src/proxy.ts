import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminUrl } from './lib/urls';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block any admin routes from running on the public customer storefront
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/moderator' ||
    pathname.startsWith('/moderator/')
  ) {
    const adminUrl = getAdminUrl();
    // If admin is on a separate port/domain, cleanly redirect or 404
    const url = request.nextUrl.clone();
    url.pathname = '/not-found';
    return NextResponse.rewrite(url, { status: 404 });
  }

  // Security Hardening: Strip internal microservice authentication headers from incoming external requests.
  // External browser visitors must never be able to inject or tamper with inter-service authentication tokens.
  const requestHeaders = new Headers(request.headers);
  let headersModified = false;
  if (requestHeaders.has('x-microservice-token')) {
    requestHeaders.delete('x-microservice-token');
    headersModified = true;
  }
  for (const headerKey of Array.from(requestHeaders.keys())) {
    if (headerKey.startsWith('x-internal-')) {
      requestHeaders.delete(headerKey);
      headersModified = true;
    }
  }

  if (headersModified) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, sw.js, manifest.json, offline.html, no-image.svg (PWA & fallback assets)
     * - icons, images, css, uploads (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|offline\\.html|no-image\\.svg|icons/|images/|css/|uploads/).*)',
  ],
};
