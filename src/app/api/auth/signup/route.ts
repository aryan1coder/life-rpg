import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { encodeSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanUsername = (username?.trim() || email.split('@')[0]).replace(/[^a-zA-Z0-9_\-\s]/g, '') || 'Operator';
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Bootstrap fresh new user in persistent database (Starts at Level 1, 0 XP, 0 Gold)
    const freshProfile = db.initFreshUser(userId, cleanUsername);

    const sessionData = {
      id: userId,
      email: email.trim().toLowerCase(),
      username: cleanUsername,
    };

    const token = encodeSession(sessionData);

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      profile: freshProfile,
      message: 'Operator identity and command deck initialized successfully',
    });

    // Set secure HTTP-only cookie
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
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
