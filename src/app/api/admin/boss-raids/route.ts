import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getAuthenticatedSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: raids, error } = await supabase
            .from('boss_raids')
            .select(`
              *,
              boss_raid_progress (
                id,
                profile_id,
                damage_dealt,
                directives_completed,
                is_completed
              )
            `)
            .order('created_at', { ascending: false });

          if (!error && raids) {
            return NextResponse.json({ success: true, raids });
          }
        }
      } catch (err) {
        console.warn('[Admin Boss Raids API] Supabase query fallback:', err);
      }
    }

    const raids = db.getBossRaids();
    return NextResponse.json({ success: true, raids });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch boss raids' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const adminId = authResult.session!.id;
    const body = await req.json();
    const {
      title,
      description,
      threat_level = 'Critical',
      max_hp = 100,
      required_directives = 3,
      time_limit_hours = 24,
      reward_gold = 350,
      reward_xp = 850,
      is_active = true,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Boss title is required' }, { status: 400 });
    }

    const raidId = `boss_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + (Number(time_limit_hours) || 24) * 3600 * 1000).toISOString();

    const newRaid = {
      id: raidId,
      title: title.trim(),
      description: description?.trim() || '',
      threat_level,
      max_hp: Number(max_hp) || 100,
      current_hp: Number(max_hp) || 100,
      required_directives: Number(required_directives) || 3,
      directives_completed: 0,
      time_limit_hours: Number(time_limit_hours) || 24,
      reward_gold: Number(reward_gold) || 350,
      reward_xp: Number(reward_xp) || 850,
      start_at: startAt,
      end_at: endAt,
      expires_at: endAt,
      is_active: Boolean(is_active),
      is_completed: false,
      created_by: adminId,
      created_at: startAt,
      updated_at: startAt,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: created, error } = await supabase
            .from('boss_raids')
            .insert({
              id: newRaid.id,
              title: newRaid.title,
              description: newRaid.description,
              threat_level: newRaid.threat_level,
              max_hp: newRaid.max_hp,
              current_hp: newRaid.current_hp,
              required_directives: newRaid.required_directives,
              time_limit_hours: newRaid.time_limit_hours,
              reward_gold: newRaid.reward_gold,
              reward_xp: newRaid.reward_xp,
              start_at: newRaid.start_at,
              end_at: newRaid.end_at,
              is_active: newRaid.is_active,
              created_by: adminId,
            })
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'BOSS_CREATE',
              targetType: 'BOSS_RAID',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, raid: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Boss Raids API] Supabase write fallback:', err);
      }
    }

    db.createBossRaid(newRaid);

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'BOSS_CREATE',
      targetType: 'BOSS_RAID',
      targetId: newRaid.id,
      metadata: newRaid,
    });

    return NextResponse.json({ success: true, raid: newRaid });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create boss raid' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const adminId = authResult.session!.id;
    const body = await req.json();
    const { id, is_active, reset_hp } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Boss Raid ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          if (reset_hp) {
            const { data: current } = await supabase.from('boss_raids').select('max_hp').eq('id', id).single();
            if (current) updates.current_hp = current.max_hp;
          }

          const { data: updated, error } = await supabase
            .from('boss_raids')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (!error && updated) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: is_active === false ? 'BOSS_DEACTIVATE' : 'BOSS_UPDATE',
              targetType: 'BOSS_RAID',
              targetId: id,
              metadata: updates,
            });

            return NextResponse.json({ success: true, raid: updated });
          }
        }
      } catch (err) {
        console.warn('[Admin Boss Raids API] Supabase update fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: is_active === false ? 'BOSS_DEACTIVATE' : 'BOSS_UPDATE',
      targetType: 'BOSS_RAID',
      targetId: id,
      metadata: updates,
    });

    return NextResponse.json({ success: true, message: 'Boss raid status updated' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update boss raid' },
      { status: 500 }
    );
  }
}
