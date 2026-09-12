# LIFE RPG — GAME LOBBY & AVATAR EVOLUTION IMPLEMENTATION

## 1. Architectural Philosophy
LIFE RPG adapts the high-clarity spatial composition of mobile game lobbies (e.g. Free Fire, BGMI) while maintaining an Apple-level clean aesthetic, Linear-style operational hierarchy, and a restrained dark neutral palette (`#0B0E15`, `#11141C`, `#151923`).

No third-party game assets, branding, battle royale terms, or neon visual clutter are used. The player's avatar is the visual hero, surrounded by actionable telemetry.

---

## 2. Information Architecture & Questions Answered at a Glance
| User Question | Lobby Component |
|---|---|
| **Who am I?** | Center Hero Avatar + Real Display Name + Callsign + Rank Title |
| **What level am I?** | Top Telemetry Bar + Large Level Badge + Current XP / Next Level progress |
| **What am I working on?** | Bottom Active Directives Strip (3-5 live prioritized quests) |
| **What can I unlock next?** | Evolution Milestone Card ("X levels until next visual tier" + signature gear preview) |
| **What should I do next?** | "Continue Directive" primary button, "New Directive" action, "Armory" link |

---

## 3. Avatar Evolution System

### Tiers (Levels 1 to 16+)
1. **Tier 1 (Level 1): Initiate Vanguard**
   - Clean, functional tactical garments, simple ergonomic footwear, clean baseline posture.
2. **Tier 2 (Levels 2–3): Discipline Adept**
   - Biometric chrono-band, anti-reflective focus spectacles, reinforced utility collar.
3. **Tier 3 (Levels 4–5): System Vanguard**
   - Vanguard ballistic chest rig, commando composite boots.
4. **Tier 4 (Levels 6–7): Tactical Specialist**
   - Translucent amber tactical HUD monocle, precision resonance neural stylus.
5. **Tier 5 (Levels 8–9): High Operative**
   - Phase-insulated storm cloak, operative shadow acoustic cowl.
6. **Tier 6 (Level 10): Archon Strategist**
   - Resonance kinetic under-suit, geometric quantum focus lattice aura.
7. **Tier 7 (Levels 11–15): Apex Commander**
   - Levitating telemetry companion drone, hyper-threaded chrono-blade.
8. **Tier 8 (Level 16+): Sovereign Ascendant**
   - Luminescent sovereign radiant halo, stellar nexus command void background.

All avatars remain fully and appropriately clothed across all tiers.

---

## 4. Responsive & Mobile Landscape Game Mode

### Breakpoints & Adaptive Rules:
- **Desktop (1280px+)**:
  - Full-featured tactical rail on left (w-64).
  - Center prominent avatar showcase.
  - Right compact progression panel (attributes, streak, evolution).
  - Bottom active directives strip.
- **Mobile Portrait (390px x 844px)**:
  - Clean floating bottom navigation (`MobileBottomNav.tsx`) with 44px+ touch targets.
  - Avatar hero centered at top, followed by quick action pills and scrollable active quests.
- **Mobile Landscape Game Mode (`@media (orientation: landscape) and (max-height: 520px)`)**:
  - Treats phone like a handheld console screen.
  - Left navigation collapses to a slim icon-only bar.
  - Large avatar placed in center with adjusted scale to eliminate vertical page scrolling.
  - Right side hosts compact telemetry metrics (Level, XP %, Gold, Streak, Attributes).
  - Bottom displays a single-row condensed action bar.
  - Safe area insets (`env(safe-area-inset-*)`) respected.

---

## 5. Server Authoritative Flow
1. **Auth**: Supabase SSR HttpOnly cookie session. Route guard redirects unauthenticated users to `/auth/login` and authenticated users to `/lobby`.
2. **Progression**: Quests completed via `POST /api/quests/[id]/complete`.
3. **Level Up**: If XP exceeds threshold, level increments, avatar unlocks are recorded, and the modal renders the new gear with an instant "Equip" action.
4. **Equip**: `POST /api/avatar/equip` validates verified ownership in `user_avatar_unlocks` before updating `user_avatar_loadout`.
