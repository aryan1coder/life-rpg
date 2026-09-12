import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  const session = getAuthSession(req);
  if (!session) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  let profile = db.getProfile(session.id);

  // Synchronize with authoritative Supabase profile if configured
  const { isSupabaseConfigured, getSupabaseAdminClient, getSupabaseServerClient } = await import('@/lib/supabase/server');
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
      if (supabase) {
        const { data: supaProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.id)
          .single();

        if (!error && supaProfile) {
          profile = {
            ...profile,
            ...supaProfile,
            role: supaProfile.role || 'player',
          };
          db.updateProfile(profile);
        }
      }
    } catch (err) {
      console.warn('[Auth Me API] Supabase profile sync warning:', err);
    }
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      ...session,
      role: profile.role || 'player',
    },
    profile,
  });
}
