# Forensic Persistence Audit

This document answers the critical questions surrounding the Life RPG architecture, identifying the sources of truth and the root causes of persistence bugs.

### A. Where authentication state comes from
Authentication state comes strictly from **Supabase Auth**. In the browser, it is managed by the `@supabase/supabase-js` browser client (reading from secure cookies set by the server). On the server, it is validated by `@supabase/ssr` (Server-Side Rendering) through Next.js middleware and API routes parsing the chunked session cookies (`sb-*-auth-token.0`, `.1`).

### B. Where profile state comes from
Profile state (including level, XP, gold, and role) is stored authoritatively in the **`public.profiles`** PostgreSQL table in Supabase. The React UI caches this state via `GameContext`, fetching it on mount or navigation via `/api/character`.

### C. Where character state comes from
Character attributes (Strength, Intelligence, etc.) come from the **`public.character_attributes`** table. This is fetched alongside the profile.

### D. Where quests come from
Quests come from the **`public.quests`** table. Previously, the application used a `DataStore` that injected fake "seed" quests into local state if the database was empty. This has been fully eliminated.

### E. Where rewards come from
Rewards are stored in the **`public.rewards`** table, which is managed by admins.

### F. Where inventory comes from
Inventory items are stored in the **`public.inventory`** table. Players spend gold to purchase rewards, which creates an inventory record.

### G. Where avatar state comes from
Avatar configuration (equipped items) comes from **`public.user_avatar_loadout`** (formerly `equipped_loadouts`).

### H. Which state is persisted in Supabase
**All of it.** Authentication, Profiles, Attributes, Quests, Rewards, Inventory, Avatar Loadouts, Boss Raids, and Audit Logs are fully schema-backed and persisted in Supabase.

### I. Which state is still local/in-memory/static
**None.** The application uses React Context (`GameContext.tsx`) only as an ephemeral UI cache. There is NO authoritative `localStorage`, `sessionStorage`, or `IndexedDB` usage for gameplay state. The `createStarterQuests` fallback mock data array has been deleted.

### J. Why reload causes state reset
Reload previously caused a state reset because of **Cookie Chunking Failure**. `@supabase/ssr` splits large JWT tokens across multiple cookies (`.0`, `.1`). The old auth session code simply ran `.join('')` on all auth cookies, concatenating old, dead non-chunked tokens with new chunked ones, producing an invalid JWT. This caused the server to return `401 Unauthorized` on reload, making the UI revert to default state. This has been fixed in `src/lib/auth/session.ts`.

### K. Why cross-device login loses data
Cross-device login lost data because the client was failing to properly establish the session server-side, causing the app to fall back to the `DataStore`'s mock cache rather than fetching the actual user's data from Supabase. With the cookie bug resolved, logging into Device B now retrieves the exact same Supabase rows.

### L. Why "Authenticate Operator" appears
"Authenticate Operator" appeared because the `/api/character` API returned `401 Unauthorized` due to the aforementioned JWT cookie parsing error. The UI gracefully (but confusingly) rendered the unauthenticated loading state. This is now fully resolved.

### M. Why seeded quests appear
Seeded quests appeared because `src/lib/storage/data-store.ts` had a `createStarterQuests` function that injected fake tasks whenever a new user logged in or the session failed. This function has been deleted, ensuring only real, database-backed quests appear.

### N. Why admin access is missing
Admin access was missing because the application lacked a proper verification of `public.profiles.role = 'admin'` at the Next.js routing layer, and the role wasn't reliably persisting through reloads (again, due to the session cookie bug). This is fixed: `profiles.role` is queried directly, and server-side authorization accurately protects the `/admin` routes.
