import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, AuthSession } from './session';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/storage/data-store';

export interface AdminAuthResult {
  authorized: boolean;
  session?: AuthSession;
  error?: string;
  status?: number;
}

/**
 * Server-authoritative admin authorization verification.
 * Validates authenticated Supabase session and confirms profiles.role === 'admin'.
 * Returns 401 Unauthorized if not logged in, or 403 Forbidden if not an administrator.
 */
export async function verifyAdminSession(req: NextRequest): Promise<AdminAuthResult> {
  const session = getAuthSession(req);
  if (!session) {
    return {
      authorized: false,
      error: 'Unauthorized: Authentication required',
      status: 401,
    };
  }

  // 1. Query Supabase profiles table for role
  if (isSupabaseConfigured()) {
    try {
      const { getSupabaseAdminClient, getSupabaseServerClient } = await import('@/lib/supabase/server');
      const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
      if (supabase) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.id)
          .single();

        if (!error && profile) {
          if (profile.role === 'admin') {
            return { authorized: true, session: { ...session, role: 'admin' } };
          } else {
            return {
              authorized: false,
              error: 'Forbidden: Administrator privileges required',
              status: 403,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[Admin Auth] Supabase role verification fallback to DataStore:', err);
    }
  }

  // 2. DataStore Fallback (Local Development & In-Memory Store without Supabase)
  const localProfile = db.getProfile(session.id);
  if (localProfile?.role === 'admin' || session.role === 'admin') {
    return { authorized: true, session: { ...session, role: 'admin' } };
  }

  return {
    authorized: false,
    error: 'Forbidden: Administrator privileges required',
    status: 403,
  };
}

/**
 * Records an immutable admin audit log entry to Supabase (and DataStore).
 */
export async function logAdminAuditAction({
  adminUserId,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
}) {
  const entry = {
    id: crypto.randomUUID(),
    admin_user_id: adminUserId,
    action,
    target_type: targetType,
    target_id: targetId || null,
    metadata,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        await supabase.from('admin_audit_logs').insert(entry);
      }
    } catch (err) {
      console.warn('[Admin Audit Log] Supabase write failed, recorded locally:', err);
    }
  }

  db.addAuditLog(entry);
  return entry;
}
