import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/storage/data-store';

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
          const [
            { count: totalPlayers },
            { count: totalDirectives },
            { count: completedDirectives },
            { count: activeBossRaids },
            { count: totalRewards },
            { count: totalPurchases },
            { data: goldData },
          ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'player'),
            supabase.from('quests').select('*', { count: 'exact', head: true }),
            supabase.from('quests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
            supabase.from('boss_raids').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('reward_items').select('*', { count: 'exact', head: true }),
            supabase.from('user_inventory').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('gold_balance'),
          ]);

          const goldCirculation = goldData ? goldData.reduce((sum, p) => sum + (p.gold_balance || 0), 0) : 0;

          return NextResponse.json({
            success: true,
            metrics: {
              totalPlayers: totalPlayers || 0,
              activePlayers: totalPlayers || 0,
              totalDirectives: totalDirectives || 0,
              completedDirectives: completedDirectives || 0,
              activeBossRaids: activeBossRaids || 0,
              totalRewards: totalRewards || 0,
              totalPurchases: totalPurchases || 0,
              goldCirculation,
            },
          });
        }
      } catch (err) {
        console.warn('[Admin Metrics API] Supabase query fallback to DataStore:', err);
      }
    }

    // Local DataStore fallback
    const profiles = db.getAllProfiles().filter((p) => p.role !== 'admin');
    let totalQuests = 0;
    let completedQuests = 0;
    let totalPurchases = 0;
    let goldCirculation = 0;

    for (const p of profiles) {
      const q = db.getQuests(p.id);
      totalQuests += q.length;
      completedQuests += q.filter((item) => item.status === 'completed').length;
      totalPurchases += db.getInventory(p.id).length;
      goldCirculation += p.gold_balance || 0;
    }

    const bossRaids = db.getBossRaids();
    const activeBossRaids = bossRaids.filter((b) => b.is_active && !b.is_completed).length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalPlayers: profiles.length,
        activePlayers: profiles.length,
        totalDirectives: totalQuests,
        completedDirectives: completedQuests,
        activeBossRaids,
        totalRewards: 0,
        totalPurchases,
        goldCirculation,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}
