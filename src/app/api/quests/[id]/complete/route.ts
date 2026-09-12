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
    const masterAvatarItems = db.getAvatarItems();
    const userAvatarUnlocks = db.getUserAvatarUnlocks(session.id);

    const { updatedProfile, updatedAttributes, updatedAchievements, result } = executeQuestCompletion({
      quest,
      profile,
      attributes,
      masterAchievements: SEED_ACHIEVEMENTS,
      userAchievements,
      masterAvatarItems,
      userAvatarUnlocks,
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

    // If level-up occurred, persist new avatar unlocks
    if (result.leveledUp && result.newlyUnlockedAvatarItems) {
      db.evaluateAvatarUnlocksForLevel(session.id, updatedProfile.level);
    }

    // Persist to authoritative Supabase tables
    const { isSupabaseConfigured, getSupabaseAdminClient, getSupabaseServerClient } = await import('@/lib/supabase/server');
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
        if (supabase) {
          // 1. Update quest status
          await supabase
            .from('quests')
            .update({
              status: 'completed',
              completed_at: completedQuest.completed_at,
              updated_at: completedQuest.updated_at,
            })
            .eq('id', questId);

          // 2. Record quest execution log
          await supabase.from('quest_logs').insert({
            quest_id: questId.includes('-') ? questId : null,
            profile_id: session.id,
            xp_earned: quest.xp_reward,
            gold_earned: quest.gold_reward,
            completed_at: completedQuest.completed_at,
          });

          // 3. Update profile progression stats
          await supabase
            .from('profiles')
            .update({
              level: updatedProfile.level,
              xp_current: updatedProfile.xp_current,
              xp_next_level: updatedProfile.xp_next_level,
              gold_balance: updatedProfile.gold_balance,
              streak_days: updatedProfile.streak_days,
              streak_multiplier: updatedProfile.streak_multiplier,
              last_active_date: updatedProfile.last_active_date,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.id);

          // 4. Update attributes
          await supabase
            .from('character_attributes')
            .upsert({
              profile_id: session.id,
              intellect: updatedAttributes.intellect,
              discipline: updatedAttributes.discipline,
              vitality: updatedAttributes.vitality,
              strength: updatedAttributes.strength,
              creativity: updatedAttributes.creativity,
              today_intellect_delta: updatedAttributes.today_intellect_delta,
              today_discipline_delta: updatedAttributes.today_discipline_delta,
              today_vitality_delta: updatedAttributes.today_vitality_delta,
              today_strength_delta: updatedAttributes.today_strength_delta,
              today_creativity_delta: updatedAttributes.today_creativity_delta,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'profile_id' });

          // 5. If level up unlocked items, persist avatar unlocks
          if (result.leveledUp && result.newlyUnlockedAvatarItems?.length) {
            for (const item of result.newlyUnlockedAvatarItems) {
              await supabase.from('user_avatar_unlocks').upsert({
                profile_id: session.id,
                avatar_item_id: item.id,
                unlocked_at: new Date().toISOString(),
              }, { onConflict: 'profile_id,avatar_item_id' });
            }
          }
        }
      } catch (err) {
        console.warn('[QuestComplete API] Supabase persistence warning:', err);
      }
    }

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
