# Screen Specification: Quests & Missions (`/quests`)

## 1. Purpose & User Story
Comprehensive mission queue and operational campaign control interface. Supports protocol filtering, time-critical Boss Raid tracking, and in-context modal quest creation.

## 2. Component Hierarchy
- `SegmentedFilter`: Category selector pills (`All`, `Active`, `Daily`, `Campaigns`, `Boss Raids`, `Completed`).
- `BossRaidCard`: Crimson-threat objective card displaying live time countdown (`02:18:42`), objective criteria, and reward yields.
- `QuestCardList`: Filtered list of cards with attribute badges, XP/Gold reward tags, and single-click completion triggers.
- `CreateQuestModal`: In-context modal with real-time XP and Gold yield calculation preview.
