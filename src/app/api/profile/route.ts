import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db } from '@/lib/storage/data-store';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const userId = session.id;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, bio, avatar_url, role, title, created_at, updated_at')
            .eq('id', userId)
            .single();

          if (!error && profile) {
            return NextResponse.json({ success: true, profile });
          }
        }
      } catch (err) {
        console.warn('[Profile API] Supabase query fallback to DataStore:', err);
      }
    }

    const profile = db.getProfile(userId);
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name || profile.username,
        bio: profile.bio || '',
        avatar_url: profile.avatar_url,
        role: profile.role || 'player',
        title: profile.title,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const userId = session.id;
    const body = await req.json().catch(() => ({}));
    const { display_name, username, bio, avatar_url } = body;

    // Validation
    if (username !== undefined && (typeof username !== 'string' || username.trim().length === 0 || username.trim().length > 30)) {
      return NextResponse.json({ success: false, error: 'Callsign must be between 1 and 30 characters' }, { status: 400 });
    }

    if (display_name !== undefined && (typeof display_name !== 'string' || display_name.trim().length > 50)) {
      return NextResponse.json({ success: false, error: 'Display name must not exceed 50 characters' }, { status: 400 });
    }

    if (bio !== undefined && (typeof bio !== 'string' || bio.trim().length > 300)) {
      return NextResponse.json({ success: false, error: 'Bio must not exceed 300 characters' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (display_name !== undefined) updates.display_name = display_name.trim();
    if (username !== undefined) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url.trim();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: updated, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

          if (!error && updated) {
            // Mirror to DataStore
            const current = db.getProfile(userId);
            db.updateProfile({ ...current, ...updates });
            return NextResponse.json({ success: true, profile: updated });
          }
        }
      } catch (err) {
        console.warn('[Profile API] Supabase update fallback to DataStore:', err);
      }
    }

    const current = db.getProfile(userId);
    const updatedProfile = { ...current, ...updates };
    db.updateProfile(updatedProfile);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update player profile' },
      { status: 500 }
    );
  }
}
