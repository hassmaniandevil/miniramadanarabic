import { NextRequest, NextResponse } from 'next/server';
import { getGeoPrice, formatPrice, formatOriginalPrice } from '@/lib/geo-pricing';

export async function GET(request: NextRequest) {
  // Get country from Vercel's geo headers
  // x-vercel-ip-country is set by Vercel Edge Network
  const country = request.headers.get('x-vercel-ip-country') || 'US';

  const price = getGeoPrice(country);

  return NextResponse.json({
    ...price,
    formattedPrice: formatPrice(price),
    formattedOriginalPrice: formatOriginalPrice(price),
  });
}
