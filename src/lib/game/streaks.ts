/**
 * LIFE RPG Streak Engine.
 * Evaluates unbroken daily cadence and computes reward yield multipliers.
 */

export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays <= 0) return 1.0;
  // +5% bonus multiplier for each full 7 days unbroken, capped at +50% (1.50x)
  const tier = Math.min(10, Math.floor(streakDays / 7));
  const multiplier = 1.0 + tier * 0.05;
  return Math.round(multiplier * 100) / 100;
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function evaluateStreakActivity(
  lastActiveDateStr: string,
  currentStreak: number,
  now: Date = new Date()
): {
  newStreak: number;
  streakExtended: boolean;
  streakReset: boolean;
  multiplier: number;
  todayDateStr: string;
} {
  const todayStr = toDateString(now);

  if (!lastActiveDateStr) {
    const newStreak = 1;
    return {
      newStreak,
      streakExtended: true,
      streakReset: false,
      multiplier: calculateStreakMultiplier(newStreak),
      todayDateStr: todayStr,
    };
  }

  const lastDate = new Date(lastActiveDateStr + 'T00:00:00Z');
  const todayDate = new Date(todayStr + 'T00:00:00Z');
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day activity: preserve current streak
    return {
      newStreak: Math.max(1, currentStreak),
      streakExtended: false,
      streakReset: false,
      multiplier: calculateStreakMultiplier(currentStreak),
      todayDateStr: todayStr,
    };
  } else if (diffDays === 1) {
    // Consecutive day activity: increment streak
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      streakExtended: true,
      streakReset: false,
      multiplier: calculateStreakMultiplier(newStreak),
      todayDateStr: todayStr,
    };
  } else {
    // Break in cadence (> 1 day): reset streak to 1
    const newStreak = 1;
    return {
      newStreak,
      streakExtended: false,
      streakReset: true,
      multiplier: calculateStreakMultiplier(newStreak),
      todayDateStr: todayStr,
    };
  }
}
