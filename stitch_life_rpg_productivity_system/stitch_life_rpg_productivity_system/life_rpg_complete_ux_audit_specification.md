# LIFE RPG — Comprehensive Functional UX Audit, Interaction Specification & Consistency Lock
**Document Version:** 3.0 (Production Master & Frontend Architectural Handoff)  
**Approved Design Direction:** Kinetic Command Deck v2 (Apple-Level Restraint × Linear-Style Hierarchy × Tactile RPG Progression)  
**Status:** DESIGN SYSTEM LOCKED · ARCHITECTURE FROZEN · SINGLE SOURCE OF TRUTH

---

## 1. Executive Summary & Audit Assessment

Across the active LIFE RPG ecosystem (`Home`, `Quests & Missions`, `Character & Progression`, `Rewards & Inventory`), a rigorous multi-screen audit was performed to resolve visual drift, eliminate orphaned/dead interactive triggers, lock data telemetry across routes, and specify comprehensive state machines (loading, error, optimistic update, server reconciliation, empty states).

### Identified Audit Discrepancies & Direct Resolutions:
1. **Top Telemetry Discrepancy (Resolved):**
   - *Legacy anomaly*: Screen 4 showed `LV. 12 CYBER-PALADIN` and `2,480 / 3,000 XP (82%)` with `85/100 AP`.
   - *Locked Truth*: User identity is strictly **Kai · Level 12 Arch-Strategist II**. Telemetry is strictly **8,260 / 10,000 XP (82.6%)**, **1,420 Gold**, **14-Day Streak (1.15× multiplier)**. AP (Action Points) removed completely to eliminate extraneous mobile-game resource clutter.
2. **Navigation Bar & Route Uniformity (Resolved):**
   - *Locked Structure*: 6 core canonical routes: `Home (⌘1)`, `Quests (⌘2)`, `Character (⌘3)`, `Rewards (⌘4)`, `Inventory (⌘5)`, `Achievements (⌘6)`.
   - Bottom rail utility pinned: `14-Day Streak Status Indicator`, `Audio Feedback Toggle (Muted/Active)`, `Settings Modal Trigger`, `User Profile Compact Trigger`.
3. **Card & Surface Architecture (Unified):**
   - Strict 1px boundary: `border: 1px solid rgba(255, 255, 255, 0.07)`.
   - Corner radius: `rounded-2xl` (16px–20px) for parent cards, `rounded-lg` (8px) for interactive buttons/inputs, `rounded-sm` (4px) for telemetry pills.
   - Elimination of all remaining fake telemetry (e.g., `AUTH_HASH: 0x994F-CYBER`, `Sector 07`, `sys_session_090.sh`). All numbers represent genuine domain entities (XP, Gold, Streaks, Attribute Points, Timers).

---

## 2. Global State Model & Authoritative Synchronization Contract

All application state is server-authoritative (PostgreSQL / Supabase Schema with Row Level Security). Client stores (Zustand / TanStack Query) operate with strictly bound optimistic updates and automatic rollbacks on network mutation rejection.

```typescript
// Shared Authoritative User Progression Schema
export interface UserProgressionState {
  user: {
    id: string;
    name: "Kai";
    title: "Arch-Strategist II";
    avatarUrl: string; // {{DATA:IMAGE:IMAGE_14}}
    level: 12;
    xpCurrent: 8260;
    xpNextLevel: 10000;
    goldBalance: 1420;
    streakDays: 14;
    streakMultiplier: 1.15;
    lastActiveDate: string; // ISO 8601
  };
  attributes: {
    intellect: { value: 86; todayDelta: +5; max: 100 };
    discipline: { value: 91; todayDelta: +2; max: 100 };
    vitality: { value: 78; todayDelta: +4; max: 100 };
    strength: { value: 72; todayDelta: +3; max: 100 };
    creativity: { value: 64; todayDelta: +1; max: 100 };
  };
  activeLoadout: {
    themeId: "theme_deep_work_obsidian";
    frameId: "frame_tactical_obsidian";
    titleId: "title_arch_strategist";
    badgeId: "badge_consistency_master";
    activeBoostId: "boost_xp_surge_25";
  };
}
```

---

## 3. End-to-End Functional Interaction State Machines

### 3.1 Quest Completion & Ripple Cascade
When a user triggers `Complete Quest` (on Home Dashboard or Quests & Missions):
1. **Interactive Trigger**:
   - Button immediately transitions to `loading` (`aria-busy="true"`): spinner icon + "Verifying...". Disables duplicate pointer events.
2. **Authoritative Sync & Optimistic Execution**:
   - Card transforms into completed state: title strikes through with muted text, status pill swaps to Emerald badge (`Completed (+90 XP Claimed)`), CTA changes to `✓ Completed`.
   - Top bar & telemetry: XP bar increments smoothly (`8,260` → `8,380 / 10,000 XP`), Gold counter increments (`1,420 G` → `1,485 G`).
   - Attribute increment: `+2 INT` floating chip rises 8px with `150ms ease-out` fade.
3. **Toast Notification Dispatch**:
   - Restrained bottom-right toast appears:  
     `✓ Protocol Conquered · +120 XP, +65 Gold, +2 Intellect added to Command Deck.`
4. **Milestone Checks**:
   - Check if total XP ≥ 10,000 → Trigger Level-Up Modal.
   - Check if streak extended → Update 14-Day matrix dot to solid Emerald.

### 3.2 Reward Redemption → Inventory Synchronization → Equip Flow
1. **Catalog Action**:
   - User clicks `Redeem 750 G` on *Deep Work Obsidian Environment*.
   - If `goldBalance < cost`: CTA enters disabled state with inline tooltip `"Insufficient Vault Balance: Requires 750 G (Balance: 420 G). Complete quests to earn Gold."`
2. **Redemption Modal Flow**:
   - Modal displays: Item preview, item cost (`750 G`), current balance (`1,420 G`), resulting balance (`670 G`).
   - Actions: `Confirm Redemption` (Primary Indigo) and `Cancel` (Secondary Ghost).
   - On Confirm: Network mutation executes. Modal displays subtle success checkmark: *"Added to your collection"*.
3. **Inventory Auto-Propagation**:
   - Gold balance drops to `670 G` across all active screens.
   - Inventory tab counter increments (`18` → `19 Items`).
   - *Deep Work Obsidian Environment* appears in `Inventory > Themes` with status `Owned`.
4. **Equipping Flow**:
   - User clicks `Equip Theme`. Button updates to `Equipping...` → `✓ Equipped`.
   - Previous equipped theme (`Midnight Graphite`) reverts to `Equip`.
   - Global active loadout updates immediately; Character page shows equipped theme reflected in active profile styling.

### 3.3 Create Quest Protocol Modal
- **Form Fields & Validation**:
  - `Quest Title`: Required (min 3 chars). Displays inline red helper `"Title cannot be blank"` on blur if empty.
  - `Category`: Single-select chips (`Study`, `Fitness`, `Work`, `Personal`, `Creative`, `Health`).
  - `Difficulty`: `Easy` (+60 XP, +25 G), `Normal` (+120 XP, +65 G), `Hard` (+180 XP, +100 G), `Epic` (+300 XP, +180 G).
  - `Target Attribute`: Single-select radio pills (`Intellect`, `Discipline`, `Vitality`, `Strength`, `Creativity`).
  - `Recurrence`: `Once`, `Daily`, `Weekly`, `Campaign Milestone`.
- **Dynamic Reward Preview**:
  - Live calculation box calculates XP, Gold, and Attribute yield in real-time as difficulty and attribute are toggled. No fake cryptographic tags.
- **Submission**:
  - Primary CTA: `Initialize Protocol` (enters loading state on click).
  - On 200 OK: Modal closes, new quest inserts at top of Active Quest Queue with a subtle highlight flash (`duration-300 bg-indigo-500/10` fade-out), and counter increments.

---

## 4. Standardized Empty, Loading, and Error States

| Context | Empty State (Encouraging) | Loading Skeleton State | Error State (Graceful Recovery) |
|---|---|---|---|
| **Active Quests** | *"No active protocols in this queue. Your campaign board is clear."* CTA: `+ Initialize New Quest` | 3 stacked rounded cards with pulsing neutral shimmer (`bg-white/5` pulse 1.5s), preserving exact layout height. | *"Unable to synchronize mission log. Your offline progress is cached."* CTA: `Retry Sync` |
| **Inventory** | *"Your inventory vault is waiting. Conquer quests and redeem rewards to build your setup."* CTA: `Explore Reward Store` | 4-column card grid skeleton with 1:1 square preview placeholders and pill lines. | *"Unable to fetch inventory items."* CTA: `Reload Vault` |
| **Gold History** | *"No transactions recorded yet. Complete daily quests to earn your first gold yield."* | Single-column horizontal rows with muted pulse badges. | *"Unable to query ledger. Vault balance remains secure."* CTA: `Refresh Ledger` |
| **Achievements** | *"No unlocked badges yet. Complete 7 consecutive daily quests to unlock Consistency Master."* | 6 grid cards with dimmed circular badge silhouettes. | *"Unable to verify achievements."* CTA: `Check Status` |

---

## 5. Responsive Behavior & Viewport Breakpoints

- **Desktop (1440px+)**: Full persistent left sidebar (240px width), 3-column asymmetric layout, generous 32px–48px gutters, spacious contextual rails.
- **Laptop / Tablet (1024px–1280px)**: Sidebar condenses to 72px icon rail with tooltips, main grids collapse from 3 columns to 2 columns, right rails stack beneath hero sections.
- **Tablet Portrait (768px–1023px)**: Single column with sticky top telemetry bar, expandable bottom-sheet drawers for quest creation and item inspection.
- **Mobile (390px–430px)**:
  - Persistent tactile Bottom Navigation Bar: `Home`, `Quests`, `Character`, `Vault`.
  - Top header displays compact telemetry pill: `Lv. 12` | `82.6% XP` | `1,420 G` | Avatar.
  - Cards stack vertically with full-width thumb-friendly completion touch targets (min 48px tap targets).
  - Segmented filters become horizontally scrollable with zero clipping.

---

## 6. Accessibility & WCAG AA Verification

1. **Contrast Ratio**: All body and descriptor text (`#94A3B8`, `#F8FAFC`) strictly achieves > 4.5:1 on all layered dark backgrounds (`#0B0E15`, `#151923`, `#1B1F2A`).
2. **Keyboard Focus States**: Every interactive element includes explicit focus styling:  
   `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E15]`.
3. **Non-Color Dependent Indicators**: Every status (completed, locked, active, grace period) utilizes an accompanying geometric glyph / semantic icon alongside color tokens.
4. **Reduced Motion**: All CSS transitions honor `@media (prefers-reduced-motion: reduce)` by degrading to instant opacity switches (`duration-0`).

---

## 7. Developer Implementation & Component Directory

All frontend components are designed for direct drop-in implementation using Next.js 14 (App Router), Tailwind CSS v3.4, and Lucide React:

- `/components/shell/TacticalSidebar.tsx` — Persistent desktop navigation rail.
- `/components/shell/TopTelemetryBar.tsx` — Global synchronized XP, Gold, Level, and Streak monitor.
- `/components/quests/QuestCard.tsx` — Universal mission card supporting Daily, Habit, Campaign, and Boss Raid modes.
- `/components/quests/CreateQuestModal.tsx` — Server-authoritative modal with live calculation preview.
- `/components/character/AttributeEngine.tsx` — Five-factor capacity matrix with 7-day trendline.
- `/components/rewards/RewardStoreGrid.tsx` — 5-tier restrained rarity catalog with instant redemption.
- `/components/inventory/ActiveLoadoutStrip.tsx` — 5-slot equipped equipment manager linked to character sheet.
- `/components/ui/ToastNotification.tsx` — Global notification stack for XP gains, level milestones, and reward unlocks.

**Final Approval:** All requirements audited, verified, and locked against Kinetic Command Deck v2 specifications.