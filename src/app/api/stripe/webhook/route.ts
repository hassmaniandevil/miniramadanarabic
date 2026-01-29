import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
  });
}

// Create admin Supabase client for webhook operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials not configured');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to get family ID from Stripe customer
async function getFamilyFromStripeCustomer(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('families')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.id || null;
}

// Helper to get family ID from user ID
async function getFamilyFromUserId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', userId)
    .single();

  return data?.id || null;
}

// Update family subscription status
async function updateFamilySubscription(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  familyId: string,
  updates: {
    subscriptionTier?: 'free' | 'paid';
    subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
    stripeSubscriptionId?: string | null;
    subscriptionCurrentPeriodEnd?: string | null;
    subscriptionCancelAtPeriodEnd?: boolean;
  }
) {
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.subscriptionTier !== undefined) {
    dbUpdates.subscription_tier = updates.subscriptionTier;
  }
  if (updates.subscriptionStatus !== undefined) {
    dbUpdates.subscription_status = updates.subscriptionStatus;
  }
  if (updates.stripeSubscriptionId !== undefined) {
    dbUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
  }
  if (updates.subscriptionCurrentPeriodEnd !== undefined) {
    dbUpdates.subscription_current_period_end = updates.subscriptionCurrentPeriodEnd;
  }
  if (updates.subscriptionCancelAtPeriodEnd !== undefined) {
    dbUpdates.subscription_cancel_at_period_end = updates.subscriptionCancelAtPeriodEnd;
  }

  const { error } = await supabase
    .from('families')
    .update(dbUpdates)
    .eq('id', familyId);

  if (error) {
    console.error('Error updating family subscription:', error);
    throw error;
  }
}

// Log subscription event
async function logSubscriptionEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  familyId: string,
  eventType: string,
  stripeEventId: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase.from('subscription_history').insert({
    family_id: familyId,
    event_type: eventType,
    stripe_event_id: stripeEventId,
    metadata,
  });

  if (error) {
    console.error('Error logging subscription event:', error);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as Record<string, unknown>;
        const metadata = session.metadata as Record<string, string> | undefined;
        const userId = metadata?.supabase_user_id;
        const discountCode = metadata?.discount_code;
        const mode = session.mode as string;

        if (userId) {
          const familyId = await getFamilyFromUserId(supabase, userId as string);

          if (familyId) {
            // Calculate subscription end date (12 months from now for one-time payment)
            const subscriptionEnd = new Date();
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

            // Update subscription status
            // For one-time payments (mode === 'payment'), set 12-month access
            // For subscriptions, use the subscription ID
            await updateFamilySubscription(supabase, familyId, {
              subscriptionTier: 'paid',
              subscriptionStatus: 'active',
              stripeSubscriptionId: mode === 'subscription'
                ? (session.subscription as string) || null
                : (session.payment_intent as string) || null, // Store payment intent for one-time
              subscriptionCurrentPeriodEnd: subscriptionEnd.toISOString(),
              subscriptionCancelAtPeriodEnd: false,
            });

            // Log the event
            await logSubscriptionEvent(
              supabase,
              familyId,
              'subscription_created',
              event.id,
              {
                checkout_session_id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                discount_code: discountCode,
                payment_mode: mode,
                access_until: subscriptionEnd.toISOString(),
              }
            );

            // If discount code was used, record redemption
            if (discountCode) {
              await supabase.rpc('redeem_discount_code', {
                p_code: discountCode,
                p_family_id: familyId,
                p_checkout_session_id: session.id as string,
              });

              await logSubscriptionEvent(
                supabase,
                familyId,
                'discount_applied',
                event.id,
                { discount_code: discountCode }
              );
            }

            console.log(`Ramadan Pass activated for family: ${familyId}, access until: ${subscriptionEnd.toISOString()}`);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        // Use Record type for flexible property access with different Stripe API versions
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const customerId = subscription.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          const subscriptionStatus = subscription.status as string;
          const status = subscriptionStatus === 'trialing' ? 'trialing' : 'active';
          const currentPeriodEnd = subscription.current_period_end as number | undefined;
          const cancelAtPeriodEnd = subscription.cancel_at_period_end as boolean | undefined;

          await updateFamilySubscription(supabase, familyId, {
            subscriptionTier: 'paid',
            subscriptionStatus: status,
            stripeSubscriptionId: subscription.id as string,
            subscriptionCurrentPeriodEnd: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
          });

          if (subscriptionStatus === 'trialing') {
            await logSubscriptionEvent(supabase, familyId, 'trial_started', event.id, {
              trial_end: subscription.trial_end,
            });
          }

          console.log(`Subscription created for family: ${familyId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const customerId = subscription.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          const subscriptionStatus = subscription.status as string;
          const currentPeriodEnd = subscription.current_period_end as number | undefined;
          const cancelAtPeriodEnd = subscription.cancel_at_period_end as boolean | undefined;

          let status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' = 'active';

          switch (subscriptionStatus) {
            case 'trialing':
              status = 'trialing';
              break;
            case 'active':
              status = 'active';
              break;
            case 'past_due':
              status = 'past_due';
              break;
            case 'canceled':
            case 'unpaid':
              status = 'cancelled';
              break;
            default:
              status = 'active';
          }

          await updateFamilySubscription(supabase, familyId, {
            subscriptionTier: subscriptionStatus === 'canceled' ? 'free' : 'paid',
            subscriptionStatus: status,
            subscriptionCurrentPeriodEnd: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
          });

          await logSubscriptionEvent(supabase, familyId, 'subscription_updated', event.id, {
            status: subscriptionStatus,
            cancel_at_period_end: cancelAtPeriodEnd,
          });

          console.log(`Subscription updated for family: ${familyId}, status: ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const customerId = subscription.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          await updateFamilySubscription(supabase, familyId, {
            subscriptionTier: 'free',
            subscriptionStatus: 'cancelled',
            stripeSubscriptionId: null,
            subscriptionCurrentPeriodEnd: null,
            subscriptionCancelAtPeriodEnd: false,
          });

          await logSubscriptionEvent(supabase, familyId, 'subscription_cancelled', event.id);

          console.log(`Subscription cancelled for family: ${familyId}`);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const customerId = subscription.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          // Could trigger email notification here
          console.log(`Trial ending soon for family: ${familyId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const customerId = invoice.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          // Ensure subscription is active after successful payment
          await updateFamilySubscription(supabase, familyId, {
            subscriptionTier: 'paid',
            subscriptionStatus: 'active',
          });

          await logSubscriptionEvent(supabase, familyId, 'payment_succeeded', event.id, {
            invoice_id: invoice.id,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
          });

          console.log(`Payment succeeded for family: ${familyId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const customerId = invoice.customer as string;
        const familyId = await getFamilyFromStripeCustomer(supabase, customerId);

        if (familyId) {
          await updateFamilySubscription(supabase, familyId, {
            subscriptionStatus: 'past_due',
          });

          await logSubscriptionEvent(supabase, familyId, 'payment_failed', event.id, {
            invoice_id: invoice.id,
            attempt_count: invoice.attempt_count,
          });

          // Could trigger email notification here
          console.log(`Payment failed for family: ${familyId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
