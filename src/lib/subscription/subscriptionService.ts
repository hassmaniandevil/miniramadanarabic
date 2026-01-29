/**
 * Unified Subscription Service
 *
 * Handles subscription purchases across all platforms:
 * - Web: Stripe Checkout
 * - iOS: App Store via RevenueCat
 * - Android: Google Play via RevenueCat
 */

import { Capacitor } from '@capacitor/core';
import { PurchasePlatform, PurchaseResult, DiscountValidationResult } from '@/types';

// RevenueCat types - import dynamically on native platforms
let Purchases: typeof import('@revenuecat/purchases-capacitor').Purchases | null = null;
let LOG_LEVEL: typeof import('@revenuecat/purchases-capacitor').LOG_LEVEL | null = null;

// Detect current platform
function getPlatform(): PurchasePlatform {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() as 'ios' | 'android';
  }
  return 'web';
}

// RevenueCat API keys (set these in your environment)
const REVENUECAT_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || '';
const REVENUECAT_ANDROID_KEY = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || '';

// Product identifiers
const PRODUCT_IDS = {
  web: process.env.STRIPE_RAMADAN_PASS_PRICE_ID || 'price_ramadan_pass',
  ios: 'rc_ramadan_pass_monthly', // RevenueCat product identifier
  android: 'rc_ramadan_pass_monthly', // RevenueCat product identifier
};

// Entitlement identifier in RevenueCat
const PREMIUM_ENTITLEMENT = 'premium';

class SubscriptionService {
  private platform: PurchasePlatform;
  private isInitialized: boolean = false;

  constructor() {
    this.platform = getPlatform();
  }

  /**
   * Initialize the subscription service
   * Call this on app startup
   */
  async initialize(userId?: string): Promise<void> {
    console.log(`Initializing subscription service for platform: ${this.platform}`);

    if (this.platform === 'web') {
      this.isInitialized = true;
      return;
    }

    try {
      // Dynamically import RevenueCat only on native platforms
      const revenueCat = await import('@revenuecat/purchases-capacitor');
      Purchases = revenueCat.Purchases;
      LOG_LEVEL = revenueCat.LOG_LEVEL;

      const apiKey = this.platform === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

      if (!apiKey) {
        console.warn(`RevenueCat API key not configured for ${this.platform}`);
        return;
      }

      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

      await Purchases.configure({
        apiKey,
        appUserID: userId || null,
      });

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  }

  /**
   * Set the user ID for RevenueCat (call after login)
   */
  async setUserId(userId: string): Promise<void> {
    if (this.platform === 'web' || !Purchases) return;

    try {
      await Purchases.logIn({ appUserID: userId });
      console.log('RevenueCat user logged in:', userId);
    } catch (error) {
      console.error('Failed to set RevenueCat user:', error);
    }
  }

  /**
   * Log out the current user from RevenueCat
   */
  async logout(): Promise<void> {
    if (this.platform === 'web' || !Purchases) return;

    try {
      await Purchases.logOut();
      console.log('RevenueCat user logged out');
    } catch (error) {
      console.error('Failed to log out RevenueCat user:', error);
    }
  }

  /**
   * Check if user has premium access
   */
  async checkPremiumStatus(): Promise<boolean> {
    if (this.platform === 'web') {
      // For web, check via API
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          return data.isPremium;
        }
      } catch (error) {
        console.error('Failed to check premium status:', error);
      }
      return false;
    }

    if (!Purchases) {
      console.warn('RevenueCat not initialized');
      return false;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
    } catch (error) {
      console.error('Failed to check premium status:', error);
      return false;
    }
  }

  /**
   * Get available products/packages
   */
  async getProducts(): Promise<Array<{
    identifier: string;
    title: string;
    description: string;
    price: string;
    priceAmount: number;
    currencyCode: string;
  }>> {
    if (this.platform === 'web') {
      // Return hardcoded web product info
      return [{
        identifier: PRODUCT_IDS.web,
        title: 'Ramadan Pass',
        description: '12 months access to all premium features',
        price: '£29.99',
        priceAmount: 29.99,
        currencyCode: 'GBP',
      }];
    }

    if (!Purchases) {
      console.warn('RevenueCat not initialized');
      return [];
    }

    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        console.warn('No current offering available');
        return [];
      }

      return offerings.current.availablePackages.map((pkg) => ({
        identifier: pkg.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.priceString,
        priceAmount: pkg.product.price,
        currencyCode: pkg.product.currencyCode,
      }));
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  /**
   * Validate a discount code (web only)
   */
  async validateDiscountCode(code: string): Promise<DiscountValidationResult> {
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isValid: false,
          errorMessage: data.error || 'Failed to validate code',
        };
      }

      return data;
    } catch (error) {
      console.error('Discount validation error:', error);
      return {
        isValid: false,
        errorMessage: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Start a purchase flow
   */
  async purchase(discountCode?: string, packageIdentifier?: string): Promise<PurchaseResult> {
    switch (this.platform) {
      case 'web':
        return this.purchaseWeb(discountCode);
      case 'ios':
      case 'android':
        return this.purchaseNative(packageIdentifier);
    }
  }

  /**
   * Web purchase via Stripe Checkout
   */
  private async purchaseWeb(discountCode?: string): Promise<PurchaseResult> {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCode,
          successUrl: `${window.location.origin}/family?success=true`,
          cancelUrl: `${window.location.origin}/settings?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          platform: 'web',
          error: data.error || 'Failed to create checkout session',
        };
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
        return {
          success: true,
          platform: 'web',
          transactionId: data.sessionId,
        };
      }

      return {
        success: false,
        platform: 'web',
        error: 'No checkout URL returned',
      };
    } catch (error) {
      console.error('Web purchase error:', error);
      return {
        success: false,
        platform: 'web',
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Native purchase via RevenueCat (iOS/Android)
   */
  private async purchaseNative(packageIdentifier?: string): Promise<PurchaseResult> {
    if (!Purchases) {
      return {
        success: false,
        platform: this.platform,
        error: 'In-app purchases not initialized. Please restart the app.',
      };
    }

    try {
      // Get offerings
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        return {
          success: false,
          platform: this.platform,
          error: 'No products available. Please try again later.',
        };
      }

      // Find the package to purchase
      let packageToPurchase = offerings.current.availablePackages[0];

      if (packageIdentifier) {
        const found = offerings.current.availablePackages.find(
          (pkg) => pkg.identifier === packageIdentifier
        );
        if (found) {
          packageToPurchase = found;
        }
      }

      if (!packageToPurchase) {
        return {
          success: false,
          platform: this.platform,
          error: 'Product not found. Please try again.',
        };
      }

      // Make the purchase
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: packageToPurchase,
      });
      const customerInfo = purchaseResult.customerInfo;

      // Check if premium entitlement is now active
      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

      if (isPremium) {
        // Sync with our server
        await this.syncPurchaseWithServer(customerInfo);

        return {
          success: true,
          platform: this.platform,
          transactionId: customerInfo.originalAppUserId,
        };
      }

      return {
        success: false,
        platform: this.platform,
        error: 'Purchase completed but entitlement not active. Please contact support.',
      };
    } catch (error: unknown) {
      console.error('Native purchase error:', error);

      // Handle user cancellation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
        return {
          success: false,
          platform: this.platform,
          error: 'Purchase was cancelled.',
        };
      }

      return {
        success: false,
        platform: this.platform,
        error: errorMessage || 'Purchase failed. Please try again.',
      };
    }
  }

  /**
   * Sync native purchase with our server
   */
  private async syncPurchaseWithServer(customerInfo: unknown): Promise<void> {
    try {
      await fetch('/api/subscription/verify-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: this.platform,
          customerInfo,
        }),
      });
    } catch (error) {
      console.error('Failed to sync purchase with server:', error);
    }
  }

  /**
   * Restore purchases (iOS and Android)
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (this.platform === 'web') {
      return {
        success: false,
        platform: 'web',
        error: 'Restore purchases is only available on mobile apps.',
      };
    }

    if (!Purchases) {
      return {
        success: false,
        platform: this.platform,
        error: 'In-app purchases not initialized.',
      };
    }

    try {
      const restoreResult = await Purchases.restorePurchases();
      const customerInfo = restoreResult.customerInfo;

      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

      if (isPremium) {
        // Sync with our server
        await this.syncPurchaseWithServer(customerInfo);

        return {
          success: true,
          platform: this.platform,
          transactionId: customerInfo.originalAppUserId,
        };
      }

      return {
        success: false,
        platform: this.platform,
        error: 'No previous purchases found.',
      };
    } catch (error) {
      console.error('Restore purchases error:', error);
      return {
        success: false,
        platform: this.platform,
        error: 'Failed to restore purchases. Please try again.',
      };
    }
  }

  /**
   * Open billing portal for managing subscription
   */
  async openBillingPortal(): Promise<boolean> {
    if (this.platform === 'web') {
      try {
        const response = await fetch('/api/stripe/billing-portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            returnUrl: window.location.href,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.url) {
          console.error('Failed to open billing portal:', data.error);
          return false;
        }

        window.location.href = data.url;
        return true;
      } catch (error) {
        console.error('Billing portal error:', error);
        return false;
      }
    }

    // On mobile, direct users to app store subscription settings
    if (this.platform === 'ios') {
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
    } else {
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
    }
    return true;
  }

  /**
   * Check if this platform supports in-app purchases
   */
  supportsInAppPurchases(): boolean {
    return this.platform === 'ios' || this.platform === 'android';
  }

  /**
   * Check if RevenueCat is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get the current platform
   */
  getCurrentPlatform(): PurchasePlatform {
    return this.platform;
  }

  /**
   * Get product ID for current platform
   */
  getProductId(): string {
    return PRODUCT_IDS[this.platform];
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Export class for testing
export { SubscriptionService };
