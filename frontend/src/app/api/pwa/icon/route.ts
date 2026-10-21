import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Valid 1x1 transparent PNG fallback buffer
const FALLBACK_1X1_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

import { getBackendUrl } from '../../../../lib/urls';

function getBackendBaseUrl(): string {
  return getBackendUrl({ asApiRoute: true });
}

function getLocalFallbackIcon(size: string): Uint8Array {
  const is512 = size === '512';
  const iconFilename = is512 ? 'icon-512x512.png' : 'icon-192x192.png';
  const filePath = path.join(process.cwd(), 'public', 'icons', iconFilename);

  try {
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return new Uint8Array(buf);
    }
  } catch {}

  return new Uint8Array(FALLBACK_1X1_PNG);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 1. Sanitize query parameters to prevent injection or invalid requests
  const rawTenant = searchParams.get('tenant') || 'default';
  const rawSize = searchParams.get('size') || '192';
  const rawPurpose = searchParams.get('purpose') || 'any';

  const tenant = rawTenant.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || 'default';
  const size = rawSize.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 16) || '192';
  const purpose = rawPurpose.toLowerCase() === 'maskable' ? 'maskable' : 'any';

  const backendBase = getBackendBaseUrl();
  const microserviceToken = (
    process.env.INTERNAL_MICROSERVICE_TOKEN ||
    process.env.JWT_SECRET ||
    ''
  ).trim();

  const targetUrl = `${backendBase}/tenants/asset?tenant=${encodeURIComponent(tenant)}&size=${encodeURIComponent(size)}&purpose=${encodeURIComponent(purpose)}`;

  try {
    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-microservice-token': microserviceToken,
        'Accept': 'image/png,image/webp,image/*;q=0.9',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (backendRes.ok) {
      const arrayBuf = await backendRes.arrayBuffer();
      const contentType = backendRes.headers.get('content-type') || 'image/png';
      const etag = backendRes.headers.get('etag');

      // Client conditional caching (HTTP 304 Not Modified)
      const clientEtag = request.headers.get('if-none-match');
      if (clientEtag && etag && clientEtag === etag) {
        return new NextResponse(null, { status: 304 });
      }

      return new NextResponse(arrayBuf as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': 'inline',
          ...(etag ? { ETag: etag } : {}),
        },
      });
    }
  } catch {
    // Backend timeout or connection failure; gracefully proceed to local fallback
  }

  // Graceful Fallback: Always return a valid image/png to prevent Android WebAPK installation rejection
  const fallbackBytes = getLocalFallbackIcon(size);
  return new NextResponse(fallbackBytes as any, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    },
  });
}
