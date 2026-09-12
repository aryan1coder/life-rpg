import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          let builder = supabase
            .from('profiles')
            .select(`
              id,
              username,
              display_name,
              bio,
              role,
              title,
              level,
              xp_current,
              xp_next_level,
              gold_balance,
              streak_days,
              streak_multiplier,
              last_active_date,
              avatar_url,
              created_at,
              updated_at,
              character_attributes (
                intellect,
                discipline,
                vitality,
                strength,
                creativity
              )
            `)
            .order('created_at', { ascending: false });

          if (query) {
            builder = builder.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);
          }

          const { data: players, error } = await builder;
          if (!error && players) {
            return NextResponse.json({ success: true, players });
          }
        }
      } catch (err) {
        console.warn('[Admin Players API] Supabase query fallback to DataStore:', err);
      }
    }

    // Local DataStore fallback
    let players = db.getAllProfiles();
    if (query) {
      players = players.filter(
        (p) => p.username.toLowerCase().includes(query) || p.display_name?.toLowerCase().includes(query)
      );
    }

    const mapped = players.map((p) => ({
      ...p,
      character_attributes: db.getAttributes(p.id),
    }));

    return NextResponse.json({ success: true, players: mapped });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch players' },
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
    const body = await req.json().catch(() => ({}));
    const { action, userId, amount, level } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Target userId is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!profile) {
            return NextResponse.json({ success: false, error: 'Target player not found' }, { status: 404 });
          }

          const updates: Record<string, any> = { updated_at: new Date().toISOString() };

          if (action === 'adjust_xp') {
            const delta = Number(amount) || 0;
            updates.xp_current = Math.max(0, profile.xp_current + delta);
          } else if (action === 'adjust_gold') {
            const delta = Number(amount) || 0;
            updates.gold_balance = Math.max(0, profile.gold_balance + delta);

            // Record transaction in ledger
            await supabase.from('gold_transactions').insert({
              profile_id: userId,
              type: delta >= 0 ? 'ADMIN_GRANT' : 'ADMIN_DEDUCTION',
              amount: delta,
              balance_after: updates.gold_balance,
              source: `Admin Adjustment by ${adminId}`,
            });
          } else if (action === 'adjust_level') {
            const targetLevel = Math.max(1, Math.min(100, Number(level) || 1));
            updates.level = targetLevel;
          } else if (action === 'reset_streak') {
            updates.streak_days = 0;
            updates.streak_multiplier = 1.00;
          } else if (action === 'reset_progression') {
            updates.level = 1;
            updates.xp_current = 0;
            updates.xp_next_level = 1000;
            updates.gold_balance = 0;
            updates.streak_days = 0;
            updates.streak_multiplier = 1.00;
            updates.title = 'Novice';
          } else {
            return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
          }

          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

          if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
          }

          // Audit log
          await logAdminAuditAction({
            adminUserId: adminId,
            action: `PLAYER_${action.toUpperCase()}`,
            targetType: 'PLAYER',
            targetId: userId,
            metadata: { previous: profile, updates },
          });

          // Mirror to DataStore
          const localProfile = db.getProfile(userId);
          db.updateProfile({ ...localProfile, ...updates });

          return NextResponse.json({ success: true, profile: updatedProfile });
        }
      } catch (err: any) {
        console.warn('[Admin Players Action] Supabase fallback to DataStore:', err);
      }
    }

    // Local DataStore fallback
    const profile = db.getProfile(userId);
    if (action === 'adjust_xp') {
      profile.xp_current = Math.max(0, profile.xp_current + (Number(amount) || 0));
    } else if (action === 'adjust_gold') {
      const delta = Number(amount) || 0;
      profile.gold_balance = Math.max(0, profile.gold_balance + delta);
      db.addGoldTransaction({
        id: crypto.randomUUID(),
        profile_id: userId,
        type: delta >= 0 ? 'ADMIN_GRANT' : 'ADMIN_DEDUCTION',
        amount: delta,
        balance_after: profile.gold_balance,
        source: `Admin Adjustment by ${adminId}`,
        created_at: new Date().toISOString(),
      });
    } else if (action === 'adjust_level') {
      profile.level = Math.max(1, Math.min(100, Number(level) || 1));
    } else if (action === 'reset_streak') {
      profile.streak_days = 0;
      profile.streak_multiplier = 1.00;
    } else if (action === 'reset_progression') {
      profile.level = 1;
      profile.xp_current = 0;
      profile.xp_next_level = 1000;
      profile.gold_balance = 0;
      profile.streak_days = 0;
      profile.streak_multiplier = 1.00;
      profile.title = 'Novice';
    }

    profile.updated_at = new Date().toISOString();
    db.updateProfile(profile);

    await logAdminAuditAction({
      adminUserId: adminId,
      action: `PLAYER_${action.toUpperCase()}`,
      targetType: 'PLAYER',
      targetId: userId,
      metadata: { action, amount, level },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Player modification failed' },
      { status: 500 }
    );
  }
}
