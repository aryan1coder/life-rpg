import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { isSupabaseConfigured, getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
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

    const { data: supaQuests, error } = await supabase
      .from('quests')
      .select('*')
      .or(`profile_id.eq.${session.id},is_system_directive.eq.true`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quests: supaQuests || [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, difficulty, attribute, frequency, due_date } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Directive title is mandatory' }, { status: 400 });
    }

    if (!['Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health', 'Engineering'].includes(category)) {
      return NextResponse.json({ success: false, error: 'Invalid protocol category' }, { status: 400 });
    }

    if (!['Easy', 'Normal', 'Hard', 'Epic'].includes(difficulty)) {
      return NextResponse.json({ success: false, error: 'Invalid difficulty tier' }, { status: 400 });
    }

    if (!['Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity'].includes(attribute)) {
      return NextResponse.json({ success: false, error: 'Invalid attribute target' }, { status: 400 });
    }

    // Server-authoritative reward calculation
    const xpReward = difficulty === 'Epic' ? 300 : difficulty === 'Hard' ? 200 : difficulty === 'Normal' ? 120 : 80;
    const goldReward = difficulty === 'Epic' ? 150 : difficulty === 'Hard' ? 95 : difficulty === 'Normal' ? 65 : 40;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const supabase = getSupabaseServerClient(req);
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client failed' }, { status: 500 });
    }

    const insertPayload = {
      profile_id: session.id,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      difficulty,
      attribute,
      xp_reward: xpReward,
      gold_reward: goldReward,
      frequency: frequency || 'Daily',
      status: 'active',
      due_date: due_date || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      is_system_directive: false,
    };

    const { data: supaQuest, error: supaError } = await supabase
      .from('quests')
      .insert(insertPayload)
      .select('*')
      .single();

    if (supaError) {
      return NextResponse.json({ success: false, error: supaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quest: supaQuest,
      message: 'New directive initialized successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create directive' },
      { status: 500 }
    );
  }
}
