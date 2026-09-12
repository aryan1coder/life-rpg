# LIFE RPG — Supabase Database Reset & Deployment Guide

This guide details the procedure for deploying a clean database state and performing safe development database resets.

---

## ⚠️ Critical Safety Warning

> [!CAUTION]
> **NEVER** execute `DROP SCHEMA public CASCADE;` on a production Supabase project.
> Doing so destroys extensions, role definitions, and system triggers.
> Always use targeted table resets or incremental migrations in production.

---

## Procedure A: Fresh Project Setup (First Time Initialization)

For a brand-new Supabase project:
1. Open your Supabase Dashboard: **SQL Editor** -> **New Query**.
2. Copy the entire contents of [`docs/FRESH_DATABASE_SETUP.sql`](file:///c:/Users/saxen/OneDrive/Desktop/Hackathon/docs/FRESH_DATABASE_SETUP.sql).
3. Click **Run**.
4. Confirm all 10 migration segments execute with `Success. No rows returned`.

---

## Procedure B: Safe Development Database Reset

When resetting a local or development environment to a zero-data clean slate:

```sql
-- 1. Truncate all player gameplay and transaction records in reverse dependency order
TRUNCATE TABLE
  public.admin_audit_logs,
  public.boss_raid_actions,
  public.boss_raid_progress,
  public.campaign_progress,
  public.user_achievements,
  public.user_avatar_loadout,
  public.user_avatar_unlocks,
  public.equipped_items,
  public.user_inventory,
  public.gold_transactions,
  public.attribute_logs,
  public.streaks,
  public.quest_logs,
  public.quests,
  public.boss_raids,
  public.campaigns,
  public.achievements,
  public.avatar_items,
  public.reward_items,
  public.character_attributes,
  public.profiles
CASCADE;

-- Optional: If resetting test authentication users in development:
-- DELETE FROM auth.users WHERE email LIKE '%@example.com' OR email LIKE '%@test.com';
```

After running this reset:
- All tables exist with complete schemas, foreign keys, and RLS policies.
- Every table has exactly **0** rows.

---

## Procedure C: Production Admin Account Bootstrap

After your project owner registers through `/auth/signup`, run this query in the **Supabase SQL Editor** to confer administrator status:

```sql
-- Secure admin promotion using server-side security definer function
SELECT public.promote_to_admin('owner@yourdomain.com');

-- Verify promotion
SELECT id, username, display_name, role, level FROM public.profiles WHERE role = 'admin';
```

---

## Procedure D: Verification Queries

Execute these queries to verify the database is in a clean, non-seeded state:

```sql
SELECT 'profiles' AS table_name, COUNT(*) AS total_rows FROM public.profiles
UNION ALL
SELECT 'character_attributes', COUNT(*) FROM public.character_attributes
UNION ALL
SELECT 'quests', COUNT(*) FROM public.quests
UNION ALL
SELECT 'reward_items', COUNT(*) FROM public.reward_items
UNION ALL
SELECT 'user_inventory', COUNT(*) FROM public.user_inventory
UNION ALL
SELECT 'gold_transactions', COUNT(*) FROM public.gold_transactions
UNION ALL
SELECT 'avatar_items', COUNT(*) FROM public.avatar_items
UNION ALL
SELECT 'user_avatar_unlocks', COUNT(*) FROM public.user_avatar_unlocks
UNION ALL
SELECT 'user_avatar_loadout', COUNT(*) FROM public.user_avatar_loadout
UNION ALL
SELECT 'boss_raids', COUNT(*) FROM public.boss_raids
UNION ALL
SELECT 'boss_raid_progress', COUNT(*) FROM public.boss_raid_progress
UNION ALL
SELECT 'achievements', COUNT(*) FROM public.achievements
UNION ALL
SELECT 'campaigns', COUNT(*) FROM public.campaigns
UNION ALL
SELECT 'admin_audit_logs', COUNT(*) FROM public.admin_audit_logs;
```

**Expected Result on Clean Setup:** All rows report `0`.
