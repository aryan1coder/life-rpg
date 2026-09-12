# LIFE RPG — Final Design System Specification & Developer Handoff
**Document Version:** 2.0 (Kinetic Command Deck v2 — Production Release)  
**Philosophy:** Apple-level restraint × Linear-style information hierarchy × tactile RPG progression.

---

## 1. Core Design Tokens

### 1.1 Color Palette & Semantic System
85–90% neutral dark surfaces, 10–15% disciplined semantic accents. No glowing rainbow borders or arbitrary neons.

```css
:root {
  /* Surfaces & Canvas */
  --bg-primary: #0b0e15;            /* Canvas background */
  --bg-secondary: #11141c;          /* Secondary container / shell background */
  --surface: #151923;               /* Standard card & panel surface */
  --surface-elevated: #1b1f2a;      /* Hover states, active dropdowns, popovers */
  --surface-border: rgba(255, 255, 255, 0.07); /* 1px subtle boundary */
  --surface-border-subtle: rgba(255, 255, 255, 0.04);
  --surface-border-active: rgba(99, 102, 241, 0.35);

  /* Typography & Text */
  --text-primary: #f8fafc;          /* High emphasis titles & numbers */
  --text-secondary: #94a3b8;        /* Body text & descriptors */
  --text-muted: #64748b;            /* Subtitles, labels & metadata */
  --text-disabled: #334155;

  /* Primary Progression Accent (Electric Indigo) */
  --accent-indigo: #6366f1;         /* XP bars, primary CTA, active navigation */
  --accent-indigo-hover: #4f46e5;
  --accent-indigo-subtle: rgba(99, 102, 241, 0.12);

  /* Economy & Milestones (Warm Radiant Gold) */
  --accent-gold: #f59e0b;           /* Gold balance, rare loot drops, rank bounties */
  --accent-gold-subtle: rgba(245, 158, 11, 0.12);

  /* Semantics & Attributes */
  --status-emerald: #10b981;        /* Completed quests, health syncs, active streak days */
  --status-amber: #f97316;          /* Streak countdowns, attention reminders */
  --status-crimson: #ef4444;        /* Boss Raids & critical objectives ONLY */
  --attr-cyan: #06b6d4;             /* Intellect attribute */
  --attr-violet: #8b5cf6;           /* Discipline attribute */
  --attr-emerald: #10b981;          /* Vitality attribute */
  --attr-amber: #f59e0b;            /* Strength attribute */
  --attr-rose: #f43f5e;             /* Creativity attribute */
}
```

---

## 2. Spacing, Elevation & Corner Radii

### 2.1 Spacing Scale (8px Grid)
- **4px (`p-1`, `gap-1`)**: Micro chips, tag padding, icon offsets
- **8px (`p-2`, `gap-2`)**: Standard pill inner padding, status indicator gaps
- **12px (`p-3`, `gap-3`)**: List items, compact table cells
- **16px (`p-4`, `gap-4`)**: Small cards, sidebar item padding
- **24px (`p-6`, `gap-6`)**: Standard card padding, grid gap
- **32px (`p-8`, `gap-8`)**: Major container padding, hero section gaps
- **48px (`p-12`, `gap-12`)**: Page content margins, screen boundary offsets

### 2.2 Corner Radii
- **`rounded-sm` (4px)**: Status badges, progress bar inner fills, keyboard shortcut tags
- **`rounded-md` (8px)**: Buttons, text inputs, segmented control pills
- **`rounded-xl` (12px)**: Contextual dropdowns, tooltips, toast notifications
- **`rounded-2xl` (16px–20px)**: Primary application cards, modals, hero panels

### 2.3 Borders & Depth
- Standard card border: `1px solid rgba(255, 255, 255, 0.07)`
- Elevation: Subtle multi-layered dark drop shadow `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5)`
- Restrained glassmorphism: `backdrop-filter: blur(12px); background: rgba(21, 25, 35, 0.75);`

---

## 3. Typography Hierarchy (`Geist` / `Inter` scale)

| Token | Size / Line-Height | Weight | Usage |
|---|---|---|---|
| **Display** | 32px / 40px | Bold (700) | Greeting ("Good evening, Kai"), Level Up modal |
| **Heading 1** | 24px / 32px | Semibold (600) | Main section titles ("Quests", "Character & Progression") |
| **Heading 2** | 18px / 24px | Semibold (600) | Card headers, Boss Raid title, Active Protocol names |
| **Body Primary** | 14px / 20px | Regular (400) / Medium (500) | Quest descriptions, system descriptors |
| **Body Muted** | 13px / 18px | Regular (400) | Secondary metadata, dates, criteria copy |
| **Caption / Tag** | 11px / 16px | Medium (500) | Category badges, rarity chips, keyboard shortcuts |
| **Telemetry / Numeric** | 12px–20px | Semibold (600) Monospace | XP ratios (`8,260 / 10,000 XP`), timers (`02:18:42`), Gold amounts |

---

## 4. Reusable Component Inventory

### 4.1 Buttons & Action Triggers
- **Primary Action (`.btn-primary`)**: Solid electric indigo background (`#6366F1`), white label, soft hover transition (`150ms ease`), active scale `0.98`. Used for *Complete Quest*, *+ Create Quest*, *Redeem 750 G*.
- **Secondary Action (`.btn-secondary`)**: Neutral surface (`#1B1F2A`), border `1px solid rgba(255,255,255,0.08)`, secondary text color. Used for *Customize Deck*, *Inspect Blueprint*, *Reschedule*.
- **Ghost / Utility (`.btn-ghost`)**: Transparent background, text muted, hover to secondary surface. Used for filtering, sorting, and header actions.

### 4.2 Standardized Quest Card
```html
<article class="bg-[#151923] border border-white/7 rounded-2xl p-5 flex items-center justify-between hover:border-white/15 transition-all duration-200">
  <!-- Left: Attribute Glyph -->
  <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mr-4">
    <svg class="w-5 h-5">...</svg>
  </div>
  
  <!-- Center: Title, Cadence & Progress -->
  <div class="flex-1 min-w-0 pr-6">
    <div class="flex items-center gap-2 mb-1">
      <h3 class="text-sm font-semibold text-white truncate">Algorithm Practice & Graph Traversal</h3>
      <span class="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">Normal · Daily</span>
    </div>
    <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
      <div class="bg-cyan-500 h-full rounded-full" style="width: 80%"></div>
    </div>
  </div>

  <!-- Right: Reward Pills & CTA -->
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2 text-xs font-mono font-medium">
      <span class="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">+120 XP</span>
      <span class="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">+65 Gold</span>
    </div>
    <button class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all">
      Complete
    </button>
  </div>
</article>
```

### 4.3 Clean Progress & Streak Matrix
- **XP Progress Gauge**: Clean track (`bg-white/5`), height `8px`, animated fill (`bg-gradient-to-r from-indigo-500 to-indigo-400`), zero glowing blur overlays.
- **Streak Tracker**: 14-day minimalist two-week dot matrix:
  - Completed: Solid Emerald (`#10B981`)
  - Today: Solid Indigo (`#6366F1`)
  - Upcoming: Subtle muted slate (`#334155`)

### 4.4 Economy & Rarity Tokens
- **Common**: Slate border (`border-white/10`), neutral text.
- **Uncommon**: Emerald accent badge (`text-emerald-400`, `bg-emerald-500/10`).
- **Rare**: Electric Indigo badge (`text-indigo-400`, `bg-indigo-500/10`).
- **Epic**: Soft Violet badge (`text-purple-400`, `bg-purple-500/10`).
- **Legendary**: Warm Radiant Gold (`text-amber-400`, `bg-amber-500/10`, `border-amber-500/20`).

---

## 5. Screen Inventory & Architecture Map

1. **`Home - Command Center (Refined)` (`{{DATA:SCREEN:SCREEN_9}}`)**:
   - Hero user identity, Level 12 trajectory, 82.6% progress, 14-day streak overclock, 1,420 G Vault balance.
   - High-priority daily quest triage with inline completion actions.
   - Right contextual rail: Attributes matrix (INT, DIS, VIT, STR, CRE), active campaign tracker (Ship Hackathon MVP), and recent loot drops.
2. **`Quests & Missions (Refined)` (`{{DATA:SCREEN:SCREEN_7}}`)**:
   - Tactical ops filter matrix (All, Active, Daily, Campaigns, Boss Raids, Completed).
   - Boss Raid objective (Critical Threat, countdown timer, sub-protocol progress).
   - Multi-stage campaign pipeline with connected progress indicators.
   - Standard quest list and non-punitive grace period card for expired protocols.
3. **`Character & Progression (Refined)` (`{{DATA:SCREEN:SCREEN_5}}`)**:
   - Hero profile card with integrated cyberpunk avatar (`{{DATA:IMAGE:IMAGE_14}}`).
   - Deep attributes engine with 7-day delta trendline and contributing quest operations.
   - Career progression chronological ledger (Level 09 through Level 12 Arch-Strategist).
   - Streak calendar and active equipped codename/title selector.
4. **`Rewards, Inventory & Economy Deck` (`{{DATA:SCREEN:SCREEN_3}}`)**:
   - Economy telemetry vault with 7-day influx sparkline and transaction history.
   - Hero feature environment theme (*Obsidian Deep-Work Focus Mode*).
   - Reward store catalog with restrained 5-tier rarity categorization and instant redemption modals.
   - Synced user loadout panel connecting directly to character progression.

---

## 6. Front-End Developer Implementation Guidelines

- **Framework Compatibility**: Fully compatible with Next.js 14 / React 18, Tailwind CSS v3.4, and Lucide React / Radix UI primitives.
- **Motion & Transitions**: Constrain animations strictly to `150ms–250ms cubic-bezier(0.16, 1, 0.3, 1)`. Avoid heavy particle scripts, screen shakes, or layout thrashing.
- **Accessibility Guarantee**: All text elements adhere strictly to WCAG AA contrast standards (> 4.5:1 on dark surfaces). Focus states utilize `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E15]`.
- **State Integrity**: All XP and Gold calculations are strictly server-authoritative; optimistic updates are permitted only on instant quest completion toggles with background synchronization.
