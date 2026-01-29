# Stripe Payment Setup Guide

This guide will help you set up Stripe payments for MiniRamadan in **test mode** first, then go live.

## Quick Start (5 minutes)

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create a free account
2. Complete email verification

### Step 2: Get Test API Keys
1. In Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API Keys**
3. You'll see:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal" to see it)

### Step 3: Create a Product
1. Go to **Products** in the sidebar
2. Click **+ Add Product**
3. Fill in:
   - Name: `Ramadan Pass`
   - Description: `12 months access to all premium features`
4. Add a price:
   - Amount: `£29.99` (or your local currency equivalent)
   - Type: `One time` (not recurring)
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`)

### Step 4: Update Environment Variables
Edit your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_RAMADAN_PASS_PRICE_ID=price_your_price_id_here
```

### Step 5: Set Up Webhook (Optional for local testing)
For full functionality (subscription updates, cancellations):

1. Go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. Enter your URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

Add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 6: Test a Purchase
1. Start your app: `npm run dev`
2. Go to Settings > Upgrade to Pass
3. You'll see a purple "Test Mode Active" banner
4. Click "Start Free Trial"
5. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## Test Card Numbers

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Insufficient funds |

## Going Live

When you're ready for real payments:

1. Complete Stripe account verification (identity, bank account)
2. In Stripe Dashboard, toggle the **Test mode** switch OFF
3. Get your live keys (start with `sk_live_` and `pk_live_`)
4. Create your product again in live mode
5. Update `.env.local` with live keys
6. Set up webhook with your production URL

## Troubleshooting

### "Payments Not Configured" error
- Check that all 3 keys are in `.env.local`
- Make sure keys don't contain placeholder `xxx` values
- Restart your dev server after changing `.env.local`

### Checkout doesn't open
- Check browser console for errors
- Verify your Price ID is correct
- Make sure you're logged in

### Webhook not receiving events
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook signing secret matches

## Local Webhook Testing with Stripe CLI

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret it shows
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

Now when you make test purchases, webhook events will be forwarded to your local server!
