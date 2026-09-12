-- LIFE RPG ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipped_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_raid_progress ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 1. PROFILES POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- -------------------------------------------------------------
-- 2. CHARACTER ATTRIBUTES POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own attributes"
  ON public.character_attributes FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own attributes"
  ON public.character_attributes FOR UPDATE
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 3. QUESTS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own quests"
  ON public.quests FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own quests"
  ON public.quests FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own quests"
  ON public.quests FOR DELETE
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 4. QUEST LOGS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own quest logs"
  ON public.quest_logs FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own quest logs"
  ON public.quest_logs FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 5. XP & GOLD TRANSACTIONS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own xp transactions"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can view own gold transactions"
  ON public.gold_transactions FOR SELECT
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 6. STREAKS & ATTRIBUTE LOGS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can view own attribute logs"
  ON public.attribute_logs FOR SELECT
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 7. REWARD ITEMS CATALOG POLICIES (PUBLIC READ-ONLY)
-- -------------------------------------------------------------
CREATE POLICY "Anyone can view available reward items"
  ON public.reward_items FOR SELECT
  USING (is_available = TRUE);

-- -------------------------------------------------------------
-- 8. USER INVENTORY & EQUIPPED LOADOUT POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Users can view own inventory"
  ON public.user_inventory FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert into own inventory"
  ON public.user_inventory FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own equipped items"
  ON public.equipped_items FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own equipped items"
  ON public.equipped_items FOR UPDATE
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 9. ACHIEVEMENTS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Anyone can view achievements catalog"
  ON public.achievements FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can view own achievements progress"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own achievements progress"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = profile_id);

-- -------------------------------------------------------------
-- 10. CAMPAIGNS & BOSS RAIDS POLICIES
-- -------------------------------------------------------------
CREATE POLICY "Anyone can view campaigns"
  ON public.campaigns FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can view own campaign progress"
  ON public.campaign_progress FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own campaign progress"
  ON public.campaign_progress FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can view boss raids"
  ON public.boss_raids FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can view own boss raid progress"
  ON public.boss_raid_progress FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own boss raid progress"
  ON public.boss_raid_progress FOR UPDATE
  USING (auth.uid() = profile_id);
