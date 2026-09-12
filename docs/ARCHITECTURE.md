# LIFE RPG — System Architecture & Technical Specification

**System Version:** 4.0.0 (Production Release)  
**Philosophy:** Apple-level restraint × Linear-style information hierarchy × tactile RPG progression.  
**Theme:** Kinetic Command Deck v2 (Dark-Only · Standardized Tokens)

---

## 1. System Overview & Technology Stack
LIFE RPG is an executive-grade gamified productivity platform translating complex personal execution into RPG metrics (XP, Levels, Attributes, Vault Gold, Streaks, Equipment).

### 1.1 Frontend Layer
- **Framework:** Next.js 14+ (App Router, Server Components, and Client Components where interactive state is required).
- **Language:** Strict TypeScript.
- **Styling:** Tailwind CSS with custom theme extensions reproducing the Stitch dark token system.
- **Iconography:** Material Symbols Outlined & Lucide React.
- **State Management:** Reactive Client Context with optimistic updates and automatic server reconciliation.

### 1.2 Backend & Data Layer
- **Database:** PostgreSQL (Supabase managed).
- **Authentication:** Supabase Auth (Email/Password, Session Cookies, OAuth readiness).
- **Security:** Row Level Security (RLS) enabled on all 17 tables, enforcing multi-tenant isolation.
- **Game Engine:** Dedicated server-authoritative progression engine (`src/lib/game/`).
- **Persistence Fallback:** Built-in isolated in-memory/file storage engine for offline development and testing.

---

## 2. Component Hierarchy & Route Mapping
All authenticated views reside inside the persistent `AppShell`:

```
AppShell
├── TacticalSidebar (240px persistent, route hotkeys ⌘1-⌘6, streak badge, user mini-profile)
├── TopTelemetryBar (Level badge, smooth XP progress bar, Gold pill, Streak pill, notifications, profile)
├── MainContent (<ScreenContent />)
└── ToastContainer (Bottom-right stacked notifications)
```

### Canonical Routes:
1. `/` — Public Landing Page (hero introduction, dark theme showcase, CTAs to login/signup).
2. `/auth/login` & `/auth/signup` — Direct Supabase authentication with dark form aesthetics.
3. `/home` (⌘1) — Command Center: Daily priority triage, active XP bar, 5 Core Capacities, active campaign.
4. `/quests` (⌘2) — Quests & Missions Log: Filterable protocols (`All`, `Active`, `Daily`, `Campaigns`, `Boss Raids`, `Completed`), Boss Raid threat card with countdown (`02:18:42`), Create Quest modal.
5. `/character` (⌘3) — Character & Progression: Cyberpunk avatar portrait, 5-attribute 7-day sparklines, career evolution matrix.
6. `/rewards` (⌘4) — Rewards Store: Curated item store, 5-tier rarity system, live gold delta redemption modals, 7-day wealth sparkline.
7. `/inventory` (⌘5) — Equipment Deck: 5-slot active synchronized loadout, item inspection drawer, direct equip/unequip toggles.
8. `/achievements` (⌘6) — Achievements & Milestones: Accolade tracker (`Unlocked`, `In Progress`, `Locked`), requirements checklist, reward yields.

---

## 3. Server / Client Boundaries
- **Server Actions & API Handlers (`/api/*` and `src/lib/game/`):**
  - Verify user session & identity before executing mutations.
  - Calculate XP curves, attribute increments, streak multipliers, and level thresholds.
  - Record audit transactions in `xp_transactions` and `gold_transactions`.
- **Client Components (`src/components/*`):**
  - Trigger optimistic state updates (e.g. card strikethrough, immediate counter updates).
  - Revert and display toast alert if server validation or network fails.
