import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';
import { getAuthSession } from '@/lib/auth/session';
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
          const { data: rewards, error: rewardError } = await supabase
            .from('reward_items')
            .select('*')
            .eq('is_available', true)
            .order('cost_gold', { ascending: true });

          const { data: profile } = await supabase
            .from('profiles')
            .select('gold_balance, level')
            .eq('id', userId)
            .single();

          const { data: inventoryRows } = await supabase
            .from('user_inventory')
            .select('item_id')
            .eq('profile_id', userId);

          const inventory = inventoryRows ? inventoryRows.map((r) => r.item_id) : [];

          if (!rewardError) {
            return NextResponse.json({
              success: true,
              rewards: rewards || [],
              inventory,
              vaultBalance: profile?.gold_balance || 0,
              userLevel: profile?.level || 1,
            });
          }
        }
      } catch (err) {
        console.warn('[Rewards API] Supabase fallback to DataStore:', err);
      }
    }

    const profile = db.getProfile(userId);
    const inventory = db.getInventory(userId);

    return NextResponse.json({
      success: true,
      rewards: SEED_REWARDS,
      inventory,
      vaultBalance: profile.gold_balance,
      userLevel: profile.level,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
