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

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: quests, error } = await supabase
            .from('quests')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && quests) {
            return NextResponse.json({ success: true, quests });
          }
        }
      } catch (err) {
        console.warn('[Admin Quests API] Supabase query fallback to DataStore:', err);
      }
    }

    // Local DataStore fallback
    const allQuests: any[] = [];
    const profiles = db.getAllProfiles();
    for (const p of profiles) {
      allQuests.push(...db.getQuests(p.id));
    }

    return NextResponse.json({ success: true, quests: allQuests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch directives' },
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
      category = 'Work',
      difficulty = 'Normal',
      attribute = 'Discipline',
      xp_reward = 100,
      gold_reward = 25,
      frequency = 'Daily',
      is_system_directive = true,
      due_date,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Directive title is required' }, { status: 400 });
    }

    const newDirective = {
      id: crypto.randomUUID(),
      profile_id: is_system_directive ? null : adminId,
      title: title.trim(),
      description: description?.trim() || null,
      category,
      difficulty,
      attribute,
      xp_reward: Number(xp_reward) || 100,
      gold_reward: Number(gold_reward) || 25,
      frequency,
      status: 'active' as const,
      is_system_directive: Boolean(is_system_directive),
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          const { data: created, error } = await supabase
            .from('quests')
            .insert(newDirective)
            .select()
            .single();

          if (!error && created) {
            await logAdminAuditAction({
              adminUserId: adminId,
              action: 'DIRECTIVE_CREATE',
              targetType: 'DIRECTIVE',
              targetId: created.id,
              metadata: created,
            });

            return NextResponse.json({ success: true, directive: created });
          }
        }
      } catch (err) {
        console.warn('[Admin Quests API] Supabase write fallback to DataStore:', err);
      }
    }

    db.addQuest({
      ...newDirective,
      profile_id: adminId,
    });

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'DIRECTIVE_CREATE',
      targetType: 'DIRECTIVE',
      targetId: newDirective.id,
      metadata: newDirective,
    });

    return NextResponse.json({ success: true, directive: newDirective });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create directive' },
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
      return NextResponse.json({ success: false, error: 'Directive ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient() || getAuthenticatedSupabaseClient(req);
        if (supabase) {
          await supabase.from('quests').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[Admin Quests API] Supabase delete fallback:', err);
      }
    }

    await logAdminAuditAction({
      adminUserId: adminId,
      action: 'DIRECTIVE_DELETE',
      targetType: 'DIRECTIVE',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Directive deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete directive' },
      { status: 500 }
    );
  }
}
