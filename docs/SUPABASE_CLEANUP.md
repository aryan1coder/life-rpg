# LIFE RPG — Supabase Production Database Cleanup Reference

## 1. Audit Summary: What Demo/Seed User Data Was Found
A complete audit of the repository migrations and code reveals:
- **Migration Files:** `001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_catalog.sql`, `004_auth_triggers.sql`, `005_profile_enhancements.sql`, and `006_avatar_evolution_and_lobby.sql` were inspected.
- **Result:** **No demo user accounts were ever inserted via SQL migrations.**
  - `003_seed_catalog.sql` strictly populates system catalog definitions: `reward_items`, `achievements`, `campaigns`, `boss_raids`.
  - `006_avatar_evolution_and_lobby.sql` strictly populates the system `avatar_items` catalog.
  - `004_auth_triggers.sql` contains the trigger function `handle_new_user()` which dynamically provisions rows ONLY when a genuine user signs up via Supabase Auth (`auth.users`).
- **Legacy Source:** The legacy demo values (`Kai`, `Level 12`, `Arch-Strategist`, `8260 XP`, `1420 Gold`, `14-day streak`) originated purely from early prototype mock fallbacks and an initial local JSON file (`.data/life_rpg_db.json`), which has been completely purged.

---

## 2. Table Classification: User Data vs System Catalogs

### A. Tables Safe for Targeted Cleanup (User-Owned Data Only)
These tables contain user-specific records. If any test accounts or manual rows were created during early development, they reside in these tables:
1. `public.user_avatar_loadout` (`user_id`)
2. `public.user_avatar_unlocks` (`user_id`)
3. `public.equipped_items` (`profile_id`)
4. `public.user_inventory` (`profile_id`)
5. `public.user_achievements` (`profile_id`)
6. `public.campaign_progress` (`profile_id`)
7. `public.boss_raid_progress` (`profile_id`)
8. `public.quests` (`profile_id`)
9. `public.quest_logs` (`profile_id`)
10. `public.xp_transactions` (`profile_id`)
11. `public.gold_transactions` (`profile_id`)
12. `public.attribute_logs` (`profile_id`)
13. `public.streaks` (`profile_id`)
14. `public.character_attributes` (`profile_id`)
15. `public.profiles` (`id`)

### B. Tables That MUST REMAIN (System Catalog Data — DO NOT DELETE)
These tables define the fundamental game rules and economy. Deleting them will break the game engine:
1. `public.avatar_items` (14 tier-based avatar evolution equipment items)
2. `public.reward_items` (12 store items: themes, cosmetics, titles, boosts)
3. `public.achievements` (8 permanent mastery accolades)
4. `public.campaigns` (MVP campaign stage definition)
5. `public.boss_raids` (Threat objective definitions)

---

## 3. Exact SQL Required to Clean the Database

> **CAUTION:** The following SQL removes test/demo user records while strictly preserving system catalog data and database structure. Do NOT run blind `TRUNCATE ... CASCADE`.

Run this script in the **Supabase SQL Editor**:

```sql
-- ====================================================================
-- LIFE RPG: TARGETED DEMO / TEST USER DATA CLEANUP
-- Preserves: reward_items, achievements, campaigns, boss_raids, avatar_items
-- ====================================================================

BEGIN;

-- Step 1: Remove dependent avatar loadouts and unlocks for non-production/test users
DELETE FROM public.user_avatar_loadout
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.user_avatar_unlocks
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

-- Step 2: Remove gameplay progress for test users
DELETE FROM public.equipped_items
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.user_inventory
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.user_achievements
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.campaign_progress
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.boss_raid_progress
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

-- Step 3: Remove quests and ledgers for test users
DELETE FROM public.quest_logs
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.quests
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.xp_transactions
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.gold_transactions
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.attribute_logs
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.streaks
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

DELETE FROM public.character_attributes
WHERE profile_id IN (
  SELECT id FROM public.profiles 
  WHERE username ILIKE '%test%' 
     OR username ILIKE '%demo%' 
     OR username ILIKE '%kai%' 
     OR username ILIKE '%operator%'
);

-- Step 4: Remove profile records for test users
DELETE FROM public.profiles
WHERE username ILIKE '%test%' 
   OR username ILIKE '%demo%' 
   OR username ILIKE '%kai%' 
   OR username ILIKE '%operator%';

COMMIT;
```

---

## 4. Verification Query: Confirming Zero Demo User Rows

Run this verification query in the Supabase SQL editor to inspect the remaining state:

```sql
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE username ILIKE '%kai%' OR username ILIKE '%demo%') AS demo_profiles_count,
  (SELECT COUNT(*) FROM public.profiles) AS total_profiles_count,
  (SELECT COUNT(*) FROM public.reward_items) AS system_rewards_count,
  (SELECT COUNT(*) FROM public.achievements) AS system_achievements_count,
  (SELECT COUNT(*) FROM public.avatar_items) AS system_avatar_items_count;
```

### Expected Output:
- `demo_profiles_count`: **0**
- `system_rewards_count`: **12**
- `system_achievements_count`: **8**
- `system_avatar_items_count`: **14**

