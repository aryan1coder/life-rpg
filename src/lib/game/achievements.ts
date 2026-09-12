import { Achievement } from './types';

export interface GameplayMetrics {
  totalQuestsCompleted: number;
  currentStreakDays: number;
  currentLevel: number;
  totalGoldEarned: number;
  totalItemsOwned: number;
  bossRaidsCompleted: number;
}

export interface UserAchievementState {
  is_unlocked: boolean;
  current_progress: number;
  unlocked_at?: string;
}

/**
 * Evaluates master accolades against gameplay metrics.
 * Returns only newly unlocked achievements.
 */
export function evaluateAchievements(
  masterAchievements: Achievement[],
  userAchievements: Record<string, UserAchievementState>,
  metrics: GameplayMetrics
): {
  updatedMap: Record<string, UserAchievementState>;
  newlyUnlocked: Achievement[];
} {
  const updatedMap: Record<string, UserAchievementState> = { ...userAchievements };
  const newlyUnlocked: Achievement[] = [];

  for (const ach of masterAchievements) {
    const existing = updatedMap[ach.id] || { is_unlocked: false, current_progress: 0 };
    if (existing.is_unlocked) continue;

    let progress = 0;
    switch (ach.id) {
      case 'ach_first_blood':
        progress = metrics.totalQuestsCompleted;
        break;
      case 'ach_cadence_7':
      case 'ach_cadence_14':
        progress = metrics.currentStreakDays;
        break;
      case 'ach_century_operative':
        progress = metrics.totalQuestsCompleted;
        break;
      case 'ach_tier_10':
        progress = metrics.currentLevel;
        break;
      case 'ach_vault_wealthy':
        progress = metrics.totalGoldEarned;
        break;
      case 'ach_first_gear':
        progress = metrics.totalItemsOwned;
        break;
      case 'ach_boss_slayer':
        progress = metrics.bossRaidsCompleted;
        break;
      default:
        progress = existing.current_progress;
    }

    const isNowUnlocked = progress >= ach.target_value;
    updatedMap[ach.id] = {
      is_unlocked: isNowUnlocked,
      current_progress: progress,
      unlocked_at: isNowUnlocked ? new Date().toISOString() : undefined,
    };

    if (isNowUnlocked) {
      newlyUnlocked.push({
        ...ach,
        is_unlocked: true,
        current_progress: progress,
        unlocked_at: new Date().toISOString(),
      });
    }
  }

  return { updatedMap, newlyUnlocked };
}
