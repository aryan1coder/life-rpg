# LIFE RPG — Comprehensive Screen Documentation & Component Hierarchy (/docs/screens/)

---

## Document Index:
1. `home.md` — Command Center & Daily Protocol Hub
2. `quests.md` — Quests, Missions & In-Context Creation Modal
3. `character.md` — Hero Profile, Attribute Engine & Evolution Ledger
4. `rewards.md` — Rewards Store, Vault Economy & Redemption Flow
5. `inventory.md` — Equipment Deck, Loadout Synchronization & Item Inspector
6. `achievements.md` — Accolade Matrix, Requirements & Yield Tracker
7. `components.md` — Universal Component Standards & Token Guide
8. `state-flow.md` — Cross-System State Cascade & Optimistic Sync Engine

---

### 1. `home.md` (Route: `/home` · Shortcut: ⌘1)
- **Purpose**: Primary daily operational hub. Answers: "What do I do right now? How am I progressing today? What did I conquer?"
- **Main Components**:
  - `HeroTelemetryStrip`: Displays Kai, LVL 12 Arch-Strategist II, 82.6% XP, 1,420 G Vault, 14-Day Streak.
  - `DailyProtocolTriage`: Interactive list of daily priorities with inline `Complete` actions.
  - `AttributeMatrix`: Live 5-factor radar values (INT 86, DIS 91, VIT 78, STR 72, CRE 64).
  - `CampaignWidget`: Live status on "Ship Hackathon MVP" (Stage 3/4).
- **User Actions**:
  - `Complete Quest`: Disables button, marks task complete, increments XP (+120), increments Gold (+65), updates INT (+2), fires toast notification.
  - `Open Create Quest`: Launches the integrated dark Create Quest modal.
- **Responsive Behavior**: Right contextual rail stacks beneath daily protocols on tablet/mobile (<1024px).

---

### 2. `quests.md` (Route: `/quests` · Shortcut: ⌘2)
- **Purpose**: Comprehensive mission queue and operational campaign control.
- **Main Components**:
  - `FilterSegment`: Filter pills (`All 16`, `Active 12`, `Daily 5`, `Campaigns 3`, `Boss Raids 1`, `Completed 4`).
  - `BossRaidCard`: Critical threat protocol with crimson accent, active timer countdown (`02:18:42`), and sub-task progress.
  - `CampaignPipeline`: Multi-node progress tracker across software milestones.
  - `GracePeriodCard`: Non-punitive recovery card providing "Retry" or "Reschedule" for expired protocols.
  - `CreateQuestModal`: In-context dark overlay with title, category, difficulty, attribute, and real-time XP/Gold calculation.
- **Empty State**: "No active protocols found. Your campaign log is clear. [ + Initialize New Quest ]"

---

### 3. `character.md` (Route: `/character` · Shortcut: ⌘3)
- **Purpose**: Deep character progression studio and career evolution chronicle.
- **Main Components**:
  - `HeroIdentityCard`: Cyberpunk avatar portrait with ambient indigo glow, rank badge, and level progress.
  - `AttributeCapacityEngine`: 5 attributes with 7-day delta sparklines and contributing quest ledger.
  - `EvolutionChronicle`: Vertical career path (Level 9 to Level 12) with unlocked operational perks.
  - `ActiveEquippedTitle`: Selector allowing instant switching of earned titles (Arch-Strategist, Deep Worker).

---

### 4. `rewards.md` (Route: `/rewards` · Shortcut: ⌘4)
- **Purpose**: High-agency motivation store where earned Gold is converted into interface themes, cosmetics, titles, and boosts.
- **Main Components**:
  - `HeroRewardShowcase`: Highlighted item (*Obsidian Deep-Work Environment*, 750 G, Level 10+ Met).
  - `VaultLedgerMetrics`: 7-day net Gold accumulation curve (+680 G net).
  - `RewardCatalogGrid`: 5-tier restrained rarity cards (`Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`).
  - `RedeemModal`: In-context financial delta (`1,420 G` → `-750 G` → `670 G`).
  - `InsufficientFundsModal`: Displays shortfall (`330 G needed`) with direct CTA to `[ View Quests ]`.

---

### 5. `inventory.md` (Route: `/inventory` · Shortcut: ⌘5)
- **Purpose**: Personal vault and active equipment manager.
- **Main Components**:
  - `ActiveSyncedLoadoutStrip`: 5 slots (Theme, Frame, Codename, Badge, Consumable Boost).
  - `VaultGrid`: 18-item personal collection with category tabs.
  - `ItemInspector`: Contextual drawer displaying item metadata, surface color tokens, and `[ Equip ]` / `[ Unequip ]` actions.
- **Synchronization**: Equipping an item instantly updates the loadout strip, the Character profile, and the active application theme.

---

### 6. `achievements.md` (Route: `/achievements` · Shortcut: ⌘6)
- **Purpose**: Permanent milestone recognition system.
- **Main Components**:
  - `MasterCompletionCard`: Global progress (12/30 Unlocked · 40%).
  - `PriorityTrackCard`: Active focus on *Consistency Legend* (14/21 Days).
  - `AccoladeMatrix`: Cards supporting Unlocked (Emerald verified), In Progress (Indigo bar), and Locked (Muted surface with clear prerequisites).

---

### 7. `components.md` & `state-flow.md`
- **Universal Standards**:
  - Surface: `#0B0E15` (Canvas), `#151923` (Cards), `#1B1F2A` (Elevated modals).
  - Border: `1px solid rgba(255, 255, 255, 0.07)`.
  - Border Radius: `rounded-2xl` (16px) for cards, `rounded-lg` (8px) for interactive controls.
  - Font: `Geist` / `Inter`.
- **Cross-Screen Flow Contract**: Zero stale values. Any mutation immediately updates the authoritative client store and dispatches background server synchronization with automatic rollback on failure.
