'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { getTitleForLevel } from '@/lib/game/progression';
import { Award, Zap, ChevronRight, X } from 'lucide-react';

export function LevelUpModal() {
  const { levelUpModalData, setLevelUpModalData } = useGame();

  if (!levelUpModalData) return null;

  const newLevel = levelUpModalData.newLevel;
  const title = getTitleForLevel(newLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-surface border border-primary/40 shadow-2xl p-7 text-center overflow-hidden">
        {/* Atmospheric Ambient Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <button
          onClick={() => setLevelUpModalData(null)}
          className="absolute top-5 right-5 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Level Emblem */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-surface-elevated border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Award className="w-10 h-10 text-primary animate-bounce" />
          <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-primary text-white font-mono text-[11px] font-bold shadow-md">
            LEVEL {newLevel}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-1">
          <span className="font-mono text-xs text-primary uppercase tracking-widest font-semibold">
            Progression Threshold Crossed
          </span>
          <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Level Up Achieved
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Conferred Rank: <span className="text-text-primary font-semibold">{title}</span>
          </p>
        </div>

        {/* Unlocked Operational Perks */}
        <div className="mt-5 p-4 rounded-xl bg-surface-elevated border border-border-subtle flex flex-col gap-2.5 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Zap className="w-4 h-4 text-primary" />
            <span>Unlocked Capabilities</span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-text-secondary font-mono">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-emerald-complete" />
              <span>+1 to All Active Core Capacities</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-secondary" />
              <span>Expanded Catalog Item Affordability</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
              <span>Tier II Subroutine Optimization</span>
            </div>
          </div>
        </div>

        {/* Dismiss CTA */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setLevelUpModalData(null)}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-98 transition-all shadow-md"
          >
            Claim & Return to Command Deck
          </button>
        </div>
      </div>
    </div>
  );
}
