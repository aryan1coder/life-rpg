# LIFE RPG — ADMIN ACCESS & PROMOTION GUIDE
**Last Updated:** 2026-09-12  
**Security Tier:** SERVER-AUTHORITATIVE CLEARANCE

---

## 1. Overview

LIFE RPG segregates administrative authority from player capabilities using a strict server-authoritative role model:
- Normal players have `profiles.role = 'player'`.
- System administrators have `profiles.role = 'admin'`.

There are **zero hardcoded admin passwords or emails**. Access to the Admin Panel (`/admin`) is gated server-side by checking the authenticated user's row in `public.profiles`.

---

## 2. Admin Entry Point

A dedicated entry point to the administrative console is located on the landing page:
- **Header Action / Footer Link:** "Admin Console" pointing directly to `/admin`.
- If an unauthenticated user navigates to `/admin`, the middleware redirects them to `/auth/login?redirect=/admin`.
- If an authenticated non-admin user navigates to `/admin`, the layout renders a `403 Forbidden // Restricted Sector` prompt with a button returning to the Lobby.

---

## 3. How to Promote a User to Admin

### Option A: Via Supabase SQL Editor (Recommended)
Run the following query in your Supabase project SQL Editor:

```sql
-- Replace with your operator email or UUID
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
);
```

### Option B: Using the Security Function `public.promote_to_admin`
If migration `002_auth_profiles.sql` was executed, use the built-in stored procedure:

```sql
SELECT public.promote_to_admin('YOUR_EMAIL@EXAMPLE.COM');
```

---

## 4. Admin Capabilities

Once promoted to `role = 'admin'`, logging into the application unlocks full access to `/admin`:
1. **System Overview & Telemetry:** Real-time database metrics (total operators, active directives, gold circulation).
2. **Directives CMS (`/admin/quests`):** Create and publish global system directives (`is_system_directive = true`) that automatically populate for all players.
3. **Rewards Shop CMS (`/admin/rewards`):** Add, edit, or archive catalog items and adjust gold costs.
4. **Avatar Armory (`/admin/avatar`):** Manage avatar cosmetic unlocks, assets, and level requirements.
5. **Boss Raids Management (`/admin/boss-raids`):** Spawn dynamic, high-stakes Boss Raids with custom HP, countdown timers, and Gold/XP bounties.
6. **Player Management & Tuning (`/admin/players`):** Safely calibrate player levels or streaks with audit logging.
7. **Economy Ledger (`/admin/economy`):** View all gold transaction logs.
8. **Audit Log (`/admin/audit-log`):** Immutable ledger of all administrative actions.
