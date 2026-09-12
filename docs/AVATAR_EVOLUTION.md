# LIFE RPG — Avatar Evolution & Armory System

## 1. Concept & Visual Philosophy
The LIFE RPG Avatar system is designed to provide visceral visual feedback for real-life discipline and progression. 
Rather than a static cartoon, the avatar evolves through **8 distinct visual tiers**, transforming from a clean baseline field operative into an ascendant sovereign tactician.

The styling draws on **Apple-grade minimalism** and **Linear-style tactical precision**, blending clean tailoring, biometric utility bands, holographic visors, phase cloaks, and geometric aura lattices.

---

## 2. The 8 Evolution Tiers

| Tier | Designation | Level Range | Silhouette & Signature Aesthetics |
|---|---|---|---|
| **Tier 1** | Initiate Vanguard | Level 1 | Clean functional field garments, baseline telemetry badge, tailored utility seams. Neutral slate/steel accent (`#94A3B8`). |
| **Tier 2** | Discipline Adept | Levels 2–3 | Biometric chrono-band, anti-reflective focus spectacles, reinforced collar. Indigo accent (`#6366F1`). |
| **Tier 3** | System Vanguard | Levels 4–5 | Lightweight ballistic chest rig, heavy commando boots, reinforced posture. Cyan accent (`#38BDF8`). |
| **Tier 4** | Tactical Specialist | Levels 6–7 | Translucent amber optical HUD visor, precision resonance neural stylus. Amber accent (`#F59E0B`). |
| **Tier 5** | High Operative | Levels 8–9 | Phase-insulated storm cloak, acoustic shadow cowl for deep flow states. Lavender accent (`#818CF8`). |
| **Tier 6** | Archon Strategist | Level 10 | Resonance kinetic under-suit, geometric quantum focus lattice circulating around operator. Violet accent (`#A855F7`). |
| **Tier 7** | Apex Commander | Levels 11–15 | Levitating telemetry companion drone, ceremonial chrono-blade. Emerald accent (`#10B981`). |
| **Tier 8** | Sovereign Ascendant | Level 16+ | Luminescent sovereign radiant halo, stellar nexus command void viewport. Gold accent (`#FCD34D`). |

---

## 3. Equipment Slots & Armory Matrix
The avatar model features 6 independent equipment slots:
1. **Head:** Helmets, Cowls, Monocles, Visors (e.g., `head_cowl`, `head_tactical_monocle`).
2. **Eyes:** Spectacles, Neural Visors (e.g., `eyes_focus_spectacles`, `eyes_tactical_hud`).
3. **Body:** Tunics, Armor, Undersuits (e.g., `body_initiate_tunic`, `body_resonance_suit`).
4. **Outerwear:** Vests, Cloaks, Mantles (e.g., `outerwear_ballistic_vest`, `outerwear_storm_cloak`).
5. **Accessory:** Chrono-bands, Drones, Holsters (e.g., `accessory_chrono_band`, `accessory_telemetry_drone`).
6. **Aura:** Ambient particle and light lattices (e.g., `aura_quantum_lattice`, `aura_celestial_halo`).

### Database Schema
- **`public.avatar_items`:** Catalog of armory gear with slot, rarity, required level, and asset keys.
- **`public.user_avatar_unlocks`:** Junction table tracking which gear items an operator has unlocked.
- **`public.user_avatar_loadout`:** Key-value table (`slot -> avatar_item_id`) defining currently equipped gear per operator.

---

## 4. Server-Authoritative Evolution Flow
1. **Quest Completion / XP Gain:** When an operator conquers a directive via `/api/quests/[id]/complete`, the server executes `evaluateXpGain(...)`.
2. **Level Up Detection:** If the new XP crosses the next-level threshold, `levelsGained > 0`.
3. **Automated Gear Unlocks:** The server evaluates newly unlocked avatar items whose `required_level <= newLevel`.
4. **Persisted Unlocks:** Unlocked items are inserted into `public.user_avatar_unlocks`.
5. **Level-Up Telemetry:** The completion response returns `{ leveledUp: true, newLevel, newlyUnlockedAvatarItems }`.
6. **Celebratory UI:** The client renders the high-energy Level Up modal displaying newly conferred rank titles and unlocked gear with instant "Equip Now" actions.
