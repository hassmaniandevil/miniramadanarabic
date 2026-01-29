-- ===========================================
-- MiniRamadan Database Schema for Supabase
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Families Table
-- ===========================================
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_name TEXT NOT NULL,
  ramadan_start_date DATE NOT NULL,
  timezone TEXT DEFAULT 'Europe/London',
  suhoor_time TIME DEFAULT '04:30',
  iftar_time TIME DEFAULT '18:30',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family" ON families
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- Profiles Table
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('little_star', 'child', 'adult')),
  age_range TEXT CHECK (age_range IN ('3-6', '7-9', '10-12', 'adult')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view family profiles" ON profiles
  FOR SELECT USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert family profiles" ON profiles
  FOR INSERT WITH CHECK (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update family profiles" ON profiles
  FOR UPDATE USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete family profiles" ON profiles
  FOR DELETE USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- ===========================================
-- Fasting Logs Table
-- ===========================================
CREATE TABLE fasting_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL CHECK (ramadan_day >= 1 AND ramadan_day <= 30),
  mode TEXT NOT NULL CHECK (mode IN ('full', 'partial', 'tried', 'not_today')),
  partial_hours INTEGER CHECK (partial_hours >= 1 AND partial_hours <= 24),
  energy_level TEXT CHECK (energy_level IN ('tired', 'okay', 'strong')),
  notes TEXT,
  stars_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Enable RLS
ALTER TABLE fasting_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family fasting logs" ON fasting_logs
  FOR ALL USING (
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN families f ON p.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- ===========================================
-- Suhoor Logs Table
-- ===========================================
CREATE TABLE suhoor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  food_groups TEXT[] NOT NULL,
  photo_url TEXT,
  stars_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Enable RLS
ALTER TABLE suhoor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family suhoor logs" ON suhoor_logs
  FOR ALL USING (
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN families f ON p.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- ===========================================
-- Mission Completions Table
-- ===========================================
CREATE TABLE mission_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_id TEXT NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  note TEXT,
  stars_earned INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, mission_id, date)
);

-- Enable RLS
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family mission completions" ON mission_completions
  FOR ALL USING (
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN families f ON p.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- ===========================================
-- Wonder Card Views Table
-- ===========================================
CREATE TABLE wonder_card_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  wonder_card_id TEXT NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  stars_earned INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, wonder_card_id, date)
);

-- Enable RLS
ALTER TABLE wonder_card_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family wonder card views" ON wonder_card_views
  FOR ALL USING (
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN families f ON p.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- ===========================================
-- Iftar Messages Table
-- ===========================================
CREATE TABLE iftar_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'emoji', 'drawing')),
  voice_url TEXT,
  drawing_url TEXT,
  emoji TEXT,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE iftar_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family messages" ON iftar_messages
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- ===========================================
-- Feeling Check-ins Table
-- ===========================================
CREATE TABLE feeling_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  feeling_level TEXT NOT NULL CHECK (feeling_level IN ('really_hard', 'bit_tough', 'okay', 'good', 'really_good')),
  feeling_word TEXT,
  note TEXT,
  voice_note_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Enable RLS
ALTER TABLE feeling_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family feeling checkins" ON feeling_checkins
  FOR ALL USING (
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN families f ON p.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- ===========================================
-- Stars Table
-- ===========================================
CREATE TABLE stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  ramadan_day INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('fasting', 'suhoor', 'mission', 'wonder', 'checkin', 'helped')),
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family stars" ON stars
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- ===========================================
-- Constellations Table
-- ===========================================
CREATE TABLE constellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, name)
);

-- Enable RLS
ALTER TABLE constellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family constellations" ON constellations
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- ===========================================
-- Parent Notes Table
-- ===========================================
CREATE TABLE parent_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(author_id, recipient_id, year)
);

-- Enable RLS
ALTER TABLE parent_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage family parent notes" ON parent_notes
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- ===========================================
-- Indexes for Performance
-- ===========================================
CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_fasting_logs_profile_date ON fasting_logs(profile_id, date);
CREATE INDEX idx_suhoor_logs_profile_date ON suhoor_logs(profile_id, date);
CREATE INDEX idx_stars_family_date ON stars(family_id, date);
CREATE INDEX idx_iftar_messages_family_date ON iftar_messages(family_id, date);
CREATE INDEX idx_feeling_checkins_profile_date ON feeling_checkins(profile_id, date);

-- ===========================================
-- Updated At Trigger Function
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
