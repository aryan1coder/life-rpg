import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';
import { db } from '@/lib/storage/data-store';
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

    const raidId = params.id;
    const userId = session.id;
    const body = await req.json().catch(() => ({}));
    const actionType = body.actionType || 'DIRECTIVE_STRIKE';
    const damage = Math.min(100, Math.max(10, Number(body.damage) || 25));

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          // 1. Fetch current boss raid
          const { data: raid, error: raidError } = await supabase
            .from('boss_raids')
            .select('*')
            .eq('id', raidId)
            .single();

          if (raidError || !raid) {
            const localRaid =
              db.getBossRaids().find((r) => r.id === raidId) ||
              (db.getBossRaid(userId).id === raidId ? db.getBossRaid(userId) : null);
            if (!localRaid) {
              return NextResponse.json({ success: false, error: 'Boss raid protocol not found' }, { status: 404 });
            }
            const result = db.attackBossRaid(userId, raidId, damage);
            return NextResponse.json({
              success: true,
              damageDealt: damage,
              newHp: result.raid.current_hp,
              isDefeated: result.completedNow,
              rewardGold: result.rewardGold,
              rewardXp: result.rewardXp,
            });
          }

          if (!raid.is_active) {
            return NextResponse.json({ success: false, error: 'Boss raid protocol is inactive or ended' }, { status: 400 });
          }

          if (raid.current_hp <= 0) {
            return NextResponse.json({ success: false, error: 'Boss has already been neutralized' }, { status: 400 });
          }

          // 2. Compute damage & new HP
          const newHp = Math.max(0, raid.current_hp - damage);
          const isDefeated = newHp === 0;

          // 3. Atomically update boss raid HP
          await supabase
            .from('boss_raids')
            .update({
              current_hp: newHp,
              updated_at: new Date().toISOString(),
            })
            .eq('id', raidId);

          // 4. Record action log
          await supabase.from('boss_raid_actions').insert({
            boss_raid_id: raidId,
            profile_id: userId,
            action_type: actionType,
            damage,
            details: { strikeTimestamp: new Date().toISOString() },
          });

          // 5. Update or insert player's progress
          const { data: currentProgress } = await supabase
            .from('boss_raid_progress')
            .select('*')
            .eq('profile_id', userId)
            .eq('boss_raid_id', raidId)
            .maybeSingle();

          const updatedDirectives = (currentProgress?.directives_completed || 0) + 1;
          const updatedDamage = (currentProgress?.damage_dealt || 0) + damage;

          await supabase.from('boss_raid_progress').upsert({
            profile_id: userId,
            boss_raid_id: raidId,
            directives_completed: updatedDirectives,
            damage_dealt: updatedDamage,
            expires_at: raid.end_at,
            is_completed: isDefeated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'profile_id,boss_raid_id' });

          // 6. If boss is defeated, reward the player
          let rewardedGold = 0;
          let rewardedXp = 0;
          if (isDefeated && !currentProgress?.reward_claimed) {
            rewardedGold = raid.reward_gold;
            rewardedXp = raid.reward_xp;

            const { data: profile } = await supabase
              .from('profiles')
              .select('gold_balance, xp_current')
              .eq('id', userId)
              .single();

            if (profile) {
              const newBalance = profile.gold_balance + rewardedGold;
              const newXp = profile.xp_current + rewardedXp;

              await supabase
                .from('profiles')
                .update({
                  gold_balance: newBalance,
                  xp_current: newXp,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

              // Ledger entry
              await supabase.from('gold_transactions').insert({
                profile_id: userId,
                type: 'BOSS_REWARD',
                amount: rewardedGold,
                balance_after: newBalance,
                source: `Boss Raid Defeated: ${raid.title}`,
                reference_id: raid.id,
              });

              await supabase
                .from('boss_raid_progress')
                .update({ reward_claimed: true })
                .eq('profile_id', userId)
                .eq('boss_raid_id', raidId);
            }
          }

          // Sync to DataStore for local state cache
          db.attackBossRaid(userId, raidId, damage);

          return NextResponse.json({
            success: true,
            damageDealt: damage,
            newHp,
            isDefeated,
            rewardGold: rewardedGold,
            rewardXp: rewardedXp,
          });
        }
      } catch (err: any) {
        console.warn('[BossAction API] Supabase write fallback to DataStore:', err);
      }
    }

    // Local DataStore fallback
    const result = db.attackBossRaid(userId, raidId, damage);
    return NextResponse.json({
      success: true,
      damageDealt: damage,
      newHp: result.raid.current_hp,
      isDefeated: result.completedNow,
      rewardGold: result.rewardGold,
      rewardXp: result.rewardXp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute boss raid strike' },
      { status: 500 }
    );
  }
}
