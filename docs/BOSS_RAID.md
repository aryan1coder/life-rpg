# LIFE RPG — Server-Authoritative Boss Raid System

## 1. Encounter Architecture
The Boss Raid system transforms personal task completion and physical actions into high-stakes, collaborative or solo world encounters. 
Boss Raids are **server-authoritative entities** persisted in PostgreSQL with real-time integrity tracking, action history, and automated bounty payouts.

### Database Tables
1. **`public.boss_raids`:** Defines the encounter parameters:
   - `id`: Unique identifier (UUID).
   - `title`: Narrative codename (e.g., "The Procrastination Colossus", "Inertia Phantom", "Sector Dreadnought").
   - `description`: Lore and mission briefing.
   - `threat_level`: Tactical classification (`Low`, `Medium`, `High Threat (Tier III)`, `Critical`).
   - `required_directives`: Directives needed for full operational conquest.
   - `directives_completed`: Tally of completed steps across attacking operators.
   - `max_hp`: Total boss structural integrity (typically 100 to 500 HP).
   - `current_hp`: Active boss structural integrity.
   - `is_active`: Administrative deployment flag.
   - `is_completed`: Victory flag set when `current_hp = 0`.
   - `reward_xp`: XP bounty granted upon conquest.
   - `reward_gold`: Gold bounty granted upon conquest.
   - `end_at` / `expires_at`: ISO countdown boundary.

2. **`public.boss_raid_progress`:** Tracks an individual operator's contribution:
   - `directives_completed`: Total directives completed during active raid.
   - `damage_dealt`: Cumulative damage dealt.
   - `is_completed`: Personal victory confirmation.
   - `reward_claimed`: Boolean guard preventing duplicate reward redemption.

3. **`public.boss_raid_actions`:** Real-time immutable strike log:
   - `boss_raid_id`: Target encounter UUID.
   - `profile_id`: Striking operator UUID.
   - `action_type`: `DIRECTIVE_STRIKE`, `HEAVY_STRIKE`, or `CRITICAL_BURST`.
   - `damage`: Damage value dealt (default 25 HP).
   - `details`: JSON telemetry with client timestamp.

---

## 2. Interactive Strike Flow

### Player Action (`POST /api/boss-raids/[id]/action`)
1. Player clicks **"Execute Directive Strike (-25 HP)"** on the Quests interface (`/quests`).
2. Server verifies caller session and validates that the raid is active (`is_active = true`) and not yet neutralized (`current_hp > 0`).
3. Server calculates new integrity: `new_hp = Math.max(0, current_hp - damage)`.
4. Server updates `public.boss_raids` atomically.
5. Server appends record to `public.boss_raid_actions`.
6. If `new_hp === 0`:
   - Sets `is_completed = true` on the raid.
   - Grants bounty XP (`+reward_xp`) and Gold (`+reward_gold`) to the player.
   - Logs an entry into `public.gold_transactions` (`type: 'BOSS_REWARD'`).
   - Sets `reward_claimed = true` in `public.boss_raid_progress`.

---

## 3. Administrator Operations (`/admin/boss-raids`)
Administrators hold complete control over encounters:
- **Deploy Encounter:** Launch new raids with custom name, HP pool, required directives, threat level, and rewards.
- **Live Health Bar Monitor:** Real-time visual HP bar reflecting player damage.
- **Execute Admin Strike:** Instantly test combat mechanics by delivering damage strikes.
- **Repair / Reset HP:** Reset a defeated boss to full HP for new gameplay rounds.
- **Deactivate:** Retire or pause an encounter from active rotation.
