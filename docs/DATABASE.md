# LIFE RPG — Database Architecture & Schema Specification

## 1. Overview
The database layer is built on PostgreSQL via Supabase, enforcing strict Row Level Security (RLS) on all user-specific data while maintaining shared read catalogs for items, achievements, campaigns, and boss raids.

---

## 2. Table Specifications & Relationships

### 2.1 Profiles (`public.profiles`)
The primary identity record linking to `auth.users(id)`:
- `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `username TEXT NOT NULL`
- `title TEXT NOT NULL DEFAULT 'Initiate Strategist'`
- `level INTEGER NOT NULL DEFAULT 1`
- `xp_current INTEGER NOT NULL DEFAULT 0`
- `xp_next_level INTEGER NOT NULL DEFAULT 1000`
- `gold_balance INTEGER NOT NULL DEFAULT 0`
- `streak_days INTEGER NOT NULL DEFAULT 0`
- `streak_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00`
- `last_active_date DATE NOT NULL DEFAULT CURRENT_DATE`
- `avatar_url TEXT`
- `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

### 2.2 Character Attributes (`public.character_attributes`)
Stores normalized core capacities (INT, DIS, VIT, STR, CRE):
- `profile_id UUID PRIMARY KEY REFERENCES profiles(id)`
- `intellect INTEGER (0..100)`, `today_intellect_delta INTEGER`
- `discipline INTEGER (0..100)`, `today_discipline_delta INTEGER`
- `vitality INTEGER (0..100)`, `today_vitality_delta INTEGER`
- `strength INTEGER (0..100)`, `today_strength_delta INTEGER`
- `creativity INTEGER (0..100)`, `today_creativity_delta INTEGER`

### 2.3 Quests (`public.quests`)
Operational directives created and executed by operators:
- `id UUID PRIMARY KEY`
- `profile_id UUID REFERENCES profiles(id)`
- `title TEXT NOT NULL`, `description TEXT`
- `category TEXT ('Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health', 'Engineering')`
- `difficulty TEXT ('Easy', 'Normal', 'Hard', 'Epic')`
- `attribute TEXT ('Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity')`
- `xp_reward INTEGER`, `gold_reward INTEGER`
- `frequency TEXT ('Once', 'Daily', 'Weekly', 'Campaign', 'Boss Raid')`
- `status TEXT ('active', 'completed', 'archived')`
- `due_date TIMESTAMPTZ`, `completed_at TIMESTAMPTZ`

### 2.4 Transaction Ledgers (`public.xp_transactions`, `public.gold_transactions`)
Immutable audit trails for every numerical increment or deduction:
- `amount INTEGER`
- `source TEXT`
- `balance_before INTEGER`, `balance_after INTEGER`
- `created_at TIMESTAMPTZ`

### 2.5 Reward Items & Inventory (`public.reward_items`, `public.user_inventory`, `public.equipped_items`)
Catalog and ownership records:
- `reward_items`: Curated store catalog with `rarity`, `cost_gold`, `min_level_required`.
- `user_inventory`: Unlocked and owned items per user.
- `equipped_items`: 5-slot active loadout (`theme_id`, `frame_id`, `title_id`, `badge_id`, `boost_id`).

### 2.6 Achievements (`public.achievements`, `public.user_achievements`)
Data-driven accolades and completion tracker.

### 2.7 Campaigns & Boss Raids (`public.campaigns`, `public.campaign_progress`, `public.boss_raids`, `public.boss_raid_progress`)
Multi-directive epic objectives with countdowns and stage tracking.
