# LIFE RPG — Testing Guide & Verification Suite

## 1. Automated Test Suites
Run the game engine test runner:
```bash
npm test
```
The automated script validates:
- Non-linear XP curve calculations (`getXPRequiredForLevel`).
- Multi-level progression algorithms.
- Streak continuation, reset, and multiplier computations.
- Economy atomicity (preventing negative gold balances).
- Dynamic achievement unlock triggers.

## 2. Manual Testing Checklist
- [x] Register new user -> verify profile and default attributes initialization.
- [x] Create quest -> appears instantly in `/quests` and `/home`.
- [x] Complete quest -> triggers XP increment, Gold increment, attribute delta, and toast.
- [x] Redeem reward with insufficient gold -> triggers shortfall alert without deduction.
- [x] Redeem reward with sufficient gold -> gold deducted, item added to inventory.
- [x] Equip item in `/inventory` -> reflected immediately in character loadout and top bar.
- [x] Cross-route navigation -> zero stale numbers between `/home`, `/quests`, `/character`, `/rewards`, `/inventory`, `/achievements`.
- [x] Page refresh -> all state correctly retrieved from backend storage.
