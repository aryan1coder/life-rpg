import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage/data-store';
import { getAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
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
        console.warn('[Character API] Supabase profile sync warning:', err);
      }
    }

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

export async function PATCH(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const body = await req.json();
    const { display_name, username, bio, avatar_url } = body;

    // Validate inputs
    if (username !== undefined && (typeof username !== 'string' || username.trim().length === 0 || username.trim().length > 30)) {
      return NextResponse.json({ success: false, error: 'Callsign must be between 1 and 30 characters' }, { status: 400 });
    }

    if (display_name !== undefined && (typeof display_name !== 'string' || display_name.trim().length > 50)) {
      return NextResponse.json({ success: false, error: 'Display name must not exceed 50 characters' }, { status: 400 });
    }

    if (bio !== undefined && (typeof bio !== 'string' || bio.trim().length > 300)) {
      return NextResponse.json({ success: false, error: 'Bio must not exceed 300 characters' }, { status: 400 });
    }

    // 1. Update in DataStore
    const currentProfile = db.getProfile(session.id);
    const updatedProfile = {
      ...currentProfile,
      display_name: display_name !== undefined ? display_name.trim() : (currentProfile.display_name || currentProfile.username),
      username: username !== undefined ? username.trim() : currentProfile.username,
      bio: bio !== undefined ? bio.trim() : (currentProfile.bio || ''),
      avatar_url: avatar_url !== undefined ? avatar_url.trim() : currentProfile.avatar_url,
      updated_at: new Date().toISOString(),
    };
    db.updateProfile(updatedProfile);

    // 2. Persist to Supabase if configured
    const { getSupabaseAdminClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = getSupabaseAdminClient();
    if (supabaseAdmin) {
      const updatePayload: Record<string, any> = {
        updated_at: updatedProfile.updated_at,
      };
      if (display_name !== undefined) updatePayload.display_name = updatedProfile.display_name;
      if (username !== undefined) updatePayload.username = updatedProfile.username;
      if (bio !== undefined) updatePayload.bio = updatedProfile.bio;
      if (avatar_url !== undefined) updatePayload.avatar_url = updatedProfile.avatar_url;

      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', session.id);

      if (dbError) {
        console.warn('Supabase profile update warning (retrying without new optional columns):', dbError.message);
        // Fallback for optional columns if migration 005 not applied yet
        const corePayload: Record<string, any> = {
          updated_at: updatedProfile.updated_at,
        };
        if (username !== undefined) corePayload.username = updatedProfile.username;
        if (avatar_url !== undefined) corePayload.avatar_url = updatedProfile.avatar_url;
        await supabaseAdmin.from('profiles').update(corePayload).eq('id', session.id);
      }
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Operator profile updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Profile update failed' },
      { status: 500 }
    );
  }
}
