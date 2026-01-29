-- ============================================
-- Subscription & Discount Code System
-- ============================================

-- Add subscription fields to families if not exist
ALTER TABLE families ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid'));
ALTER TABLE families ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired'));
ALTER TABLE families ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE families ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;
ALTER TABLE families ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Create discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  stripe_coupon_id TEXT, -- Optional Stripe coupon ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount code redemptions table (tracks who used what)
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_checkout_session_id TEXT,
  UNIQUE(discount_code_id, family_id) -- Each family can only use a code once
);

-- Create subscription history table (audit trail)
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'subscription_expired',
    'payment_succeeded',
    'payment_failed',
    'trial_started',
    'trial_ended',
    'discount_applied'
  )),
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_family ON discount_redemptions(family_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_family ON subscription_history(family_id);
CREATE INDEX IF NOT EXISTS idx_families_stripe_customer ON families(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_families_subscription ON families(stripe_subscription_id);

-- RLS policies
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Discount codes are read-only for users (admin creates them)
DROP POLICY IF EXISTS "Anyone can read active discount codes" ON discount_codes;
CREATE POLICY "Anyone can read active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Redemptions - users can see their own
DROP POLICY IF EXISTS "Users can view their redemptions" ON discount_redemptions;
CREATE POLICY "Users can view their redemptions" ON discount_redemptions
  FOR SELECT USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- Subscription history - users can see their own
DROP POLICY IF EXISTS "Users can view their subscription history" ON subscription_history;
CREATE POLICY "Users can view their subscription history" ON subscription_history
  FOR SELECT USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- Insert some default discount codes
INSERT INTO discount_codes (code, description, discount_type, discount_value, max_uses, valid_until) VALUES
  ('RAMADAN2026', 'Ramadan 2026 Launch Discount', 'percent', 25, 1000, '2026-04-15'),
  ('EARLYBIRD', 'Early Bird Special', 'percent', 30, 500, '2026-03-01'),
  ('FAMILY50', '50% Family Discount', 'percent', 50, 100, '2026-12-31'),
  ('WELCOME10', 'Welcome Discount', 'fixed', 1.00, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- Function to validate and apply discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_family_id UUID
) RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT,
  stripe_coupon_id TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_already_used BOOLEAN;
BEGIN
  -- Get the discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code);

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Invalid discount code'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if code is active
  IF NOT v_discount.is_active THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'This code is no longer active'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check validity dates
  IF v_discount.valid_from IS NOT NULL AND NOW() < v_discount.valid_from THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'This code is not yet valid'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_discount.valid_until IS NOT NULL AND NOW() > v_discount.valid_until THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'This code has expired'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.current_uses >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'This code has reached its usage limit'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if family already used this code
  SELECT EXISTS(
    SELECT 1 FROM discount_redemptions
    WHERE discount_code_id = v_discount.id AND family_id = p_family_id
  ) INTO v_already_used;

  IF v_already_used THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'You have already used this code'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Code is valid
  RETURN QUERY SELECT
    true,
    v_discount.discount_type,
    v_discount.discount_value,
    NULL::TEXT,
    v_discount.stripe_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem a discount code
CREATE OR REPLACE FUNCTION redeem_discount_code(
  p_code TEXT,
  p_family_id UUID,
  p_checkout_session_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  -- Get discount code id
  SELECT id INTO v_discount_id
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Insert redemption
  INSERT INTO discount_redemptions (discount_code_id, family_id, stripe_checkout_session_id)
  VALUES (v_discount_id, p_family_id, p_checkout_session_id)
  ON CONFLICT (discount_code_id, family_id) DO NOTHING;

  -- Increment usage count
  UPDATE discount_codes
  SET current_uses = current_uses + 1, updated_at = NOW()
  WHERE id = v_discount_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
