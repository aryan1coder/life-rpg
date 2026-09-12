import assert from 'assert';
import { getXPRequiredForLevel, evaluateXpGain, calculateLevelProgress } from '../src/lib/game/progression';
import { earnGold, spendGold, validateAffordability } from '../src/lib/game/economy';
import { calculateStreakMultiplier, evaluateStreakActivity } from '../src/lib/game/streaks';
import { applyAttributeGain, getAttributeGainForDifficulty } from '../src/lib/game/attributes';
import { evaluateAchievements } from '../src/lib/game/achievements';
import { canEquipItem, equipItemInLoadout } from '../src/lib/game/rewards';
import { executeQuestCompletion } from '../src/lib/game/quest-engine';

console.log('⚡ [LIFE RPG] Commencing Game Engine Verification Suite...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

// 1. XP Calculations & Progression
test('getXPRequiredForLevel follows convex polynomial curve', () => {
  assert.strictEqual(getXPRequiredForLevel(1), 1000);
  assert(getXPRequiredForLevel(2) > 1000);
  assert.strictEqual(getXPRequiredForLevel(10), 17782);
});

test('calculateLevelProgress calculates exact clamped percentage', () => {
  assert.strictEqual(calculateLevelProgress(500, 1000), 50);
  assert.strictEqual(calculateLevelProgress(8260, 10000), 82.6);
  assert.strictEqual(calculateLevelProgress(1500, 1000), 100);
});

test('evaluateXpGain handles multi-level boundary crossings', () => {
  // At level 1, xp 900, adding 200 XP crosses 1000 threshold to level 2
  const result = evaluateXpGain(1, 900, 200);
  assert.strictEqual(result.newLevel, 2);
  assert.strictEqual(result.levelsGained, 1);
  assert.strictEqual(result.newXp, 100);
  assert(result.leveledUp);
});

// 2. Gold Economy
test('earnGold increases vault balance', () => {
  const { newBalance, delta } = earnGold(1420, 65);
  assert.strictEqual(newBalance, 1485);
  assert.strictEqual(delta, 65);
});

test('spendGold safely deducts and guards against negative balances', () => {
  // Successful spend
  const res1 = spendGold(1420, 750);
  assert(res1.success);
  assert.strictEqual(res1.newBalance, 670);
  assert.strictEqual(res1.shortfall, 0);

  // Insufficient funds
  const res2 = spendGold(420, 750);
  assert.strictEqual(res2.success, false);
  assert.strictEqual(res2.newBalance, 420);
  assert.strictEqual(res2.shortfall, 330);
});

test('validateAffordability returns exact shortfall', () => {
  const { affordable, shortfall } = validateAffordability(500, 750);
  assert.strictEqual(affordable, false);
  assert.strictEqual(shortfall, 250);
});

// 3. Streak Calculations
test('calculateStreakMultiplier caps at 1.50x', () => {
  assert.strictEqual(calculateStreakMultiplier(0), 1.0);
  assert.strictEqual(calculateStreakMultiplier(7), 1.05);
  assert.strictEqual(calculateStreakMultiplier(14), 1.10);
  assert.strictEqual(calculateStreakMultiplier(100), 1.50);
});

test('evaluateStreakActivity continues streak on consecutive days', () => {
  const res = evaluateStreakActivity('2026-09-11', 13, new Date('2026-09-12T12:00:00Z'));
  assert.strictEqual(res.newStreak, 14);
  assert(res.streakExtended);
  assert(!res.streakReset);
});

test('evaluateStreakActivity resets streak on gap > 1 day', () => {
  const res = evaluateStreakActivity('2026-09-08', 13, new Date('2026-09-12T12:00:00Z'));
  assert.strictEqual(res.newStreak, 1);
  assert(!res.streakExtended);
  assert(res.streakReset);
});

// 4. Attributes
test('applyAttributeGain correctly clamps at 100', () => {
  const attrs = {
    profile_id: 'test',
    intellect: 99,
    discipline: 50,
    vitality: 50,
    strength: 50,
    creativity: 50,
    today_intellect_delta: 0,
    today_discipline_delta: 0,
    today_vitality_delta: 0,
    today_strength_delta: 0,
    today_creativity_delta: 0,
    updated_at: '',
  };
  const updated = applyAttributeGain(attrs, 'Intellect', 3);
  assert.strictEqual(updated.intellect, 100);
  assert.strictEqual(updated.today_intellect_delta, 3);
});

// 5. Equipment & Loadout
test('canEquipItem enforces level requirements and ownership', () => {
  const item = {
    id: 'theme_obsidian',
    name: 'Obsidian Theme',
    description: '',
    category: 'Theme' as const,
    rarity: 'Rare' as const,
    cost_gold: 750,
    min_level_required: 10,
    is_available: true,
  };

  const owned = new Set(['theme_obsidian']);
  assert.strictEqual(canEquipItem(item, 12, owned).canEquip, true);
  assert.strictEqual(canEquipItem(item, 8, owned).canEquip, false); // Level too low
  assert.strictEqual(canEquipItem(item, 12, new Set()).canEquip, false); // Not owned
});

// 6. Quest Completion Engine
test('executeQuestCompletion performs atomic state computation', () => {
  const profile = {
    id: 'test_user',
    username: 'TestOperator',
    title: 'Novice',
    level: 1,
    xp_current: 900,
    xp_next_level: 1000,
    gold_balance: 100,
    streak_days: 2,
    streak_multiplier: 1.0,
    last_active_date: '2026-09-11',
    avatar_url: '',
    created_at: '',
    updated_at: '',
  };

  const quest = {
    id: 'quest_1',
    profile_id: 'test_user',
    title: 'Write Compiler Frontend',
    category: 'Engineering' as const,
    difficulty: 'Normal' as const,
    attribute: 'Intellect' as const,
    xp_reward: 200,
    gold_reward: 50,
    frequency: 'Daily' as const,
    status: 'active' as const,
    created_at: '',
    updated_at: '',
  };

  const attributes = {
    profile_id: 'test_user',
    intellect: 50,
    discipline: 50,
    vitality: 50,
    strength: 50,
    creativity: 50,
    today_intellect_delta: 0,
    today_discipline_delta: 0,
    today_vitality_delta: 0,
    today_strength_delta: 0,
    today_creativity_delta: 0,
    updated_at: '',
  };

  const { updatedProfile, updatedAttributes, result } = executeQuestCompletion({
    quest,
    profile,
    attributes,
    masterAchievements: [],
    userAchievements: {},
    totalQuestsCompleted: 0,
    totalGoldEarned: 100,
    totalItemsOwned: 0,
    bossRaidsCompleted: 0,
  });

  assert(result.leveledUp);
  assert.strictEqual(updatedProfile.level, 2);
  assert.strictEqual(updatedProfile.gold_balance, 150);
  assert.strictEqual(updatedAttributes.intellect, 51);
});

console.log(`\n========================================`);
console.log(`🏁 Total Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
