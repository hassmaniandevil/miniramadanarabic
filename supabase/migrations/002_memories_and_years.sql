-- Migration: Add Memories, Time Capsules, and Multi-Year Support
-- This migration adds ramadan_year tracking, timezone support per profile,
-- photo memories, and time capsule messages.

-- ============================================
-- ADD RAMADAN_YEAR TO ALL ACTIVITY TABLES
-- ============================================

-- Stars
ALTER TABLE stars ADD COLUMN IF NOT EXISTS ramadan_year INTEGER;

-- Fasting logs
ALTER TABLE fasting_logs ADD COLUMN IF NOT EXISTS ramadan_year INTEGER;

-- Suhoor logs
ALTER TABLE suhoor_logs ADD COLUMN IF NOT EXISTS ramadan_year INTEGER;

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ramadan_year INTEGER;

-- Feeling check-ins
ALTER TABLE feeling_checkins ADD COLUMN IF NOT EXISTS ramadan_year INTEGER;

-- ============================================
-- BACKFILL WITH CURRENT YEAR (2026)
-- ============================================
UPDATE stars SET ramadan_year = 2026 WHERE ramadan_year IS NULL;
UPDATE fasting_logs SET ramadan_year = 2026 WHERE ramadan_year IS NULL;
UPDATE suhoor_logs SET ramadan_year = 2026 WHERE ramadan_year IS NULL;
UPDATE messages SET ramadan_year = 2026 WHERE ramadan_year IS NULL;
UPDATE feeling_checkins SET ramadan_year = 2026 WHERE ramadan_year IS NULL;

-- ============================================
-- ADD TIMEZONE AND LOCATION TO PROFILES
-- ============================================
-- Each profile can have their own timezone (for family in different countries)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_label TEXT;

-- ============================================
-- CREATE MEMORIES TABLE (PHOTO GALLERY)
-- ============================================
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ramadan_year INTEGER NOT NULL,
  ramadan_day INTEGER CHECK (ramadan_day >= 0 AND ramadan_day <= 30),
  category TEXT NOT NULL CHECK (category IN (
    'first_iftar',
    'decorations',
    'family',
    'suhoor',
    'eid',
    'special',
    'kindness',
    'other'
  )),
  caption TEXT,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE TIME_CAPSULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  written_year INTEGER NOT NULL,
  message TEXT NOT NULL,
  voice_url TEXT,
  reveal_type TEXT NOT NULL CHECK (reveal_type IN (
    'next_ramadan',
    'next_eid',
    'specific_date'
  )),
  reveal_date DATE,
  is_revealed BOOLEAN DEFAULT false,
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR MEMORIES
-- ============================================
DROP POLICY IF EXISTS "Users can view family memories" ON memories;
CREATE POLICY "Users can view family memories" ON memories
  FOR SELECT USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert family memories" ON memories;
CREATE POLICY "Users can insert family memories" ON memories
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update family memories" ON memories;
CREATE POLICY "Users can update family memories" ON memories
  FOR UPDATE USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete family memories" ON memories;
CREATE POLICY "Users can delete family memories" ON memories
  FOR DELETE USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR TIME CAPSULES
-- ============================================
DROP POLICY IF EXISTS "Users can view family time capsules" ON time_capsules;
CREATE POLICY "Users can view family time capsules" ON time_capsules
  FOR SELECT USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert family time capsules" ON time_capsules;
CREATE POLICY "Users can insert family time capsules" ON time_capsules
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update family time capsules" ON time_capsules;
CREATE POLICY "Users can update family time capsules" ON time_capsules
  FOR UPDATE USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete family time capsules" ON time_capsules;
CREATE POLICY "Users can delete family time capsules" ON time_capsules
  FOR DELETE USING (
    family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_memories_family_year ON memories(family_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_memories_profile ON memories(profile_id);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON memories(family_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_time_capsules_recipient ON time_capsules(recipient_id, is_revealed);
CREATE INDEX IF NOT EXISTS idx_time_capsules_reveal ON time_capsules(reveal_date, is_revealed) WHERE is_revealed = false;
CREATE INDEX IF NOT EXISTS idx_time_capsules_family_year ON time_capsules(family_id, written_year);

-- Indexes for ramadan_year on existing tables
CREATE INDEX IF NOT EXISTS idx_stars_year ON stars(family_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_fasting_logs_year ON fasting_logs(family_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_suhoor_logs_year ON suhoor_logs(family_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_messages_year ON messages(family_id, ramadan_year);

-- ============================================
-- FUNCTION TO GET AVAILABLE RAMADAN YEARS
-- ============================================
CREATE OR REPLACE FUNCTION get_family_ramadan_years(p_family_id UUID)
RETURNS TABLE(year INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT s.ramadan_year
  FROM stars s
  WHERE s.family_id = p_family_id AND s.ramadan_year IS NOT NULL
  UNION
  SELECT DISTINCT m.ramadan_year
  FROM memories m
  WHERE m.family_id = p_family_id
  ORDER BY 1 DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
