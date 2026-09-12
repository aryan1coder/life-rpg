# LIFE RPG — Project Owner Admin Access Setup Guide

This guide details the procedure for granting administrative privileges to the platform owner or game master using real **Supabase Auth** and PostgreSQL role verification.

---

## 1. Security Model Overview

- **Default Player State:** All newly registered users begin strictly with `role = 'player'`.
- **Zero Insecure Grants:** No client-side storage (`localStorage`, `sessionStorage`, `IndexedDB`), URL parameters, or hardcoded email addresses can grant administrative access.
- **Authoritative Database Source:** Access to `/admin` and mutating `/api/admin/*` APIs is determined strictly by:
  ```sql
  profiles.id = auth.uid() AND profiles.role = 'admin'
  ```
- **Execution Safeguards:** The `public.promote_to_admin` database function is protected with `SECURITY DEFINER` and its execution permissions are revoked from `PUBLIC`, `anon`, and `authenticated` roles. Only privileged database operators (such as the project owner in the Supabase SQL Editor or `service_role`) can invoke it.

---

## 2. Step-by-Step Owner Promotion Procedure

### Step 1: Register or Log In
1. Navigate to your LIFE RPG application instance:
   - Sign up at [`/auth/signup`](http://localhost:3000/auth/signup) or log in at [`/auth/login`](http://localhost:3000/auth/login).
2. Note the exact email address you used to register (e.g. `owner@yourdomain.com`).
3. Your newly created account will immediately be assigned `role = 'player'`.

### Step 2: Open Supabase SQL Editor
1. Log in to your [Supabase Project Dashboard](https://app.supabase.com).
2. Select your LIFE RPG project.
3. In the left navigation menu, click **SQL Editor**.
4. Click **New query** (or press `Ctrl+N` / `Cmd+N`).

### Step 3: Execute Owner Promotion SQL Command
Run the authoritative database promotion function in the SQL Editor:

```sql
-- Replace OWNER_EMAIL with the actual email address of your registered Supabase account:
SELECT public.promote_to_admin('OWNER_EMAIL');
```

> [!IMPORTANT]
> Be sure to replace `'OWNER_EMAIL'` with your real email address (e.g., `'owner@example.com'`).
> The function automatically sanitizes the email, locates the user in `auth.users`, verifies their profile exists in `public.profiles`, and updates their role to `'admin'`.

#### Verification Query:
Verify that the profile has been promoted to administrator:

```sql
SELECT id, username, display_name, role, level, created_at
FROM public.profiles
WHERE role = 'admin';
```

---

## 3. Direct SQL Fallback (Alternative Method)

If for any reason you prefer to execute a direct SQL statement without invoking the stored procedure, run:

```sql
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'OWNER_EMAIL'
);
```

*(Replace `'OWNER_EMAIL'` with your actual registered email address.)*

---

## 4. Accessing the Admin Panel

1. Return to the LIFE RPG web application.
2. If already logged in, simply refresh the browser.
3. You will now observe:
   - The **"Admin Panel"** navigation entry appears in the main tactical sidebar under the **Administration** section.
   - Clicking **"Admin Panel"** (or navigating directly to [`/admin`](http://localhost:3000/admin)) loads the full Tactical Administrator Command Center.
4. If an unauthenticated user attempts to visit `/admin`, they are redirected to `/auth/login`.
5. If a regular player (`role = 'player'`) attempts to visit `/admin`, they receive an authentic HTTP 403 Forbidden screen and are redirected to `/lobby`.

---

## 5. Administrative Modules Available at `/admin`

Once logged in as an administrator, the following command modules are accessible:

| Module Route | Description |
|---|---|
| `/admin` | System health overview, real-time counters, active raid alerts. |
| `/admin/players` | Operator directory, telemetry search, attribute tuning (with audit logging). |
| `/admin/quests` | Global directives publishing (`is_system_directive = true`). |
| `/admin/rewards` | Real Rewards Shop catalog manager (item publishing, pricing, availability). |
| `/admin/avatar` | Avatar Armory registry (6 slots, progression gates, equipment preview). |
| `/admin/boss-raids` | Authoritative boss encounters (HP bars, strike execution, bounties). |
| `/admin/achievements` | Milestone achievement creator and criteria manager. |
| `/admin/campaigns` | Episodic multi-stage campaign operations. |
| `/admin/economy` | Real-time transaction ledger (auditing all gold earned and spent). |
| `/admin/qa/avatar-lab` | Isolated developer QA lab for avatar tier and progression validation. |
| `/admin/audit-log` | Immutable administrative mutation logs (`admin_audit_logs`). |
| `/admin/settings` | Global system configurations and maintenance controls. |
