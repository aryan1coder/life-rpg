# LIFE RPG — Stitch Prototype Technical Audit & Inventory

**Audit Date:** September 2026  
**Auditor:** Antigravity Lead Systems Architect & Engineering Team  
**Scope:** `c:\Users\saxen\OneDrive\Desktop\Hackathon\stitch_life_rpg_productivity_system`

---

## 1. Overview & Current Framework State
The Stitch export contains static HTML5 prototypes utilizing Tailwind CSS via CDN (`https://cdn.tailwindcss.com`), Google Fonts (`Geist`, `Inter`, `JetBrains Mono`, `Space Grotesk`, `Material Symbols Outlined`), inline JavaScript mock interactions, and high-fidelity screen captures.

### Framework & Toolchain
- **Current Framework:** Standalone HTML5 / Tailwind CDN / Vanilla JavaScript DOM bindings.
- **Node & NPM Toolchain:** Node v24.14.1, NPM 11.18.0.
- **Target Full-Stack Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), Vercel.

---

## 2. Inventory of Exported Stitch Artifacts

| Directory / Artifact | Primary Type | Purpose & Screen Mapping |
|---|---|---|
| `home_command_center_refined/` | `code.html`, `screen.png` | Primary daily hub (`/home`): Hero progression strip, daily triage, 5-factor radar values, active campaign pipeline. |
| `quests_missions_refined/` | `code.html`, `screen.png` | Quests log (`/quests`): Bento boss raid threat card with countdown (`02:18:42`), segmented filters (`All`, `Active`, `Daily`, `Campaigns`, `Boss Raids`, `Completed`). |
| `character_progression_refined/` | `code.html`, `screen.png` | Character sheet (`/character`): Cybernetic avatar portrait, 5 attributes with 7-day trend sparklines, career evolution milestone matrix. |
| `rewards_inventory_economy_deck_refined/` | `code.html`, `screen.png` | Reward vault (`/rewards`): Hero reward showcase (*Obsidian Deep-Work Environment* 750 G), 5-tier rarity catalog, financial delta calculation. |
| `inventory_equipment_deck_refined/` | `code.html`, `screen.png` | Equipment deck (`/inventory`): 5-slot active loadout (Theme, Frame, Codename, Badge, Consumable Boost), category tabs, item inspector drawer. |
| `achievements_milestones_deck_refined/` | `code.html`, `screen.png` | Accolades tracker (`/achievements`): Master completion (12/30, 40%), priority focus track (*Consistency Legend*), accolades matrix. |
| `interactive_modals_item_redemption_quest_creation/` | `code.html` | In-context overlays: Create Quest modal with dynamic reward preview, Item Redemption modal, Insufficient Funds modal. |
| `life_rpg_crest_emblem/` | `code.html`, `screen.png` | High-res cybernetic SVG crest emblem with glowing radial gradients. |
| `futuristic_cyberpunk_rpg_warrior_.../` | `screen.png` | Cybernetic portrait asset for Kai (Arch-Strategist II). |
| `readme.md_master_architecture...` | Markdown | Master technical architecture specification v4.0.0. |
| `life_rpg_final_design_system...` | Markdown | Developer design tokens handoff specification v2.0. |
| `life_rpg_complete_ux_audit...` | Markdown | UX audit & interaction specification v3.0. |
| `screen_documentation_master_docs_screens.md` | Markdown | Screen component hierarchy & route documentation index. |

---

## 3. Design Tokens & Styling System

### 3.1 Color Palette & Semantic Surfaces
- **Canvas / Background:** `#0B0E15` (`bg-primary`)
- **Secondary Shell:** `#11141C` (`bg-secondary`)
- **Card Surface:** `#151923` (`surface`)
- **Elevated / Hover:** `#1B1F2A` (`surface-elevated`)
- **Subtle Borders:** `rgba(255, 255, 255, 0.07)` (`border-subtle`)
- **Primary Progression:** Electric Indigo `#6366F1`
- **Vault Currency:** Warm Radiant Gold `#F59E0B`
- **Completed / Health:** Emerald `#10B981`
- **Warnings / Streaks:** Amber `#F97316`
- **Boss Raid Threats:** Crimson `#EF4444`
- **Attributes:**
  - Intellect: Cyan `#06B6D4`
  - Discipline: Violet `#8B5CF6`
  - Vitality: Emerald `#10B981`
  - Strength: Amber `#F59E0B`
  - Creativity: Rose `#F43F5E`

### 3.2 Spacing & Radii
- **Radii:** `rounded-2xl` (16px–20px) for cards/modals, `rounded-lg` (8px) for buttons/inputs, `rounded-sm` (4px) for telemetry pills.
- **Card Depth:** `border: 1px solid rgba(255, 255, 255, 0.07); box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);`

### 3.3 Typography
- **Headings & Body:** `Geist` and `Inter`
- **Numeric & Telemetry:** `JetBrains Mono` for XP ratios (`8,260 / 10,000 XP`), timers (`02:18:42`), and currency values (`1,420 G`).

---

## 4. Identified Prototype Artifacts To Remove
1. **Developer Testing UI:** Removed buttons and notices for "TESTING HARNESS", "Simulate Insufficient Vault Funds", "PostgreSQL verification text", and internal transaction hashes (`AUTH_HASH: 0x994F-CYBER`, `sys_session_090.sh`).
2. **Legacy Military Anomaly:** Screen 4's reference to `LV. 12 CYBER-PALADIN` and `85/100 AP` eliminated in favor of canonical standard: **Kai · Level 12 Arch-Strategist II**, with real XP, Gold, Streaks, and 5 normalized Core Capacities (INT, DIS, VIT, STR, CRE).
3. **Static Mock State:** Replaced hardcoded client variables with server-authoritative state backed by PostgreSQL and real Supabase Auth.

---

## 5. Migration Strategy & Target Architecture
- Maintain root directory Next.js 14+ structure.
- Reusable UI primitives structured in `src/components/ui/` (`AppShell`, `Sidebar`, `TopTelemetryBar`, `QuestCard`, `RewardCard`, etc.).
- Complete server-side game engine in `src/lib/game/` covering non-linear XP curves, atomic quest completions, streak calculations, and achievement evaluations.
- PostgreSQL migrations in `supabase/migrations/` enforcing Row Level Security (RLS) and referential integrity.
