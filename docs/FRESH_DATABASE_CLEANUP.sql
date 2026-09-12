-- ==============================================================================
-- LIFE RPG — FRESH DATABASE CLEAN SLATE SCRIPT
-- ==============================================================================
-- Purpose:
--   Clears all player activity, generated directives, logs, inventory,
--   and raid states so the database is in an authentic Day 1 production state.
--   Preserves:
--     - Core database tables and schemas
--     - All RLS policies and row ownership rules
--     - Auth triggers (on_auth_user_created)
--     - Admin role assignments (profiles.role = 'admin')
--     - Base catalog definitions (avatar_items, reward_items, boss_raids if desired)
-- ==============================================================================

BEGIN;

-- 1. Safely truncate user transactional and gameplay tables if they exist
DO $$
DECLARE
  tbl TEXT;
  tables_to_truncate TEXT[] := ARRAY[
    'quest_logs',
    'boss_raid_actions',
    'boss_raid_progress',
    'gold_transactions',
    'admin_audit_logs',
    'user_inventory',
    'user_avatar_unlocks'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_truncate LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('TRUNCATE TABLE public.%I CASCADE', tbl);
    END IF;
  END LOOP;
END $$;

-- 2. Clear non-system player quests (preserve admin-published system directives if desired)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quests') THEN
    DELETE FROM public.quests WHERE is_system_directive = false;
  END IF;
END $$;

-- Ensure last_active_date allows NULL or reset it to CURRENT_DATE to satisfy any existing NOT NULL constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_active_date') THEN
    ALTER TABLE public.profiles ALTER COLUMN last_active_date DROP NOT NULL;
  END IF;
END $$;

-- 3. Reset all non-admin player profiles to initial Day 1 state
UPDATE public.profiles
SET
  level = 1,
  xp_current = 0,
  xp_next_level = 1000,
  gold_balance = 0,
  streak_days = 0,
  last_active_date = CURRENT_DATE,
  title = 'Initiate Strategist',
  updated_at = NOW()
WHERE role != 'admin';

-- 4. Reset character attributes to baseline values
UPDATE public.character_attributes
SET
  intellect = 50,
  discipline = 50,
  vitality = 50,
  strength = 50,
  creativity = 50,
  today_intellect_delta = 0,
  today_discipline_delta = 0,
  today_vitality_delta = 0,
  today_strength_delta = 0,
  today_creativity_delta = 0,
  updated_at = NOW();

-- 5. Clear equipped loadouts for non-admin players (handles user_avatar_loadout or equipped_loadouts if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_avatar_loadout') THEN
    DELETE FROM public.user_avatar_loadout WHERE user_id IN (SELECT id FROM public.profiles WHERE role != 'admin');
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'equipped_loadouts') THEN
    EXECUTE 'UPDATE public.equipped_loadouts SET weapon_or_tool_id = NULL, face_id = NULL, outerwear_id = NULL, theme_id = NULL, updated_at = NOW() WHERE profile_id IN (SELECT id FROM public.profiles WHERE role != ''admin'')';
  END IF;
END $$;

COMMIT;

-- Verification query: Confirm zero residual gameplay logs
SELECT
  COALESCE((SELECT COUNT(*) FROM public.quests WHERE is_system_directive = false), 0) AS player_quests_count,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quest_logs')
    THEN (SELECT COUNT(*) FROM public.quest_logs) ELSE 0 END AS quest_logs_count,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boss_raid_progress')
    THEN (SELECT COUNT(*) FROM public.boss_raid_progress) ELSE 0 END AS raid_progress_count,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gold_transactions')
    THEN (SELECT COUNT(*) FROM public.gold_transactions) ELSE 0 END AS gold_tx_count,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_inventory')
    THEN (SELECT COUNT(*) FROM public.user_inventory) ELSE 0 END AS inventory_count;
