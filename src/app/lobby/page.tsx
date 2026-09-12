'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { calculateLevelProgress, getEvolutionTierForLevel, getNextEvolutionTier, getTitleForLevel } from '@/lib/game/progression';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import {
  Sparkles,
  Flame,
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Plus,
  Compass,
  Award,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function LobbyPage() {
  const {
    profile,
    attributes,
    quests,
    avatarLoadout,
    loading,
    completeQuest,
    setCreateQuestModalOpen,
  } = useGame();

  const level = profile?.level ?? 1;
  const xpCurrent = profile?.xp_current ?? 0;
  const xpNext = profile?.xp_next_level ?? 1000;
  const gold = profile?.gold_balance ?? 0;
  const streak = profile?.streak_days ?? 0;
  const title = profile?.title || getTitleForLevel(level);

  const xpPercent = calculateLevelProgress(xpCurrent, xpNext);
  const currentTier = getEvolutionTierForLevel(level);
  const nextTier = getNextEvolutionTier(level);

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const rawName = profile?.display_name || profile?.username;
  const cleanName = rawName && rawName.trim().length > 0 && rawName.trim().length <= 40 ? rawName.trim() : 'Adventurer';
  const greeting = `${getGreeting()}, ${cleanName}`;

  if (loading && !profile) {
    return (
      <AppShell>
        <div className="w-full max-w-7xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest">
            Authorizing Command Deck Telemetry...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!loading && !profile) {
    return (
      <AppShell>
        <div className="w-full max-w-md mx-auto p-8 my-16 bg-surface border border-border-subtle rounded-3xl text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-white">Session Authorization Required</h2>
          <p className="text-xs text-text-secondary">Please sign in to access your operational directives and character ledger.</p>
          <Link
            href="/auth/login"
            className="mt-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-tight shadow-md transition-all"
          >
            Authenticate Operator
          </Link>
        </div>
      </AppShell>
    );
  }

  // 3-5 Priority Active Quests
  const activeQuests = quests.filter((q) => q.status === 'active').slice(0, 4);

  // Attribute icon helper
  const getAttributeColor = (attr: string) => {
    switch (attr) {
      case 'Intellect':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'Discipline':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'Strength':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Vitality':
        return 'text-emerald-complete bg-emerald-complete/10 border-emerald-complete/20';
      case 'Creativity':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 pb-24 lg:pb-12 lobby-container">
        {/* Top Header / Greeting Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                Command Deck Lobby // Node 01 Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Current Rank: <span className="text-text-primary font-semibold">{title}</span>
            </p>
          </div>

          {/* Quick Action Strip */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateQuestModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Directive</span>
            </button>
            <Link
              href="/character"
              className="px-4 py-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle hover:border-primary/40 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Armory & Loadout</span>
            </Link>
          </div>
        </header>

        {/* Mobile Landscape & Desktop Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lobby-grid">
          {/* CENTER HERO: Large Avatar Showcase (Col 1-7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-surface border border-border-subtle relative overflow-hidden shadow-xl lobby-hero-card">
            {/* Ambient Radial Mesh Behind Avatar */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentTier.accentColor }}
            />

            {/* Operator Identifier Ribbon */}
            <div className="w-full flex items-center justify-between mb-4 z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-primary font-semibold">
                  LVL {level}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {currentTier.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle">
                <Flame className="w-3.5 h-3.5 text-amber-streak" />
                <span className="font-mono text-xs text-amber-streak font-semibold">
                  {streak}D STREAK
                </span>
              </div>
            </div>

            {/* Prominent Multi-Tier Vector Avatar */}
            <div className="relative z-10 my-2">
              <AvatarRenderer
                level={level}
                equippedLoadout={avatarLoadout}
                size="hero"
                showBadge={true}
              />
            </div>

            {/* Avatar Navigation CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 z-10 w-full">
              <Link
                href="/character"
                className="px-5 py-2 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Customize Gear</span>
                <ArrowRight className="w-3 h-3 text-text-muted" />
              </Link>
              <Link
                href="/quests"
                className="px-5 py-2 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
              >
                <span>Browse All Quests</span>
                <ChevronRight className="w-3 h-3 text-text-muted" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Progression & Telemetry Status (Col 8-12 on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-5 lobby-status-col">
            {/* Level & XP Trajectory Card */}
            <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-text-primary">Executive Progression</span>
                </div>
                <span className="font-mono text-xs font-semibold text-primary">
                  {xpPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>{xpCurrent.toLocaleString()} XP</span>
                <span>{xpNext.toLocaleString()} XP Threshold</span>
              </div>
            </div>

            {/* Evolution Milestone Card (What Can I Unlock Next?) */}
            <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Visual Evolution
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
                  style={{
                    backgroundColor: `${currentTier.accentColor}20`,
                    color: currentTier.accentColor,
                  }}
                >
                  TIER {currentTier.tier} ACTIVE
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {currentTier.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {currentTier.description}
                </p>
              </div>

              {nextTier ? (
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    <span>Next: {nextTier.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-primary font-medium">
                    Level {nextTier.minLevel} ({Math.max(1, nextTier.minLevel - level)} lvl to go)
                  </span>
                </div>
              ) : (
                <div className="pt-3 border-t border-border-subtle text-xs text-emerald-complete font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Maximum Visual Evolution Conquered</span>
                </div>
              )}
            </div>

            {/* Core Attributes Matrix */}
            <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">Core Capacities</span>
                <span className="font-mono text-[10px] text-text-muted">DYNAMIC (1-100)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Intellect', val: attributes?.intellect ?? 50, color: '#6366F1' },
                  { label: 'Discipline', val: attributes?.discipline ?? 50, color: '#38BDF8' },
                  { label: 'Strength', val: attributes?.strength ?? 50, color: '#F59E0B' },
                  { label: 'Vitality', val: attributes?.vitality ?? 50, color: '#10B981' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between"
                  >
                    <span className="text-xs text-text-secondary">{item.label}</span>
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Active Directives Quick Strip (3-5 priority quests) */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Active Directives Queue</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-text-muted">
                {activeQuests.length} in progress
              </span>
            </div>
            <Link
              href="/quests"
              className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-mono"
            >
              <span>View All Directives</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeQuests.length === 0 ? (
            /* Empty State */
            <div className="w-full p-8 rounded-2xl bg-surface border border-dashed border-border-subtle text-center flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-complete" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  All Directives Conquered
                </h3>
                <p className="text-xs text-text-secondary max-w-sm">
                  Your operational board is clear. Initialize a new directive to maintain kinetic streak momentum.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateQuestModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all"
              >
                Create New Directive
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-md group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${getAttributeColor(quest.attribute)}`}>
                        {quest.attribute}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted uppercase">
                        {quest.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {quest.title}
                    </h4>
                    {quest.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {quest.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-primary font-semibold">+{quest.xp_reward} XP</span>
                      <span className="text-secondary font-semibold">+{quest.gold_reward} G</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => completeQuest(quest.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-emerald-complete hover:text-white border border-border-subtle hover:border-emerald-complete text-xs font-semibold text-text-primary transition-all flex items-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conclude</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
