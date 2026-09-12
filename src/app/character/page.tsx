'use client';

import React from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { calculateLevelProgress } from '@/lib/game/progression';
import {
  Shield,
  Brain,
  Heart,
  Dumbbell,
  Palette,
  Flame,
  Coins,
  Zap,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function CharacterPage() {
  const { profile, attributes, loadout } = useGame();

  const level = profile?.level ?? 12;
  const xpCurrent = profile?.xp_current ?? 8260;
  const xpNext = profile?.xp_next_level ?? 10000;
  const xpPercent = calculateLevelProgress(xpCurrent, xpNext);

  const attributeList = [
    {
      name: 'Intellect',
      code: 'INT',
      value: attributes?.intellect ?? 86,
      delta: attributes?.today_intellect_delta ?? 5,
      description: 'Computational modeling, system architecture, algorithm design',
      color: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      icon: Brain,
    },
    {
      name: 'Discipline',
      code: 'DIS',
      value: attributes?.discipline ?? 91,
      delta: attributes?.today_discipline_delta ?? 2,
      description: 'Deep work focus blocks, habit adherence, minimal distraction',
      color: 'text-violet-400',
      barColor: 'bg-violet-500',
      icon: Shield,
    },
    {
      name: 'Vitality',
      code: 'VIT',
      value: attributes?.vitality ?? 78,
      delta: attributes?.today_vitality_delta ?? 4,
      description: 'Sleep hygiene, mental recovery, physiological endurance',
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      icon: Heart,
    },
    {
      name: 'Strength',
      code: 'STR',
      value: attributes?.strength ?? 72,
      delta: attributes?.today_strength_delta ?? 3,
      description: 'Physical resistance training, athletic stamina, motor power',
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
      icon: Dumbbell,
    },
    {
      name: 'Creativity',
      code: 'CRE',
      value: attributes?.creativity ?? 64,
      delta: attributes?.today_creativity_delta ?? 1,
      description: 'Synthesis, generative problem solving, UX aesthetic refinement',
      color: 'text-rose-400',
      barColor: 'bg-rose-500',
      icon: Palette,
    },
  ];

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Hero Profile Identity Card */}
        <section className="relative overflow-hidden rounded-3xl bg-surface border border-border-subtle p-6 lg:p-8 shadow-sm">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Wrapper */}
              <div className="relative group">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-elevated shadow-md border border-primary/30">
                  <img
                    className="w-full h-full object-cover"
                    alt="Cybernetic styled character portrait of Kai"
                    src={
                      profile?.avatar_url ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I'
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent" />
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-surface-elevated font-mono text-[11px] text-primary border border-border-subtle font-bold uppercase shadow-sm">
                  LVL {level}
                </span>
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-complete ring-2 ring-surface" />
              </div>

              {/* Name & Title Telemetry */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
                    {profile?.username || 'Kai'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-elevated font-mono text-xs text-cyan-400 border border-border-subtle uppercase tracking-wider">
                    {profile?.title || 'Arch-Strategist II'}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-elevated font-mono text-xs text-text-muted border border-border-subtle">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-complete" />
                    Synchronized
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary">
                  Tier 2 Neural Class · Systems Architecture & Strategic Execution
                </p>

                {/* Quick Status Pills */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle">
                    <Flame className="w-3.5 h-3.5 text-amber-streak" />
                    <span className="font-mono text-xs text-text-primary">
                      {profile?.streak_days ?? 14}-Day Streak
                    </span>
                    <span className="font-mono text-[11px] text-amber-streak">
                      {(profile?.streak_multiplier ?? 1.15).toFixed(2)}× Boost
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-xs text-text-primary">
                      {xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">
                      ({xpPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle">
                    <Coins className="w-3.5 h-3.5 text-secondary" />
                    <span className="font-mono text-xs text-secondary font-semibold">
                      {(profile?.gold_balance ?? 1420).toLocaleString()} G
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-3 w-full sm:w-auto self-end lg:self-center">
              <Link
                href="/inventory"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated text-text-primary hover:bg-surface-bright border border-border-subtle text-xs font-medium transition-all"
              >
                <span>Customize Loadout</span>
              </Link>
              <Link
                href="/achievements"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>View Accolades</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Column Bento: Attribute Capacity Engine (Left 7) + Evolution Chronicle (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Core Capacities Engine */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-semibold text-text-primary tracking-tight">
                  Core Capacities & Attributes
                </h2>
                <span className="px-2 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-text-muted border border-border-subtle">
                  7-DAY LEDGER
                </span>
              </div>
              <span className="font-mono text-xs text-emerald-complete">
                +15 NET GAIN TODAY
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {attributeList.map((attr) => {
                const Icon = attr.icon;
                return (
                  <div
                    key={attr.code}
                    className="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-border-subtle-hover transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${attr.color}`} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">
                              {attr.name}
                            </span>
                            <span className="font-mono text-[10px] text-text-muted">
                              [{attr.code}]
                            </span>
                          </div>
                          <span className="text-[11px] text-text-secondary">
                            {attr.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-base font-bold text-text-primary">
                            {attr.value}
                          </span>
                          <span className="text-xs text-text-muted">/100</span>
                        </div>
                        {attr.delta > 0 && (
                          <span className="font-mono text-[10px] text-emerald-complete flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +{attr.delta} today
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                      <div
                        className={`h-full ${attr.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${attr.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Career Evolution Chronicle */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-text-primary tracking-tight">
                Career Evolution Chronicle
              </h2>
              <span className="font-mono text-xs text-primary">TIER PATHWAY</span>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-6">
              {[
                {
                  tier: 'Tier I · Novice Tactician',
                  levelReq: 'Levels 1–9',
                  status: 'conquered',
                  description: 'Foundational habit discipline and tactical directive completion.',
                },
                {
                  tier: 'Tier II · Arch-Strategist',
                  levelReq: 'Levels 10–19',
                  status: 'active',
                  description: 'Active operating status. Systems architecture and distributed focus blocks.',
                },
                {
                  tier: 'Tier III · High-Commander',
                  levelReq: 'Levels 20–29',
                  status: 'locked',
                  description: 'Unlocks autonomous subroutines, team synchronization, and macro milestones.',
                },
                {
                  tier: 'Tier IV · Sovereign Architect',
                  levelReq: 'Level 30+',
                  status: 'locked',
                  description: 'Ultimate mastery over personal cognitive output and lifetime execution.',
                },
              ].map((path, idx) => {
                const isConquered = path.status === 'conquered';
                const isActive = path.status === 'active';

                return (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Connecting Line */}
                    {idx < 3 && (
                      <div
                        className={`absolute top-8 left-4 w-0.5 h-12 -ml-px ${
                          isConquered ? 'bg-emerald-complete' : 'bg-border-subtle'
                        }`}
                      />
                    )}

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10 border ${
                        isConquered
                          ? 'bg-emerald-complete/15 border-emerald-complete text-emerald-complete'
                          : isActive
                          ? 'bg-primary/20 border-primary text-primary animate-pulse'
                          : 'bg-surface-elevated border-border-subtle text-text-muted'
                      }`}
                    >
                      {isConquered && <CheckCircle2 className="w-4 h-4" />}
                      {isActive && <Zap className="w-4 h-4" />}
                      {!isConquered && !isActive && <Lock className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {path.tier}
                        </h3>
                        <span className="font-mono text-[10px] text-text-muted">
                          [{path.levelReq}]
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {path.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
