-- ===========================================
-- Countdown & Preparation Mode
-- ===========================================
-- Features for pre-Ramadan engagement

-- Ramadan goals for each profile
CREATE TABLE IF NOT EXISTS ramadan_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ramadan_year INTEGER NOT NULL,
  goal_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fasting', 'prayer', 'quran', 'kindness', 'learning', 'family', 'other')),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Preparation checklist items (family-wide)
CREATE TABLE IF NOT EXISTS preparation_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  ramadan_year INTEGER NOT NULL,
  task_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('decorations', 'learning', 'shopping', 'planning', 'spiritual', 'family')),
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS policies
ALTER TABLE ramadan_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage family goals" ON ramadan_goals;
CREATE POLICY "Users can manage family goals" ON ramadan_goals
  FOR ALL USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage family preparation tasks" ON preparation_tasks;
CREATE POLICY "Users can manage family preparation tasks" ON preparation_tasks
  FOR ALL USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ramadan_goals_family_year ON ramadan_goals(family_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_ramadan_goals_profile ON ramadan_goals(profile_id, ramadan_year);
CREATE INDEX IF NOT EXISTS idx_preparation_tasks_family_year ON preparation_tasks(family_id, ramadan_year);

-- Default preparation task templates (can be copied to families)
-- These are suggestions that appear in the UI, not stored per-family initially
