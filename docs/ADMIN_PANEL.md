# LIFE RPG — Tactical Administrator Command Center (CMS)

## 1. System Overview
The LIFE RPG **Admin Command Center** (`/admin`) is a server-authoritative, role-protected operations portal designed for platform owners, game masters, and system administrators. It functions as the live Content Management System (CMS) for the entire application ecosystem, eliminating hardcoded seeds or static gameplay states.

Through the Admin Panel, administrators can authoritatively govern:
1. **Directives Protocol (Quests):** Deploy global server directives and inspect player directives.
2. **Armory & Shop Catalog (Rewards):** Publish real items, configure gold prices, tiers, and availability.
3. **Avatar Equipment Matrix:** Introduce gear pieces across 6 equipment slots (Head, Eyes, Body, Outerwear, Accessory, Aura) linked to progression tiers.
4. **Boss Raid Operations:** Deploy live multi-stage raids, monitor real-time integrity (HP), trigger tactical damage strikes, and reset encounters.
5. **Campaign Operations:** Structure multi-stage episodic arcs with narrative chapters and progression gates.
6. **Achievement Catalog:** Publish milestone awards across difficulty tiers.
7. **Player Registry & Telemetry:** Inspect any registered operator, search by username or callsign, view real Supabase UUIDs, and tune progression attributes (XP, Gold, Level) with mandatory audit logging.
8. **Real-Time Economic Ledger:** Audit all transaction events (Quest rewards, Boss bounties, Armory purchases, Admin manual adjustments) with running balances.
9. **Immutable Audit Trail:** Review all administrative actions (`admin_audit_logs`) tracking administrative operator IDs, target entities, timestamps, and JSON diff metadata.
10. **QA Avatar Evolution Lab:** Dedicated developer laboratory for testing avatar evolution models, level scrubbers (1-100), tier aura previews, and slot equipping on an isolated test profile.

---

## 2. Authentication & Security Architecture

### Role-Based Access Control (RBAC)
Access to `/admin` and all `/api/admin/*` endpoints is strictly governed by the `role` column on the `public.profiles` table.
- **Player Role (`role = 'player'`):** Standard users. Requests to `/admin` or `/api/admin/*` are immediately blocked with HTTP `403 Forbidden`. The UI renders a tactical access denial screen with navigation back to `/lobby`.
- **Administrator Role (`role = 'admin'`):** Privileged operators. Granted access to the Admin layout, sidebar, and all mutating administrative APIs.

### Server-Authoritative Verification: `verifyAdminSession`
Located in `src/lib/auth/admin.ts`, this helper guarantees that client-side role claims cannot bypass server checks:
```typescript
export async function verifyAdminSession(req: NextRequest): Promise<AdminAuthResult>
```
1. Extracts active session token via `getAuthSession(req)`. Rejects with `401 Unauthorized` if unauthenticated.
2. In production Supabase environments, executes a server-side query with the Supabase Admin Service Key (`supabase.from('profiles').select('role').eq('id', session.id).single()`).
3. Confirms `profile.role === 'admin'`. If false, returns `403 Forbidden`.
4. In offline/mock development environments, queries the internal memory `DataStore.getProfile(session.id)`.

### How to Promote an Operator to Admin
In the Supabase SQL Editor:
```sql
-- Direct SQL promotion:
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = 'YOUR-SUPABASE-AUTH-USER-UUID';

-- Or via the built-in database procedure:
SELECT public.promote_to_admin('your_email@domain.com');
```

---

## 3. Administrative Interface Routes

| Route | Functionality | Primary Actions |
|---|---|---|
| `/admin` | System Health & Operations Overview | Live metrics (Total Players, Active Directives, Catalog Items, Active Boss Raids), Quick Navigation cards |
| `/admin/players` | Player Inspection & Telemetry | Search operators, inspect real stats, adjust Level/XP/Gold, tune attributes |
| `/admin/quests` | Directives Command Matrix | Filter by category/difficulty, publish new global directives (`is_system_directive = true`) |
| `/admin/rewards` | Armory Shop Catalog Manager | Create and edit catalog rewards, set costs, assign category, toggle availability |
| `/admin/avatar` | Avatar Armory & Equipment Matrix | Register avatar items by slot (Head, Eyes, Body, Outerwear, Accessory, Aura), set required levels |
| `/admin/boss-raids` | Boss Raid Encounters CMS | Launch new world raid encounters, inspect live HP, strike boss, reset health, toggle active status |
| `/admin/achievements` | Achievement Milestone Registry | Register tier achievements, icon tags, and XP/Gold completion rewards |
| `/admin/campaigns` | Episodic Operations CMS | Build multi-stage campaigns, set stage count, assign rewards |
| `/admin/economy` | Authoritative Transaction Ledger | Inspect all player gold transactions, balances after, and issue manual economic credits |
| `/admin/audit-log` | Immutable Audit Ledger | Filter and view all admin adjustments with timestamp, target ID, and JSON details |
| `/admin/qa/avatar-lab` | Isolated Avatar QA Lab | Test user evolution scrubbers (Level 1-100), quick leap buttons, preset archetypes, slot equipment |
| `/admin/settings` | System-Wide Configuration | Maintenance mode toggle, telemetry logging rate, emergency operational parameters |

---

## 4. Admin API Matrix

All admin endpoints reside under `/api/admin/*` and require an authenticated session with `role === 'admin'`:

- `GET /api/admin/metrics` — Aggregate system telemetry (player counts, economy circulation, quest stats).
- `GET /api/admin/players?q=...` — Search registered operators.
- `PATCH /api/admin/players` — Tune player stats (`level`, `xp_current`, `gold_balance`, attributes) and log audit record.
- `GET, POST, DELETE /api/admin/quests` — Authoritative directives CMS.
- `GET, POST, DELETE /api/admin/rewards` — Rewards catalog management.
- `GET, POST, DELETE /api/admin/avatar` — Avatar gear registry.
- `GET, POST, PATCH /api/admin/boss-raids` — Create, activate, deactivate, or heal boss raids.
- `GET, POST, DELETE /api/admin/achievements` — Achievements management.
- `GET, POST, DELETE /api/admin/campaigns` — Campaign arcs management.
- `GET /api/admin/economy` — Query system-wide gold transactions.
- `GET /api/admin/audit` — Query admin audit trail.
- `GET, PUT /api/admin/settings` — System flags and configuration.
- `GET, POST /api/admin/qa/avatar-lab` — Isolated QA lab test actions.
