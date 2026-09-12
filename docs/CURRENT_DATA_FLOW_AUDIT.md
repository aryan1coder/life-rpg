# LIFE RPG — CURRENT DATA FLOW & PERSISTENCE AUDIT
**Generated:** 2026-09-12  
**Status:** COMPLETE PRODUCTION AUDIT  
**Scope:** Authentication resolution, session cookie parsing, in-memory DataStore race conditions, and Supabase PostgreSQL persistence mapping.

---

## 1. Executive Summary

A comprehensive forensic audit of the LIFE RPG codebase was conducted to diagnose the following critical defects:
1. `/api/character` returning `401 Unauthorized`.
2. The UI intermittently displaying "Authenticate Operator" for signed-in users.
3. Seeded/demo quests ("Initialize Cognitive Command Deck", "Establish Deep Work Protocol", "Recovery & Sunlight Walk") unexpectedly appearing.
4. User changes (e.g., callsign or newly created quests) visually reverting to demo states before a hard browser refresh.
5. In-memory `DataStore` conflicting with Supabase PostgreSQL.

---

## 2. Root Cause Analysis

### A. `/api/character` 401 & "Authenticate Operator" Flash
* **The Mechanism:**
  - In `GameContext.tsx`, `authFetch` attaches `Authorization: Bearer <access_token>` from `supabase.auth.getSession()`.
  - When the browser navigates across pages or reloads, `supabase.auth.getSession()` can experience a 50–200ms hydration delay before returning the token.
  - In `src/lib/auth/session.ts`, `getAuthSession(req)` attempted to reconstruct chunked Supabase cookies (`sb-*-auth-token.0`, `sb-*-auth-token.1`, etc.) via manual concatenation and JSON decoding.
  - In instances where browser cookie jars held both legacy unchunked tokens and modern SSR chunked tokens, manual concatenation produced malformed strings, resulting in `getAuthSession` returning `null`.
  - `/api/character` therefore returned `401 Unauthorized`.
  - In `src/app/lobby/page.tsx`, line 75 evaluates:
    ```tsx
    if (!loading && !profile) {
      // Renders "Authenticate Operator" card
    }
    ```
    With `profile` set to `null` due to the 401, the fallback was presented to authenticated users.

### B. Seeded Quests & Data Reversion
* **The Mechanism:**
  - `src/lib/storage/data-store.ts` contained `createStarterQuests(profile_id)`:
    - *"Initialize Cognitive Command Deck"* (80 XP, 40 G)
    - *"Establish Deep Work Protocol"* (120 XP, 65 G)
    - *"Recovery & Sunlight Walk"* (80 XP, 40 G)
  - Whenever `db.getQuests(userId)` was invoked for a user without in-memory quests, `data-store.ts` automatically instantiated these 3 starter quests.
  - In `src/app/api/quests/route.ts`, if Supabase was either initializing or returned an empty array for a brand new user, the route fell back to `db.getQuests(userId)`, which populated and returned the 3 starter quests!
  - Consequently, new players saw demo quests rather than a clean slate.
  - Furthermore, on route navigation, `useEffect([pathname])` triggered `refreshAll()`. If any Supabase network query lagged, the fallback data from in-memory `DataStore` overwrote the UI state until the next successful refresh.

### C. Directives vs. Quests Nomenclature
* **The Mechanism:**
  - The UI design system references "Directives" (high-tech cyberpunk / Apple Health aesthetic).
  - The Supabase relational database schema created in `001_core_schema.sql` defines `public.quests`.
  - No table named `directives` exists or should exist in Supabase.
  - Canonical API routes (`/api/quests`, `/api/admin/quests`) interact directly with `public.quests`.

---

## 3. Data Flow Architecture Matrix

| Domain | UI Trigger / Route | Primary Target (Authoritative) | Fallback / Cache Store | Persistence Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Session** | `authFetch` / Header / Cookies | `@supabase/ssr` + JWT Header | `life_rpg_session` (cookie) | Cryptographically validated JWT |
| **User Profile** | `/api/character` | `public.profiles` | `db.profiles[id]` | Survives page refresh via Supabase |
| **Directives / Quests** | `/api/quests` | `public.quests` | `db.quests[id]` (empty by default) | Fully persisted; zero mock tasks |
| **Boss Raids** | `/api/boss-raids` | `public.boss_raids` | `db.customBossRaids` | Dynamic HP updates & bounty ledger |
| **Shop & Inventory** | `/api/rewards` | `public.reward_items`, `public.user_inventory` | `db.inventory[id]` | Gold balance & transactional ledger |
| **Avatar Evolution**| `/api/avatar/items` | `public.avatar_items`, `public.user_avatar_unlocks` | `db.avatarUnlocks[id]` | Level-based progression unlocks |

---

## 4. Required Structural Fixes

1. **Purge Seed Quests from DataStore:**
   - In `data-store.ts`, delete `createStarterQuests`.
   - `getQuests` must return `[]` if no quests exist.
   - `initFreshUser` must initialize `quests: []`.
2. **Synchronize Directives API:**
   - Maintain `public.quests` as the single authoritative table.
   - Create an alias `/api/directives` forwarding directly to `/api/quests` for client compatibility if requested.
3. **Session Robustness:**
   - Add async SSR session verification `getAuthenticatedSession(req)` that pairs `@supabase/ssr` `createServerClient` with the fast synchronous JWT fallback.
4. **Clean Slate Database Script:**
   - Provide `docs/FRESH_DATABASE_CLEANUP.sql` to truncate gameplay records while preserving schema, admin users, and RLS policies.
5. **Admin Access Segregation:**
   - Distinct entry point on the landing page (`/admin`) with server-side role validation (`profiles.role === 'admin'`).
