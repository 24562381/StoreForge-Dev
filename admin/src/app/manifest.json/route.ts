import { NextResponse } from 'next/server';
import manifest from '../manifest';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const data = await manifest();
  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
