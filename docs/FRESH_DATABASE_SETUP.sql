-- LIFE RPG MASTER PRODUCTION DATABASE SETUP SCRIPT
-- Generated from supabase/migrations (001 to 010)
-- ZERO SEED/DEMO GAMEPLAY ROWS.

-- ======================================================
-- START: 001_core_schema.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 001_core_schema.sql
-- Purpose: Defines core player identity, RPG progression stats, and character attributes.
-- ZERO seed/demo player data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Player Identity & RPG Progression State)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  title TEXT NOT NULL DEFAULT 'Novice',
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp_current INTEGER NOT NULL DEFAULT 0 CHECK (xp_current >= 0),
  xp_next_level INTEGER NOT NULL DEFAULT 1000 CHECK (xp_next_level > 0),
  gold_balance INTEGER NOT NULL DEFAULT 0 CHECK (gold_balance >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  streak_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (streak_multiplier >= 1.00),
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent Column Guarantees (Ensures existing tables acquire all required columns before 002 runs)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'player';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Novice';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_current INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_next_level INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure CHECK constraints exist on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('player', 'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_level_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_level_check CHECK (level >= 1);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_gold_balance_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_gold_balance_check CHECK (gold_balance >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_xp_current_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_xp_current_check CHECK (xp_current >= 0);
  END IF;
END $$;

-- 2. CHARACTER ATTRIBUTES (5-Capacity Cognitive & Physical Matrix)
CREATE TABLE IF NOT EXISTS public.character_attributes (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  intellect INTEGER NOT NULL DEFAULT 10 CHECK (intellect >= 0),
  discipline INTEGER NOT NULL DEFAULT 10 CHECK (discipline >= 0),
  vitality INTEGER NOT NULL DEFAULT 10 CHECK (vitality >= 0),
  strength INTEGER NOT NULL DEFAULT 10 CHECK (strength >= 0),
  creativity INTEGER NOT NULL DEFAULT 10 CHECK (creativity >= 0),
  today_intellect_delta INTEGER NOT NULL DEFAULT 0,
  today_discipline_delta INTEGER NOT NULL DEFAULT 0,
  today_vitality_delta INTEGER NOT NULL DEFAULT 0,
  today_strength_delta INTEGER NOT NULL DEFAULT 0,
  today_creativity_delta INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent Column Guarantees for character_attributes
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS intellect INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS discipline INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS vitality INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS strength INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS creativity INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_intellect_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_discipline_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_vitality_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_strength_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_creativity_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ======================================================
-- END: 001_core_schema.sql
-- ======================================================

-- ======================================================
-- START: 002_auth_profiles.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 002_auth_profiles.sql
-- Purpose: Real Supabase Auth triggers and server-authoritative admin security functions.
-- ZERO seed/demo player data.

-- 1. Function: Check if current authenticated user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Function: Securely promote an account to admin by email (SQL / Owner Tooling Only)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  target_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Look up target user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(target_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Operator with email % not found in auth.users', target_email;
  END IF;

  -- Ensure corresponding profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_user_id
  ) INTO profile_exists;

  IF NOT profile_exists THEN
    RAISE EXCEPTION 'Profile for operator % (ID: %) does not exist in public.profiles', target_email, target_user_id;
  END IF;

  -- Authoritatively promote to admin
  UPDATE public.profiles
  SET role = 'admin',
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Revoke public execution of promote_to_admin to prevent privilege escalation
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(TEXT) TO service_role;

-- 3. Function: Automatic new operator initialization on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  default_username TEXT;
  clean_display_name TEXT;
BEGIN
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'Operator_' || SUBSTRING(NEW.id::TEXT, 1, 6)
  );

  clean_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    default_username
  );

  -- Insert fresh profile (Level 1, 0 XP, 0 Gold, 0 Streak, Role player)
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    role,
    title,
    level,
    xp_current,
    xp_next_level,
    gold_balance,
    streak_days,
    streak_multiplier,
    last_active_date,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    default_username,
    clean_display_name,
    'player',
    'Novice',
    1,
    0,
    1000,
    0,
    0,
    1.00,
    CURRENT_DATE,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = NOW();

  -- Insert initial character attributes
  INSERT INTO public.character_attributes (
    profile_id,
    intellect,
    discipline,
    vitality,
    strength,
    creativity,
    today_intellect_delta,
    today_discipline_delta,
    today_vitality_delta,
    today_strength_delta,
    today_creativity_delta,
    updated_at
  ) VALUES (
    NEW.id,
    10,
    10,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    NOW()
  )
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Trigger on auth.users registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ======================================================
-- END: 002_auth_profiles.sql
-- ======================================================

-- ======================================================
-- START: 003_rls.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 003_rls.sql
-- Purpose: Row Level Security for core profiles and attributes.
-- Enforces strict multi-user tenant isolation and admin access.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_attributes ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile without escalating role; Admins can update any profile
DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
CREATE POLICY "Allow users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (public.is_admin() OR (auth.uid() = id AND role = 'player'));

-- Allow auth triggers (service role) and authenticated signup to insert profiles
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- CHARACTER ATTRIBUTES POLICIES
DROP POLICY IF EXISTS "Allow users read own attributes" ON public.character_attributes;
CREATE POLICY "Allow users read own attributes"
  ON public.character_attributes FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow users update own attributes" ON public.character_attributes;
CREATE POLICY "Allow users update own attributes"
  ON public.character_attributes FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin())
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert attributes" ON public.character_attributes;
CREATE POLICY "Allow insert attributes"
  ON public.character_attributes FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- ======================================================
-- END: 003_rls.sql
-- ======================================================

-- ======================================================
-- START: 004_quests_directives.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 004_quests_directives.sql
-- Purpose: Directives (Quests), execution logs, streaks, and attribute progression history.
-- ZERO seed/demo player or quest data.

-- 1. QUESTS / DIRECTIVES
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health', 'Engineering')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Normal', 'Hard', 'Epic')),
  attribute TEXT NOT NULL CHECK (attribute IN ('Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity')),
  xp_reward INTEGER NOT NULL DEFAULT 100 CHECK (xp_reward >= 0),
  gold_reward INTEGER NOT NULL DEFAULT 25 CHECK (gold_reward >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('Once', 'Daily', 'Weekly', 'Campaign', 'Boss Raid')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_system_directive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. QUEST EXECUTION LOGS
CREATE TABLE IF NOT EXISTS public.quest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES public.quests(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  gold_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STREAKS
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
  last_activity_date DATE,
  freeze_credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- 4. ATTRIBUTE PROGRESSION LOGS
CREATE TABLE IF NOT EXISTS public.attribute_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attribute TEXT NOT NULL CHECK (attribute IN ('Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity')),
  delta INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS is_system_directive BOOLEAN NOT NULL DEFAULT FALSE;

-- ROW LEVEL SECURITY
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_logs ENABLE ROW LEVEL SECURITY;

-- Quests: Users can read own directives AND global system directives
DROP POLICY IF EXISTS "Allow read own or system quests" ON public.quests;
CREATE POLICY "Allow read own or system quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR is_system_directive = true OR public.is_admin());

-- Quests: Users can insert own directives; Admins can insert any (including system directives)
DROP POLICY IF EXISTS "Allow insert quests" ON public.quests;
CREATE POLICY "Allow insert quests"
  ON public.quests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- Quests: Users can update/delete own directives; Admins can update/delete any
DROP POLICY IF EXISTS "Allow update quests" ON public.quests;
CREATE POLICY "Allow update quests"
  ON public.quests FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow delete quests" ON public.quests;
CREATE POLICY "Allow delete quests"
  ON public.quests FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

-- Quest Logs
DROP POLICY IF EXISTS "Allow read own quest logs" ON public.quest_logs;
CREATE POLICY "Allow read own quest logs"
  ON public.quest_logs FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own quest logs" ON public.quest_logs;
CREATE POLICY "Allow insert own quest logs"
  ON public.quest_logs FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- Streaks
DROP POLICY IF EXISTS "Allow read own streaks" ON public.streaks;
CREATE POLICY "Allow read own streaks"
  ON public.streaks FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own streaks" ON public.streaks;
CREATE POLICY "Allow insert own streaks"
  ON public.streaks FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow update own streaks" ON public.streaks;
CREATE POLICY "Allow update own streaks"
  ON public.streaks FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

-- Attribute Logs
DROP POLICY IF EXISTS "Allow read own attribute logs" ON public.attribute_logs;
CREATE POLICY "Allow read own attribute logs"
  ON public.attribute_logs FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own attribute logs" ON public.attribute_logs;
CREATE POLICY "Allow insert own attribute logs"
  ON public.attribute_logs FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ======================================================
-- END: 004_quests_directives.sql
-- ======================================================

-- ======================================================
-- START: 005_rewards_economy.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 005_rewards_economy.sql
-- Purpose: Reward items catalog, player inventory, cosmetic equipment, and authoritative economy ledger.
-- ZERO seed/demo rewards or purchases. Admin creates rewards via Admin CMS.

-- 1. REWARD ITEMS (Catalog created and curated by Admin)
CREATE TABLE IF NOT EXISTS public.reward_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Theme', 'Cosmetic', 'Badge', 'Title', 'Boost', 'Unlock', 'Avatar', 'Utility', 'Special')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
  cost_gold INTEGER NOT NULL DEFAULT 0 CHECK (cost_gold >= 0),
  min_level_required INTEGER NOT NULL DEFAULT 1 CHECK (min_level_required >= 1),
  preview_asset TEXT NOT NULL,
  metadata JSONB,
  stock INTEGER DEFAULT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER INVENTORY (Player-owned items purchased with real Gold)
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.reward_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(profile_id, item_id)
);

-- 3. EQUIPPED COSMETIC ITEMS
CREATE TABLE IF NOT EXISTS public.equipped_items (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  frame_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  title_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  badge_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  boost_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. GOLD TRANSACTIONS (Authoritative Economy Ledger)
CREATE TABLE IF NOT EXISTS public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND', 'ADJUST', 'QUEST_REWARD', 'REWARD_PURCHASE', 'ADMIN_GRANT', 'ADMIN_DEDUCTION', 'BOSS_REWARD', 'ACHIEVEMENT_REWARD')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  source TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipped_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;

-- Reward Items: Available items viewable by all authenticated operators; Admin manages all
DROP POLICY IF EXISTS "Allow read available rewards" ON public.reward_items;
CREATE POLICY "Allow read available rewards"
  ON public.reward_items FOR SELECT
  TO authenticated
  USING (is_available = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin manage rewards" ON public.reward_items;
CREATE POLICY "Allow admin manage rewards"
  ON public.reward_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User Inventory: Operators access only own items; Admins can view/manage
DROP POLICY IF EXISTS "Allow read own inventory" ON public.user_inventory;
CREATE POLICY "Allow read own inventory"
  ON public.user_inventory FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own inventory" ON public.user_inventory;
CREATE POLICY "Allow insert own inventory"
  ON public.user_inventory FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow delete own inventory" ON public.user_inventory;
CREATE POLICY "Allow delete own inventory"
  ON public.user_inventory FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

-- Equipped Items
DROP POLICY IF EXISTS "Allow read equipped items" ON public.equipped_items;
CREATE POLICY "Allow read equipped items"
  ON public.equipped_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow update own equipped items" ON public.equipped_items;
CREATE POLICY "Allow update own equipped items"
  ON public.equipped_items FOR ALL
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- Gold Transactions Ledger: Operators view own audit history; Admins view all
DROP POLICY IF EXISTS "Allow read own gold transactions" ON public.gold_transactions;
CREATE POLICY "Allow read own gold transactions"
  ON public.gold_transactions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert gold transactions" ON public.gold_transactions;
CREATE POLICY "Allow insert gold transactions"
  ON public.gold_transactions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ======================================================
-- END: 005_rewards_economy.sql
-- ======================================================

-- ======================================================
-- START: 006_avatar_evolution.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 006_avatar_evolution.sql
-- Purpose: Avatar Armory catalog, server-validated player unlocks, and equipped avatar gear loadouts.
-- ZERO seed/demo player equipment. Admin creates and curates avatar items via Admin CMS.

-- 1. AVATAR ITEMS (Catalog created and curated by Admin)
CREATE TABLE IF NOT EXISTS public.avatar_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('head', 'face', 'body', 'outerwear', 'legs', 'shoes', 'accessory', 'weapon_or_tool', 'aura', 'background')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
  asset_key TEXT NOT NULL,
  required_level INTEGER NOT NULL DEFAULT 1 CHECK (required_level >= 1),
  cost_gold INTEGER NOT NULL DEFAULT 0 CHECK (cost_gold >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER AVATAR UNLOCKS (Verified player gear ownership)
CREATE TABLE IF NOT EXISTS public.user_avatar_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avatar_item_id TEXT NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, avatar_item_id)
);

-- 3. USER AVATAR LOADOUT (Equipped items per slot)
CREATE TABLE IF NOT EXISTS public.user_avatar_loadout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('head', 'face', 'body', 'outerwear', 'legs', 'shoes', 'accessory', 'weapon_or_tool', 'aura', 'background')),
  avatar_item_id TEXT NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
  equipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

-- ROW LEVEL SECURITY
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_loadout ENABLE ROW LEVEL SECURITY;

-- Avatar Items: Active items readable by authenticated users; Admin manages all
DROP POLICY IF EXISTS "Allow read active avatar items" ON public.avatar_items;
CREATE POLICY "Allow read active avatar items"
  ON public.avatar_items FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin manage avatar items" ON public.avatar_items;
CREATE POLICY "Allow admin manage avatar items"
  ON public.avatar_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User Avatar Unlocks: Read own unlocks; Admin manages all
DROP POLICY IF EXISTS "Allow read own avatar unlocks" ON public.user_avatar_unlocks;
CREATE POLICY "Allow read own avatar unlocks"
  ON public.user_avatar_unlocks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own avatar unlocks" ON public.user_avatar_unlocks;
CREATE POLICY "Allow insert own avatar unlocks"
  ON public.user_avatar_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- User Avatar Loadout: Read all loadouts (for lobby & character inspection); Update only own
DROP POLICY IF EXISTS "Allow read avatar loadouts" ON public.user_avatar_loadout;
CREATE POLICY "Allow read avatar loadouts"
  ON public.user_avatar_loadout FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow manage own avatar loadout" ON public.user_avatar_loadout;
CREATE POLICY "Allow manage own avatar loadout"
  ON public.user_avatar_loadout FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ======================================================
-- END: 006_avatar_evolution.sql
-- ======================================================

-- ======================================================
-- START: 007_boss_raids.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 007_boss_raids.sql
-- Purpose: Authoritative Boss Raid system, player participation/progress tracking, and action logs.
-- ZERO seed/demo boss raids. Boss Raids are created and activated by Admin via Admin CMS.

-- 1. BOSS RAIDS (Defined and activated by Admin)
CREATE TABLE IF NOT EXISTS public.boss_raids (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'Critical',
  max_hp INTEGER NOT NULL DEFAULT 100 CHECK (max_hp > 0),
  current_hp INTEGER NOT NULL DEFAULT 100 CHECK (current_hp >= 0),
  required_directives INTEGER NOT NULL DEFAULT 3 CHECK (required_directives > 0),
  time_limit_hours INTEGER NOT NULL DEFAULT 24 CHECK (time_limit_hours > 0),
  reward_gold INTEGER NOT NULL DEFAULT 350 CHECK (reward_gold >= 0),
  reward_xp INTEGER NOT NULL DEFAULT 850 CHECK (reward_xp >= 0),
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BOSS RAID PROGRESS (Player participation & completion state)
CREATE TABLE IF NOT EXISTS public.boss_raid_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boss_raid_id TEXT NOT NULL REFERENCES public.boss_raids(id) ON DELETE CASCADE,
  damage_dealt INTEGER NOT NULL DEFAULT 0 CHECK (damage_dealt >= 0),
  directives_completed INTEGER NOT NULL DEFAULT 0 CHECK (directives_completed >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, boss_raid_id)
);

-- 3. BOSS RAID ACTIONS (Verified combat & directive strikes log)
CREATE TABLE IF NOT EXISTS public.boss_raid_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_raid_id TEXT NOT NULL REFERENCES public.boss_raids(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ATTACK', 'DIRECTIVE_STRIKE', 'SPECIAL_ABILITY')),
  damage INTEGER NOT NULL CHECK (damage >= 0),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent Column Guarantees for boss_raids
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS threat_level TEXT NOT NULL DEFAULT 'Critical';
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS max_hp INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS current_hp INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS required_directives INTEGER NOT NULL DEFAULT 3;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS time_limit_hours INTEGER NOT NULL DEFAULT 24;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS reward_gold INTEGER NOT NULL DEFAULT 350;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS reward_xp INTEGER NOT NULL DEFAULT 850;
ALTER TABLE public.boss_raids ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ROW LEVEL SECURITY
ALTER TABLE public.boss_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_raid_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_raid_actions ENABLE ROW LEVEL SECURITY;

-- Boss Raids: All operators can read active raids; Admins manage all
DROP POLICY IF EXISTS "Allow read boss raids" ON public.boss_raids;
CREATE POLICY "Allow read boss raids"
  ON public.boss_raids FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin manage boss raids" ON public.boss_raids;
CREATE POLICY "Allow admin manage boss raids"
  ON public.boss_raids FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Boss Raid Progress: Operators read/update own progress; Admins manage all
DROP POLICY IF EXISTS "Allow read own boss progress" ON public.boss_raid_progress;
CREATE POLICY "Allow read own boss progress"
  ON public.boss_raid_progress FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow manage own boss progress" ON public.boss_raid_progress;
CREATE POLICY "Allow manage own boss progress"
  ON public.boss_raid_progress FOR ALL
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- Boss Raid Actions: Operators read own strikes; Admins read all
DROP POLICY IF EXISTS "Allow read boss actions" ON public.boss_raid_actions;
CREATE POLICY "Allow read boss actions"
  ON public.boss_raid_actions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert own boss action" ON public.boss_raid_actions;
CREATE POLICY "Allow insert own boss action"
  ON public.boss_raid_actions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ======================================================
-- END: 007_boss_raids.sql
-- ======================================================

-- ======================================================
-- START: 008_achievements_campaigns.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 008_achievements_campaigns.sql
-- Purpose: Achievements and campaigns/events catalogs and player progression tracking.
-- ZERO seed/demo achievements or campaigns. Admin defines master achievements and events via Admin CMS.

-- 1. ACHIEVEMENTS (Master definitions created by Admin)
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  reward_gold INTEGER NOT NULL DEFAULT 50 CHECK (reward_gold >= 0),
  reward_xp INTEGER NOT NULL DEFAULT 100 CHECK (reward_xp >= 0),
  target_value INTEGER NOT NULL DEFAULT 1 CHECK (target_value > 0),
  badge_icon TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER ACHIEVEMENTS (Player unlocked milestones)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(profile_id, achievement_id)
);

-- 3. CAMPAIGNS / EVENTS (Created by Admin)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  total_stages INTEGER NOT NULL DEFAULT 10 CHECK (total_stages > 0),
  reward_xp INTEGER NOT NULL DEFAULT 1500 CHECK (reward_xp >= 0),
  reward_gold INTEGER NOT NULL DEFAULT 500 CHECK (reward_gold >= 0),
  badge_reward_id TEXT,
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CAMPAIGN PROGRESS
CREATE TABLE IF NOT EXISTS public.campaign_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  current_stage INTEGER NOT NULL DEFAULT 0 CHECK (current_stage >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, campaign_id)
);

-- ROW LEVEL SECURITY
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;

-- Achievements
DROP POLICY IF EXISTS "Allow read achievements" ON public.achievements;
CREATE POLICY "Allow read achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin manage achievements" ON public.achievements;
CREATE POLICY "Allow admin manage achievements"
  ON public.achievements FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User Achievements
DROP POLICY IF EXISTS "Allow read own achievements" ON public.user_achievements;
CREATE POLICY "Allow read own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow manage own achievements" ON public.user_achievements;
CREATE POLICY "Allow manage own achievements"
  ON public.user_achievements FOR ALL
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- Campaigns
DROP POLICY IF EXISTS "Allow read campaigns" ON public.campaigns;
CREATE POLICY "Allow read campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin manage campaigns" ON public.campaigns;
CREATE POLICY "Allow admin manage campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Campaign Progress
DROP POLICY IF EXISTS "Allow read own campaign progress" ON public.campaign_progress;
CREATE POLICY "Allow read own campaign progress"
  ON public.campaign_progress FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow manage own campaign progress" ON public.campaign_progress;
CREATE POLICY "Allow manage own campaign progress"
  ON public.campaign_progress FOR ALL
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ======================================================
-- END: 008_achievements_campaigns.sql
-- ======================================================

-- ======================================================
-- START: 009_admin_system.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 009_admin_system.sql
-- Purpose: Admin audit trail and system configuration settings.
-- Restricted exclusively to authenticated administrators.

-- 1. ADMIN AUDIT LOGS (Immutable audit trail of all privileged mutations)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SYSTEM SETTINGS (Global game flags, maintenance state, economy rate parameters)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- ROW LEVEL SECURITY
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Audit Logs: Strictly admin readable and insertable
DROP POLICY IF EXISTS "Allow admin read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Allow admin read audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Allow admin insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- System Settings: Authenticated operators can read public config; Admins manage all
DROP POLICY IF EXISTS "Allow read system settings" ON public.system_settings;
CREATE POLICY "Allow read system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow admin manage system settings" ON public.system_settings;
CREATE POLICY "Allow admin manage system settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ======================================================
-- END: 009_admin_system.sql
-- ======================================================

-- ======================================================
-- START: 010_indexes_constraints.sql
-- ======================================================
-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 010_indexes_constraints.sql
-- Purpose: Performance indexes and relational integrity constraints across all tables.

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_quests_profile_status ON public.quests(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_quests_system ON public.quests(is_system_directive);
CREATE INDEX IF NOT EXISTS idx_quest_logs_profile ON public.quest_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_inventory_profile ON public.user_inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_gold_tx_profile ON public.gold_transactions(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avatar_unlocks_user ON public.user_avatar_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_loadout_user ON public.user_avatar_loadout(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_progress_profile ON public.boss_raid_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_boss_actions_raid ON public.boss_raid_actions(boss_raid_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_profile ON public.user_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_profile ON public.campaign_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_time ON public.admin_audit_logs(admin_user_id, created_at DESC);

-- ======================================================
-- END: 010_indexes_constraints.sql
-- ======================================================

