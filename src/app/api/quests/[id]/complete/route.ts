import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_ACHIEVEMENTS } from '@/lib/storage/data-store';
import { executeQuestCompletion } from '@/lib/game/quest-engine';
import { getAuthSession } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const questId = params.id;
    const profile = db.getProfile(session.id);
    const attributes = db.getAttributes(session.id);
    const quests = db.getQuests(session.id);
    const quest = quests.find((q) => q.id === questId);

    if (!quest) {
      return NextResponse.json({ success: false, error: 'Directive not found' }, { status: 404 });
    }

    // Strict multi-tenant ownership check
    if (quest.profile_id !== session.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: Directive belongs to another operator' }, { status: 403 });
    }

    // Concurrency & double completion guard
    if (quest.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Directive has already been marked as complete' },
        { status: 409 }
      );
    }

    const userAchievements = db.getUserAchievements(session.id);
    const completedQuestsCount = quests.filter((q) => q.status === 'completed').length;
    const inventory = db.getInventory(session.id);

    const { updatedProfile, updatedAttributes, updatedAchievements, result } = executeQuestCompletion({
      quest,
      profile,
      attributes,
      masterAchievements: SEED_ACHIEVEMENTS,
      userAchievements,
      totalQuestsCompleted: completedQuestsCount,
      totalGoldEarned: profile.gold_balance,
      totalItemsOwned: inventory.length,
      bossRaidsCompleted: 0,
    });

    // Mark quest completed atomically
    const completedQuest = {
      ...quest,
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.updateQuest(completedQuest);
    db.updateProfile(updatedProfile);
    db.updateAttributes(updatedAttributes);
    db.updateUserAchievements(session.id, updatedAchievements);

    return NextResponse.json({
      success: true,
      quest: completedQuest,
      profile: updatedProfile,
      attributes: updatedAttributes,
      achievements: updatedAchievements,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Quest completion failed' },
      { status: 500 }
    );
  }
}
