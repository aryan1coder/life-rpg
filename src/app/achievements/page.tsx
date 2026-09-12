'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { getTitleForLevel } from '@/lib/game/progression';
import {
  Award,
  Coins,
  CheckCircle2,
  Lock,
  Flame,
  ShieldCheck,
  Zap,
  Target,
  Flag,
  Sparkles,
} from 'lucide-react';

export default function AchievementsPage() {
  const { achievements, profile } = useGame();

  const [activeTab, setActiveTab] = useState<'All' | 'Unlocked' | 'In Progress' | 'Locked'>('All');

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievements.length || 8;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((ach) => {
    if (activeTab === 'Unlocked' && !ach.is_unlocked) return false;
    if (activeTab === 'In Progress' && (ach.is_unlocked || ach.current_progress === 0)) return false;
    if (activeTab === 'Locked' && (ach.is_unlocked || (ach.current_progress ?? 0) > 0)) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Page Header & Accolade Summary */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                Field Dossier // Accolades
              </span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span className="font-mono text-xs text-text-muted">
                {profile?.display_name || profile?.username || 'Operator'} · {profile?.title || getTitleForLevel(profile?.level ?? 1)}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
              Achievements & Milestones
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              Permanent accolades earned through consistent execution and disciplined daily operating velocity.
            </p>
          </div>

          {/* Right Telemetry Badges Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface border border-border-subtle shadow-sm">
              <Award className="w-4 h-4 text-emerald-complete" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">
                  Global Unlocked
                </span>
                <span className="font-mono text-sm font-bold text-text-primary">
                  {unlockedCount} / {totalCount}{' '}
                  <span className="text-emerald-complete font-semibold">
                    ({completionPercent}%)
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface border border-border-subtle shadow-sm">
              <Coins className="w-4 h-4 text-secondary" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">
                  Accolade Yield
                </span>
                <span className="font-mono text-sm font-bold text-secondary">
                  +1,850 G Earned
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bento Strip (3 Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Master Completion */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  Trajectory Matrix
                </span>
                <h2 className="text-base font-display font-semibold text-text-primary mt-0.5">
                  Master Completion
                </h2>
              </div>
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-primary">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-text-primary font-bold">
                  {unlockedCount} / {totalCount} Unlocked
                </span>
                <span className="text-text-secondary">{completionPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Priority Focus Track */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-amber-streak uppercase tracking-wider">
                  Active Priority Focus
                </span>
                <h2 className="text-base font-display font-semibold text-text-primary mt-0.5">
                  Fortnight Discipline
                </h2>
              </div>
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-amber-streak">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-text-primary font-bold">14 / 14 Days</span>
                <span className="text-emerald-complete">Conquered!</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                <div className="h-full bg-amber-streak rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Card 3: Milestone Yield Rewards */}
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  Vault Multiplier
                </span>
                <h2 className="text-base font-display font-semibold text-text-primary mt-0.5">
                  Accolade Bounties
                </h2>
              </div>
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-secondary">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Every milestone unlock grants instant XP and Vault Gold credits to accelerate catalog unlocks.
            </p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="flex items-center gap-2">
          {(['All', 'Unlocked', 'In Progress', 'Locked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-surface-elevated text-text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </section>

        {/* Accolades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.is_unlocked;
            const progress = ach.current_progress ?? 0;
            const target = ach.target_value;
            const progressPercent = Math.min(100, Math.round((progress / target) * 100));

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl bg-surface border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'border-emerald-complete/30'
                    : 'border-border-subtle hover:border-border-subtle-hover'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                      isUnlocked
                        ? 'bg-emerald-complete/15 border-emerald-complete/40 text-emerald-complete'
                        : progress > 0
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-surface-elevated border-border-subtle text-text-muted'
                    }`}
                  >
                    {isUnlocked ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : progress > 0 ? (
                      <Target className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {ach.title}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                        {ach.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Footer / Progress */}
                <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
                  {!isUnlocked && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-text-secondary">
                        {progress} / {target} ({progressPercent}%)
                      </span>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-text-muted">
                      Yield: +{ach.reward_xp} XP, +{ach.reward_gold} G
                    </span>
                    {isUnlocked ? (
                      <span className="text-emerald-complete font-medium">
                        ✓ Claimed & Unlocked
                      </span>
                    ) : (
                      <span className="text-text-muted">In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
