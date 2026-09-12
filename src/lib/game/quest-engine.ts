import { evaluateXpGain, getTitleForLevel } from './progression';
import { earnGold } from './economy';
import { evaluateStreakActivity } from './streaks';
import { applyAttributeGain, getAttributeGainForDifficulty } from './attributes';
import { evaluateAchievements, UserAchievementState } from './achievements';
import {
  Achievement,
  CharacterAttributes,
  Quest,
  QuestCompletionResult,
  UserProfile,
} from './types';

export interface QuestCompletionInput {
  quest: Quest;
  profile: UserProfile;
  attributes: CharacterAttributes;
  masterAchievements: Achievement[];
  userAchievements: Record<string, UserAchievementState>;
  totalQuestsCompleted: number;
  totalGoldEarned: number;
  totalItemsOwned: number;
  bossRaidsCompleted: number;
}

/**
 * Server-authoritative execution of a quest completion directive.
 * Atomically computes XP, Level, Gold, Attributes, Streak, and Accolades.
 */
export function executeQuestCompletion(input: QuestCompletionInput): {
  updatedProfile: UserProfile;
  updatedAttributes: CharacterAttributes;
  updatedAchievements: Record<string, UserAchievementState>;
  result: QuestCompletionResult;
} {
  const { quest, profile, attributes, masterAchievements, userAchievements } = input;

  if (quest.status === 'completed') {
    throw new Error('Directive has already been concluded.');
  }

  // 1. Evaluate Streak
  const streakResult = evaluateStreakActivity(
    profile.last_active_date,
    profile.streak_days,
    new Date()
  );

  // 2. Compute XP Gain with Streak Multiplier
  const rawXp = quest.xp_reward;
  const netXpGained = Math.round(rawXp * streakResult.multiplier);
  const xpProgression = evaluateXpGain(profile.level, profile.xp_current, netXpGained);

  // 3. Compute Gold Gain
  const { newBalance: newGold, delta: netGoldGained } = earnGold(
    profile.gold_balance,
    quest.gold_reward
  );

  // 4. Compute Attribute Gain
  const attributeGainAmount = getAttributeGainForDifficulty(quest.difficulty);
  const updatedAttributes = applyAttributeGain(
    attributes,
    quest.attribute,
    attributeGainAmount
  );

  // 5. Update Profile
  const updatedProfile: UserProfile = {
    ...profile,
    level: xpProgression.newLevel,
    title: getTitleForLevel(xpProgression.newLevel),
    xp_current: xpProgression.newXp,
    xp_next_level: xpProgression.newXpNextLevel,
    gold_balance: newGold,
    streak_days: streakResult.newStreak,
    streak_multiplier: streakResult.multiplier,
    last_active_date: streakResult.todayDateStr,
    updated_at: new Date().toISOString(),
  };

  // 6. Evaluate Achievements
  const totalCompleted = input.totalQuestsCompleted + 1;
  const totalGold = input.totalGoldEarned + netGoldGained;
  const { updatedMap, newlyUnlocked } = evaluateAchievements(
    masterAchievements,
    userAchievements,
    {
      totalQuestsCompleted: totalCompleted,
      currentStreakDays: streakResult.newStreak,
      currentLevel: xpProgression.newLevel,
      totalGoldEarned: totalGold,
      totalItemsOwned: input.totalItemsOwned,
      bossRaidsCompleted: input.bossRaidsCompleted,
    }
  );

  // 7. Assemble Complete Result
  const result: QuestCompletionResult = {
    success: true,
    xpGained: netXpGained,
    goldGained: netGoldGained,
    attributeGained: {
      name: quest.attribute,
      amount: attributeGainAmount,
    },
    leveledUp: xpProgression.leveledUp,
    newLevel: xpProgression.newLevel,
    levelsGained: xpProgression.levelsGained,
    newXp: xpProgression.newXp,
    newXpNextLevel: xpProgression.newXpNextLevel,
    newGold,
    newStreak: streakResult.newStreak,
    newStreakMultiplier: streakResult.multiplier,
    unlockedAchievements: newlyUnlocked,
    message: `Directive conquered: +${netXpGained} XP, +${netGoldGained} G, +${attributeGainAmount} ${quest.attribute}`,
  };

  return {
    updatedProfile,
    updatedAttributes,
    updatedAchievements: updatedMap,
    result,
  };
}
