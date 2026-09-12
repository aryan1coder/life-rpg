# LIFE RPG — Comprehensive Database Schema Reference

This document details the complete relational PostgreSQL schema deployed across the 10 sequential migrations in `supabase/migrations/`.

---

## 1. Table Architecture Overview

| Migration | Table | Primary Key | Purpose |
|---|---|---|---|
| `001_core_schema.sql` | `profiles` | `UUID (auth.users)` | Player identity, RPG level, XP, Gold, streak, role (`player` \| `admin`) |
| `001_core_schema.sql` | `character_attributes` | `profile_id (UUID)` | 5 core capacities (Intellect, Discipline, Vitality, Strength, Creativity) |
| `004_quests_directives.sql` | `quests` | `UUID` | Player directives & admin system directive templates |
| `004_quests_directives.sql` | `quest_logs` | `UUID` | Directive completion history |
| `004_quests_directives.sql` | `streaks` | `UUID` | Unbroken activity streaks and multipliers |
| `004_quests_directives.sql` | `attribute_logs` | `UUID` | Attribute score delta tracking |
| `005_rewards_economy.sql` | `reward_items` | `TEXT` | Rewards shop catalog (Theme, Cosmetic, Badge, Title, Boost, Avatar) |
| `005_rewards_economy.sql` | `user_inventory` | `UUID` | Player-owned rewards purchased with Gold |
| `005_rewards_economy.sql` | `equipped_items` | `profile_id (UUID)` | Equipped cosmetic themes, frames, badges, titles |
| `005_rewards_economy.sql` | `gold_transactions` | `UUID` | Authoritative economy ledger tracking all credits/debits |
| `006_avatar_evolution.sql` | `avatar_items` | `TEXT` | Avatar Armory items (Tiers 1–8) |
| `006_avatar_evolution.sql` | `user_avatar_unlocks` | `UUID` | Verified unlocked avatar gear per player |
| `006_avatar_evolution.sql` | `user_avatar_loadout` | `UUID` | Equipped avatar items per slot (head, body, legs, shoes, etc.) |
| `007_boss_raids.sql` | `boss_raids` | `TEXT` | Authoritative boss raids (HP, time limits, bounties) |
| `007_boss_raids.sql` | `boss_raid_progress` | `UUID` | Player progress, damage dealt, directives completed |
| `007_boss_raids.sql` | `boss_raid_actions` | `UUID` | Verified combat strikes & directive actions |
| `008_achievements_campaigns.sql` | `achievements` | `TEXT` | Master achievement definitions |
| `008_achievements_campaigns.sql` | `user_achievements` | `UUID` | Player unlocked achievements & progress |
| `008_achievements_campaigns.sql` | `campaigns` | `TEXT` | Multi-stage campaign event definitions |
| `008_achievements_campaigns.sql` | `campaign_progress` | `UUID` | Player campaign stage progress |
| `009_admin_system.sql` | `admin_audit_logs` | `UUID` | Immutable audit trail for all privileged administrative actions |
| `009_admin_system.sql` | `system_settings` | `TEXT` | Dynamic game parameters and maintenance settings |

---

## 2. Row Level Security (RLS) Model

- **Public Profiles**: Anyone authenticated can read profiles for leaderboards, greetings, and inspection.
- **Tenant Isolation**: Players can only view and mutate their own `character_attributes`, `quests`, `user_inventory`, `gold_transactions`, `user_avatar_unlocks`, `user_avatar_loadout`, `boss_raid_progress`, `user_achievements`.
- **Role Escalation Protection**: In `profiles`, authenticated users are strictly restricted to updating their own profile where `role = 'player'`. Only administrative sessions (`public.is_admin()`) can update roles or manage other profiles.
- **System Catalogs**: `reward_items`, `avatar_items`, `boss_raids`, `achievements`, and `campaigns` are readable by authenticated players and mutable **only** by administrators (`public.is_admin()`).
- **Audit Logs**: Strictly admin accessible.

---

## 3. Auth, Admin Functions & Triggers

### `public.is_admin()`
- **Type**: `STABLE SECURITY DEFINER` with explicit `SET search_path = public, pg_temp;`
- **Behavior**: Evaluates whether `auth.uid()` corresponds to a record in `public.profiles` where `role = 'admin'`.

### `public.promote_to_admin(target_email TEXT)`
- **Type**: `VOLATILE SECURITY DEFINER` with explicit `SET search_path = public, auth, pg_temp;`
- **Execution Permissions**: Revoked from `PUBLIC`, `authenticated`, and `anon`. Granted exclusively to `service_role`.
- **Behavior**: Locates user by email in `auth.users`, checks that their profile exists in `public.profiles`, updates `role = 'admin'`, and returns `TRUE`. Throws a descriptive exception if either user or profile is absent.

### `public.handle_new_user()`
- **Trigger**: `AFTER INSERT ON auth.users FOR EACH ROW`
- **Behavior**: Automatically provisions a default `profiles` row (Level 1, 0 XP, 0 Gold, 0 Streak, `role = 'player'`) and base 5-capacity `character_attributes` (score 10 in all capacities).

