# Root Cause Auth & Persistence Analysis

## Overview
This document traces the exact data flow and identifies the root causes of the production-blocking bugs regarding authentication resets ("Authenticate Operator"), data disappearance, and seeded data corruption.

## 1. Trace of Real Data Flow

### AUTH:
Supabase Auth → browser session (via HTTP cookies) → Next.js Middleware → `getAuthSession()` (server) → API route authentication → React state (GameContext).
**Root Cause found:** Cookie chunking `.0` and `.1` were being concatenated improperly in `session.ts`, causing invalid JWTs on reload.

### PROFILE:
Supabase `public.profiles` → API (`GET /api/character`) → `GameContext` → UI.
**Root Cause found:** `GET /api/character` was fetching from Supabase, but actively writing to an in-memory `DataStore` (`db`). If the fetch failed or took too long, it returned the mocked `DataStore` state instead, overwriting the UI with "Level 1 Operator" fallback data.

### QUEST:
Supabase `public.quests` → API (`GET /api/quests`) → `GameContext` → UI.
**Root Cause found:** `GET /api/quests` was intercepting Supabase data and storing it in `DataStore`. On failure (or race condition), it returned `db.getQuests()`, which previously injected seeded directives. 

### CHARACTER:
Supabase `public.character_attributes` → API (`GET /api/character`) → `GameContext` → UI.

### ADMIN:
Supabase Auth → `profiles.role` → server admin guard (`middleware` / Layout Server Components) → `/admin`.

## 2. Every Source of "Authenticate Operator"
The string "Authenticate Operator" appears in the unauthenticated loading state.
**Trigger Chain:**
1. User reloads browser.
2. `GameContext` mounts and calls `refreshAll()`.
3. `refreshAll()` calls `GET /api/character`.
4. `GET /api/character` calls `getAuthSession()`.
5. Due to the cookie chunking bug, the JWT fails validation.
6. API returns `401 Unauthorized`.
7. `GameContext` receives `401`, nulls the profile, and UI displays "Authenticate Operator".

## 3. "Data Disappears Then Refresh Fixes It" Bug
**The Race Condition:**
1. User edits profile in UI (e.g., gains XP, completes quest).
2. UI updates optimistically.
3. API is called (e.g., `PATCH /api/character`), successfully updates Supabase.
4. User navigates. Next.js triggers `useEffect([pathname])` in `GameContext`.
5. `refreshAll()` fires a new `GET /api/character`.
6. If the Next.js `fetch` is cached (stale-while-revalidate), or if the in-memory `DataStore` intercepts it before the Supabase read resolves, it returns the *old* data.
7. UI reverts to old data.
8. User refreshes manually → hard network request clears cache → `refreshAll()` hits Supabase → correct data returns.

## 4. Quests Not Saving Reliably
**Root Cause:**
`POST /api/quests` was writing to the `DataStore` cache in addition to Supabase. Furthermore, some constraints in the PostgreSQL schema (e.g., `category`, `xp_reward` NOT NULL constraints) were not being satisfied by the client request, causing silent database insertion failures. The API swallowed the error and returned success because it fell back to writing to the mock `DataStore`.

## 5. Admin Authentication
**Root Cause:**
Admin privileges were not exclusively checking `public.profiles.role = 'admin'` server-side on every request. Relying on frontend UI state allowed the admin state to disappear on refresh due to the same cookie auth bug.

## Conclusion
The fundamental issue is that **`DataStore.ts` acts as a parallel, fake database** that masks network failures and API errors. When Supabase interactions failed (due to auth bugs or SQL constraints), the application silently failed over to the mock data store, creating the illusion of success while completely corrupting the user's cross-device state.
