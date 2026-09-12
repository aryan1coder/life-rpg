import { NextResponse } from 'next/server';
import { db, SEED_ACHIEVEMENTS } from '@/lib/storage/data-store';

export async function GET() {
  try {
    const profile = db.getProfile();
    const userMap = db.getUserAchievements(profile.id);

    const merged = SEED_ACHIEVEMENTS.map((ach) => {
      const userProgress = userMap[ach.id] || { is_unlocked: false, current_progress: 0 };
      return {
        ...ach,
        is_unlocked: userProgress.is_unlocked,
        current_progress: userProgress.current_progress,
        unlocked_at: userProgress.unlocked_at || null,
      };
    });

    const unlockedCount = merged.filter((a) => a.is_unlocked).length;

    return NextResponse.json({
      success: true,
      achievements: merged,
      unlockedCount,
      totalCount: merged.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
