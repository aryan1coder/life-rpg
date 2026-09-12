# LIFE RPG — Game Rules, Economy & Mathematical Specifications

## 1. XP Curve & Level Progression
XP progression uses a non-linear convex polynomial curve to balance early sense of accomplishment with mid-to-late game mastery:

$$\text{XP Required for Level } L = \left\lfloor 1000 \times L^{1.25} \right\rfloor$$

### Level Thresholds Table
| Level | XP to Next Level | Cumulative XP (Est.) | Unlocks & Titles |
|---|---|---|---|
| **1** | 1,000 XP | 0 | Initiate Strategist |
| **2** | 2,378 XP | 1,000 | Novice Operator |
| **5** | 7,476 XP | 12,500 | Tier I Tactician |
| **10** | 17,782 XP | 58,000 | Tier II Arch-Strategist |
| **12** | 22,467 XP | 98,000 | Arch-Strategist II (Cognitive Subroutines) |
| **15** | 30,000 XP | 175,000 | High-Commander |

### Multiple Level-Up Detection
If a massive XP transaction (e.g. Boss Raid + Campaign completion) grants enough XP to cross multiple thresholds:
- The engine calculates all crossed levels in a single atomic pass.
- Returns `levelsGained: number` to trigger multiple level-up animations without desynchronization.

---

## 2. Streak Engine & Multipliers
- **Cadence:** Daily (evaluated with timezone awareness against `CURRENT_DATE`).
- **Continuation:** If last activity date was yesterday (`today - 1 day`), `streak_days` increments by 1.
- **Same-Day Activity:** If last activity date was today, streak remains unchanged (already preserved).
- **Broken Streak:** If last activity date was more than 1 day ago (`today - 2+ days`), streak resets to 1.
- **Streak Multiplier Formula:**
  $$\text{Multiplier} = 1.00 + \min(0.50, \lfloor \text{streak\_days} / 7 \rfloor \times 0.05)$$
  - Day 1–6: `1.00×`
  - Day 7–13: `1.05×`
  - Day 14–20: `1.10×` (or `1.15×` bonus tier)
  - Cap: `1.50×` max multiplier.

---

## 3. Core Attributes (5-Factor Radar)
- **Scale:** 0 to 100 points.
- **Attributes:**
  - `Intellect` (INT): Focus, cognitive algorithms, technical architectures.
  - `Discipline` (DIS): Deep-work execution, consistency, habit mastery.
  - `Vitality` (VIT): Recovery, sleep, hydration, mental endurance.
  - `Strength` (STR): Physical training, resistance, energy.
  - `Creativity` (CRE): Writing, ideation, design, generative synthesis.
- **Progression:** Each completed quest grants `+1` to `+3` points to its tagged attribute, logged in `attribute_logs` with a daily delta tracker.

---

## 4. Vault Gold Economy
- Authoritative balance stored in `profiles.gold_balance`.
- Guaranteed non-negative check constraint (`CHECK (gold_balance >= 0)`).
- Every debit and credit generates a row in `gold_transactions`.
- Attempting to spend more Gold than available triggers a clean `INSUFFICIENT_FUNDS` error with shortfall telemetry.
