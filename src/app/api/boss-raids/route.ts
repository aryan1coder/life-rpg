import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db } from '@/lib/storage/data-store';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized operator session' },
        { status: 401 }
      );
    }

    const userId = session.id;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          // Fetch active boss raid
          const { data: activeRaid, error: raidError } = await supabase
            .from('boss_raids')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!raidError && activeRaid) {
            // Fetch player's progress on this raid
            const { data: userProgress } = await supabase
              .from('boss_raid_progress')
              .select('*')
              .eq('profile_id', userId)
              .eq('boss_raid_id', activeRaid.id)
              .maybeSingle();

            return NextResponse.json({
              success: true,
              bossRaid: {
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
                is_completed: (activeRaid.current_hp <= 0) || Boolean(userProgress?.is_completed),
                is_active: activeRaid.is_active,
              },
            });
          }

          // Supabase is configured, but ZERO active boss raids deployed by admin
          return NextResponse.json({
            success: true,
            bossRaid: null,
          });
        }
      } catch (err) {
        console.warn('[BossRaids API] Supabase query fallback to DataStore:', err);
      }
    }

    // DataStore Fallback (Only when Supabase is unconfigured)
    const localRaid = db.getBossRaid(userId);
    return NextResponse.json({
      success: true,
      bossRaid: localRaid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch boss raid' },
      { status: 500 }
    );
  }
}
