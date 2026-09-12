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
