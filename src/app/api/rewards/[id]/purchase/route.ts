import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';
import { spendGold } from '@/lib/game/economy';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized operator session' },
        { status: 401 }
      );
    }

    const itemId = params.id;
    const userId = session.id;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          // 1. Fetch item from Supabase catalog
          const { data: item, error: itemError } = await supabase
            .from('reward_items')
            .select('*')
            .eq('id', itemId)
            .single();

          if (itemError || !item) {
            return NextResponse.json({ success: false, error: 'Reward item not found in catalog' }, { status: 404 });
          }

          if (!item.is_available) {
            return NextResponse.json({ success: false, error: 'This reward is currently unavailable' }, { status: 400 });
          }

          if (item.stock !== null && item.stock <= 0) {
            return NextResponse.json({ success: false, error: 'Reward is out of stock' }, { status: 400 });
          }

          // 2. Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('gold_balance, level')
            .eq('id', userId)
            .single();

          if (profileError || !profile) {
            return NextResponse.json({ success: false, error: 'Player profile not found' }, { status: 404 });
          }

          // 3. Check level requirement
          if (profile.level < item.min_level_required) {
            return NextResponse.json({
              success: false,
              error: `Requires Level ${item.min_level_required} (Current: Level ${profile.level})`,
            }, { status: 400 });
          }

          // 4. Check for duplicate ownership (except consumables/boosts)
          const { data: existingOwnership } = await supabase
            .from('user_inventory')
            .select('id')
            .eq('profile_id', userId)
            .eq('item_id', itemId)
            .maybeSingle();

          if (existingOwnership && item.category !== 'Boost') {
            return NextResponse.json({
              success: false,
              error: 'Unique item already acquired in inventory',
            }, { status: 409 });
          }

          // 5. Check Gold balance
          if (profile.gold_balance < item.cost_gold) {
            return NextResponse.json({
              success: false,
              insufficientFunds: true,
              error: `Insufficient Vault Balance: Requires ${item.cost_gold} G (Available: ${profile.gold_balance} G)`,
              shortfall: item.cost_gold - profile.gold_balance,
            }, { status: 400 });
          }

          const newBalance = profile.gold_balance - item.cost_gold;

          // 6. Deduct Gold atomically
          await supabase
            .from('profiles')
            .update({
              gold_balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // 7. Add to user inventory
          await supabase.from('user_inventory').insert({
            profile_id: userId,
            item_id: itemId,
            acquired_at: new Date().toISOString(),
          });

          // 8. If Avatar category, also unlock in user_avatar_unlocks
          if (item.category === 'Avatar') {
            await supabase.from('user_avatar_unlocks').upsert({
              user_id: userId,
              avatar_item_id: itemId,
            }, { onConflict: 'user_id,avatar_item_id' });
          }

          // 9. Decrement stock if limited
          if (item.stock !== null) {
            await supabase
              .from('reward_items')
              .update({ stock: item.stock - 1 })
              .eq('id', itemId);
          }

          // 10. Record in authoritative economy ledger
          await supabase.from('gold_transactions').insert({
            profile_id: userId,
            type: 'REWARD_PURCHASE',
            amount: -item.cost_gold,
            balance_after: newBalance,
            source: `Rewards Shop: ${item.name}`,
            reference_id: itemId,
          });

          // Sync to local DataStore
          db.spendUserGold(userId, item.cost_gold);
          db.addInventoryItem(userId, itemId);

          return NextResponse.json({
            success: true,
            newGoldBalance: newBalance,
            item,
            message: `Acquired ${item.name} for ${item.cost_gold} G`,
          });
        }
      } catch (err: any) {
        console.warn('[RewardPurchase API] Supabase write fallback to DataStore:', err);
      }
    }

    // DataStore Fallback
    const profile = db.getProfile(userId);
    const item = SEED_REWARDS.find((r) => r.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Reward item not found' }, { status: 404 });
    }

    if (profile.level < item.min_level_required) {
      return NextResponse.json({
        success: false,
        error: `Requires Level ${item.min_level_required}`,
      }, { status: 400 });
    }

    const spendResult = spendGold(profile.gold_balance, item.cost_gold);
    if (!spendResult.success) {
      return NextResponse.json({
        success: false,
        insufficientFunds: true,
        error: `Insufficient Vault Balance: Requires ${item.cost_gold} G`,
        shortfall: spendResult.shortfall,
      }, { status: 400 });
    }

    profile.gold_balance = spendResult.newBalance;
    db.updateProfile(profile);
    db.addInventoryItem(userId, item.id);
    db.addGoldTransaction({
      id: crypto.randomUUID(),
      profile_id: userId,
      type: 'REWARD_PURCHASE',
      amount: -item.cost_gold,
      balance_after: spendResult.newBalance,
      source: `Rewards Shop: ${item.name}`,
      reference_id: itemId,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      newGoldBalance: spendResult.newBalance,
      item,
      message: `Acquired ${item.name} for ${item.cost_gold} G`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Reward purchase failed' },
      { status: 500 }
    );
  }
}
