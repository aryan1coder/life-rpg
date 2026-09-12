'use client';

import React from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { calculateLevelProgress } from '@/lib/game/progression';
import {
  Sparkles,
  Plus,
  Flame,
  Coins,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Shield,
  Heart,
  Dumbbell,
  Palette,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const {
    profile,
    attributes,
    quests,
    campaign,
    completeQuest,
    setCreateQuestModalOpen,
    refreshAll,
  } = useGame();

  const level = profile?.level ?? 12;
  const xpCurrent = profile?.xp_current ?? 8260;
  const xpNext = profile?.xp_next_level ?? 10000;
  const gold = profile?.gold_balance ?? 1420;
  const streak = profile?.streak_days ?? 14;
  const title = profile?.title ?? 'Arch-Strategist II';

  const xpPercent = calculateLevelProgress(xpCurrent, xpNext);

  // Active Daily Priorities
  const activeDailyQuests = quests.filter((q) => q.status === 'active').slice(0, 4);

  const getAttributeIcon = (attr: string) => {
    switch (attr) {
      case 'Intellect':
        return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'Discipline':
        return <Shield className="w-4 h-4 text-violet-400" />;
      case 'Vitality':
        return <Heart className="w-4 h-4 text-emerald-400" />;
      case 'Strength':
        return <Dumbbell className="w-4 h-4 text-amber-400" />;
      case 'Creativity':
      default:
        return <Palette className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Top Greeting & Action Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Cycle 284 · Meridian Shift
              </span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span className="font-mono text-xs text-emerald-complete flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-complete animate-pulse" />
                Neural Sync Live
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
                Good evening, {profile?.username || 'Kai'}
              </h1>
              <span className="text-base text-primary font-normal">
                Level {level} · {title}
              </span>
            </div>
          </div>

          {/* Quick Action Array */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => refreshAll()}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle shadow-sm transition-all text-xs font-medium"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Sync Telemetry</span>
              <span className="font-mono text-[10px] text-text-muted ml-1">⌥S</span>
            </button>
            <button
              onClick={() => setCreateQuestModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Quest</span>
              <span className="font-mono text-[10px] text-white/70 ml-1">⌘N</span>
            </button>
          </div>
        </div>

        {/* Hero Progression Canvas */}
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-border-subtle p-6 lg:p-8 shadow-sm">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Avatar + Class Meta */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <img
                    alt="Character Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border border-primary/30 shadow-md ring-1 ring-primary/20"
                    src={
                      profile?.avatar_url ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I'
                    }
                  />
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-surface-elevated font-mono text-[11px] text-primary font-bold shadow-sm border border-border-subtle">
                    LVL {level}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                      Domain Specialization
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-cyan-400 border border-border-subtle">
                      TIER II
                    </span>
                  </div>
                  <span className="text-xl font-display font-semibold text-text-primary tracking-tight">
                    {title}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Next threshold unlocks Cognitive Subroutines & Co-Pilot Specialization
                  </span>
                </div>
              </div>

              {/* Telemetry Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-text-muted uppercase">
                      Active Streak
                    </span>
                    <Flame className="w-4 h-4 text-amber-streak" />
                  </div>
                  <span className="font-mono text-lg font-bold text-amber-streak mt-1">
                    {streak} DAYS
                  </span>
                  <span className="font-mono text-[10px] text-text-muted mt-0.5">
                    Multiplier x{(profile?.streak_multiplier ?? 1.15).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-text-muted uppercase">
                      Gold Vault
                    </span>
                    <Coins className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="font-mono text-lg font-bold text-secondary mt-1">
                    {gold.toLocaleString()} G
                  </span>
                  <span className="font-mono text-[10px] text-text-muted mt-0.5">
                    Authoritative Balance
                  </span>
                </div>
              </div>
            </div>

            {/* Smooth Level XP Progress Bar */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-secondary">Level {level} Progress</span>
                <span className="text-text-primary font-semibold">
                  {xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Bento: Daily Protocols (Left 8) + Capacity Radar & Campaign (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Daily Protocol Triage */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-display font-semibold text-text-primary tracking-tight">
                  Daily Protocol Triage
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated font-mono text-[11px] text-text-muted border border-border-subtle">
                  {activeDailyQuests.length} Priority Directives
                </span>
              </div>
              <button
                onClick={() => setCreateQuestModalOpen(true)}
                className="text-xs font-mono text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                type="button"
              >
                <span>+ Add Task</span>
              </button>
            </div>

            {activeDailyQuests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface border border-border-subtle text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-complete opacity-80" />
                <h3 className="text-sm font-semibold text-text-primary">
                  All active protocols cleared!
                </h3>
                <p className="text-xs text-text-muted max-w-sm">
                  Command log is clear for today. Initialize a new quest directive to accelerate your XP trajectory.
                </p>
                <button
                  onClick={() => setCreateQuestModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all"
                  type="button"
                >
                  + Initialize Protocol
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeDailyQuests.map((quest) => (
                  <article
                    key={quest.id}
                    className="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-border-subtle-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Attribute Icon Badge */}
                      <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center flex-shrink-0">
                        {getAttributeIcon(quest.attribute)}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-text-primary truncate">
                            {quest.title}
                          </h3>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                            {quest.difficulty} · {quest.frequency}
                          </span>
                        </div>
                        {quest.description && (
                          <p className="text-xs text-text-secondary line-clamp-1">
                            {quest.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reward Tags & Complete CTA */}
                    <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                          +{quest.xp_reward} XP
                        </span>
                        <span className="px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                          +{quest.gold_reward} G
                        </span>
                      </div>
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-complete/15 hover:bg-emerald-complete text-emerald-complete hover:text-white border border-emerald-complete/30 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                        type="button"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Attribute Radar Matrix & Active Campaign */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Core Capacities Matrix */}
            <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                  Core Capacities
                </span>
                <span className="font-mono text-[10px] text-primary">5-FACTOR RADAR</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { name: 'Intellect', code: 'INT', val: attributes?.intellect ?? 86, delta: attributes?.today_intellect_delta ?? 5, color: 'bg-cyan-500' },
                  { name: 'Discipline', code: 'DIS', val: attributes?.discipline ?? 91, delta: attributes?.today_discipline_delta ?? 2, color: 'bg-violet-500' },
                  { name: 'Vitality', code: 'VIT', val: attributes?.vitality ?? 78, delta: attributes?.today_vitality_delta ?? 4, color: 'bg-emerald-500' },
                  { name: 'Strength', code: 'STR', val: attributes?.strength ?? 72, delta: attributes?.today_strength_delta ?? 3, color: 'bg-amber-500' },
                  { name: 'Creativity', code: 'CRE', val: attributes?.creativity ?? 64, delta: attributes?.today_creativity_delta ?? 1, color: 'bg-rose-500' },
                ].map((attr) => (
                  <div key={attr.code} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-text-primary">
                          {attr.code}
                        </span>
                        <span className="text-text-muted text-[11px]">{attr.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        {attr.delta > 0 && (
                          <span className="text-emerald-complete text-[11px]">
                            +{attr.delta}
                          </span>
                        )}
                        <span className="text-text-primary font-semibold">{attr.val}/100</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                      <div
                        className={`h-full ${attr.color} rounded-full transition-all duration-300`}
                        style={{ width: `${attr.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Campaign Widget */}
            {campaign && (
              <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                    Active Campaign
                  </span>
                  <span className="font-mono text-[10px] text-secondary">
                    STAGE {campaign.current_stage}/{campaign.total_stages}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>

                <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{
                      width: `${(campaign.current_stage / campaign.total_stages) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-text-muted">
                  <span>Reward: +{campaign.reward_xp} XP</span>
                  <span className="text-secondary font-semibold">
                    +{campaign.reward_gold} G
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
