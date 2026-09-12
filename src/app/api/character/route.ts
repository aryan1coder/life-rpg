import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { isSupabaseConfigured, getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const supabase = getSupabaseServerClient(req);
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client failed' }, { status: 500 });
    }

    // 1. Authoritative profile
    const { data: supaProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.id)
      .single();

    if (profileErr || !supaProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // 2. Authoritative attributes
    const { data: supaAttrs } = await supabase
      .from('character_attributes')
      .select('*')
      .eq('profile_id', session.id)
      .maybeSingle();

    // 3. Boss Raid
    const { data: activeRaid } = await supabase
      .from('boss_raids')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let bossRaid = null;
    if (activeRaid) {
      const { data: userProgress } = await supabase
        .from('boss_raid_progress')
        .select('*')
        .eq('profile_id', session.id)
        .eq('boss_raid_id', activeRaid.id)
        .maybeSingle();

      bossRaid = {
        id: activeRaid.id,
        title: activeRaid.title,
        description: activeRaid.description,
        threat_level: activeRaid.threat_level,
        max_hp: activeRaid.max_hp,
        current_hp: activeRaid.current_hp,
        required_directives: activeRaid.required_directives,
        directives_completed: userProgress?.directives_completed || 0,
        expires_at: activeRaid.end_at,
        start_at: activeRaid.start_at,
        reward_gold: activeRaid.reward_gold,
        reward_xp: activeRaid.reward_xp,
        is_completed: activeRaid.current_hp <= 0 || Boolean(userProgress?.is_completed),
        is_active: activeRaid.is_active,
      };
    }

    // Return exact data directly from database
    return NextResponse.json({
      success: true,
      profile: supaProfile,
      attributes: supaAttrs || null,
      loadout: null, // to be migrated
      campaign: null, // to be migrated
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { display_name, username, bio, avatar_url } = body;

    const supabase = getSupabaseServerClient(req);
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client failed' }, { status: 500 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (display_name !== undefined) updatePayload.display_name = display_name;
    if (username !== undefined) updatePayload.username = username;
    if (bio !== undefined) updatePayload.bio = bio;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url;

    const { error: dbError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', session.id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Fetch the updated profile to return
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.id)
      .single();

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Profile update failed' },
      { status: 500 }
    );
  }
}
