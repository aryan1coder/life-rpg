import { NextRequest, NextResponse } from 'next/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';
import { spendGold } from '@/lib/game/economy';
import { getAuthSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized operator session' }, { status: 401 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const item = SEED_REWARDS.find((r) => r.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Reward item not found' }, { status: 404 });
    }

    const profile = db.getProfile(session.id);
    const inventory = db.getInventory(session.id);

    // Duplicate check for permanent unique items
    if (inventory.includes(itemId) && item.category !== 'Boost') {
      return NextResponse.json(
        { success: false, error: 'Unique equipment already owned in inventory' },
        { status: 409 }
      );
    }

    // Level check
    if (profile.level < item.min_level_required) {
      return NextResponse.json(
        {
          success: false,
          error: `Level requirement not met: Requires Level ${item.min_level_required} (Current: Level ${profile.level})`,
        },
        { status: 400 }
      );
    }

    // Atomic spend validation
    const spendResult = spendGold(profile.gold_balance, item.cost_gold);
    if (!spendResult.success) {
      return NextResponse.json(
        {
          success: false,
          insufficientFunds: true,
          error: `Insufficient Vault Balance: Requires ${item.cost_gold} G (Available: ${profile.gold_balance} G)`,
          shortfall: spendResult.shortfall,
        },
        { status: 400 }
      );
    }

    // Update Profile and Inventory atomically
    const updatedProfile = {
      ...profile,
      gold_balance: spendResult.newBalance,
      updated_at: new Date().toISOString(),
    };

    db.updateProfile(updatedProfile);
    db.addInventoryItem(session.id, item.id);

    return NextResponse.json({
      success: true,
      newGoldBalance: spendResult.newBalance,
      item,
      message: `Acquired ${item.name} for ${item.cost_gold} G`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Reward redemption failed' },
      { status: 500 }
    );
  }
}
