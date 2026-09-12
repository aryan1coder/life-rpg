/**
 * Non-linear convex XP progression curve for LIFE RPG.
 * Formula: floor(1000 * (level ^ 1.25))
 */
export function getXPRequiredForLevel(level: number): number {
  if (level < 1) return 1000;
  return Math.floor(1000 * Math.pow(level, 1.25));
}

/**
 * Calculates current level completion progress as a clamped percentage (0-100).
 */
export function calculateLevelProgress(currentXp: number, xpNextLevel: number): number {
  if (xpNextLevel <= 0) return 100;
  const progress = (currentXp / xpNextLevel) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}

/**
 * Evaluates XP addition and computes multi-level progression atomically.
 */
export function evaluateXpGain(
  currentLevel: number,
  currentXp: number,
  xpToAdd: number
): {
  newLevel: number;
  newXp: number;
  newXpNextLevel: number;
  levelsGained: number;
  leveledUp: boolean;
} {
  let level = currentLevel;
  let xp = currentXp + Math.max(0, xpToAdd);
  let threshold = getXPRequiredForLevel(level);
  let levelsGained = 0;

  while (xp >= threshold) {
    xp -= threshold;
    level += 1;
    levelsGained += 1;
    threshold = getXPRequiredForLevel(level);
  }

  return {
    newLevel: level,
    newXp: xp,
    newXpNextLevel: threshold,
    levelsGained,
    leveledUp: levelsGained > 0,
  };
}

/**
 * Computes rank / title conferred based on operator level.
 */
export function getTitleForLevel(level: number): string {
  if (level >= 25) return 'Grand Arch-Strategist';
  if (level >= 20) return 'High-Commander';
  if (level >= 15) return 'Master Tactician';
  if (level >= 12) return 'Arch-Strategist II';
  if (level >= 10) return 'Arch-Strategist I';
  if (level >= 7) return 'Senior Operator';
  if (level >= 4) return 'Tier I Tactician';
  if (level >= 2) return 'Novice Operator';
  return 'Initiate Strategist';
}

export interface AvatarEvolutionTier {
  tier: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  silhouette: string;
  signatureGear: string;
  accentColor: string;
}

export const AVATAR_EVOLUTION_TIERS: AvatarEvolutionTier[] = [
  {
    tier: 1,
    name: 'Initiate Vanguard',
    minLevel: 1,
    maxLevel: 1,
    description: 'Clean functional field garments, baseline telemetry badge, tailored utility seams.',
    silhouette: 'clean-tactical',
    signatureGear: 'Initiate Tactical Garments',
    accentColor: '#94A3B8',
  },
  {
    tier: 2,
    name: 'Discipline Adept',
    minLevel: 2,
    maxLevel: 3,
    description: 'Biometric chrono-band, anti-reflective focus spectacles, reinforced utility collar.',
    silhouette: 'utility-focused',
    signatureGear: 'Kinetic Chrono-Band',
    accentColor: '#6366F1',
  },
  {
    tier: 3,
    name: 'System Vanguard',
    minLevel: 4,
    maxLevel: 5,
    description: 'Lightweight ballistic chest rig, heavy commando boots, reinforced focus posture.',
    silhouette: 'armored-light',
    signatureGear: 'Vanguard Ballistic Vest',
    accentColor: '#38BDF8',
  },
  {
    tier: 4,
    name: 'Tactical Specialist',
    minLevel: 6,
    maxLevel: 7,
    description: 'Translucent amber optical HUD visor, precision resonance neural stylus.',
    silhouette: 'tactical-spec',
    signatureGear: 'Tactical HUD Monocle',
    accentColor: '#F59E0B',
  },
  {
    tier: 5,
    name: 'High Operative',
    minLevel: 8,
    maxLevel: 9,
    description: 'Phase-insulated storm cloak, operative acoustic shadow cowl for deep flow states.',
    silhouette: 'stealth-operative',
    signatureGear: 'Phase-Insulated Storm Cloak',
    accentColor: '#818CF8',
  },
  {
    tier: 6,
    name: 'Archon Strategist',
    minLevel: 10,
    maxLevel: 10,
    description: 'Resonance kinetic under-suit, geometric quantum focus lattice circulating around operator.',
    silhouette: 'kinetic-mantle',
    signatureGear: 'Quantum Focus Lattice',
    accentColor: '#A855F7',
  },
  {
    tier: 7,
    name: 'Apex Commander',
    minLevel: 11,
    maxLevel: 15,
    description: 'Levitating telemetry companion drone, hyper-threaded ceremonial chrono-blade.',
    silhouette: 'sovereign-armor',
    signatureGear: 'Telemetry Companion Drone',
    accentColor: '#10B981',
  },
  {
    tier: 8,
    name: 'Sovereign Ascendant',
    minLevel: 16,
    maxLevel: 99,
    description: 'Luminescent sovereign radiant halo, stellar nexus command void viewport.',
    silhouette: 'ascendant-celestial',
    signatureGear: 'Sovereign Radiant Halo',
    accentColor: '#FCD34D',
  },
];

export function getEvolutionTierForLevel(level: number): AvatarEvolutionTier {
  const safeLevel = Math.max(1, level);
  const found = AVATAR_EVOLUTION_TIERS.find(
    (t) => safeLevel >= t.minLevel && safeLevel <= t.maxLevel
  );
  return found || AVATAR_EVOLUTION_TIERS[AVATAR_EVOLUTION_TIERS.length - 1];
}

export function getNextEvolutionTier(level: number): AvatarEvolutionTier | null {
  const current = getEvolutionTierForLevel(level);
  const next = AVATAR_EVOLUTION_TIERS.find((t) => t.tier === current.tier + 1);
  return next || null;
}

