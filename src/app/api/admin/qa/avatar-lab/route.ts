import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { db, SEED_AVATAR_ITEMS } from '@/lib/storage/data-store';
import { getEvolutionTierForLevel, evaluateXpGain, calculateLevelProgress } from '@/lib/game/progression';

const QA_TEST_USER_ID = '00000000-0000-4000-a000-000000000099';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const profile = db.getProfile(QA_TEST_USER_ID);
    const attributes = db.getAttributes(QA_TEST_USER_ID);
    const unlocks = db.getUserAvatarUnlocks(QA_TEST_USER_ID);
    const loadout = db.getUserAvatarLoadout(QA_TEST_USER_ID);
    const evolutionTier = getEvolutionTierForLevel(profile.level);
    const progress = calculateLevelProgress(profile.xp_current, profile.level);

    return NextResponse.json({
      success: true,
      testUser: {
        profile,
        attributes,
        unlocks,
        loadout,
        evolutionTier,
        progress,
      },
      catalog: SEED_AVATAR_ITEMS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch QA Lab state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const adminId = authResult.session!.id;
    const body = await req.json();
    const { action, level, amount, itemId, slot, scenario } = body;

    const profile = db.getProfile(QA_TEST_USER_ID);

    if (action === 'set_level') {
      const targetLevel = Math.max(1, Math.min(100, Number(level) || 1));
      profile.level = targetLevel;
      profile.xp_current = (targetLevel - 1) * 1000;
      profile.xp_next_level = targetLevel * 1000;
      db.updateProfile(profile);

      // Auto unlock items for this level
      const newlyUnlocked = db.evaluateAvatarUnlocksForLevel(QA_TEST_USER_ID, targetLevel);

      await logAdminAuditAction({
        adminUserId: adminId,
        action: 'QA_SET_LEVEL',
        targetType: 'QA_TEST_USER',
        targetId: QA_TEST_USER_ID,
        metadata: { targetLevel, newlyUnlockedCount: newlyUnlocked.length },
      });

      return NextResponse.json({
        success: true,
        profile,
        newlyUnlocked,
        evolutionTier: getEvolutionTierForLevel(targetLevel),
      });
    }

    if (action === 'add_xp') {
      const addAmount = Number(amount) || 100;
      const { newLevel, newXp, levelsGained } = evaluateXpGain(profile.level, profile.xp_current, addAmount);
      profile.level = newLevel;
      profile.xp_current = newXp;
      profile.xp_next_level = newLevel * 1000;
      db.updateProfile(profile);

      let newlyUnlocked: any[] = [];
      if (levelsGained > 0) {
        newlyUnlocked = db.evaluateAvatarUnlocksForLevel(QA_TEST_USER_ID, newLevel);
      }

      await logAdminAuditAction({
        adminUserId: adminId,
        action: 'QA_ADD_XP',
        targetType: 'QA_TEST_USER',
        targetId: QA_TEST_USER_ID,
        metadata: { addAmount, newLevel, levelsGained },
      });

      return NextResponse.json({
        success: true,
        profile,
        levelsGained,
        newlyUnlocked,
        evolutionTier: getEvolutionTierForLevel(newLevel),
      });
    }

    if (action === 'equip') {
      if (!itemId) return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
      const res = db.equipAvatarItem(QA_TEST_USER_ID, itemId);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, loadout: db.getUserAvatarLoadout(QA_TEST_USER_ID) });
    }

    if (action === 'unequip') {
      if (!slot) return NextResponse.json({ success: false, error: 'Slot required' }, { status: 400 });
      db.unequipAvatarSlot(QA_TEST_USER_ID, slot);
      return NextResponse.json({ success: true, loadout: db.getUserAvatarLoadout(QA_TEST_USER_ID) });
    }

    if (action === 'unlock') {
      if (!itemId) return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
      const current = db.getUserAvatarUnlocks(QA_TEST_USER_ID);
      if (!current.includes(itemId)) {
        current.push(itemId);
      }
      return NextResponse.json({ success: true, unlocks: current });
    }

    if (action === 'scenario') {
      let targetLevel = 1;
      if (scenario === 'early') targetLevel = 5;
      else if (scenario === 'mid') targetLevel = 10;
      else if (scenario === 'advanced') targetLevel = 15;
      else if (scenario === 'endgame') targetLevel = 20;
      else if (scenario === 'full') targetLevel = 30;

      profile.level = targetLevel;
      profile.xp_current = (targetLevel - 1) * 1000;
      profile.xp_next_level = targetLevel * 1000;
      profile.gold_balance = targetLevel * 100;
      db.updateProfile(profile);
      db.evaluateAvatarUnlocksForLevel(QA_TEST_USER_ID, targetLevel);

      return NextResponse.json({
        success: true,
        profile,
        loadout: db.getUserAvatarLoadout(QA_TEST_USER_ID),
        evolutionTier: getEvolutionTierForLevel(targetLevel),
      });
    }

    if (action === 'reset') {
      profile.level = 1;
      profile.xp_current = 0;
      profile.xp_next_level = 1000;
      profile.gold_balance = 0;
      profile.streak_days = 0;
      profile.streak_multiplier = 1.00;
      profile.title = 'Novice';
      db.updateProfile(profile);

      // Reset starter loadout & unlocks
      const starterItems = ['body_initiate_tunic', 'legs_initiate_fatigues', 'shoes_standard_trainers'];
      const unlocks = starterItems;
      const loadout = {
        body: 'body_initiate_tunic',
        legs: 'legs_initiate_fatigues',
        shoes: 'shoes_standard_trainers',
      };

      await logAdminAuditAction({
        adminUserId: adminId,
        action: 'QA_RESET_TEST_USER',
        targetType: 'QA_TEST_USER',
        targetId: QA_TEST_USER_ID,
      });

      return NextResponse.json({
        success: true,
        profile,
        unlocks,
        loadout,
        evolutionTier: getEvolutionTierForLevel(1),
        message: 'QA Test User reset cleanly to Level 1, 0 XP, 0 Gold.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unrecognized action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'QA action failed' },
      { status: 500 }
    );
  }
}
