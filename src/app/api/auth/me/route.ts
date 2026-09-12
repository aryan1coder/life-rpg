import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  const session = getAuthSession(req);
  if (!session) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  const profile = db.getProfile(session.id);

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: session,
    profile,
  });
}
