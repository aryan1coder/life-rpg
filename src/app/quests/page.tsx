'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { formatTimeRemaining } from '@/lib/game/boss-raids';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Brain,
  Shield,
  Heart,
  Dumbbell,
  Palette,
  Flame,
  Swords,
  Layers,
} from 'lucide-react';

export default function QuestsPage() {
  const { quests, bossRaid, completeQuest, setCreateQuestModalOpen } = useGame();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Daily' | 'Campaigns' | 'Boss Raids' | 'Completed'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [attributeFilter, setAttributeFilter] = useState('All');
  const [countdownText, setCountdownText] = useState('02:18:42 remaining');

  useEffect(() => {
    if (!bossRaid) return;
    const interval = setInterval(() => {
      setCountdownText(formatTimeRemaining(bossRaid.expires_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [bossRaid]);

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

  const filteredQuests = quests.filter((q) => {
    // Tab Filter
    if (activeFilter === 'Active' && q.status !== 'active') return false;
    if (activeFilter === 'Completed' && q.status !== 'completed') return false;
    if (activeFilter === 'Daily' && q.frequency !== 'Daily') return false;
    if (activeFilter === 'Campaigns' && q.frequency !== 'Campaign') return false;
    if (activeFilter === 'Boss Raids' && q.frequency !== 'Boss Raid') return false;

    // Difficulty Filter
    if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;

    // Attribute Filter
    if (attributeFilter !== 'All' && q.attribute !== attributeFilter) return false;

    return true;
  });

  const activeCount = quests.filter((q) => q.status === 'active').length;
  const completedCount = quests.filter((q) => q.status === 'completed').length;

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-6">
        {/* Header Bar */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
                Quests & Missions
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated text-primary font-mono text-xs border border-border-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Season 03
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              {activeCount} active protocols · {completedCount} completed today ·{' '}
              <span className="text-primary font-medium">+840 XP available</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateQuestModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Quest</span>
            </button>
          </div>
        </section>

        {/* Tactical Segmented Filter & Controls */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {(
              [
                { label: 'All', count: quests.length },
                { label: 'Active', count: activeCount },
                { label: 'Daily', count: quests.filter((q) => q.frequency === 'Daily').length },
                { label: 'Campaigns', count: quests.filter((q) => q.frequency === 'Campaign').length },
                { label: 'Boss Raids', count: quests.filter((q) => q.frequency === 'Boss Raid').length },
                { label: 'Completed', count: completedCount },
              ] as const
            ).map((tab) => {
              const isSelected = activeFilter === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveFilter(tab.label)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-surface-elevated text-text-primary border border-border-subtle shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
                  }`}
                  type="button"
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-surface-container-high text-text-primary'
                        : 'bg-surface-container text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-text-secondary hover:text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Normal">Normal</option>
              <option value="Hard">Hard</option>
              <option value="Epic">Epic</option>
            </select>

            <select
              value={attributeFilter}
              onChange={(e) => setAttributeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-text-secondary hover:text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="All">Attribute: All</option>
              <option value="Intellect">Intellect</option>
              <option value="Discipline">Discipline</option>
              <option value="Vitality">Vitality</option>
              <option value="Strength">Strength</option>
              <option value="Creativity">Creativity</option>
            </select>
          </div>
        </section>

        {/* Priority Bento: Boss Raid (7 cols) + Recovery Protocol (5 cols) */}
        {bossRaid && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-2">
            {/* Boss Raid Card */}
            <div className="lg:col-span-7 rounded-2xl bg-surface border border-crimson-threat/30 p-6 lg:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-crimson-threat/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-crimson-threat/10 text-crimson-threat font-mono text-[11px] font-bold uppercase tracking-wider border border-crimson-threat/20">
                      <Flame className="w-3.5 h-3.5" />
                      BOSS RAID
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      {bossRaid.threat_level}
                    </span>
                  </div>

                  {/* Pulse Countdown */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container font-mono text-xs text-text-primary border border-border-subtle">
                    <span className="w-2 h-2 rounded-full bg-crimson-threat animate-ping" />
                    <span>{countdownText}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-display font-semibold text-text-primary tracking-tight">
                    {bossRaid.title}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {bossRaid.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">
                      Directives Conquered ({bossRaid.directives_completed}/{bossRaid.required_directives})
                    </span>
                    <span className="text-crimson-threat font-semibold">
                      {Math.round((bossRaid.directives_completed / bossRaid.required_directives) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                    <div
                      className="h-full bg-crimson-threat rounded-full"
                      style={{
                        width: `${(bossRaid.directives_completed / bossRaid.required_directives) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs font-mono">
                  <span className="text-text-muted">
                    Bounty: +{bossRaid.reward_xp} XP, +{bossRaid.reward_gold} G
                  </span>
                  <span className="text-emerald-complete font-medium">
                    Verified Multi-Stage
                  </span>
                </div>
              </div>
            </div>

            {/* Grace Period Card */}
            <div className="lg:col-span-5 rounded-2xl bg-surface border border-border-subtle p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Operational Recovery
                </span>
                <span className="font-mono text-[10px] text-amber-streak">
                  NON-PUNITIVE
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  48-Hour Grace Cadence
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  LIFE RPG enforces restorative progress over arbitrary penalty loops. Expired daily protocols enter grace status for up to 48 hours.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-text-muted pt-2 border-t border-border-subtle">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>Zero XP penalties for rescheduled directives.</span>
              </div>
            </div>
          </div>
        )}

        {/* Quests Stream List */}
        <div className="flex flex-col gap-3">
          {filteredQuests.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-border-subtle text-center flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-text-muted opacity-60" />
              <h3 className="text-sm font-semibold text-text-primary">
                No matching protocols found
              </h3>
              <p className="text-xs text-text-muted max-w-sm">
                No directives correspond to the selected filters. Clear your filter criteria or deploy a new protocol.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('All');
                  setDifficultyFilter('All');
                  setAttributeFilter('All');
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-surface-elevated text-text-primary text-xs font-semibold hover:bg-surface-bright transition-all"
                type="button"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const isCompleted = quest.status === 'completed';

              return (
                <article
                  key={quest.id}
                  className={`p-4 rounded-2xl bg-surface border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isCompleted
                      ? 'border-emerald-complete/30 opacity-75'
                      : 'border-border-subtle hover:border-border-subtle-hover'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-complete/10 border-emerald-complete/20'
                          : 'bg-surface-elevated border-border-subtle'
                      }`}
                    >
                      {getAttributeIcon(quest.attribute)}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-semibold text-text-primary truncate ${
                            isCompleted ? 'line-through text-text-muted' : ''
                          }`}
                        >
                          {quest.title}
                        </h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                          {quest.difficulty} · {quest.frequency}
                        </span>
                        {isCompleted && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-complete/10 text-emerald-complete border border-emerald-complete/20">
                            ✓ Conquered
                          </span>
                        )}
                      </div>
                      {quest.description && (
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {quest.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rewards & Complete Button */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        +{quest.xp_reward} XP
                      </span>
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                        +{quest.gold_reward} G
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="px-4 py-1.5 rounded-lg bg-surface-elevated text-text-muted font-mono text-xs flex items-center gap-1.5 border border-border-subtle">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-complete" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-complete/15 hover:bg-emerald-complete text-emerald-complete hover:text-white border border-emerald-complete/30 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                        type="button"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
