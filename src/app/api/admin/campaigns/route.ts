import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminAuditAction } from '@/lib/auth/admin';
import { getSupabaseAdminClient, getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminSession(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 403 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
        if (supabase) {
          const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && campaigns) {
            return NextResponse.json({ success: true, campaigns });
          }
        }
      } catch (err) {
        console.warn('[Admin Campaigns API] Supabase query fallback:', err);
      }
    }

    return NextResponse.json({ success: true, campaigns: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaigns' },
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
      title,
      description,
      theme = 'System Operational Cadence',
      total_stages = 10,
      reward_xp = 1500,
      reward_gold = 500,
      is_active = true,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Campaign title is required' }, { status: 400 });
    }

    const campaignId = `campaign_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newCampaign = {
      id: campaignId,
      title: title.trim(),
      description: description?.trim() || '',
      theme,
      total_stages: Number(total_stages) || 10,
      reward_xp: Number(reward_xp) || 1500,
      reward_gold: Number(reward_gold) || 500,
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);
        if (supabase) {
          const { data: created, error } = await supabase
            .from('campaigns')
            .insert(newCampaign)
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'CAMPAIGN_CREATE',
              targetType: 'CAMPAIGN',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, campaign: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Campaigns API] Supabase write fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'CAMPAIGN_CREATE',
      targetType: 'CAMPAIGN',
      targetId: newCampaign.id,
      metadata: newCampaign,
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
