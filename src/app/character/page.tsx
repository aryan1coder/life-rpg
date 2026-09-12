'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { calculateLevelProgress, getEvolutionTierForLevel, getNextEvolutionTier, getTitleForLevel } from '@/lib/game/progression';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import { AvatarSlot } from '@/lib/game/types';
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
  User,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function CharacterPage() {
  const {
    profile,
    attributes,
    avatarItems,
    avatarUnlocks,
    avatarLoadout,
    equipAvatarItem,
    unequipAvatarSlot,
    setProfileModalOpen,
  } = useGame();

  const [selectedSlot, setSelectedSlot] = useState<AvatarSlot>('body');

  const level = profile?.level ?? 1;
  const xpCurrent = profile?.xp_current ?? 0;
  const xpNext = profile?.xp_next_level ?? 1000;
  const xpPercent = calculateLevelProgress(xpCurrent, xpNext);

  const currentTier = getEvolutionTierForLevel(level);
  const nextTier = getNextEvolutionTier(level);

  const attributeList = [
    {
      name: 'Intellect',
      code: 'INT',
      value: attributes?.intellect ?? 50,
      delta: attributes?.today_intellect_delta ?? 0,
      description: 'Computational modeling, system architecture, algorithm design',
      color: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      icon: Brain,
    },
    {
      name: 'Discipline',
      code: 'DIS',
      value: attributes?.discipline ?? 50,
      delta: attributes?.today_discipline_delta ?? 0,
      description: 'Deep work focus blocks, habit adherence, minimal distraction',
      color: 'text-violet-400',
      barColor: 'bg-violet-500',
      icon: Shield,
    },
    {
      name: 'Vitality',
      code: 'VIT',
      value: attributes?.vitality ?? 50,
      delta: attributes?.today_vitality_delta ?? 0,
      description: 'Sleep hygiene, mental recovery, physiological endurance',
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      icon: Heart,
    },
    {
      name: 'Strength',
      code: 'STR',
      value: attributes?.strength ?? 50,
      delta: attributes?.today_strength_delta ?? 0,
      description: 'High pressure delivery, raw engineering momentum, resilience',
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
      icon: Dumbbell,
    },
    {
      name: 'Creativity',
      code: 'CRE',
      value: attributes?.creativity ?? 50,
      delta: attributes?.today_creativity_delta ?? 0,
      description: 'Lateral thinking, UX fidelity, novel problem formulation',
      color: 'text-rose-400',
      barColor: 'bg-rose-500',
      icon: Palette,
    },
  ];

  const slotsList: { slot: AvatarSlot; label: string }[] = [
    { slot: 'body', label: 'Body Garments' },
    { slot: 'outerwear', label: 'Outerwear / Rig' },
    { slot: 'face', label: 'Optics / Visor' },
    { slot: 'head', label: 'Headwear' },
    { slot: 'accessory', label: 'Accessory / Drone' },
    { slot: 'weapon_or_tool', label: 'Tool / Weapon' },
    { slot: 'aura', label: 'Aura / Lattice' },
    { slot: 'shoes', label: 'Footwear' },
    { slot: 'legs', label: 'Trousers' },
  ];

  // Items for currently selected slot
  const slotItems = avatarItems.filter((i) => i.slot === selectedSlot);
  const equippedItemId = avatarLoadout[selectedSlot];

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 flex flex-col gap-8 pb-24 lg:pb-12">
        {/* Hero Identity + Large Character Showcase */}
        <section className="relative overflow-hidden rounded-3xl bg-surface border border-border-subtle p-6 lg:p-8 shadow-sm">
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: currentTier.accentColor }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Avatar Showcase */}
            <div className="flex flex-col items-center flex-shrink-0">
              <AvatarRenderer
                level={level}
                equippedLoadout={avatarLoadout}
                size="lg"
                showBadge={false}
              />
            </div>

            {/* Center: Name, Rank & Telemetry */}
            <div className="flex-1 flex flex-col gap-4 text-center lg:text-left">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
                    {profile?.display_name || profile?.username || 'Operator'}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-surface-elevated font-mono text-xs text-primary border border-border-subtle uppercase tracking-wider font-semibold">
                    {profile?.title || getTitleForLevel(level)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-elevated font-mono text-xs text-emerald-complete border border-border-subtle flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-complete" />
                    Tier {currentTier.tier} Operative
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto lg:mx-0">
                  {profile?.bio || 'Initiate Strategic Protocol · Systems Architecture & Execution'}
                </p>
              </div>

              {/* Status Metric Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
                  <Flame className="w-3.5 h-3.5 text-amber-streak" />
                  <span className="font-mono text-xs text-text-primary font-semibold">
                    {profile?.streak_days ?? 0}-Day Streak
                  </span>
                  <span className="font-mono text-[11px] text-amber-streak">
                    {(profile?.streak_multiplier ?? 1.0).toFixed(2)}× Boost
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-xs text-text-primary font-semibold">
                    {xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    ({xpPercent}%)
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
                  <Coins className="w-3.5 h-3.5 text-secondary" />
                  <span className="font-mono text-xs text-secondary font-semibold">
                    {(profile?.gold_balance ?? 0).toLocaleString()} G
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-bright text-text-primary border border-border-subtle text-xs font-semibold transition-all shadow-sm"
              >
                <User className="w-4 h-4 text-primary" />
                <span>Edit Profile</span>
              </button>
              <Link
                href="/lobby"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Return to Lobby</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Evolution Milestone Card (Detailed Progression) */}
        <section className="p-6 rounded-3xl bg-surface border border-border-subtle flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-text-primary">
                Avatar Visual Evolution Milestone
              </h2>
            </div>
            <span className="font-mono text-xs text-text-muted">
              CURRENT: TIER {currentTier.tier} · {currentTier.name}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-primary">
                {currentTier.name} → {nextTier ? nextTier.name : 'Max Tier'}
              </span>
              <p className="text-xs text-text-secondary">
                {nextTier
                  ? `Next Visual Evolution unlocks at Level ${nextTier.minLevel}. ${Math.max(1, nextTier.minLevel - level)} levels remaining.`
                  : 'Highest visual evolution tier unlocked! You possess the Sovereign Ascendant aura.'}
              </p>
            </div>

            {nextTier && (
              <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Unlock: {nextTier.signatureGear}</span>
              </div>
            )}
          </div>
        </section>

        {/* 2-Column Grid: Core Capacities (Left 6) + Avatar Gear Loadout (Right 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Attributes Engine */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">
                Core Cognitive & Physical Attributes
              </h3>
              <span className="font-mono text-xs text-text-muted">DYNAMIC (1-100)</span>
            </div>

            <div className="flex flex-col gap-3">
              {attributeList.map((attr) => {
                const Icon = attr.icon;
                return (
                  <div
                    key={attr.code}
                    className="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-primary/30 transition-all flex flex-col gap-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center border border-border-subtle">
                          <Icon className={`w-4 h-4 ${attr.color}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-primary">
                            {attr.name}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted">
                            Vector // {attr.code}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-base font-bold text-text-primary">
                        {attr.value}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                      <div
                        className={`h-full ${attr.barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, attr.value)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Avatar Equipment & Loadout Inspector */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Avatar Equipment Loadout
                </h3>
              </div>
              <span className="font-mono text-xs text-text-muted">SERVER AUTHORITATIVE</span>
            </div>

            {/* Slot Tab Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {slotsList.map((s) => {
                const isSelected = selectedSlot === s.slot;
                const isEquipped = Boolean(avatarLoadout[s.slot]);
                return (
                  <button
                    key={s.slot}
                    type="button"
                    onClick={() => setSelectedSlot(s.slot)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle'
                    }`}
                  >
                    {isEquipped && <span className="w-1.5 h-1.5 rounded-full bg-emerald-complete" />}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Items Available in Selected Slot */}
            <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3 min-h-[320px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                <span className="font-mono text-xs text-text-muted uppercase">
                  Slot: {selectedSlot}
                </span>
                {equippedItemId && (
                  <button
                    type="button"
                    onClick={() => unequipAvatarSlot(selectedSlot)}
                    className="text-xs text-crimson-failed hover:underline font-mono"
                  >
                    Unequip Slot
                  </button>
                )}
              </div>

              {slotItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted text-xs">
                  <span>No catalog items defined for this slot yet.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {slotItems.map((item) => {
                    const isUnlocked = avatarUnlocks.includes(item.id);
                    const isEquipped = avatarLoadout[selectedSlot] === item.id;
                    const canEquip = isUnlocked && level >= item.required_level;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isEquipped
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : isUnlocked
                            ? 'bg-surface-elevated border-border-subtle hover:border-white/20'
                            : 'bg-surface-elevated/40 border-border-subtle opacity-60'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-primary">
                              {item.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono text-secondary">
                              {item.rarity}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-text-muted line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {!isUnlocked && (
                            <span className="font-mono text-[10px] text-amber-streak flex items-center gap-1 mt-0.5">
                              <Lock className="w-3 h-3" /> Unlocks at Level {item.required_level}
                            </span>
                          )}
                        </div>

                        <div>
                          {isEquipped ? (
                            <span className="px-3 py-1 rounded-lg bg-emerald-complete/20 text-emerald-complete border border-emerald-complete/30 text-xs font-semibold font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" /> Equipped
                            </span>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => equipAvatarItem(item.id)}
                              className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold font-mono transition-all active:scale-95"
                            >
                              Equip
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-text-muted text-xs font-mono">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
