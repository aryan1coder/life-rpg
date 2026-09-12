'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import {
  ShieldAlert,
  Users,
  Target,
  Sparkles,
  Shirt,
  Flame,
  Award,
  Calendar,
  Coins,
  FlaskConical,
  FileText,
  Settings,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/players', label: 'Players', icon: Users },
  { href: '/admin/quests', label: 'Directives', icon: Target },
  { href: '/admin/rewards', label: 'Rewards Shop', icon: Sparkles },
  { href: '/admin/avatar', label: 'Avatar Armory', icon: Shirt },
  { href: '/admin/boss-raids', label: 'Boss Raids', icon: Flame },
  { href: '/admin/achievements', label: 'Achievements', icon: Award },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Calendar },
  { href: '/admin/economy', label: 'Economy Ledger', icon: Coins },
  { href: '/admin/qa/avatar-lab', label: 'QA Avatar Lab', icon: FlaskConical },
  { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useGame();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted font-mono text-sm">
        Verifying Administrative Security Clearance...
      </div>
    );
  }

  // Access Control: Strictly verified server-authoritative role === 'admin'
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      router.replace('/lobby');
    }
  }, [loading, profile, router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-crimson-threat/10 border border-crimson-threat/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-crimson-threat" />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
          403 Forbidden // Restricted Sector
        </h1>
        <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
          Access to the LIFE RPG Administrative Command Center requires elevated clearance (`role: admin`). Your current credentials do not grant access.
        </p>
        <Link
          href="/lobby"
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover transition-colors shadow-lg"
        >
          Return to Command Deck
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col lg:flex-row">
      {/* Top Mobile Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border-subtle sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display font-bold text-sm tracking-wider uppercase">ADMIN CMS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Tactical Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-subtle flex flex-col justify-between p-4 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
                LIFE RPG // SYSTEM
              </span>
              <span className="font-display text-base font-bold text-text-primary tracking-tight">
                ADMIN CONTROL
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-bold">
              ROOT
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
          <Link
            href="/lobby"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated font-mono text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <div className="px-3 py-1 text-[10px] font-mono text-text-muted">
            Logged in as: <span className="text-text-secondary">{profile.username}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 bg-bg-primary overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
