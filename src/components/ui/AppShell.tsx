'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { TacticalSidebar } from './TacticalSidebar';
import { TopTelemetryBar } from './TopTelemetryBar';
import { ToastContainer } from './ToastContainer';
import { CreateQuestModal } from '../modals/CreateQuestModal';
import { RedeemModal } from '../modals/RedeemModal';
import { InsufficientFundsModal } from '../modals/InsufficientFundsModal';
import { LevelUpModal } from '../modals/LevelUpModal';

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    setCreateQuestModalOpen,
    setRedeemItemTarget,
    setInsufficientFundsData,
    setLevelUpModalData,
    setSidebarOpen,
  } = useGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        setCreateQuestModalOpen(false);
        setRedeemItemTarget(null);
        setInsufficientFundsData(null);
        setLevelUpModalData(null);
        setSidebarOpen(false);
        return;
      }

      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && !isInput) {
        if (e.key === '1') {
          e.preventDefault();
          router.push('/home');
        } else if (e.key === '2') {
          e.preventDefault();
          router.push('/quests');
        } else if (e.key === '3') {
          e.preventDefault();
          router.push('/character');
        } else if (e.key === '4') {
          e.preventDefault();
          router.push('/rewards');
        } else if (e.key === '5') {
          e.preventDefault();
          router.push('/inventory');
        } else if (e.key === '6') {
          e.preventDefault();
          router.push('/achievements');
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setCreateQuestModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, setCreateQuestModalOpen, setRedeemItemTarget, setInsufficientFundsData, setLevelUpModalData, setSidebarOpen]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary selection:text-white relative">
      {/* Persistent Sidebar */}
      <TacticalSidebar />

      {/* Main Content Area Offset by Sidebar on large screens */}
      <div className="pl-0 lg:pl-64 flex flex-col min-h-screen">
        <TopTelemetryBar />
        <main className="flex-1 pt-16">{children}</main>
      </div>

      {/* Global Overlays & Modals */}
      <ToastContainer />
      <CreateQuestModal />
      <RedeemModal />
      <InsufficientFundsModal />
      <LevelUpModal />
    </div>
  );
}
