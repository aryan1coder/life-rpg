import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

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
          const { data: settings, error } = await supabase.from('system_settings').select('*');
          if (!error && settings) {
            return NextResponse.json({ success: true, settings });
          }
        }
      } catch (err) {
        console.warn('[Admin Settings API] Supabase query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: [
        { key: 'maintenance_mode', value: { enabled: false }, description: 'Global system maintenance state' },
        { key: 'xp_multiplier', value: { multiplier: 1.0 }, description: 'Global base XP multiplier' },
        { key: 'gold_multiplier', value: { multiplier: 1.0 }, description: 'Global base Gold yield multiplier' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const adminId = authResult.session!.id;
    const body = await req.json();
    const { key, value, description } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key is required' }, { status: 400 });
    }

    const entry = {
      key,
      value: typeof value === 'object' ? value : { value },
      description: description || null,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          await supabase.from('system_settings').upsert(entry);
        }
      } catch (err) {
        console.warn('[Admin Settings API] Supabase upsert fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'SETTING_UPDATE',
      targetType: 'SETTING',
      targetId: key,
      metadata: entry,
    });

    return NextResponse.json({ success: true, setting: entry });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update setting' },
      { status: 500 }
    );
  }
}
