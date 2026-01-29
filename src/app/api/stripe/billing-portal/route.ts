import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get family and Stripe customer ID
    const { data: family } = await supabase
      .from('families')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!family?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { returnUrl } = body;

    // Validate return URL to prevent open redirect attacks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let validatedReturnUrl = `${appUrl}/settings`;

    if (returnUrl) {
      try {
        const returnUrlObj = new URL(returnUrl);
        const appUrlObj = new URL(appUrl);

        // Only allow redirects to our own domain
        if (returnUrlObj.origin === appUrlObj.origin) {
          validatedReturnUrl = returnUrl;
        }
      } catch {
        // Invalid URL, use default
      }
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: family.stripe_customer_id,
      return_url: validatedReturnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
