-- LIFE RPG MASTER POSTGRESQL SCHEMA
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. USERS & PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Initiate Strategist',
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp_current INTEGER NOT NULL DEFAULT 0 CHECK (xp_current >= 0),
  xp_next_level INTEGER NOT NULL DEFAULT 1000 CHECK (xp_next_level > 0),
  gold_balance INTEGER NOT NULL DEFAULT 0 CHECK (gold_balance >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  streak_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (streak_multiplier >= 1.00),
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ==========================================
-- 2. CHARACTER ATTRIBUTES (STR, INT, DIS, CRE, VIT)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.character_attributes (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  intellect INTEGER NOT NULL DEFAULT 50 CHECK (intellect >= 0 AND intellect <= 100),
  discipline INTEGER NOT NULL DEFAULT 50 CHECK (discipline >= 0 AND discipline <= 100),
  vitality INTEGER NOT NULL DEFAULT 50 CHECK (vitality >= 0 AND vitality <= 100),
  strength INTEGER NOT NULL DEFAULT 50 CHECK (strength >= 0 AND strength <= 100),
  creativity INTEGER NOT NULL DEFAULT 50 CHECK (creativity >= 0 AND creativity <= 100),
  today_intellect_delta INTEGER NOT NULL DEFAULT 0,
  today_discipline_delta INTEGER NOT NULL DEFAULT 0,
  today_vitality_delta INTEGER NOT NULL DEFAULT 0,
  today_strength_delta INTEGER NOT NULL DEFAULT 0,
  today_creativity_delta INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. QUEST DIRECTIVES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health', 'Engineering')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Normal', 'Hard', 'Epic')),
  attribute TEXT NOT NULL CHECK (attribute IN ('Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity')),
  xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
  gold_reward INTEGER NOT NULL CHECK (gold_reward >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('Once', 'Daily', 'Weekly', 'Campaign', 'Boss Raid')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_profile_status ON public.quests(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_quests_due_date ON public.quests(due_date);

-- ==========================================
-- 4. QUEST COMPLETION LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_awarded INTEGER NOT NULL,
  gold_awarded INTEGER NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_gain INTEGER NOT NULL,
  streak_at_completion INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_logs_profile_time ON public.quest_logs(profile_id, completed_at DESC);

-- ==========================================
-- 5. XP TRANSACTIONS LEDGER
-- ==========================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  source TEXT NOT NULL,
  level_before INTEGER NOT NULL,
  level_after INTEGER NOT NULL,
  xp_before INTEGER NOT NULL,
  xp_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_tx_profile ON public.xp_transactions(profile_id, created_at DESC);

-- ==========================================
-- 6. GOLD TRANSACTIONS LEDGER
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for earnings, negative for expenditures
  source TEXT NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gold_tx_profile ON public.gold_transactions(profile_id, created_at DESC);

-- ==========================================
-- 7. STREAKS HISTORY & STATE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- ==========================================
-- 8. ATTRIBUTE LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attribute_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  gain INTEGER NOT NULL CHECK (gain > 0),
  source TEXT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribute_logs ON public.attribute_logs(profile_id, logged_at DESC);

-- ==========================================
-- 9. REWARD ITEMS CATALOG
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reward_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Theme', 'Cosmetic', 'Badge', 'Title', 'Boost', 'Unlock')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
  cost_gold INTEGER NOT NULL CHECK (cost_gold >= 0),
  min_level_required INTEGER NOT NULL DEFAULT 1 CHECK (min_level_required >= 1),
  preview_asset TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_items_category ON public.reward_items(category, rarity);

-- ==========================================
-- 10. USER INVENTORY
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.reward_items(id) ON DELETE RESTRICT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory ON public.user_inventory(profile_id);

-- ==========================================
-- 11. EQUIPPED ACTIVE LOADOUT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.equipped_items (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  frame_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  title_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  badge_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  boost_id TEXT REFERENCES public.reward_items(id) ON DELETE SET NULL,
  boost_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 12. MASTER ACHIEVEMENTS CATALOG
-- ==========================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Milestones', 'Consistency', 'Execution', 'Mastery', 'Economy')),
  reward_gold INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER NOT NULL DEFAULT 1,
  badge_icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 13. USER ACHIEVEMENTS PROGRESS & UNLOCKS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_profile ON public.user_achievements(profile_id, is_unlocked);

-- ==========================================
-- 14. CAMPAIGNS & CAMPAIGN PROGRESS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  total_stages INTEGER NOT NULL DEFAULT 4,
  reward_gold INTEGER NOT NULL DEFAULT 500,
  reward_xp INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  current_stage INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, campaign_id)
);

-- ==========================================
-- 15. BOSS RAIDS & PROGRESS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.boss_raids (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'Critical',
  required_directives INTEGER NOT NULL DEFAULT 3,
  time_limit_hours INTEGER NOT NULL DEFAULT 24,
  reward_gold INTEGER NOT NULL DEFAULT 350,
  reward_xp INTEGER NOT NULL DEFAULT 850,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.boss_raid_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boss_raid_id TEXT NOT NULL REFERENCES public.boss_raids(id) ON DELETE CASCADE,
  directives_completed INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, boss_raid_id)
);
