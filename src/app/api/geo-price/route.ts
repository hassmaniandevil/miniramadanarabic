import { NextRequest, NextResponse } from 'next/server';
import { getGeoPrice, DEFAULT_PRICE, formatPrice, formatOriginalPrice } from '@/lib/geo-pricing';

export async function GET(request: NextRequest) {
  // Get country from Vercel's geo headers
  const country = request.headers.get('x-vercel-ip-country') ||
                  request.geo?.country ||
                  'US';

  const price = getGeoPrice(country);

  return NextResponse.json({
    ...price,
    formattedPrice: formatPrice(price),
    formattedOriginalPrice: formatOriginalPrice(price),
  });
}

// Also export for server components
export async function getGeoPriceFromRequest(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') ||
                  request.geo?.country ||
                  'US';

  return getGeoPrice(country);
}
