'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Sliders,
  Shield,
  Coins,
  Zap,
  RotateCcw,
  Check,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';

interface Player {
  id: string;
  username: string;
  display_name?: string;
  role: string;
  level: number;
  xp_current: number;
  xp_next_level: number;
  gold_balance: number;
  streak_days: number;
  created_at: string;
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actionType, setActionType] = useState<'adjust_xp' | 'adjust_gold' | 'adjust_level' | 'reset_streak' | 'reset_progression' | null>(null);
  const [amountInput, setAmountInput] = useState('100');
  const [executing, setExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchPlayers = async (q = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/players?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (e) {
      console.error('Failed to fetch players:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAction = async () => {
    if (!selectedPlayer || !actionType) return;
    try {
      setExecuting(true);
      setStatusMessage(null);

      const payload: any = {
        action: actionType,
        userId: selectedPlayer.id,
      };

      if (actionType === 'adjust_xp' || actionType === 'adjust_gold') {
        payload.amount = Number(amountInput);
      } else if (actionType === 'adjust_level') {
        payload.level = Number(amountInput);
      }

      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Successfully executed ${actionType} on ${selectedPlayer.username}`);
        setActionType(null);
        setSelectedPlayer(null);
        fetchPlayers(searchQuery);
      } else {
        setStatusMessage(`Error: ${data.error || 'Action failed'}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Player Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Search registered operators, audit progression, and execute authorized state adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchPlayers(e.target.value);
              }}
              placeholder="Filter by callsign..."
              className="pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary w-60 font-mono"
            />
          </div>
          <button
            onClick={() => fetchPlayers(searchQuery)}
            className="p-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-primary/30 text-xs font-mono text-text-primary flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Players Table */}
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated font-mono text-[11px] text-text-muted">
                <th className="py-3 px-4">CALLSIGN</th>
                <th className="py-3 px-4">ROLE</th>
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">XP PROGRESS</th>
                <th className="py-3 px-4">VAULT BALANCE</th>
                <th className="py-3 px-4">STREAK</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    Loading operators from database...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No player records found.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text-primary">{p.display_name || p.username}</div>
                      <div className="text-[10px] text-text-muted">{p.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.role === 'admin'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary">Lvl {p.level}</td>
                    <td className="py-3 px-4 text-text-secondary">
                      {p.xp_current} / {p.xp_next_level} XP
                    </td>
                    <td className="py-3 px-4 text-amber-streak font-semibold">{p.gold_balance} G</td>
                    <td className="py-3 px-4 text-text-secondary">{p.streak_days} days</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPlayer(p);
                          setActionType('adjust_gold');
                          setAmountInput('100');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-elevated border border-border-subtle text-[11px] text-text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Inspect / Tune</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal Dialog */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">
                  Tune Operator: {selectedPlayer.username}
                </h3>
                <p className="text-[11px] font-mono text-text-muted">ID: {selectedPlayer.id}</p>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Select Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setActionType('adjust_xp')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                  actionType === 'adjust_xp' ? 'bg-primary text-white border-primary' : 'bg-surface-elevated border-border-subtle text-text-secondary'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Adjust XP</span>
              </button>
              <button
                onClick={() => setActionType('adjust_gold')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                  actionType === 'adjust_gold' ? 'bg-primary text-white border-primary' : 'bg-surface-elevated border-border-subtle text-text-secondary'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Adjust Gold</span>
              </button>
              <button
                onClick={() => setActionType('adjust_level')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                  actionType === 'adjust_level' ? 'bg-primary text-white border-primary' : 'bg-surface-elevated border-border-subtle text-text-secondary'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Set Level</span>
              </button>
              <button
                onClick={() => setActionType('reset_progression')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                  actionType === 'reset_progression' ? 'bg-crimson-threat text-white border-crimson-threat' : 'bg-surface-elevated border-border-subtle text-crimson-threat'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Prog</span>
              </button>
            </div>

            {/* Input Value */}
            {actionType && actionType !== 'reset_streak' && actionType !== 'reset_progression' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">
                  {actionType === 'adjust_level' ? 'Target Level (1 - 100):' : 'Adjustment Amount (+/-):'}
                </label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle font-mono text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {actionType === 'reset_progression' && (
              <div className="p-3 rounded-xl bg-crimson-threat/10 border border-crimson-threat/30 flex items-center gap-3 text-xs text-crimson-threat font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>This will reset level to 1, XP to 0, Gold to 0, and log to audit trail.</span>
              </div>
            )}

            {/* Confirm Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 rounded-xl bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={executing || !actionType}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-semibold hover:bg-primary-hover disabled:opacity-50"
              >
                {executing ? 'Executing...' : 'Confirm Mutation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
