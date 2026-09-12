import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { isSupabaseConfigured, getSupabaseServerClient } from '@/lib/supabase/server';

// Simplistic execution engine since we're removing the heavy DataStore dependencies
function executeQuestCompletion(quest: any, profile: any, attributes: any) {
  let newXp = (profile.xp_current || 0) + (quest.xp_reward || 0);
  let newGold = (profile.gold_balance || 0) + (quest.gold_reward || 0);
  let newLevel = profile.level || 1;
  let nextXp = profile.xp_next_level || 1000;
  let leveledUp = false;

  while (newXp >= nextXp) {
    newXp -= nextXp;
    newLevel += 1;
    nextXp = Math.floor(nextXp * 1.5);
    leveledUp = true;
  }

  const updatedProfile = {
    ...profile,
    xp_current: newXp,
    gold_balance: newGold,
    level: newLevel,
    xp_next_level: nextXp,
  };

  const attrKey = quest.attribute?.toLowerCase();
  const updatedAttributes = { ...attributes };
  if (attrKey && updatedAttributes[attrKey] !== undefined) {
    updatedAttributes[attrKey] += 1;
    updatedAttributes[`today_${attrKey}_delta`] = (updatedAttributes[`today_${attrKey}_delta`] || 0) + 1;
  }

  return {
    updatedProfile,
    updatedAttributes,
    result: {
      leveledUp,
      message: leveledUp ? `Leveled up to ${newLevel}!` : `Gained ${quest.xp_reward} XP and ${quest.gold_reward} Gold.`,
    }
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const supabase = getSupabaseServerClient(req);
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client failed' }, { status: 500 });
    }

    const questId = params.id;

    // Fetch quest
    const { data: quest, error: questErr } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (questErr || !quest) {
      return NextResponse.json({ success: false, error: 'Directive not found' }, { status: 404 });
    }

    if (quest.profile_id !== session.id && !quest.is_system_directive) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (quest.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Directive has already been marked as complete' },
        { status: 409 }
      );
    }

    // Fetch profile and attributes
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.id).single();
    const { data: attributes } = await supabase.from('character_attributes').select('*').eq('profile_id', session.id).single();

    if (!profile || !attributes) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const { updatedProfile, updatedAttributes, result } = executeQuestCompletion(quest, profile, attributes);

    // 1. Update quest status
    const completed_at = new Date().toISOString();
    await supabase
      .from('quests')
      .update({
        status: 'completed',
        completed_at,
        updated_at: completed_at,
      })
      .eq('id', questId);

    // 2. Record quest execution log
    await supabase.from('quest_logs').insert({
      quest_id: questId,
      profile_id: session.id,
      xp_earned: quest.xp_reward,
      gold_earned: quest.gold_reward,
      completed_at,
    });

    // 3. Update profile progression stats
    await supabase
      .from('profiles')
      .update({
        level: updatedProfile.level,
        xp_current: updatedProfile.xp_current,
        xp_next_level: updatedProfile.xp_next_level,
        gold_balance: updatedProfile.gold_balance,
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

    return NextResponse.json({
      success: true,
      quest: { ...quest, status: 'completed' },
      profile: updatedProfile,
      attributes: updatedAttributes,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Quest completion failed' },
      { status: 500 }
    );
  }
}
