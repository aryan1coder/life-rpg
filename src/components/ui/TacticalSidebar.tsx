'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { getTitleForLevel } from '@/lib/game/progression';
import {
  Gamepad2,
  CheckSquare,
  User,
  Award,
  Backpack,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';

export function TacticalSidebar() {
  const pathname = usePathname();
  const { profile, sidebarOpen, setSidebarOpen, logout } = useGame();
  const [audioMuted, setAudioMuted] = useState(false);

  const navItems = [
    { label: 'Lobby', href: '/lobby', icon: Gamepad2, shortcut: '⌘1' },
    { label: 'Directives', href: '/quests', icon: CheckSquare, shortcut: '⌘2' },
    { label: 'Character', href: '/character', icon: User, shortcut: '⌘3' },
    { label: 'Armory', href: '/rewards', icon: Award, shortcut: '⌘4' },
    { label: 'Inventory', href: '/inventory', icon: Backpack, shortcut: '⌘5' },
    { label: 'Achievements', href: '/achievements', icon: ShieldCheck, shortcut: '⌘6' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border-subtle z-50 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-text-primary text-base tracking-tight">
                  LIFE RPG
                </span>
                <span className="font-mono text-[10px] text-text-muted tracking-wider uppercase">
                  SYSTEM v2.4
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-4 pb-2">
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest">
              Navigation
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/lobby' && (pathname === '/' || pathname === '/home'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-surface-elevated text-text-primary border border-border-subtle shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <kbd
                    className={`font-mono text-[10px] transition-colors ${
                      isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                    }`}
                  >
                    {item.shortcut}
                  </kbd>
                </Link>
              );
            })}

            {profile?.role === 'admin' && (
              <div className="pt-3 mt-2 border-t border-border-subtle">
                <div className="px-2 pb-1.5">
                  <span className="font-mono text-[10px] text-amber-streak uppercase tracking-wider font-semibold">
                    Administration
                  </span>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    pathname?.startsWith('/admin')
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                      : 'text-amber-streak/80 hover:text-amber-streak hover:bg-surface-elevated/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Admin Panel</span>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase font-bold tracking-wider">
                    ADMIN
                  </span>
                </Link>
              </div>
            )}
          </nav>
        </div>

      {/* Bottom Utility Rail */}
      <div className="flex flex-col gap-3 p-3 border-t border-border-subtle bg-bg-secondary">
        {/* Streak Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-streak animate-pulse" />
            <span className="text-xs text-text-secondary">Current Streak</span>
          </div>
          <span className="font-mono text-xs font-semibold text-amber-streak">
            {profile?.streak_days ?? 0} DAYS
          </span>
        </div>

        {/* Audio & Quick Controls */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="flex items-center gap-1.5 p-1.5 rounded text-xs text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all"
            type="button"
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="font-mono text-[11px]">{audioMuted ? 'Muted' : 'Audio ON'}</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all"
              type="button"
              title="Tactical Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operator Profile Trigger */}
        <Link
          href="/character"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 p-2 rounded-lg bg-surface border border-border-subtle hover:border-primary/40 transition-all cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <img
              alt="Operator Profile"
              className="w-8 h-8 rounded-full object-cover border border-border-subtle"
              src={
                profile?.avatar_url ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I'
              }
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-complete ring-2 ring-surface"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-text-primary truncate">
              {profile?.display_name || profile?.username || 'Operator'}
            </span>
            <span className="font-mono text-[10px] text-text-muted truncate">
              {profile?.title || getTitleForLevel(profile?.level ?? 1)}
            </span>
          </div>
        </Link>

        {/* Terminate Session / Logout Button */}
        <button
          onClick={() => logout()}
          type="button"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-surface hover:bg-surface-elevated text-text-muted hover:text-crimson-failed border border-border-subtle hover:border-crimson-failed/40 transition-all text-xs font-medium group"
          title="Terminate Tactical Session"
        >
          <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
    </>
  );
}
