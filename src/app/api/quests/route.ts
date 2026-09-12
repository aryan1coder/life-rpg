import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { Quest } from '@/lib/game/types';
import { getAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const quests = db.getQuests(session.id);
    return NextResponse.json({ success: true, quests });
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

    const newQuest: Quest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.addQuest(newQuest);

    return NextResponse.json({
      success: true,
      quest: newQuest,
      message: 'Directive registered successfully in command deck',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Quest creation failed' },
      { status: 500 }
    );
  }
}
