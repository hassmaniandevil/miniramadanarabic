-- MiniRamadan Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- FAMILIES TABLE
-- ============================================
create table if not exists public.families (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  family_name text not null,
  ramadan_start_date date not null,
  timezone text default 'Europe/London',
  suhoor_time time default '04:30',
  iftar_time time default '18:30',
  subscription_tier text default 'free' check (subscription_tier in ('free', 'paid')),
  subscription_status text check (subscription_status in ('active', 'cancelled', 'expired')),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint unique_user_family unique (user_id)
);

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families(id) on delete cascade not null,
  nickname text not null,
  avatar text not null,
  profile_type text not null check (profile_type in ('little_star', 'child', 'adult')),
  age_range text check (age_range in ('3-6', '7-9', '10-12', 'adult')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- STARS TABLE
-- ============================================
create table if not exists public.stars (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  date date not null,
  ramadan_day integer not null check (ramadan_day >= 0 and ramadan_day <= 30),
  source text not null check (source in ('fasting', 'suhoor', 'mission', 'wonder', 'checkin', 'helped', 'story', 'quran', 'preparation')),
  count integer default 1,
  created_at timestamptz default now(),

  -- Prevent duplicate stars for same activity on same day
  constraint unique_star_per_activity unique (profile_id, date, source)
);

-- ============================================
-- FASTING LOGS TABLE
-- ============================================
create table if not exists public.fasting_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  date date not null,
  ramadan_day integer not null,
  mode text not null check (mode in ('full', 'partial', 'tried', 'not_today')),
  partial_hours integer,
  energy_level text check (energy_level in ('tired', 'okay', 'strong')),
  notes text,
  stars_earned integer default 0,
  created_at timestamptz default now(),

  constraint unique_fasting_per_day unique (profile_id, date)
);

-- ============================================
-- SUHOOR LOGS TABLE
-- ============================================
create table if not exists public.suhoor_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  date date not null,
  ramadan_day integer not null,
  food_groups text[] not null,
  photo_url text,
  stars_earned integer default 0,
  created_at timestamptz default now(),

  constraint unique_suhoor_per_day unique (profile_id, date)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete set null,
  message text not null,
  message_type text default 'text' check (message_type in ('text', 'voice', 'emoji', 'drawing')),
  voice_url text,
  drawing_url text,
  emoji text,
  date date not null,
  ramadan_day integer not null,
  is_delivered boolean default false,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- FEELING CHECK-INS TABLE
-- ============================================
create table if not exists public.feeling_checkins (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  date date not null,
  ramadan_day integer not null,
  feeling_level text not null check (feeling_level in ('really_hard', 'bit_tough', 'okay', 'good', 'really_good')),
  feeling_word text,
  note text,
  created_at timestamptz default now(),

  constraint unique_checkin_per_day unique (profile_id, date)
);

-- ============================================
-- PREPARATION COMPLETIONS TABLE
-- ============================================
create table if not exists public.preparation_completions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  family_id uuid references public.families(id) on delete cascade not null,
  activity_day integer not null check (activity_day >= 1 and activity_day <= 24),
  date date not null,
  created_at timestamptz default now(),

  constraint unique_prep_per_activity unique (profile_id, activity_day)
);

-- ============================================
-- SYNC METADATA TABLE (for offline support)
-- ============================================
create table if not exists public.sync_metadata (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families(id) on delete cascade not null,
  last_synced_at timestamptz default now(),
  device_id text,

  constraint unique_sync_per_family unique (family_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.stars enable row level security;
alter table public.fasting_logs enable row level security;
alter table public.suhoor_logs enable row level security;
alter table public.messages enable row level security;
alter table public.feeling_checkins enable row level security;
alter table public.preparation_completions enable row level security;
alter table public.sync_metadata enable row level security;

-- Families: users can only access their own family
create policy "Users can manage own family" on public.families
  for all using (user_id = auth.uid());

-- Profiles: users can access profiles in their family
create policy "Users can manage family profiles" on public.profiles
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Stars: users can access stars in their family
create policy "Users can manage family stars" on public.stars
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Fasting logs: users can access logs in their family
create policy "Users can manage family fasting logs" on public.fasting_logs
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Suhoor logs: users can access logs in their family
create policy "Users can manage family suhoor logs" on public.suhoor_logs
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Messages: users can access messages in their family
create policy "Users can manage family messages" on public.messages
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Feeling check-ins: users can access check-ins in their family
create policy "Users can manage family checkins" on public.feeling_checkins
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Preparation completions: users can access completions in their family
create policy "Users can manage family preparations" on public.preparation_completions
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- Sync metadata: users can access their family's sync data
create policy "Users can manage family sync" on public.sync_metadata
  for all using (
    family_id in (select id from public.families where user_id = auth.uid())
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_profiles_family on public.profiles(family_id);
create index if not exists idx_stars_profile on public.stars(profile_id);
create index if not exists idx_stars_family_date on public.stars(family_id, date);
create index if not exists idx_fasting_profile_date on public.fasting_logs(profile_id, date);
create index if not exists idx_suhoor_profile_date on public.suhoor_logs(profile_id, date);
create index if not exists idx_messages_family_date on public.messages(family_id, date);
create index if not exists idx_checkins_profile_date on public.feeling_checkins(profile_id, date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger set_families_updated_at
  before update on public.families
  for each row execute function public.handle_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Function to get family data for sync
create or replace function public.get_family_data(p_user_id uuid)
returns json as $$
declare
  result json;
  family_record public.families%rowtype;
begin
  -- Get family
  select * into family_record from public.families where user_id = p_user_id;

  if family_record is null then
    return null;
  end if;

  -- Build complete family data
  select json_build_object(
    'family', row_to_json(family_record),
    'profiles', (select coalesce(json_agg(row_to_json(p)), '[]'::json) from public.profiles p where p.family_id = family_record.id),
    'stars', (select coalesce(json_agg(row_to_json(s)), '[]'::json) from public.stars s where s.family_id = family_record.id),
    'fastingLogs', (select coalesce(json_agg(row_to_json(f)), '[]'::json) from public.fasting_logs f where f.family_id = family_record.id),
    'suhoorLogs', (select coalesce(json_agg(row_to_json(sl)), '[]'::json) from public.suhoor_logs sl where sl.family_id = family_record.id),
    'messages', (select coalesce(json_agg(row_to_json(m)), '[]'::json) from public.messages m where m.family_id = family_record.id),
    'checkins', (select coalesce(json_agg(row_to_json(c)), '[]'::json) from public.feeling_checkins c where c.family_id = family_record.id)
  ) into result;

  return result;
end;
$$ language plpgsql security definer;
