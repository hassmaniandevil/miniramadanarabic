import { NextResponse } from 'next/server';

/**
 * GET /api/stripe/config
 *
 * Returns Stripe configuration status (without exposing secrets)
 * Used by frontend to show appropriate UI
 */
export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceId = process.env.STRIPE_RAMADAN_PASS_PRICE_ID;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Check if keys are configured (not placeholder values)
  const isSecretKeyConfigured = !!(secretKey && !secretKey.includes('xxx'));
  const isPublishableKeyConfigured = !!(publishableKey && !publishableKey.includes('xxx'));
  const isPriceIdConfigured = !!(priceId && !priceId.includes('xxx'));
  const isWebhookConfigured = !!(webhookSecret && !webhookSecret.includes('xxx'));

  const isConfigured = isSecretKeyConfigured && isPublishableKeyConfigured && isPriceIdConfigured;

  // Check if we're in test mode
  const isTestMode = secretKey?.startsWith('sk_test_') ?? true;

  // Build list of what's missing
  const missingConfig: string[] = [];
  if (!isSecretKeyConfigured) missingConfig.push('Secret Key');
  if (!isPublishableKeyConfigured) missingConfig.push('Publishable Key');
  if (!isPriceIdConfigured) missingConfig.push('Price ID');
  if (!isWebhookConfigured) missingConfig.push('Webhook Secret');

  return NextResponse.json({
    isConfigured,
    isTestMode,
    missingConfig,
    // Safe to expose - this is public anyway
    publishableKey: isPublishableKeyConfigured ? publishableKey : null,
  });
}
