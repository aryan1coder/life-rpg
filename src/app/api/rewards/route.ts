import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';
import { getAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const profile = db.getProfile(session.id);
    const inventory = db.getInventory(session.id);

    return NextResponse.json({
      success: true,
      rewards: SEED_REWARDS,
      inventory,
      vaultBalance: profile.gold_balance,
      userLevel: profile.level,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
