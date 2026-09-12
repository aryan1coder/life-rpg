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
