import { NextResponse } from 'next/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';

export async function GET() {
  try {
    const profile = db.getProfile();
    const inventory = db.getInventory(profile.id);

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
