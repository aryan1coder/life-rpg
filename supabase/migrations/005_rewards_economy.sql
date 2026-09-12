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
