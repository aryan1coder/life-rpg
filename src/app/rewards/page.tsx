'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { ItemCategory, RewardItem } from '@/lib/game/types';
import {
  Coins,
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
  const { rewards, inventory, profile, setRedeemItemTarget, setInsufficientFundsData } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const gold = profile?.gold_balance ?? 1420;
  const level = profile?.level ?? 12;

  const categories = ['All', 'Theme', 'Cosmetic', 'Badge', 'Title', 'Boost'];

  const filteredRewards = rewards.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleRedeemClick = (item: RewardItem) => {
    if (gold < item.cost_gold) {
      setInsufficientFundsData({
        required: item.cost_gold,
        balance: gold,
        shortfall: item.cost_gold - gold,
      });
    } else {
      setRedeemItemTarget(item);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Epic':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'Rare':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'Uncommon':
        return 'bg-emerald-complete/10 text-emerald-complete border-emerald-complete/30';
      case 'Common':
      default:
        return 'bg-surface-elevated text-text-muted border-border-subtle';
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Header & Vault Summary */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
                Rewards & Vault
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated text-secondary font-mono text-xs border border-border-subtle">
                <Coins className="w-3.5 h-3.5" />
                Curated Store
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              Convert your earned gold into tactile interface environments, cosmetic frames, and boost modules.
            </p>
          </div>

          {/* Vault Balance Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-subtle shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <Coins className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                Available Vault Reserve
              </span>
              <span className="font-mono text-2xl font-bold text-secondary">
                {gold.toLocaleString()} G
              </span>
            </div>
          </div>
        </section>

        {/* Hero Reward Showcase: Obsidian Deep-Work */}
        <section className="relative overflow-hidden rounded-3xl bg-surface border border-primary/30 p-6 lg:p-8 shadow-md">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-[11px] font-semibold uppercase">
                  Featured Environment · Rare
                </span>
                <span className="font-mono text-xs text-text-muted">
                  Requires Level 10+ (Met)
                </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">
                Obsidian Deep-Work Environment
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                High contrast monochrome palette tailored for extreme late-night uninterrupted engineering sprints. Strips distraction and locks focus into cold obsidian geometry.
              </p>

              <div className="flex items-center gap-4 pt-1 font-mono text-xs text-text-muted">
                <span>Accent: Electric Indigo (#6366F1)</span>
                <span>•</span>
                <span>Canvas: Pitch Obsidian (#0B0E15)</span>
              </div>
            </div>

            {/* Showcase Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 w-full lg:w-auto">
              <div className="flex flex-col items-center lg:items-end">
                <span className="font-mono text-[10px] text-text-muted uppercase">
                  Authorization Cost
                </span>
                <span className="font-mono text-2xl font-bold text-secondary">
                  750 G
                </span>
              </div>

              {inventory.includes('theme_deep_work_obsidian') ? (
                <Link
                  href="/inventory"
                  className="w-full lg:w-auto px-6 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-xs font-semibold hover:bg-surface-bright transition-all text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-complete" />
                  <span>Owned in Inventory</span>
                </Link>
              ) : (
                <button
                  onClick={() =>
                    handleRedeemClick(
                      rewards.find((r) => r.id === 'theme_deep_work_obsidian')!
                    )
                  }
                  className="w-full lg:w-auto px-7 py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  type="button"
                >
                  <Coins className="w-4 h-4 text-secondary" />
                  <span>Redeem 750 G</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-surface-elevated text-text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
              }`}
              type="button"
            >
              {cat}s
            </button>
          ))}
        </section>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((item) => {
            const isOwned = inventory.includes(item.id);
            const levelMet = level >= item.min_level_required;
            const canAfford = gold >= item.cost_gold;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-surface border transition-all flex flex-col justify-between gap-5 ${
                  isOwned
                    ? 'border-emerald-complete/30'
                    : 'border-border-subtle hover:border-border-subtle-hover'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Metadata Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-semibold ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      {item.rarity} · {item.category}
                    </span>

                    <div className="flex items-center gap-1 font-mono text-xs font-semibold text-secondary">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.cost_gold.toLocaleString()} G</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Level Requirement & Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <span className="font-mono text-[11px] text-text-muted">
                    {levelMet ? (
                      <span className="text-emerald-complete">
                        Level {item.min_level_required}+ Met
                      </span>
                    ) : (
                      <span className="text-amber-streak flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Requires Lvl {item.min_level_required}
                      </span>
                    )}
                  </span>

                  {isOwned ? (
                    <Link
                      href="/inventory"
                      className="px-3.5 py-1.5 rounded-lg bg-surface-elevated text-text-muted hover:text-text-primary border border-border-subtle text-xs font-mono transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-complete" />
                      <span>Owned</span>
                    </Link>
                  ) : !levelMet ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-lg bg-surface-elevated text-text-muted border border-border-subtle text-xs font-medium cursor-not-allowed opacity-50"
                      type="button"
                    >
                      Locked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRedeemClick(item)}
                      className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                      type="button"
                    >
                      <span>Redeem</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
