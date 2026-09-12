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
