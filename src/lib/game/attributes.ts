import { AttributeName, CharacterAttributes } from './types';

/**
 * Calculates attribute gain based on quest difficulty.
 */
export function getAttributeGainForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'Epic':
      return 3;
    case 'Hard':
      return 2;
    case 'Normal':
    case 'Easy':
    default:
      return 1;
  }
}

/**
 * Applies attribute delta to character capacities and clamps to 100 max.
 */
export function applyAttributeGain(
  attributes: CharacterAttributes,
  attributeName: AttributeName,
  gain: number
): CharacterAttributes {
  const safeGain = Math.max(1, gain);
  const updated = { ...attributes };

  switch (attributeName) {
    case 'Intellect':
      updated.intellect = Math.min(100, updated.intellect + safeGain);
      updated.today_intellect_delta += safeGain;
      break;
    case 'Discipline':
      updated.discipline = Math.min(100, updated.discipline + safeGain);
      updated.today_discipline_delta += safeGain;
      break;
    case 'Vitality':
      updated.vitality = Math.min(100, updated.vitality + safeGain);
      updated.today_vitality_delta += safeGain;
      break;
    case 'Strength':
      updated.strength = Math.min(100, updated.strength + safeGain);
      updated.today_strength_delta += safeGain;
      break;
    case 'Creativity':
      updated.creativity = Math.min(100, updated.creativity + safeGain);
      updated.today_creativity_delta += safeGain;
      break;
  }

  updated.updated_at = new Date().toISOString();
  return updated;
}
