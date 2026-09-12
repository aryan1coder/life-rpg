# Screen Specification: Rewards & Vault Economy (`/rewards`)

## 1. Purpose & User Story
High-agency motivation store converting accumulated Vault Gold into interface themes, cosmetics, badges, titles, and temporary XP/Gold boost modules.

## 2. Component Hierarchy
- `HeroRewardShowcase`: Highlighted catalog item (*Obsidian Deep-Work Environment*, 750 G, Level 10+ Met).
- `VaultLedgerMetrics`: 7-day net Gold accumulation trend and current balance telemetry.
- `RewardCatalogGrid`: 5-tier restrained rarity cards (`Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`).
- `RedeemModal`: Financial delta visualizer (`1,420 G` → `-750 G` → `670 G`).
- `InsufficientFundsModal`: Displays balance shortfall with direct CTA to `[ View Quests ]`.
