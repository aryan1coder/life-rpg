# LIFE RPG — Production System Architecture, Data Synchronization & Technical Reference
**Document Version:** 4.0.0 (Production Release & Full System Interconnection Lock)  
**Philosophy:** Apple-level restraint × Linear-style information hierarchy × tactile RPG progression.  
**Theme:** Kinetic Command Deck v2 (Dark-Only · Standardized Tokens)

---

## 1. Product Overview
LIFE RPG is an opinionated, executive-grade life gamification platform engineered for high-agency knowledge workers, founders, and engineers. It translates daily disciplines, habits, and complex technical campaigns into tactile RPG progression metrics (XP, Levels, Core Capacities, Vault Gold, Streaks, and Curated Equipment).

---

## 2. Core Functional Loop & Interconnection Model
The entire product operates on a strictly synchronized, unidirectional data flow with server-authoritative reconciliation:

```
[ Quest Directive Completed ]
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Optimistic Update (Card Strikethrough & Lockout)   │
│ 2. Authoritative PostgreSQL RPC Execution (`complete_quest`)│
└───────────────────────────┬─────────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
[ Economy & Vault ]                      [ Progression Engine ]
 • +65 G Vault Delta                      • +120 XP Net Addition
 • Auto-propagation to TopBar,            • Level 12 (8,260 → 8,380 / 10,000)
   Rewards Deck & Inventory Vault         • Attribute Increment: +2 INT
 • Transaction Ledger Append              • Streak Check: 14D Active (1.15×)
       │                                         │
       ▼                                         ▼
[ Reward Store & Catalog ]               [ Milestone & Accolades ]
 • Dynamic Affordability Recalculation    • Trigger "Century Operative" (69/100)
 • One-Click Redemption (e.g. 750 G)      • Level-Up Boundary Check (XP ≥ 10k)
 • Instant Vault Balance Drop (670 G)     • Toast Notification Stack
       │                                         │
       └────────────────────┬────────────────────┘
                            │
                            ▼
[ Loadout & Active Character Sheet ]
 • Unlocked Item Propagates to `/inventory`
 • User Equips "Obsidian Deep-Work Theme"
 • Global Active Loadout Updates (`theme_deep_work_obsidian`)
 • Synced to Profile Rail, Home Dashboard & Character Studio
```

---

## 3. Authoritative State Contract & Database Schema

### 3.1 Global Player State Contract
All screens read from a unified store:
- **Identity:** Kai · Arch-Strategist II
- **Level:** 12 (8,260 / 10,000 XP · 82.6%)
- **Vault Balance:** 1,420 Gold
- **Streak:** 14 Days (1.15× Multiplier)
- **Attributes:** INT: 86 (+5) | DIS: 91 (+2) | VIT: 78 (+4) | STR: 72 (+3) | CRE: 64 (+1)
- **Active Loadout:**
  - Theme: `theme_deep_work_obsidian`
  - Frame: `frame_tactical_obsidian`
  - Codename Title: `title_arch_strategist`
  - Insignia Badge: `badge_consistency_master`
  - Consumable Boost: `boost_xp_surge_25` (18h remaining)

### 3.2 Relational PostgreSQL Schema (Supabase / Prisma)
```sql
-- Core Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Initiate',
  level INTEGER NOT NULL DEFAULT 1,
  xp_current INTEGER NOT NULL DEFAULT 0,
  xp_next_level INTEGER NOT NULL DEFAULT 1000,
  gold_balance INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  streak_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core Attributes
CREATE TABLE public.character_attributes (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  intellect INTEGER NOT NULL DEFAULT 50,
  discipline INTEGER NOT NULL DEFAULT 50,
  vitality INTEGER NOT NULL DEFAULT 50,
  strength INTEGER NOT NULL DEFAULT 50,
  creativity INTEGER NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Missions & Quests
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Normal', 'Hard', 'Epic')),
  attribute TEXT NOT NULL CHECK (attribute IN ('Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity')),
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('Once', 'Daily', 'Weekly', 'Campaign')),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rewards Catalog
CREATE TABLE public.reward_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Themes', 'Cosmetics', 'Badges', 'Titles', 'Boosts', 'Unlocks')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
  cost_gold INTEGER NOT NULL,
  min_level_required INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL
);

-- Inventory & User Collection
CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.reward_items(id),
  is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, item_id)
);

-- Ledger Transactions
CREATE TABLE public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Canonical Route Architecture
All routes exist within the unified persistent `TacticalSidebar` (240px) and `TopTelemetryBar`:
1. `/home` (⌘1) — Command Center: Primary daily triage, XP trajectory, active campaign track, and 5-capacity delta.
2. `/quests` (⌘2) — Quests & Missions Log: Filterable protocols (`All`, `Active`, `Daily`, `Campaigns`, `Boss Raids`, `Completed`), integrated modal creation, and Boss Raid countdown.
3. `/character` (⌘3) — Character & Progression: Tactical identity card, 7-day attribute trends, career evolution milestone matrix.
4. `/rewards` (⌘4) — Rewards & Vault: Curated item store, 5-tier rarity system, live gold delta redemption modals, and 7-day wealth sparkline.
5. `/inventory` (⌘5) — Inventory & Equipment: 5-slot active synchronized loadout, item inspection drawer, and direct equip/unequip toggles.
6. `/achievements` (⌘6) — Achievements & Milestones: Multi-tier accolade tracker (`Unlocked`, `In Progress`, `Locked`), requirements checklist, and reward yields.

---

## 5. Standardized Micro-Interactions & Modals
- **Create Quest Modal (`+ Create Quest`)**: In-context dark overlay with live XP/Gold/Attribute calculation preview, strict form validation, and zero disruption of the current route.
- **Item Redemption Modal (`Redeem 750 G`)**: Clean financial ledger delta display (`1,420 G` → `-750 G` → `670 G`). Clear insufficient funds state (`Shortfall: 330 G · View Quests CTA`). Stripped of all developer/test jargon.
- **Global Toast Engine**: Standardized 180ms notification stack pinned to bottom-right with dismiss and action buttons.
