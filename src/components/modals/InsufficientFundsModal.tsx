'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { AlertTriangle, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function InsufficientFundsModal() {
  const { insufficientFundsData, setInsufficientFundsData } = useGame();

  if (!insufficientFundsData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-crimson-threat/30 shadow-2xl p-6 overflow-hidden">
        {/* Ambient Threat Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-crimson-threat/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-crimson-threat/10 border border-crimson-threat/20 flex items-center justify-center text-crimson-threat">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">
                Insufficient Vault Reserve
              </h2>
              <p className="font-mono text-[11px] text-text-muted">
                Transaction Ledger Rejection
              </p>
            </div>
          </div>
          <button
            onClick={() => setInsufficientFundsData(null)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortfall Breakdown */}
        <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-border-subtle flex flex-col gap-3">
          <p className="text-xs text-text-secondary leading-relaxed">
            Your personal vault does not currently possess adequate gold reserves to execute this equipment redemption directive.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase">Required</span>
              <span className="font-semibold text-text-primary mt-0.5">
                {insufficientFundsData.required.toLocaleString()} G
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted uppercase">Available</span>
              <span className="font-semibold text-secondary mt-0.5">
                {insufficientFundsData.balance.toLocaleString()} G
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-crimson-threat uppercase">Shortfall</span>
              <span className="font-semibold text-crimson-threat mt-0.5">
                -{insufficientFundsData.shortfall.toLocaleString()} G
              </span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setInsufficientFundsData(null)}
            className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
          <Link
            href="/quests"
            onClick={() => setInsufficientFundsData(null)}
            className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <span>View Quests & Earn Gold</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
