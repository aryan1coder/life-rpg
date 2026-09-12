import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_ACHIEVEMENTS } from '@/lib/storage/data-store';
import { executeQuestCompletion } from '@/lib/game/quest-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id;
    const profile = db.getProfile();
    const attributes = db.getAttributes(profile.id);
    const quests = db.getQuests(profile.id);
    const quest = quests.find((q) => q.id === questId);

    if (!quest) {
      return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
    }

    if (quest.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Directive has already been marked as complete' },
        { status: 400 }
      );
    }

    const userAchievements = db.getUserAchievements(profile.id);
    const completedQuestsCount = quests.filter((q) => q.status === 'completed').length;
    const inventory = db.getInventory(profile.id);

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

    // Mark quest completed
    const completedQuest = {
      ...quest,
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.updateQuest(completedQuest);
    db.updateProfile(updatedProfile);
    db.updateAttributes(updatedAttributes);
    db.updateUserAchievements(profile.id, updatedAchievements);

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
