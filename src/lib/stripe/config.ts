/**
 * Stripe Configuration Utilities
 *
 * Helps detect test mode and configuration status
 */

export interface StripeConfig {
  isConfigured: boolean;
  isTestMode: boolean;
  publishableKey: string | null;
  missingKeys: string[];
}

/**
 * Check if Stripe is properly configured
 */
export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceId = process.env.STRIPE_RAMADAN_PASS_PRICE_ID;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const missingKeys: string[] = [];

  if (!secretKey || secretKey.includes('xxx')) {
    missingKeys.push('STRIPE_SECRET_KEY');
  }
  if (!publishableKey || publishableKey.includes('xxx')) {
    missingKeys.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  if (!priceId || priceId.includes('xxx')) {
    missingKeys.push('STRIPE_RAMADAN_PASS_PRICE_ID');
  }
  if (!webhookSecret || webhookSecret.includes('xxx')) {
    missingKeys.push('STRIPE_WEBHOOK_SECRET');
  }

  const isConfigured = missingKeys.length === 0;

  // Check if we're in test mode (keys start with sk_test_ or pk_test_)
  const isTestMode = !!(
    (secretKey?.startsWith('sk_test_') || !secretKey) &&
    (publishableKey?.startsWith('pk_test_') || !publishableKey)
  );

  return {
    isConfigured,
    isTestMode,
    publishableKey: publishableKey || null,
    missingKeys,
  };
}

/**
 * Client-side function to check if Stripe is in test mode
 */
export function isStripeTestMode(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return !publishableKey || publishableKey.startsWith('pk_test_');
}

/**
 * Check if Stripe is configured (client-side)
 */
export function isStripeConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return !!(publishableKey && !publishableKey.includes('xxx'));
}
