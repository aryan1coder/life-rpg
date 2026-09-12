# LIFE RPG — Security Architecture & RLS Verification

## 1. Principles of Security
1. **Zero Client Trust:** The client never submits balances, levels, or XP values. It only submits intents (e.g. `completeQuest(id)`, `redeemReward(itemId)`). The server verifies prerequisites, computes state changes, and writes to database ledgers.
2. **Multi-Tenant Isolation (RLS):** Every user-owned table enforces Row Level Security based on `auth.uid() = profile_id`.
3. **Audit Immutability:** Ledgers (`xp_transactions`, `gold_transactions`, `quest_logs`) cannot be altered or forged.
4. **Service Role Confidentiality:** The Supabase Service Role key is strictly server-side and never exposed to the client.

## 2. Multi-User Verification Matrix
| Action | User A attempting on User B's entity | Database/Server Enforcement | Expected Outcome |
|---|---|---|---|
| Read Quests | `SELECT * FROM quests WHERE profile_id = 'User B'` | RLS Policy `auth.uid() = profile_id` | Empty result (0 rows) |
| Complete Quest | `POST /api/quests/[B_id]/complete` | RPC ownership check | `403 Forbidden` / Abort |
| Equip Item | `POST /api/character/loadout` with unowned item | `user_inventory` ownership join | `400 Bad Request` |
| Redeem with 0 Gold | `POST /api/rewards/redeem` (Cost: 750 G) | `gold_balance >= item_cost` check | `400 Insufficient Funds` |
