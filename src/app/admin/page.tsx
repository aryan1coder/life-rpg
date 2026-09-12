'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  Sparkles,
  Flame,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FlaskConical,
} from 'lucide-react';

interface Metrics {
  totalPlayers: number;
  activePlayers: number;
  totalDirectives: number;
  completedDirectives: number;
  activeBossRaids: number;
  totalRewards: number;
  totalPurchases: number;
  goldCirculation: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch admin metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-complete" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
              Telemetry Status: Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
            System Overview & CMS
          </h1>
          <p className="text-xs text-text-secondary">
            Live database metrics and administrative command protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary font-mono text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Players */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">TOTAL PLAYERS</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-bold text-text-primary">
              {loading ? '—' : metrics?.totalPlayers ?? 0}
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1">
              Active: {loading ? '—' : metrics?.activePlayers ?? 0}
            </p>
          </div>
        </div>

        {/* Directives */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">DIRECTIVES CONQUERED</span>
            <Target className="w-4 h-4 text-emerald-complete" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-bold text-text-primary">
              {loading ? '—' : metrics?.completedDirectives ?? 0}
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1">
              Total created: {loading ? '—' : metrics?.totalDirectives ?? 0}
            </p>
          </div>
        </div>

        {/* Active Boss Raids */}
        <div className="p-5 rounded-2xl bg-surface border border-crimson-threat/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-crimson-threat font-semibold">ACTIVE BOSS RAIDS</span>
            <Flame className="w-4 h-4 text-crimson-threat" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-bold text-text-primary">
              {loading ? '—' : metrics?.activeBossRaids ?? 0}
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1">
              Threat protocols live in system
            </p>
          </div>
        </div>

        {/* Gold Circulation */}
        <div className="p-5 rounded-2xl bg-surface border border-amber-streak/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-amber-streak font-semibold">VAULT CIRCULATION</span>
            <Coins className="w-4 h-4 text-amber-streak" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-bold text-text-primary">
              {loading ? '—' : `${(metrics?.goldCirculation ?? 0).toLocaleString()} G`}
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1">
              Purchases: {loading ? '—' : metrics?.totalPurchases ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Control Strip */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-bold text-lg text-text-primary">
          Administrative Directives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/quests"
            className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-text-primary">Create Directive</div>
                <div className="text-[11px] text-text-muted">Global quest templates</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/admin/rewards"
            className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-streak" />
              <div>
                <div className="text-sm font-semibold text-text-primary">Create Reward</div>
                <div className="text-[11px] text-text-muted">Shop cosmetics & themes</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/admin/boss-raids"
            className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-crimson-threat/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-crimson-threat" />
              <div>
                <div className="text-sm font-semibold text-text-primary">Deploy Boss Raid</div>
                <div className="text-[11px] text-text-muted">Multi-stage raid encounters</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-crimson-threat transition-colors" />
          </Link>

          <Link
            href="/admin/qa/avatar-lab"
            className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-emerald-complete/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-emerald-complete" />
              <div>
                <div className="text-sm font-semibold text-text-primary">QA Avatar Lab</div>
                <div className="text-[11px] text-text-muted">Evolution & tier testing</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-emerald-complete transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
