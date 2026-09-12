# LIFE RPG — Developer & QA Avatar Evolution Lab

## 1. Overview & Security Guard
The **QA Avatar Evolution Lab** is an isolated developer sandbox located within the Administrator Command Center at:

`/admin/qa/avatar-lab`

### Access Control
- **Admin Authentication Only:** Protected by `verifyAdminSession`. Non-admin players cannot access this route (HTTP `403 Forbidden`).
- **Complete Public Stealth:** Not linked in any player navigation, player sidebar, or public routes.
- **Dedicated Test Subject:** All test operations mutate a reserved, isolated test operator:
  ```
  UUID: 00000000-0000-4000-a000-000000000099
  Username: QA-Test-Pilot
  Callsign: Test Operative
  ```
  Real player accounts are completely isolated and can never be corrupted by test lab adjustments.

---

## 2. Interactive QA Controls

### A. Level Scrubber & Quick Leaps
- **Slider Control (Levels 1–100):** Real-time slider immediately updates test subject level, recalculates required XP, and determines active evolution tier.
- **Instant Level Leap Buttons:** 1-click jumps to crucial evolution gates:
  - `Level 1` (Initiate Vanguard)
  - `Level 2` (Discipline Adept)
  - `Level 4` (System Vanguard)
  - `Level 6` (Tactical Specialist)
  - `Level 8` (High Operative)
  - `Level 10` (Archon Strategist)
  - `Level 12` (Apex Commander)
  - `Level 16` (Sovereign Ascendant)
  - `Level 20` (Master Ascendant)

### B. Cognitive XP Injection
- Buttons to inject `+100 XP`, `+500 XP`, or `+1,000 XP`.
- Live demonstration of the level-up algorithm, showing threshold crossing, level-up trigger, and automatic gear unlocking.

### C. Archetype Presets
1-click activation of signature visual configurations:
- **Baseline Initiate:** Resets to Level 1 with default tunic and pants.
- **Tactical Specialist:** Jumps to Level 6 with HUD visor and ballistic vest.
- **Apex Commander:** Jumps to Level 12 with companion drone and storm cloak.
- **Sovereign Ascendant:** Jumps to Level 20 with celestial halo and quantum focus lattice.

### D. Equipment Armory Inspector
- Inspect unlocked gear across 6 equipment slots (Head, Eyes, Body, Outerwear, Accessory, Aura).
- Test slot conflict resolution: equipping a new item in an occupied slot safely swaps the equipment.
- Test unequip actions.

### E. Live Avatar Renderer
- Renders the full SVG/CSS layered avatar canvas in real-time.
- Shows responsive stance, silhouette modifications, particle effects, and dynamic tier accent glow.
