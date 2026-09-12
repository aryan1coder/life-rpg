'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Gamepad2,
  CheckSquare,
  User,
  Award,
  Backpack,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setCreateQuestModalOpen } = useGame();

  const navItems = [
    { label: 'Lobby', href: '/lobby', icon: Gamepad2 },
    { label: 'Directives', href: '/quests', icon: CheckSquare },
    { label: 'Character', href: '/character', icon: User },
    { label: 'Armory', href: '/rewards', icon: Award },
    { label: 'Inventory', href: '/inventory', icon: Backpack },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-subtle z-40 lg:hidden flex items-center justify-around px-2"
      aria-label="Mobile Navigation Bar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}

      {/* Floating Create Quest Button */}
      <button
        type="button"
        onClick={() => setCreateQuestModalOpen(true)}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 text-primary hover:text-primary-hover transition-colors"
        aria-label="Create Directive"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">New</span>
      </button>
    </nav>
  );
}
