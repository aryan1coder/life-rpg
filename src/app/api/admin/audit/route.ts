import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 50));

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data: logs, error } = await supabase
            .from('admin_audit_logs')
            .select(`
              *,
              profiles (
                username,
                display_name
              )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (!error && logs) {
            return NextResponse.json({ success: true, logs });
          }
        }
      } catch (err) {
        console.warn('[Admin Audit API] Supabase query fallback:', err);
      }
    }

    const localLogs = db.getAuditLogs(limit);
    return NextResponse.json({ success: true, logs: localLogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
