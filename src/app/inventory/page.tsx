'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { useGame } from '@/context/GameContext';
import { ItemCategory } from '@/lib/game/types';
import {
  Backpack,
  CheckCircle2,
  Shield,
  Palette,
  Award,
  Zap,
  Sparkles,
  Power,
} from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { rewards, inventory, loadout, equipItem, unequipItem } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Theme', 'Cosmetic', 'Badge', 'Title', 'Boost'];

  const ownedItems = rewards.filter((r) => inventory.includes(r.id));

  const filteredItems = ownedItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const isEquipped = (itemId: string) => {
    if (!loadout) return false;
    return (
      loadout.theme_id === itemId ||
      loadout.frame_id === itemId ||
      loadout.title_id === itemId ||
      loadout.badge_id === itemId ||
      loadout.boost_id === itemId
    );
  };

  const getEquippedSlot = (category: ItemCategory) => {
    if (!loadout) return null;
    let equippedId: string | null | undefined = null;
    if (category === 'Theme') equippedId = loadout.theme_id;
    if (category === 'Cosmetic') equippedId = loadout.frame_id;
    if (category === 'Title') equippedId = loadout.title_id;
    if (category === 'Badge') equippedId = loadout.badge_id;
    if (category === 'Boost') equippedId = loadout.boost_id;

    return rewards.find((r) => r.id === equippedId) || null;
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {/* Header & Metrics Strip */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Vault & Loadout Management
              </span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span className="font-mono text-xs text-primary font-semibold">
                OPERATIONAL SUITE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
              Inventory & Equipment
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Inspect and configure your active loadout of environments, cosmetic frames, titles, and boosts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle shadow-sm font-mono text-xs">
              <Backpack className="w-4 h-4 text-primary" />
              <span>{ownedItems.length} Items Owned</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle shadow-sm font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-complete" />
              <span>Synced Loadout Active</span>
            </div>
          </div>
        </section>

        {/* Section 1: Active Synced Loadout Strip */}
        <section className="w-full rounded-3xl bg-surface border border-border-subtle p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-primary/10 pointer-events-none blur-3xl" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-complete animate-pulse" />
              <h2 className="text-lg font-display font-semibold text-text-primary tracking-tight">
                Active Synced Loadout
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
              Profile Sync v2.4
            </span>
          </div>

          {/* 5 Slot Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 z-10">
            {(
              [
                { label: 'Theme', category: 'Theme' as ItemCategory, icon: Palette },
                { label: 'Avatar Frame', category: 'Cosmetic' as ItemCategory, icon: Shield },
                { label: 'Codename Title', category: 'Title' as ItemCategory, icon: Award },
                { label: 'Insignia Badge', category: 'Badge' as ItemCategory, icon: Sparkles },
                { label: 'Active Boost', category: 'Boost' as ItemCategory, icon: Zap },
              ] as const
            ).map((slot) => {
              const Icon = slot.icon;
              const equippedItem = getEquippedSlot(slot.category);

              return (
                <div
                  key={slot.label}
                  className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col justify-between gap-3 group hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                      {slot.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>

                  <div className="flex flex-col gap-1">
                    {equippedItem ? (
                      <>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {equippedItem.name}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-complete">
                          ✓ Synchronized
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-text-muted italic">
                        Empty Slot
                      </span>
                    )}
                  </div>

                  {equippedItem && (
                    <button
                      onClick={() => unequipItem(slot.category)}
                      className="text-[11px] font-mono text-text-muted hover:text-crimson-threat transition-colors text-left flex items-center gap-1"
                      type="button"
                    >
                      <Power className="w-3 h-3" />
                      <span>Unequip</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Category Selector Tabs */}
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

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full p-12 rounded-2xl bg-surface border border-border-subtle text-center flex flex-col items-center justify-center gap-3">
              <Backpack className="w-10 h-10 text-text-muted opacity-60" />
              <h3 className="text-sm font-semibold text-text-primary">
                No items in this category
              </h3>
              <p className="text-xs text-text-muted max-w-sm">
                Redeem items in the Rewards Store using your Vault Gold to expand your operational loadout.
              </p>
              <Link
                href="/rewards"
                className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all shadow-md"
              >
                Browse Rewards Store
              </Link>
            </div>
          ) : (
            filteredItems.map((item) => {
              const equipped = isEquipped(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-surface border transition-all flex flex-col justify-between gap-4 ${
                    equipped
                      ? 'border-primary shadow-sm ring-1 ring-primary/30'
                      : 'border-border-subtle hover:border-border-subtle-hover'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-primary border border-border-subtle uppercase">
                        {item.category} · {item.rarity}
                      </span>
                      {equipped && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary text-white font-bold">
                          EQUIPPED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {item.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-end">
                    {equipped ? (
                      <button
                        onClick={() => unequipItem(item.category)}
                        className="px-4 py-1.5 rounded-lg bg-surface-elevated text-text-muted hover:text-text-primary border border-border-subtle text-xs font-mono transition-colors"
                        type="button"
                      >
                        Unequip
                      </button>
                    ) : (
                      <button
                        onClick={() => equipItem(item.id)}
                        className="px-5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-sm"
                        type="button"
                      >
                        Equip to Loadout
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
