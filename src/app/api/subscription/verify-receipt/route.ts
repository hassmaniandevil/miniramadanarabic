import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin Supabase client for updating subscription
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials not configured');
  }

  return createAdminClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface IOSReceiptValidationResponse {
  status: number;
  environment?: 'Sandbox' | 'Production';
  receipt?: {
    in_app?: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
      is_trial_period?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
    is_trial_period?: string;
  }>;
}

// Verify iOS App Store receipt
async function verifyIOSReceipt(
  receiptData: string,
  isSandbox: boolean = false
): Promise<IOSReceiptValidationResponse | null> {
  const url = isSandbox
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  const sharedSecret = process.env.APP_STORE_SHARED_SECRET;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': sharedSecret,
        'exclude-old-transactions': true,
      }),
    });

    const data = await response.json();

    // Status 21007 means receipt is from sandbox, retry with sandbox URL
    if (data.status === 21007 && !isSandbox) {
      return verifyIOSReceipt(receiptData, true);
    }

    return data;
  } catch (error) {
    console.error('iOS receipt verification error:', error);
    return null;
  }
}

// Verify Google Play purchase
async function verifyAndroidPurchase(
  packageName: string,
  productId: string,
  purchaseToken: string
): Promise<{ valid: boolean; expiryTime?: number } | null> {
  // Note: This requires Google Play Developer API credentials
  // In production, you would use the google-auth-library and googleapis packages

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEmail || !serviceAccountKey) {
    console.error('Google Play credentials not configured');
    return null;
  }

  // Placeholder - actual implementation would use Google Play Developer API
  // const androidpublisher = google.androidpublisher('v3');
  // const auth = new google.auth.GoogleAuth({...});
  // const response = await androidpublisher.purchases.subscriptions.get({...});

  console.log('Android purchase verification - requires Google Play API setup');
  return null;
}

export async function POST(request: Request) {
  try {
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

    const { platform, receiptData, packageName, productId, purchaseToken } = body;

    // Get family
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    let isValid = false;
    let expiryTime: number | null = null;
    let transactionId: string | null = null;

    if (platform === 'ios') {
      if (!receiptData) {
        return NextResponse.json({ error: 'Receipt data required for iOS' }, { status: 400 });
      }

      const result = await verifyIOSReceipt(receiptData);

      if (result && result.status === 0) {
        // Get the latest subscription info
        const latestInfo = result.latest_receipt_info?.[0] || result.receipt?.in_app?.[0];

        if (latestInfo) {
          isValid = true;
          transactionId = latestInfo.transaction_id;

          if (latestInfo.expires_date_ms) {
            expiryTime = parseInt(latestInfo.expires_date_ms, 10);
          }
        }
      }
    } else if (platform === 'android') {
      if (!packageName || !productId || !purchaseToken) {
        return NextResponse.json(
          { error: 'Package name, product ID, and purchase token required for Android' },
          { status: 400 }
        );
      }

      const result = await verifyAndroidPurchase(packageName, productId, purchaseToken);

      if (result?.valid) {
        isValid = true;
        expiryTime = result.expiryTime || null;
        transactionId = purchaseToken;
      }
    } else {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    if (!isValid) {
      return NextResponse.json({
        verified: false,
        error: 'Receipt validation failed',
      });
    }

    // Update family subscription status
    const adminSupabase = getSupabaseAdmin();

    const subscriptionUpdate: Record<string, unknown> = {
      subscription_tier: 'paid',
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    };

    if (expiryTime) {
      subscriptionUpdate.subscription_current_period_end = new Date(expiryTime).toISOString();
    }

    await adminSupabase
      .from('families')
      .update(subscriptionUpdate)
      .eq('id', family.id);

    // Log the purchase event
    await adminSupabase.from('subscription_history').insert({
      family_id: family.id,
      event_type: 'subscription_created',
      metadata: {
        platform,
        transaction_id: transactionId,
        expiry_time: expiryTime,
      },
    });

    return NextResponse.json({
      verified: true,
      transactionId,
      expiryTime: expiryTime ? new Date(expiryTime).toISOString() : null,
    });
  } catch (error) {
    console.error('Receipt verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify receipt' },
      { status: 500 }
    );
  }
}
