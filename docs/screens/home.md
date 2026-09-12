# Screen Specification: Home / Command Center (`/home`)

## 1. Purpose & User Story
The primary operational cockpit where operators review their daily priorities, monitor real-time XP velocity, review active campaigns, and calibrate their 5-factor attribute radar.

## 2. Component Hierarchy
- `HeroTelemetryStrip`: Displays operator identity (Kai · Arch-Strategist II), Level 12 badge, smooth XP bar (`8,260 / 10,000 XP · 82.6%`), Vault balance (`1,420 G`), and active streak pill (`14D`).
- `DailyProtocolTriage`: Interactive list of priority daily quests with immediate completion actions.
- `AttributeMatrix`: 5-factor radar values (`INT 86`, `DIS 91`, `VIT 78`, `STR 72`, `CRE 64`) with daily delta indicators.
- `CampaignWidget`: Progress tracker for the primary active campaign (*Ship Hackathon MVP*, Stage 3/4).

## 3. Keyboard Shortcuts & Triggers
- `⌘1`: Navigate to Home.
- `⌘N`: Open Create Quest modal.
- `⌥S`: Sync schedule.
