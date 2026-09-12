import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db, SEED_REWARDS } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: rewards, error } = await supabase
            .from('reward_items')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && rewards) {
            return NextResponse.json({ success: true, rewards });
          }
        }
      } catch (err) {
        console.warn('[Admin Rewards API] Supabase query fallback to DataStore:', err);
      }
    }

    return NextResponse.json({ success: true, rewards: SEED_REWARDS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rewards' },
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
      name,
      description,
      category = 'Cosmetic',
      rarity = 'Common',
      cost_gold = 100,
      min_level_required = 1,
      preview_asset = 'theme-obsidian.png',
      metadata = {},
      stock = null,
      is_available = true,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Item name is required' }, { status: 400 });
    }

    const itemId = id?.trim() || `reward_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    const newReward = {
      id: itemId,
      name: name.trim(),
      description: description?.trim() || '',
      category,
      rarity,
      cost_gold: Number(cost_gold) || 0,
      min_level_required: Number(min_level_required) || 1,
      preview_asset,
      metadata: typeof metadata === 'object' ? metadata : {},
      stock: stock === null || stock === '' ? null : Number(stock),
      is_available: Boolean(is_available),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: created, error } = await supabase
            .from('reward_items')
            .upsert(newReward)
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'REWARD_CREATE',
              targetType: 'REWARD',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, reward: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Rewards API] Supabase write fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'REWARD_CREATE',
      targetType: 'REWARD',
      targetId: newReward.id,
      metadata: newReward,
    });

    return NextResponse.json({ success: true, reward: newReward });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create reward' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const adminId = authResult.session!.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          await supabase.from('reward_items').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[Admin Rewards API] Supabase delete fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'REWARD_DELETE',
      targetType: 'REWARD',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Reward item deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete reward' },
      { status: 500 }
    );
  }
}
