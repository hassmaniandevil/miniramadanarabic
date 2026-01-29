-- 005_family_connections.sql
-- Family connections, codes, and encouragements

-- ============================================
-- 1. Add family_code to families table
-- ============================================

ALTER TABLE families ADD COLUMN IF NOT EXISTS family_code TEXT UNIQUE;

-- Function to generate a random 6-char alphanumeric code
-- Using charset without ambiguous chars: no I, O, 0, 1
CREATE OR REPLACE FUNCTION generate_family_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
  attempts INT := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM families WHERE family_code = result) THEN
      RETURN result;
    END IF;

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique family code after 100 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate family_code on insert
CREATE OR REPLACE FUNCTION set_family_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.family_code IS NULL THEN
    NEW.family_code := generate_family_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_family_code ON families;
CREATE TRIGGER trigger_set_family_code
  BEFORE INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION set_family_code();

-- Backfill existing families that don't have a code
DO $$
DECLARE
  fam RECORD;
BEGIN
  FOR fam IN SELECT id FROM families WHERE family_code IS NULL LOOP
    UPDATE families SET family_code = generate_family_code() WHERE id = fam.id;
  END LOOP;
END;
$$;

-- Make family_code NOT NULL after backfill
ALTER TABLE families ALTER COLUMN family_code SET NOT NULL;

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_families_family_code ON families (family_code);

-- ============================================
-- 2. Family Connections table
-- ============================================

CREATE TABLE IF NOT EXISTS family_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviting_family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  invited_family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  inviting_shares BOOLEAN NOT NULL DEFAULT true,
  invited_shares BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate connections in either direction
  CONSTRAINT unique_connection UNIQUE (inviting_family_id, invited_family_id),
  CONSTRAINT no_self_connection CHECK (inviting_family_id != invited_family_id)
);

CREATE INDEX IF NOT EXISTS idx_family_connections_inviting ON family_connections (inviting_family_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_invited ON family_connections (invited_family_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_status ON family_connections (status);

-- ============================================
-- 3. Family Encouragements table
-- ============================================

CREATE TABLE IF NOT EXISTS family_encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES family_connections(id) ON DELETE CASCADE,
  sender_family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  receiver_family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  emoji TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_encouragements_connection ON family_encouragements (connection_id);
CREATE INDEX IF NOT EXISTS idx_family_encouragements_receiver ON family_encouragements (receiver_family_id);
CREATE INDEX IF NOT EXISTS idx_family_encouragements_unread ON family_encouragements (receiver_family_id, is_read) WHERE NOT is_read;

-- ============================================
-- 4. RLS Policies
-- ============================================

ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_encouragements ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's family ID
CREATE OR REPLACE FUNCTION get_user_family_id()
RETURNS UUID AS $$
  SELECT id FROM families WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Family Connections: both sides can read their connections
CREATE POLICY "Users can view their connections"
  ON family_connections FOR SELECT
  USING (
    inviting_family_id = get_user_family_id()
    OR invited_family_id = get_user_family_id()
  );

-- Only the inviter can create a connection request
CREATE POLICY "Users can create connection requests"
  ON family_connections FOR INSERT
  WITH CHECK (
    inviting_family_id = get_user_family_id()
  );

-- Both sides can update (accept/decline, toggle share flags)
CREATE POLICY "Users can update their connections"
  ON family_connections FOR UPDATE
  USING (
    inviting_family_id = get_user_family_id()
    OR invited_family_id = get_user_family_id()
  );

-- Either side can remove a connection
CREATE POLICY "Users can delete their connections"
  ON family_connections FOR DELETE
  USING (
    inviting_family_id = get_user_family_id()
    OR invited_family_id = get_user_family_id()
  );

-- Encouragements: sender and receiver can read
CREATE POLICY "Users can view their encouragements"
  ON family_encouragements FOR SELECT
  USING (
    sender_family_id = get_user_family_id()
    OR receiver_family_id = get_user_family_id()
  );

-- Only sender can create encouragements
CREATE POLICY "Users can send encouragements"
  ON family_encouragements FOR INSERT
  WITH CHECK (
    sender_family_id = get_user_family_id()
  );

-- Receiver can mark as read
CREATE POLICY "Users can update their received encouragements"
  ON family_encouragements FOR UPDATE
  USING (
    receiver_family_id = get_user_family_id()
  );
