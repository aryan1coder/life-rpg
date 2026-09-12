import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';
import { equipItemInLoadout, unequipSlot } from '@/lib/game/rewards';
import { ItemCategory } from '@/lib/game/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, itemId, slot } = body;
    const profile = db.getProfile();
    const loadout = db.getLoadout();
    const inventory = db.getInventory(profile.id);

    if (action === 'equip') {
      const item = SEED_REWARDS.find((r) => r.id === itemId);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item not found in catalog' }, { status: 404 });
      }

      if (!inventory.includes(itemId)) {
        return NextResponse.json(
          { success: false, error: 'Item not owned in inventory' },
          { status: 403 }
        );
      }

      if (profile.level < item.min_level_required) {
        return NextResponse.json(
          { success: false, error: `Requires level ${item.min_level_required}` },
          { status: 400 }
        );
      }

      const updated = equipItemInLoadout(loadout, item);
      db.updateLoadout(updated);

      return NextResponse.json({
        success: true,
        loadout: updated,
        message: `Equipped ${item.name}`,
      });
    } else if (action === 'unequip') {
      const updated = unequipSlot(loadout, slot as ItemCategory);
      db.updateLoadout(updated);

      return NextResponse.json({
        success: true,
        loadout: updated,
        message: `Slot unequipped`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Loadout update failed' },
      { status: 500 }
    );
  }
}
