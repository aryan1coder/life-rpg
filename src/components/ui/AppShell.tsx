'use client';

import React, { ReactNode } from 'react';
import { TacticalSidebar } from './TacticalSidebar';
import { TopTelemetryBar } from './TopTelemetryBar';
import { ToastContainer } from './ToastContainer';
import { CreateQuestModal } from '../modals/CreateQuestModal';
import { RedeemModal } from '../modals/RedeemModal';
import { InsufficientFundsModal } from '../modals/InsufficientFundsModal';
import { LevelUpModal } from '../modals/LevelUpModal';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary selection:text-white relative">
      {/* Persistent Sidebar */}
      <TacticalSidebar />

      {/* Main Content Area Offset by Sidebar (w-64) */}
      <div className="pl-64 flex flex-col min-h-screen">
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
