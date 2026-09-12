# LIFE RPG — Cross-System State Flow & Cascade Architecture

## 1. Quest Completion Cascade
```
User Clicks "Complete" on Quest Card
      │
      ▼
Client Optimistic Update (Card Strikethrough, Instant Sound/Animation)
      │
      ▼
Server Verification & Transaction Boundary:
   ├── 1. Authenticate user session
   ├── 2. Verify quest ownership and active status
   ├── 3. Calculate XP with streak multiplier
   ├── 4. Calculate Gold yield
   ├── 5. Increment Tagged Attribute & Log
   ├── 6. Record in `quest_logs`
   ├── 7. Insert `xp_transactions` and `gold_transactions`
   ├── 8. Evaluate Level-Up boundary (XP >= xp_next_level)
   ├── 9. Evaluate Streak advancement
   └── 10. Evaluate Achievement milestones
      │
      ▼
Atomically Commit Transaction
      │
      ▼
Return Authoritative Response Payload
      │
      ▼
Client Global Store Reconciles:
   ├── XP Bar animates smoothly
   ├── Gold counter increments
   ├── Floating "+2 INT" telemetry badge
   ├── Toast notification dispatched
   └── Level-Up Modal triggers if threshold crossed
```

---

## 2. Reward Redemption Cascade
```
User clicks "Redeem 750 G"
      │
      ▼
Check Client Affordability:
   ├── If Gold < Cost: Display Insufficient Funds Modal (Shortfall Telemetry)
   └── If Gold >= Cost: Open Confirmation Modal
      │
      ▼
User Confirms Redemption
      │
      ▼
Server Authoritative Transaction:
   ├── 1. Authenticate user
   ├── 2. Verify Level Requirement (e.g. Level >= 10)
   ├── 3. Lock profile row & verify `gold_balance >= item_cost`
   ├── 4. Deduct Gold & append `gold_transactions`
   └── 5. Insert row into `user_inventory`
      │
      ▼
Commit Transaction & Return Updated Profile + Inventory
      │
      ▼
UI Propagates:
   ├── Vault balance drops to resulting amount
   ├── Item displays "Owned" / "Equip" button
   ├── Item appears in `/inventory` immediately
   └── Toast: "Item added to your collection"
```

---

## 3. Inventory Equip & Loadout Cascade
```
User clicks "Equip" on Owned Item
      │
      ▼
Server validates item ownership in `user_inventory`
      │
      ▼
Update `equipped_items` slot (Theme / Frame / Title / Badge / Boost)
      │
      ▼
Global Broadcast:
   ├── Active Synced Loadout strip updates
   ├── Character Profile Card reflects new title / frame / theme
   └── TopBar telemetry reflects new cosmetic
```
