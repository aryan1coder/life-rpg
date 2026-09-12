import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getAuthenticatedSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
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
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: transactions, error } = await supabase
            .from('gold_transactions')
            .select(`
              *,
              profiles (
                username,
                display_name
              )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

          const { data: goldProfiles } = await supabase
            .from('profiles')
            .select('gold_balance');

          const totalCirculation = goldProfiles ? goldProfiles.reduce((sum, p) => sum + (p.gold_balance || 0), 0) : 0;

          if (!error && transactions) {
            return NextResponse.json({
              success: true,
              totalCirculation,
              transactions,
            });
          }
        }
      } catch (err) {
        console.warn('[Admin Economy API] Supabase query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      totalCirculation: 0,
      transactions: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch economy ledger' },
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
    const { userId, amount, reason = 'Administrative grant' } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Target userId and amount are required' }, { status: 400 });
    }

    const delta = Number(amount);
    if (isNaN(delta) || delta === 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a non-zero integer' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('gold_balance')
            .eq('id', userId)
            .single();

          if (!profile) {
            return NextResponse.json({ success: false, error: 'Player profile not found' }, { status: 404 });
          }

          const newBalance = Math.max(0, profile.gold_balance + delta);

          await supabase
            .from('profiles')
            .update({ gold_balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', userId);

          const { data: tx } = await supabase
            .from('gold_transactions')
            .insert({
              profile_id: userId,
              type: delta > 0 ? 'ADMIN_GRANT' : 'ADMIN_DEDUCTION',
              amount: delta,
              balance_after: newBalance,
              source: `Admin Adjustment: ${reason}`,
            })
            .select()
            .single();

          await logAdminAuditAction({
            adminUserId: adminId,
            action: delta > 0 ? 'GOLD_GRANT' : 'GOLD_DEDUCT',
            targetType: 'PLAYER',
            targetId: userId,
            metadata: { delta, previousBalance: profile.gold_balance, newBalance, reason },
          });

          return NextResponse.json({ success: true, newBalance, transaction: tx });
        }
      } catch (err: any) {
        console.warn('[Admin Economy API] Supabase write fallback:', err);
      }
    }

    const profile = db.getProfile(userId);
    const newBalance = Math.max(0, profile.gold_balance + delta);
    profile.gold_balance = newBalance;
    db.updateProfile(profile);

    const txEntry = {
      id: crypto.randomUUID(),
      profile_id: userId,
      type: delta > 0 ? 'ADMIN_GRANT' : 'ADMIN_DEDUCTION',
      amount: delta,
      balance_after: newBalance,
      source: `Admin Adjustment: ${reason}`,
      created_at: new Date().toISOString(),
    };
    db.addGoldTransaction(txEntry);

    await logAdminAuditAction({
      adminUserId: adminId,
      action: delta > 0 ? 'GOLD_GRANT' : 'GOLD_DEDUCT',
      targetType: 'PLAYER',
      targetId: userId,
      metadata: { delta, newBalance, reason },
    });

    return NextResponse.json({ success: true, newBalance, transaction: txEntry });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Economy adjustment failed' },
      { status: 500 }
    );
  }
}
