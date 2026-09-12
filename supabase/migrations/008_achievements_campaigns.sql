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
