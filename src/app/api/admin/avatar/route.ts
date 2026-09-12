import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getAuthenticatedSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db, SEED_AVATAR_ITEMS } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: items, error } = await supabase
            .from('avatar_items')
            .select('*')
            .order('required_level', { ascending: true });

          if (!error && items) {
            return NextResponse.json({ success: true, items });
          }
        }
      } catch (err) {
        console.warn('[Admin Avatar API] Supabase query fallback:', err);
      }
    }

    return NextResponse.json({ success: true, items: SEED_AVATAR_ITEMS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch avatar items' },
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
      slot = 'body',
      rarity = 'Common',
      asset_key = 'body_initiate',
      required_level = 1,
      cost_gold = 0,
      is_active = true,
      metadata = {},
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Item name is required' }, { status: 400 });
    }

    const itemId = id?.trim() || `avatar_${slot}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    const newItem = {
      id: itemId,
      name: name.trim(),
      description: description?.trim() || '',
      slot,
      rarity,
      asset_key,
      required_level: Number(required_level) || 1,
      cost_gold: Number(cost_gold) || 0,
      is_active: Boolean(is_active),
      metadata: typeof metadata === 'object' ? metadata : {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: created, error } = await supabase
            .from('avatar_items')
            .upsert(newItem)
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'AVATAR_ITEM_CREATE',
              targetType: 'AVATAR_ITEM',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, item: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Avatar API] Supabase write fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'AVATAR_ITEM_CREATE',
      targetType: 'AVATAR_ITEM',
      targetId: newItem.id,
      metadata: newItem,
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create avatar item' },
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
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          await supabase.from('avatar_items').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[Admin Avatar API] Supabase delete fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'AVATAR_ITEM_DELETE',
      targetType: 'AVATAR_ITEM',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Avatar item deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete avatar item' },
      { status: 500 }
    );
  }
}
