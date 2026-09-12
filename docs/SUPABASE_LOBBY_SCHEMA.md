# SUPABASE LOBBY & AVATAR EVOLUTION SCHEMA

## Overview
Migration `006_avatar_evolution_and_lobby.sql` extends the LIFE RPG PostgreSQL schema with server-authoritative Avatar Evolution, user ownership ledgers, and equipped loadouts.

---

## 1. Tables & Relationships

### `public.avatar_items`
System catalog of available avatar equipment and cosmetics.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | PRIMARY KEY | Unique item identifier (e.g., `body_initiate_tunic`) |
| `name` | `TEXT` | NOT NULL | Display name |
| `description` | `TEXT` | NULLABLE | Tactical lore and utility description |
| `slot` | `TEXT` | CHECK in 10 slots | `head`, `face`, `body`, `outerwear`, `legs`, `shoes`, `accessory`, `weapon_or_tool`, `aura`, `background` |
| `rarity` | `TEXT` | CHECK in 5 rarities | `Common`, `Uncommon`, `Rare`, `Epic`, `Legendary` |
| `asset_key` | `TEXT` | NOT NULL | Visual vector / layer key |
| `required_level` | `INTEGER` | NOT NULL, >= 1 | Minimum player level required to unlock |
| `attribute_requirements` | `JSONB` | DEFAULT `{}` | Optional stat threshold requirements |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Availability switch |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Timestamp |

### `public.user_avatar_unlocks`
Authoritative ownership ledger tracking which avatar items a user has earned.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, gen_random_uuid() | Record ID |
| `user_id` | `UUID` | NOT NULL, FK `profiles(id)` | Player profile reference |
| `avatar_item_id` | `TEXT` | NOT NULL, FK `avatar_items(id)` | Avatar item reference |
| `unlocked_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Unlock timestamp |

**Unique Constraint:** `UNIQUE(user_id, avatar_item_id)`

### `public.user_avatar_loadout`
Current actively equipped avatar items across the 10 equipment slots.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, gen_random_uuid() | Loadout entry ID |
| `user_id` | `UUID` | NOT NULL, FK `profiles(id)` | Player profile reference |
| `slot` | `TEXT` | NOT NULL, CHECK in 10 slots | Equipment slot |
| `avatar_item_id` | `TEXT` | NOT NULL, FK `avatar_items(id)` | Equipped item reference |
| `equipped_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Equip timestamp |

**Unique Constraint:** `UNIQUE(user_id, slot)` (guarantees exactly 1 equipped item per slot per user).

---

## 2. Row Level Security (RLS) Policies

All tables have RLS enabled:
```sql
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_loadout ENABLE ROW LEVEL SECURITY;
```

1. **`avatar_items`**:
   - `SELECT`: Allowed for all authenticated users where `is_active = TRUE`.
   - `INSERT / UPDATE / DELETE`: Restricted to service role / admin.
2. **`user_avatar_unlocks`**:
   - `SELECT`: `auth.uid() = user_id`.
   - `INSERT / UPDATE / DELETE`: Restricted to server-side game engine via service role upon verified level-up.
3. **`user_avatar_loadout`**:
   - `SELECT`: `auth.uid() = user_id`.
   - `INSERT`: `auth.uid() = user_id` (enforces slot uniqueness).
   - `UPDATE`: `auth.uid() = user_id`.
   - `DELETE`: `auth.uid() = user_id` (unequipping).

---

## 3. Server-Authoritative Progression Guarantees
- The client cannot forge an unlock. When quest completion triggers a level-up, the server evaluates all avatar items where `required_level <= new_level` and inserts any missing unlocks.
- The equip endpoint strictly verifies:
  1. The user is authenticated (`auth.uid()`).
  2. The item exists in `user_avatar_unlocks` for that user.
  3. The slot matches the item's defined slot.
