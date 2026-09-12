# Screen Specification: Inventory & Equipment (`/inventory`)

## 1. Purpose & User Story
Personal vault and active equipment manager. Allows operators to inspect their owned collection and equip cosmetics, titles, and boosts across their entire profile.

## 2. Component Hierarchy
- `ActiveSyncedLoadoutStrip`: 5 slots (Theme, Frame, Title, Badge, Consumable Boost).
- `VaultGrid`: Filterable collection organized into category tabs (All, Themes, Cosmetics, Badges, Titles, Boosts).
- `ItemInspector`: Contextual drawer displaying item rarity, metadata, and direct `[ Equip ]` / `[ Unequip ]` actions.
