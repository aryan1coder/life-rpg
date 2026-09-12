import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { Quest } from '@/lib/game/types';

export async function GET(req: NextRequest) {
  try {
    const profile = db.getProfile();
    const quests = db.getQuests(profile.id);
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
    const body = await req.json();
    const { title, description, category, difficulty, attribute, xp_reward, gold_reward, frequency, due_date } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is mandatory' }, { status: 400 });
    }

    if (!['Work', 'Study', 'Fitness', 'Personal', 'Creative', 'Health', 'Engineering'].includes(category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });
    }

    if (!['Easy', 'Normal', 'Hard', 'Epic'].includes(difficulty)) {
      return NextResponse.json({ success: false, error: 'Invalid difficulty' }, { status: 400 });
    }

    if (!['Intellect', 'Discipline', 'Vitality', 'Strength', 'Creativity'].includes(attribute)) {
      return NextResponse.json({ success: false, error: 'Invalid attribute' }, { status: 400 });
    }

    const profile = db.getProfile();
    const newQuest: Quest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      profile_id: profile.id,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      difficulty,
      attribute,
      xp_reward: Number(xp_reward) > 0 ? Number(xp_reward) : 100,
      gold_reward: Number(gold_reward) >= 0 ? Number(gold_reward) : 50,
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
      message: 'Quest initialized successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Quest creation failed' },
      { status: 500 }
    );
  }
}
