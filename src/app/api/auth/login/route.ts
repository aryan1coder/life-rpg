import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { encodeSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ success: false, error: 'Security cipher is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in database or retrieve existing profile
    const existing = db.findProfileByEmailOrUsername(cleanEmail);
    const userId = existing ? existing.id : `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const username = existing ? existing.username : cleanEmail.split('@')[0];

    // Ensure user profile exists
    const profile = db.getProfile(userId);

    const sessionData = {
      id: userId,
      email: cleanEmail,
      username: username || profile.username,
    };

    const token = encodeSession(sessionData);

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      profile,
      message: 'Session authenticated successfully',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
