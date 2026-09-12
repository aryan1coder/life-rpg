# LIFE RPG — Full-Stack Executive Kinetic Command Deck

**System Architecture & Production Deployment Reference**  
*Document Version: 4.0.0 (Production Master Lock)*  
*Design Reference: Stitch Kinetic Command Deck v2*

---

## 1. Product Overview

LIFE RPG is an opinionated, executive-grade life gamification platform engineered specifically for high-agency knowledge workers, technical founders, and systems engineers. It translates daily disciplines, habits, and complex technical campaigns into tactile RPG progression metrics (XP, Levels, 5 Core Capacities, Vault Gold, Streaks, and Curated Equipment).

Built with Apple-level restraint, Linear-style information density, and tactile RPG satisfaction, LIFE RPG strips away juvenile gamification tropes and replaces them with an authoritative, dark-only operational terminal.

---

## 2. The Problem

Standard task managers and habit trackers suffer from two terminal failure modes:
1. **The Depressive Void of Static Checklists:** Clearing tasks in traditional tools yields zero compounding sense of kinetic momentum. The list empties, only to refill tomorrow with no long-term trajectory.
2. **Juvenile Mobile Gamification:** Conventional "gamified" apps flood the screen with neon rainbows, arbitrary action points (AP), cartoon avatars, and fake currencies that insult the intelligence of serious professionals.

---

## 3. The Solution: The Kinetic Progression Loop

LIFE RPG solves this through an authentic, mathematically sound RPG progression engine:
- **Server-Authoritative Economy:** Tasks yield genuine, auditable Vault Gold and XP.
- **Convex Polynomial XP Curve:** Leveling requires compounding effort, making high-tier titles meaningful milestones.
- **5 Core Human Capacities:** Quests allocate points to Intellect, Discipline, Vitality, Strength, and Creativity, visualizing real-life character balance.
- **Restrained Visual Polish:** Pitch-black canvases (`#0B0E15`), card elevations (`#151923`), electric indigo accents (`#6366F1`), and warm radiant gold (`#F59E0B`).
- **Tangible Motivation Rewards:** Vault Gold can be used to acquire custom theme palettes, cosmetic avatar frames, codename titles, and operational boosts.

---

## 4. Key Features

- **Authentication & Security:** Supabase Auth with Row Level Security (RLS) policies guaranteeing multi-tenant data isolation.
- **Quests & Directives Queue (`/quests`):** Full CRUD operational directive logging, categorized by difficulty (Easy to Epic), attribute tags, and cadence (Daily, Weekly, Campaign).
- **Boss Raids & Critical Threats:** Time-sensitive boss objectives with real-time countdown clocks (`02:18:42`) and multi-stage completion tracking.
- **Convex XP & Multi-Level Engine:** Non-linear progression formula `floor(1000 * level^1.25)` supporting multi-level jumps and rank title promotions.
- **5-Factor Radar Attributes:** Normalized point tracking across Intellect, Discipline, Vitality, Strength, and Creativity with 7-day trend analysis.
- **Daily Cadence Streak Engine:** Timezone-aware streak tracking with compounding multipliers up to 1.50×.
- **Vault Gold Economy:** Auditable financial ledgers with non-negative guarantees.
- **Rewards Catalog & In-Context Redemption (`/rewards`):** 5-tier item rarity store (Common, Uncommon, Rare, Epic, Legendary) with live financial delta visualization and shortfall telemetry.
- **Active Synced Loadout (`/inventory`):** 5 equipment slots (Theme, Frame, Title, Badge, Boost) that propagate across the TopBar, Profile rail, and Character sheet.
- **Data-Driven Achievements (`/achievements`):** Permanent accolade tracker evaluating real-time execution, streak cadence, and wealth thresholds.
- **Cross-Screen Synchronization:** Instant optimistic client updates backed by automatic server reconciliation.

---

## 5. Technology Stack

- **Frontend Framework:** Next.js 14+ (App Router, Server Components & Client Hooks)
- **Language:** TypeScript 5+ (Strict Mode)
- **Styling & Design System:** Tailwind CSS with custom Stitch design tokens
- **Iconography:** Lucide React & Google Material Symbols Outlined
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (SSR Cookie Sessions)
- **Security:** PostgreSQL Row Level Security (RLS) on all 17 tables
- **Testing:** Standalone TypeScript test runner (`tsx scripts/test-engine.ts`)
- **Deployment Target:** Vercel

---

## 6. System Architecture

```
[ Operator Action: Complete Quest / Redeem Item ]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Optimistic Update (Card Strikethrough / Sound)    │
│ 2. Server Action / Route Handler API Verification           │
└──────────────────────────┬──────────────────────────────────┘
                           │
      ┌────────────────────┴────────────────────┐
      ▼                                         ▼
[ Economy & Vault Engine ]             [ Progression & Level Engine ]
 • Non-negative balance check           • Convex XP incrementation
 • Append to `gold_transactions`        • Level threshold check
 • Real-time shortfall telemetry        • Conferred rank promotions
      │                                         │
      └────────────────────┬────────────────────┘
                           │
                           ▼
[ PostgreSQL / Supabase Ledger Commit ]
 • Update `profiles` & `character_attributes`
 • Record `quest_logs` & `xp_transactions`
 • Append `user_inventory` on item acquisition
 • Evaluate master `achievements`
                           │
                           ▼
[ Client Global State Synchronization (`GameContext`) ]
 • TopTelemetryBar XP & Gold animation
 • Floating "+2 INT" attribute chip
 • Instant toast notification stack
 • Active Loadout propagation
```

---

## 7. Database Architecture & Migrations

The database is defined in `supabase/migrations/`:
- `001_initial_schema.sql`:
  - `profiles`: User identity, level, XP, gold, streak, title, avatar.
  - `character_attributes`: Normalized INT, DIS, VIT, STR, CRE points and daily deltas.
  - `quests`: Operational directives with category, difficulty, reward tags.
  - `quest_logs`: Historical completion snapshots.
  - `xp_transactions`: Immutable XP delta audit ledger.
  - `gold_transactions`: Immutable Gold debit/credit ledger.
  - `streaks`: Consecutive day counters and multiplier status.
  - `attribute_logs`: Historical attribute gains.
  - `reward_items`: Curated catalog of themes, cosmetics, titles, and boosts.
  - `user_inventory`: Player-owned items.
  - `equipped_items`: 5-slot active profile loadout.
  - `achievements` & `user_achievements`: Master accolades and player unlock progress.
  - `campaigns` & `campaign_progress`: Multi-stage development campaigns.
  - `boss_raids` & `boss_raid_progress`: Threat objectives with expiration deadlines.
- `002_rls_policies.sql`: Row Level Security policies enforcing `auth.uid() = profile_id`.
- `003_seed_catalog.sql`: Seed definitions for items, achievements, and starter campaigns.

---

## 8. Canonical Routes

| Route | Shortcut | Purpose |
|---|---|---|
| `/` | — | Public landing and system introduction |
| `/auth/login` | — | Operator authentication terminal |
| `/auth/signup` | — | New operator registration & character initialization |
| `/home` | `⌘1` | Command Center, Daily Triage, 5-Factor Radar, Active Campaign |
| `/quests` | `⌘2` | Mission Log, Category Filters, Boss Raid countdown, Create Quest |
| `/character` | `⌘3` | Hero Profile, Attribute Capacity Engine, Evolution Chronicle |
| `/rewards` | `⌘4` | Curated Item Store, 5-Tier Rarity Grid, Financial Delta Redemption |
| `/inventory` | `⌘5` | 5-Slot Active Synced Loadout, Equipment Deck, Equip/Unequip Toggles |
| `/achievements` | `⌘6` | Accolades Matrix (Unlocked, In Progress, Locked), Yield Trackers |

---

## 9. Project Directory Structure

```
├── docs/                                # Engineering documentation suite
│   ├── STITCH_AUDIT.md                  # Comprehensive prototype audit
│   ├── ARCHITECTURE.md                  # Master architecture spec
│   ├── DATABASE.md & schema.md          # Database schemas & relationships
│   ├── GAME_RULES.md                    # Mathematical rules & formulas
│   ├── STATE_FLOW.md                    # Cross-system cascade sequence diagrams
│   ├── API.md                           # Route handlers & endpoints
│   ├── SECURITY.md                      # RLS validation & multi-user tests
│   ├── TESTING.md                       # Test suites & execution guide
│   ├── DEPLOYMENT.md                    # Vercel & Supabase deployment
│   ├── DESIGN_SYSTEM.md                 # Stitch tokens & typographic hierarchy
│   └── screens/                         # Individual screen specifications
├── scripts/
│   └── test-engine.ts                   # Game Engine automated test suite
├── src/
│   ├── app/                             # Next.js App Router canonical pages
│   │   ├── api/                         # Server-authoritative REST endpoints
│   │   ├── auth/                        # Login and Signup pages
│   │   ├── home/                        # /home Command Center
│   │   ├── quests/                      # /quests Mission Log
│   │   ├── character/                   # /character Hero Profile
│   │   ├── rewards/                     # /rewards Store & Vault
│   │   ├── inventory/                   # /inventory Loadout Deck
│   │   └── achievements/                # /achievements Accolade Matrix
│   ├── components/
│   │   ├── ui/                          # TacticalSidebar, TopTelemetryBar, Toast, AppShell
│   │   └── modals/                      # CreateQuest, Redeem, InsufficientFunds, LevelUp
│   ├── context/
│   │   └── GameContext.tsx              # Synchronized client state provider
│   ├── lib/
│   │   ├── game/                        # Isolated Server-Authoritative Game Engine
│   │   ├── storage/                     # Persistent database store & fallback engine
│   │   └── supabase/                    # Supabase browser & server clients
├── supabase/
│   └── migrations/                      # PostgreSQL SQL migrations
├── .env.example                         # Environment configuration template
├── package.json                         # Project dependencies & scripts
├── tailwind.config.ts                   # Tailwind configuration matching Stitch tokens
└── tsconfig.json                        # Strict TypeScript compiler options
```

---

## 10. Environment Setup

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Populate the required credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 11. Installation & Development

### Install Dependencies
```bash
npm install
```

### Run Game Engine Automated Tests
```bash
npm test
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Production Bundle
```bash
npm run build
```

---

## 12. Design System Tokens

- **Background Canvas:** `#0B0E15` (`bg-primary`)
- **Container Surfaces:** `#11141C` (`bg-secondary`), `#151923` (`surface`)
- **Elevated Surfaces:** `#1B1F2A` (`surface-elevated`)
- **Subtle Borders:** `rgba(255, 255, 255, 0.07)`
- **Electric Indigo Accent:** `#6366F1` (Progression, XP, Primary CTA)
- **Radiant Gold Accent:** `#F59E0B` (Vault Currency, Rare items)
- **Emerald Accent:** `#10B981` (Completed directives, active streak dots)
- **Crimson Threat Accent:** `#EF4444` (Boss Raids, shortfall notices)
- **Typography:** `Geist` for headers, `Inter` for body copy, and `JetBrains Mono` for numerical telemetry.

---

## 13. License & Hackathon Attribution

Engineered for the LIFE RPG Hackathon. Built on the Stitch Kinetic Command Deck v2 design foundation.
