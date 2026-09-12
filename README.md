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
[ PostgreSQ---

## 7. Database Architecture & Migrations

The database schema is defined across 10 sequential migrations in `supabase/migrations/` with **ZERO seeded gameplay rows**:
1. `001_core_schema.sql`: Core `profiles` (`role: 'player' | 'admin'`, checks `level >= 1`, `gold_balance >= 0`, `xp_current >= 0`), `character_attributes` (5 core human capacities).
2. `002_auth_profiles.sql`: Auth trigger `handle_new_user()` (provisions Level 1, 0 XP, 0 Gold, role `player`), `public.is_admin()`, and `public.promote_to_admin(target_email)`.
3. `003_rls.sql`: Row Level Security policies with self-promotion guards on `profiles` and strict tenant isolation.
4. `004_quests_directives.sql`: Operational directives (`quests` with `is_system_directive`), `quest_logs`, `streaks`, and `attribute_logs`.
5. `005_rewards_economy.sql`: Rewards catalog (`reward_items`), player-owned inventory (`user_inventory`), cosmetic loadouts (`equipped_items`), and authoritative double-entry ledger (`gold_transactions`).
6. `006_avatar_evolution.sql`: Avatar Armory catalog (`avatar_items`), player unlocks (`user_avatar_unlocks`), and 10-slot gear loadouts (`user_avatar_loadout`).
7. `007_boss_raids.sql`: Authoritative Boss Raids (`boss_raids`), player combat participation (`boss_raid_progress`), and directive strikes log (`boss_raid_actions`).
8. `008_achievements_campaigns.sql`: Master achievements (`achievements`), unlocks (`user_achievements`), episodic campaigns (`campaigns`), and stages (`campaign_progress`).
9. `009_admin_system.sql`: Administrative mutation audit trail (`admin_audit_logs`) and system parameters (`system_settings`).
10. `010_indexes_constraints.sql`: B-tree performance indexes across all foreign keys and query paths.

- **One-Click Master SQL Setup:** [`docs/FRESH_DATABASE_SETUP.sql`](docs/FRESH_DATABASE_SETUP.sql) contains all 10 schema components for single-step execution in Supabase SQL Editor.
- **Database Schema Specification:** [`docs/SUPABASE_SCHEMA.md`](docs/SUPABASE_SCHEMA.md).
- **Safe Reset Guide:** [`docs/SUPABASE_DATABASE_RESET.md`](docs/SUPABASE_DATABASE_RESET.md).

---

## 8. Canonical Routes

| Route | Shortcut | Clearance | Purpose |
|---|---|---|---|
| `/` | — | Public | Kinetic command deck landing page & CTA |
| `/auth/login` | — | Public | Operator terminal sign-in |
| `/auth/signup` | — | Public | New operator registration & character initialization |
| `/lobby` | `⌘1` | Authenticated | Primary Game Lobby, dynamic avatar stage, quick directives & attribute summary |
| `/home` | — | Authenticated | Compatibility forwarder targeting `/lobby` |
| `/quests` | `⌘2` | Authenticated | Mission log, category filters, interactive Boss Raid strike deck, directive creation |
| `/character` | `⌘3` | Authenticated | Hero profile, avatar armory loadout inspector, 5-capacity radar matrix |
| `/rewards` | `⌘4` | Authenticated | Armory shop catalog, 5-tier rarity grid, real-time gold redemption & shortfall telemetry |
| `/inventory` | `⌘5` | Authenticated | Active equipped cosmetic loadout deck, equip/unequip toggles |
| `/achievements` | `⌘6` | Authenticated | Accolades matrix (Unlocked, In Progress, Locked), milestone yield trackers |
| `/admin` | — | Admin (`role: admin`) | Tactical Administrator Command Center (CMS) |
| `/admin/qa/avatar-lab` | — | Admin (`role: admin`) | Isolated Developer QA Avatar Evolution Laboratory |

---

## 9. Administrator Command Center & Owner Promotion

All newly registered users are provisioned as standard players (`role = 'player'`). To confer administrative clearance to the project owner:

1. Register or sign in normally at `/auth/signup` or `/auth/login`.
2. Open your [Supabase Dashboard](https://app.supabase.com) -> **SQL Editor**.
3. Run the secure promotion procedure:
   ```sql
   SELECT public.promote_to_admin('owner@yourdomain.com');
   ```
   *(Or direct SQL fallback:)*
   ```sql
   UPDATE public.profiles
   SET role = 'admin', updated_at = NOW()
   WHERE id = (SELECT id FROM auth.users WHERE email = 'owner@yourdomain.com');
   ```
4. Refresh your browser. The **"Admin Panel"** link will appear in the main navigation under **Administration**, providing direct access to `/admin`.
5. For full details, see [`docs/ADMIN_ACCESS_SETUP.md`](docs/ADMIN_ACCESS_SETUP.md) and [`docs/ADMIN_PANEL.md`](docs/ADMIN_PANEL.md).

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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 11. Installation & Development

### Install Dependencies
```bash
npm install
```

### Run Master Verification Test Suite (50 Tests)
```bash
npm test
```
Executes the comprehensive 50-test production suite verifying:
- Real Supabase Auth & session restoration (chunked cookies, no redirect loops)
- Fresh user initialization (strictly Level 1, 0 XP, 0 Gold, 0 Streak, role `player`)
- Multi-user tenant isolation & complete absence of hardcoded demo/seed data
- Zero game state or auth credentials in client storage (`localStorage` / `sessionStorage`)
- Directive completion lifecycle, duplicate completion guards, and XP/Gold accrual
- Rewards shop affordability validation, inventory grants, and double-entry ledger logging
- Avatar Evolution 8-tier progression & slot equipment conflict resolution
- Server-authoritative Boss Raid deployment, HP deduction, and defeat bounty
- Admin RBAC enforcement (`verifyAdminSession`), 403 Forbidden checks, and audit logging
- QA Avatar Evolution Lab isolation on dedicated test operator (`00000000-0000-4000-a000-000000000099`)
- `docs/FRESH_DATABASE_SETUP.sql` 10-component schema validation
- Unauthenticated `/admin` redirection to `/auth/login` & player access denial
- Admin CMS dynamic reward publishing and session persistence across refresh

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

## 12. Deployment Instructions (Vercel + Supabase)

### Step 1: Deploy Supabase Schema
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the entire contents of [`docs/FRESH_DATABASE_SETUP.sql`](docs/FRESH_DATABASE_SETUP.sql).
4. Promote the project owner:
   ```sql
   SELECT public.promote_to_admin('owner@yourdomain.com');
   ```

### Step 2: Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure the following environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.vercel.app`)
4. Click **Deploy**. Vercel will build and deploy the Next.js application.

---

## 13. Design System Tokens

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

## 14. License & Hackathon Attribution

Engineered for the LIFE RPG Hackathon. Built on the Stitch Kinetic Command Deck v2 design foundation.
