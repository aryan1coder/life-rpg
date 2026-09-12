# Admin Authentication & Security Audit

This document details the security model that governs the Admin system within the Life RPG application.

## 1. Authentication Foundation
- Admin authentication does NOT rely on a separate authentication table, separate login flow, or static password files.
- It leverages the exact same **Supabase Auth** session (and the `auth.users` table) as a standard player.
- The separation of privileges is strictly managed by a database-level role column.

## 2. The Role Column
- **Location:** `public.profiles.role`
- **Allowed Values:** Checked at the database level to only allow `'player'` or `'admin'` via the `profiles_role_check` constraint.
- **Default Value:** Every new user explicitly receives `role = 'player'` by default.

## 3. Server-Side Protection
### API Routes
Every `/api/admin/*` endpoint contains the following logic:
1. `const { data: { session } } = await supabase.auth.getSession()` (Retrieves HTTP-only cookie session).
2. If no session, return `401 Unauthorized`.
3. Query `public.profiles` for the `auth.uid()`.
4. If `profile.role !== 'admin'`, return `403 Forbidden`.
5. Proceed with admin data mutation.

### Next.js Pages (Server Components)
- `src/app/admin/layout.tsx` (or `page.tsx` handlers) executes an identical server-side check. 
- If a standard player attempts to navigate to `/admin`, they are immediately redirected to `/lobby` via `redirect('/lobby')`.
- This ensures that manipulating frontend state cannot bypass page rendering or data fetching.

## 4. Admin Promotion (Row Level Security & Functions)
- **Problem:** If a frontend client could simply execute `supabase.from('profiles').update({ role: 'admin' })`, the system would be fundamentally insecure.
- **Solution:** 
  1. The RLS policies on `public.profiles` strictly prohibit users from updating their own `role` column.
  2. To create an admin, the `public.promote_to_admin(target_email TEXT)` PostgreSQL function must be used.
  3. Execution of `promote_to_admin` is restricted (`REVOKE EXECUTE ON FUNCTION... FROM PUBLIC/anon/authenticated`). It can only be run by the `service_role` (e.g., via a secure backend script or Supabase Dashboard) or by a user who is already an admin (if explicitly granted).

## 5. Reload and Persistence Testing
- Previously, a malformed JWT (due to `.join('')` on chunked cookies) caused `getSession()` to fail on page reload.
- This resulted in an admin user refreshing `/admin` and being greeted by an "Authenticate Operator" error or being bumped back to the login screen.
- **Current State:** The chunked cookie issue is resolved. The browser correctly passes the multi-part `.0`/`.1` cookies. The server accurately decodes the session, verifies the `role = 'admin'`, and renders the Admin Panel seamlessly across hard refreshes and distinct devices.
