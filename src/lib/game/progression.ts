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
