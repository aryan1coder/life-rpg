import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { getAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const profile = db.getProfile(session.id);
    const attributes = db.getAttributes(session.id);
    const loadout = db.getLoadout(session.id);
    const campaign = db.getCampaign(session.id);
    const bossRaid = db.getBossRaid(session.id);

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
