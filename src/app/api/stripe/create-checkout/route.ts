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

// Allowed price IDs - only these can be used
const ALLOWED_PRICE_IDS = [
  process.env.STRIPE_RAMADAN_PASS_PRICE_ID,
].filter(Boolean);

// Validate URL is from our domain to prevent open redirect
function isValidRedirectUrl(url: string | undefined): boolean {
  if (!url) return true; // Will use default
  try {
    const parsed = new URL(url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return false;
    const appDomain = new URL(appUrl).hostname;
    return parsed.hostname === appDomain || parsed.hostname === 'localhost';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();

    // Verify request origin
    const origin = request.headers.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (origin && appUrl && !origin.includes(new URL(appUrl).hostname) && !origin.includes('localhost')) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { priceId, successUrl, cancelUrl, discountCode } = body;

    // Validate priceId - must be from allowed list or use default
    const finalPriceId = priceId || process.env.STRIPE_RAMADAN_PASS_PRICE_ID;
    if (priceId && !ALLOWED_PRICE_IDS.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Validate redirect URLs to prevent open redirect attacks
    if (!isValidRedirectUrl(successUrl) || !isValidRedirectUrl(cancelUrl)) {
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    // Get family for discount code validation
    const { data: family } = await supabase
      .from('families')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    // Validate discount code if provided
    let stripeCouponId: string | undefined;
    let discountValidation: { is_valid: boolean; error_message?: string; stripe_coupon_id?: string } | null = null;

    if (discountCode && family) {
      const { data: validationResult } = await supabase.rpc('validate_discount_code', {
        p_code: discountCode,
        p_family_id: family.id,
      });

      if (validationResult && validationResult.length > 0) {
        const validation = validationResult[0];
        discountValidation = validation;

        if (!validation.is_valid) {
          return NextResponse.json({
            error: validation.error_message || 'Invalid discount code'
          }, { status: 400 });
        }

        stripeCouponId = validation.stripe_coupon_id || undefined;
      }
    }

    // Get or create Stripe customer
    let customerId = family?.stripe_customer_id;

    if (!customerId) {
      // Check if customer already exists with this email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        customerId = customer.id;
      }

      // Save customer ID to family
      if (family) {
        await supabase
          .from('families')
          .update({ stripe_customer_id: customerId })
          .eq('id', family.id);
      }
    }

    // Build checkout session options
    // Using 'payment' mode for one-time £29.99 annual pass
    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'payment', // One-time payment for 12 months access
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/family?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/family?canceled=true`,
      payment_intent_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        discount_code: discountCode || '',
      },
      allow_promotion_codes: true, // Allow Stripe promotion codes
    };

    // Add coupon if we have a Stripe coupon ID
    if (stripeCouponId) {
      checkoutOptions.discounts = [{ coupon: stripeCouponId }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(checkoutOptions);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      discountApplied: !!stripeCouponId,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
