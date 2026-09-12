'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { calculateLevelProgress } from '@/lib/game/progression';
import { Coins, Flame, Bell, Menu } from 'lucide-react';
import Link from 'next/link';

export function TopTelemetryBar() {
  const { profile, sidebarOpen, setSidebarOpen } = useGame();

  const level = profile?.level ?? 12;
  const xpCurrent = profile?.xp_current ?? 8260;
  const xpNext = profile?.xp_next_level ?? 10000;
  const gold = profile?.gold_balance ?? 1420;
  const streak = profile?.streak_days ?? 14;
  const title = profile?.title ?? 'Arch-Strategist II';

  const progressPercent = calculateLevelProgress(xpCurrent, xpNext);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-bg-secondary/90 backdrop-blur-xl border-b border-border-subtle z-40 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Hamburger (mobile) + Level, Title & XP Telemetry */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          type="button"
          aria-label="Toggle Command Deck Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-surface-elevated border border-border-subtle text-primary font-semibold tracking-wide uppercase">
            LVL {level}
          </span>
          <span className="text-border-subtle font-light hidden sm:inline">|</span>
          <span className="text-xs text-text-secondary font-medium hidden sm:inline">
            {title}
          </span>
        </div>

        {/* Live XP Trajectory */}
        <div className="hidden md:flex items-center gap-3 pl-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
              XP
            </span>
            <div className="w-28 h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs text-text-secondary font-medium">
              {progressPercent}%
            </span>
            <span className="font-mono text-[11px] text-text-muted hidden lg:inline">
              ({xpCurrent.toLocaleString()} / {xpNext.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Right: Currency, Streak, Alerts, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Gold Reservoir */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle">
          <Coins className="w-3.5 h-3.5 text-secondary" />
          <span className="font-mono text-xs text-secondary font-semibold tracking-tight">
            {gold.toLocaleString()} G
          </span>
        </div>

        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle">
          <Flame className="w-3.5 h-3.5 text-amber-streak" />
          <span className="font-mono text-xs text-amber-streak font-semibold tracking-tight">
            {streak}D
          </span>
        </div>

        {/* Notifications Alert */}
        <button
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors relative"
          type="button"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-bg-secondary" />
        </button>

        <div className="h-4 w-px bg-border-subtle" />

        {/* Avatar link */}
        <Link href="/character" className="relative block">
          <img
            alt="Operator Portrait"
            className="w-8 h-8 rounded-full object-cover border border-border-subtle hover:ring-2 hover:ring-primary transition-all"
            src={
              profile?.avatar_url ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I'
            }
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-complete ring-2 ring-bg-secondary" />
        </Link>
      </div>
    </header>
  );
}
