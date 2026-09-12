'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { X, Coins, ArrowRight, ShieldAlert } from 'lucide-react';

export function RedeemModal() {
  const { redeemItemTarget, setRedeemItemTarget, profile, redeemReward } = useGame();
  const [submitting, setSubmitting] = useState(false);

  if (!redeemItemTarget) return null;

  const currentGold = profile?.gold_balance ?? 0;
  const cost = redeemItemTarget.cost_gold;
  const resultingGold = currentGold - cost;

  const handleConfirm = async () => {
    setSubmitting(true);
    await redeemReward(redeemItemTarget.id);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-secondary" />
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              Vault Item Acquisition
            </h2>
          </div>
          <button
            onClick={() => setRedeemItemTarget(null)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Details */}
        <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-border-subtle flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
              {redeemItemTarget.category} · {redeemItemTarget.rarity}
            </span>
            <span className="font-mono text-xs font-semibold text-secondary">
              {redeemItemTarget.cost_gold.toLocaleString()} G
            </span>
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            {redeemItemTarget.name}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {redeemItemTarget.description}
          </p>
        </div>

        {/* Financial Delta Visualizer */}
        <div className="mt-4 p-4 rounded-xl bg-surface-container border border-border-subtle flex items-center justify-between font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase">Current Balance</span>
            <span className="font-semibold text-text-primary mt-0.5">
              {currentGold.toLocaleString()} G
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted" />

          <div className="flex flex-col text-center">
            <span className="text-[10px] text-crimson-threat uppercase">Debit</span>
            <span className="font-semibold text-crimson-threat mt-0.5">
              -{cost.toLocaleString()} G
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted" />

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-emerald-complete uppercase">Vault Result</span>
            <span className="font-semibold text-emerald-complete mt-0.5">
              {resultingGold.toLocaleString()} G
            </span>
          </div>
        </div>

        {/* Confirmation Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setRedeemItemTarget(null)}
            className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || resultingGold < 0}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {submitting ? 'Confirming...' : `Confirm & Authorize ${cost} G`}
          </button>
        </div>
      </div>
    </div>
  );
}
