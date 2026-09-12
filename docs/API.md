# LIFE RPG — API & Server Operations Specification

## 1. REST & Server Action Endpoints

### 1.1 Quests API
- `POST /api/quests` — Create directive (validates title, category, difficulty, attribute, rewards, frequency).
- `GET /api/quests` — Fetch operator's active and completed quests with filtering.
- `POST /api/quests/[id]/complete` — Execute atomic quest completion transaction.
- `DELETE /api/quests/[id]` — Archive or remove directive.

### 1.2 Progression & Character API
- `GET /api/character` — Authoritative profile, attributes, streak state, and progression timeline.
- `POST /api/character/loadout` — Equip or unequip cosmetics, themes, titles, or badges.

### 1.3 Economy & Vault API
- `GET /api/rewards` — Retrieve catalog items with player unlock status and affordability.
- `POST /api/rewards/redeem` — Server-authoritative redemption validating balance, deducting gold, and inserting into inventory.

### 1.4 Achievements API
- `GET /api/achievements` — Master accolades catalog with per-user progress and unlock timestamps.
