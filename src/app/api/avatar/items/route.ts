import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db, SEED_AVATAR_ITEMS } from '@/lib/storage/data-store';
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

    // 1. If Supabase is configured, attempt to query PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          // Fetch active catalog
          const { data: items, error: itemsError } = await supabase
            .from('avatar_items')
            .select('*')
            .eq('is_active', true)
            .order('required_level', { ascending: true });

          // Fetch user unlocks
          const { data: unlocks, error: unlocksError } = await supabase
            .from('user_avatar_unlocks')
            .select('avatar_item_id')
            .eq('user_id', userId);

          // Fetch user loadout
          const { data: loadoutRows, error: loadoutError } = await supabase
            .from('user_avatar_loadout')
            .select('slot, avatar_item_id')
            .eq('user_id', userId);

          if (!itemsError && !unlocksError && !loadoutError && items && items.length > 0) {
            const loadoutMap: Record<string, string> = {};
            if (loadoutRows) {
              for (const row of loadoutRows) {
                loadoutMap[row.slot] = row.avatar_item_id;
              }
            }

            return NextResponse.json({
              success: true,
              items,
              unlocks: unlocks ? unlocks.map((u) => u.avatar_item_id) : [],
              loadout: loadoutMap,
            });
          }
        }
      } catch (err) {
        console.warn('[AvatarItems API] Supabase query fallback to DataStore:', err);
      }
    }

    // 2. DataStore Fallback
    const items = db.getAvatarItems();
    const unlocks = db.getUserAvatarUnlocks(userId);
    const loadout = db.getUserAvatarLoadout(userId);

    return NextResponse.json({
      success: true,
      items,
      unlocks,
      loadout,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve avatar items' },
      { status: 500 }
    );
  }
}
