import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db, SEED_AVATAR_ITEMS } from '@/lib/storage/data-store';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { AvatarSlot } from '@/lib/game/types';

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized operator session' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const body = await req.json().catch(() => ({}));
    const { itemId, slot, unequip } = body;

    // Handling Unequip
    if (unequip && slot) {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseAdminClient();
          if (supabase) {
            await supabase
              .from('user_avatar_loadout')
              .delete()
              .eq('user_id', userId)
              .eq('slot', slot);
          }
        } catch (err) {
          console.warn('[AvatarEquip API] Supabase unequip fallback:', err);
        }
      }

      db.unequipAvatarSlot(userId, slot);
      const updatedLoadout = db.getUserAvatarLoadout(userId);
      return NextResponse.json({ success: true, loadout: updatedLoadout });
    }

    // Handling Equip
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Target avatar itemId is required' },
        { status: 400 }
      );
    }

    // 1. Locate Item Metadata
    let targetItem = SEED_AVATAR_ITEMS.find((i) => i.id === itemId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: dbItem } = await supabase
            .from('avatar_items')
            .select('*')
            .eq('id', itemId)
            .single();
          if (dbItem) targetItem = dbItem;

          // Check user unlock ownership in database
          const { data: userUnlock } = await supabase
            .from('user_avatar_unlocks')
            .select('id')
            .eq('user_id', userId)
            .eq('avatar_item_id', itemId)
            .single();

          if (!userUnlock) {
            // Also check DataStore in case of local-only fallback
            const localUnlocks = db.getUserAvatarUnlocks(userId);
            if (!localUnlocks.includes(itemId)) {
              return NextResponse.json(
                { success: false, error: 'Forbidden: Cannot equip unowned avatar gear' },
                { status: 403 }
              );
            }
          }

          // Check level requirement
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('level')
            .eq('id', userId)
            .single();

          const userLevel = userProfile?.level ?? db.getProfile(userId).level;
          if (targetItem && userLevel < targetItem.required_level) {
            return NextResponse.json(
              { success: false, error: `Level ${targetItem.required_level} required to equip this item` },
              { status: 400 }
            );
          }

          if (targetItem) {
            // Upsert into user_avatar_loadout
            await supabase.from('user_avatar_loadout').upsert(
              {
                user_id: userId,
                slot: targetItem.slot,
                avatar_item_id: targetItem.id,
                equipped_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,slot' }
            );
          }
        }
      } catch (err) {
        console.warn('[AvatarEquip API] Supabase equip fallback to DataStore:', err);
      }
    }

    // Mirror to DataStore
    const localResult = db.equipAvatarItem(userId, itemId);
    if (!localResult.success) {
      return NextResponse.json(
        { success: false, error: localResult.error },
        { status: 400 }
      );
    }

    const loadout = db.getUserAvatarLoadout(userId);
    return NextResponse.json({
      success: true,
      loadout,
      equippedItem: targetItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to equip avatar item' },
      { status: 500 }
    );
  }
}
