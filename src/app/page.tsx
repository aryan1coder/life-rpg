import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Coins, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Top Bar */}
      <header className="h-20 border-b border-border-subtle px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">
              LIFE RPG
            </span>
            <span className="font-mono text-[10px] text-text-muted tracking-wider uppercase">
              KINETIC COMMAND DECK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <span>Enter Command Deck</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center justify-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-complete animate-pulse" />
          <span className="font-mono text-xs text-text-secondary">
            System v2.4 Online · Server-Authoritative Architecture
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-text-primary tracking-tight max-w-4xl leading-tight">
          Executive-Grade Life Gamification for High-Agency Builders
        </h1>

        <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
          Translate daily execution, deep-work disciplines, and software milestones into tactile RPG progression metrics. XP, Levels, 5 Core Capacities, Vault Gold, and Curated Equipment.
        </p>

        {/* Primary CTA array */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/home"
            className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-2.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/quests"
            className="px-6 py-3.5 rounded-xl bg-surface-elevated hover:bg-surface-bright text-text-primary border border-border-subtle font-medium text-sm transition-all"
          >
            View Active Protocols
          </Link>
        </div>

        {/* 4-Pillar Feature Bento */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Convex XP Curve
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Non-linear polynomial progression formula prevents arbitrary level inflation and preserves long-term mastery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Auditable Vault Economy
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Strictly non-negative Gold ledger. Redeem interface themes, cosmetic frames, codename titles, and temporary boosts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-streak/10 border border-amber-streak/20 flex items-center justify-center text-amber-streak">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Daily Cadence Streaks
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Timezone-aware streak engine with up to 1.50× multiplier rewards unbroken daily execution habits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-complete/10 border border-emerald-complete/20 flex items-center justify-center text-emerald-complete">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Server-Authoritative RLS
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Zero client trust. Powered by PostgreSQL Row Level Security to ensure personal gameplay data stays private.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-6 text-center text-xs font-mono text-text-muted">
        LIFE RPG SYSTEM v2.4 · KINETIC COMMAND DECK ARCHITECTURE
      </footer>
    </div>
  );
}
