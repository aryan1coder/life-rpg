'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import { getEvolutionTierForLevel, AVATAR_EVOLUTION_TIERS } from '@/lib/game/progression';
import {
  FlaskConical,
  Zap,
  Shield,
  Coins,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Check,
  Award,
  Layers,
} from 'lucide-react';

interface TestUserState {
  profile: any;
  attributes: any;
  unlocks: string[];
  loadout: Record<string, string>;
  evolutionTier: any;
  progress: number;
}

export default function AdminQALabPage() {
  const [testUser, setTestUser] = useState<TestUserState | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'controls' | 'timeline' | 'armory'>('controls');

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/qa/avatar-lab');
      if (res.ok) {
        const data = await res.json();
        setTestUser(data.testUser);
        setCatalog(data.catalog || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const sendAction = async (payload: any) => {
    try {
      setStatusMessage(null);
      const res = await fetch('/api/admin/qa/avatar-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message || 'Action executed successfully');
        fetchState();
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    }
  };

  const level = testUser?.profile?.level || 1;
  const evolution = getEvolutionTierForLevel(level);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-complete/10 text-emerald-complete font-mono text-[10px] font-bold border border-emerald-complete/20">
              ISOLATED QA TEST PROFILE
            </span>
            <span className="font-mono text-xs text-text-muted">Target: dev-qa-test-user</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight mt-1">
            Avatar Evolution & Progression QA Lab
          </h1>
          <p className="text-xs text-text-secondary">
            Simulate real server-authoritative level leaps, tier unlocks, and equipment transformations without modifying production player accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/lobby"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
          >
            <span>Open Lobby</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/character"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
          >
            <span>Open Character</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => sendAction({ action: 'reset' })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-crimson-threat/10 text-crimson-threat border border-crimson-threat/30 hover:bg-crimson-threat/20 font-mono text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Test State</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-primary/30 text-xs font-mono text-text-primary flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-text-muted hover:text-text-primary">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Left = Live Avatar, Right = Tabs / Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Stage: Live AvatarRenderer */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col items-center justify-between gap-6 relative overflow-hidden">
          <div className="w-full flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Current Tier:</span>
            <span className="font-bold text-primary">{evolution.name}</span>
          </div>

          <div className="relative py-4 flex items-center justify-center">
            <AvatarRenderer
              level={level}
              equippedLoadout={testUser?.loadout || {}}
              size="hero"
              showBadge={true}
            />
          </div>

          <div className="w-full flex flex-col gap-2 pt-4 border-t border-border-subtle font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">OPERATOR LEVEL</span>
              <span className="font-bold text-text-primary text-base">Level {level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">ACCUMULATED XP</span>
              <span className="text-primary font-semibold">{testUser?.profile?.xp_current ?? 0} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">VAULT BALANCE</span>
              <span className="text-amber-streak font-semibold">{testUser?.profile?.gold_balance ?? 0} G</span>
            </div>
          </div>
        </div>

        {/* Right Stage: Tabbed Controls */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Navigation Sub-tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border-subtle font-mono text-xs">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-2 rounded-lg transition-colors font-semibold ${
                activeTab === 'controls' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Progression Controls
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 rounded-lg transition-colors font-semibold ${
                activeTab === 'timeline' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Evolution Timeline
            </button>
            <button
              onClick={() => setActiveTab('armory')}
              className={`flex-1 py-2 rounded-lg transition-colors font-semibold ${
                activeTab === 'armory' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Armory Catalog ({catalog.length})
            </button>
          </div>

          {/* TAB 1: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface border border-border-subtle">
              {/* Quick Level Leaps */}
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs text-text-muted uppercase">Quick Level Thresholds</span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 4, 6, 8, 10, 12, 15, 16, 20].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => sendAction({ action: 'set_level', level: lvl })}
                      className={`py-2 rounded-xl border font-mono text-xs font-semibold transition-all ${
                        level === lvl
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-surface-elevated border-border-subtle hover:border-primary/50 text-text-primary'
                      }`}
                    >
                      Lvl {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubber / Slider */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-text-muted">Live Level Scrubber (1 - 100):</span>
                  <span className="font-bold text-primary">Level {level}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={level}
                  onChange={(e) => sendAction({ action: 'set_level', level: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* XP Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <span className="font-mono text-xs text-text-muted uppercase">Inject XP</span>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => sendAction({ action: 'add_xp', amount: amt })}
                      className="py-2 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/50 text-xs font-mono text-text-primary font-semibold transition-colors"
                    >
                      +{amt} XP
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Scenarios */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <span className="font-mono text-xs text-text-muted uppercase">Archetype Scenarios</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => sendAction({ action: 'scenario', scenario: 'early' })}
                    className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle hover:bg-surface-container text-left"
                  >
                    <div className="font-semibold text-text-primary">Early Game</div>
                    <div className="text-[10px] text-text-muted">Level 5 Vanguard</div>
                  </button>
                  <button
                    onClick={() => sendAction({ action: 'scenario', scenario: 'mid' })}
                    className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle hover:bg-surface-container text-left"
                  >
                    <div className="font-semibold text-text-primary">Mid Progression</div>
                    <div className="text-[10px] text-text-muted">Level 10 Infiltrator</div>
                  </button>
                  <button
                    onClick={() => sendAction({ action: 'scenario', scenario: 'endgame' })}
                    className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle hover:bg-surface-container text-left"
                  >
                    <div className="font-semibold text-text-primary">Endgame Ascendant</div>
                    <div className="text-[10px] text-text-muted">Level 20 Sovereign</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border-subtle max-h-[600px] overflow-y-auto">
              <span className="font-mono text-xs text-text-muted uppercase">
                Evolution Tiers (Tiers 1 - 8)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 4, 6, 8, 10, 12, 16].map((milestone) => {
                  const t = getEvolutionTierForLevel(milestone);
                  return (
                    <div
                      key={milestone}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                        level >= milestone
                          ? 'bg-surface-elevated border-primary/40 shadow-sm'
                          : 'bg-surface border-border-subtle opacity-60'
                      }`}
                      onClick={() => sendAction({ action: 'set_level', level: milestone })}
                    >
                      <AvatarRenderer level={milestone} size="sm" showBadge={false} />
                      <div className="font-mono text-[11px] font-bold text-text-primary">
                        Level {milestone}
                      </div>
                      <div className="font-mono text-[9px] text-primary truncate max-w-full">
                        {t.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARMORY */}
          {activeTab === 'armory' && (
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border-subtle max-h-[600px] overflow-y-auto">
              <span className="font-mono text-xs text-text-muted uppercase">
                Armory Equipment Inspection
              </span>
              <div className="space-y-2 font-mono text-xs">
                {catalog.map((item) => {
                  const isUnlocked = testUser?.unlocks?.includes(item.id);
                  const isEquipped = testUser?.loadout?.[item.slot] === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-semibold text-text-primary">{item.name}</div>
                        <div className="text-[10px] text-text-muted">
                          Slot: {item.slot} • Req: Level {item.required_level}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isUnlocked ? (
                          <button
                            onClick={() => sendAction({ action: 'unlock', itemId: item.id })}
                            className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle hover:bg-surface-container text-[11px] text-text-primary"
                          >
                            Unlock for Test
                          </button>
                        ) : isEquipped ? (
                          <button
                            onClick={() => sendAction({ action: 'unequip', slot: item.slot })}
                            className="px-2.5 py-1 rounded-lg bg-crimson-threat/10 text-crimson-threat border border-crimson-threat/30 text-[11px]"
                          >
                            Unequip
                          </button>
                        ) : (
                          <button
                            onClick={() => sendAction({ action: 'equip', itemId: item.id, slot: item.slot })}
                            className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] hover:bg-primary-hover"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
