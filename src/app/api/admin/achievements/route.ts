import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db, SEED_ACHIEVEMENTS } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
        if (supabase) {
          const { data: achievements, error } = await supabase
            .from('achievements')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && achievements) {
            return NextResponse.json({ success: true, achievements });
          }
        }
      } catch (err) {
        console.warn('[Admin Achievements API] Supabase query fallback:', err);
      }
    }

    return NextResponse.json({ success: true, achievements: SEED_ACHIEVEMENTS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch achievements' },
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
      id,
      title,
      description,
      category = 'Milestones',
      reward_gold = 50,
      reward_xp = 100,
      target_value = 1,
      badge_icon = 'flag',
      is_active = true,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Achievement title is required' }, { status: 400 });
    }

    const achievementId = id?.trim() || `ach_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    const newAch = {
      id: achievementId,
      title: title.trim(),
      description: description?.trim() || '',
      category,
      reward_gold: Number(reward_gold) || 0,
      reward_xp: Number(reward_xp) || 0,
      target_value: Number(target_value) || 1,
      badge_icon,
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
        if (supabase) {
          const { data: created, error } = await supabase
            .from('achievements')
            .upsert(newAch)
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'ACHIEVEMENT_CREATE',
              targetType: 'ACHIEVEMENT',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, achievement: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Achievements API] Supabase write fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'ACHIEVEMENT_CREATE',
      targetType: 'ACHIEVEMENT',
      targetId: newAch.id,
      metadata: newAch,
    });

    return NextResponse.json({ success: true, achievement: newAch });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
