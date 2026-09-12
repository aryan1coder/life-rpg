import { NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';

export async function GET() {
  try {
    const profile = db.getProfile();
    const attributes = db.getAttributes();
    const loadout = db.getLoadout();
    const campaign = db.getCampaign();
    const bossRaid = db.getBossRaid();

    return NextResponse.json({
      success: true,
      profile,
      attributes,
      loadout,
      campaign,
      bossRaid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch character state' },
      { status: 500 }
    );
  }
}
