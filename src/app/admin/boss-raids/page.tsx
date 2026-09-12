'use client';

import React, { useEffect, useState } from 'react';
import {
  Flame,
  Plus,
  RefreshCw,
  Power,
  RotateCcw,
  Clock,
  Coins,
  Zap,
  X,
} from 'lucide-react';

interface BossRaid {
  id: string;
  title: string;
  description: string;
  threat_level: string;
  max_hp: number;
  current_hp: number;
  required_directives: number;
  time_limit_hours: number;
  reward_gold: number;
  reward_xp: number;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
}

export default function AdminBossRaidsPage() {
  const [raids, setRaids] = useState<BossRaid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [threatLevel, setThreatLevel] = useState('Critical Threat');
  const [maxHp, setMaxHp] = useState('100');
  const [requiredDirectives, setRequiredDirectives] = useState('3');
  const [timeLimitHours, setTimeLimitHours] = useState('24');
  const [rewardGold, setRewardGold] = useState('350');
  const [rewardXp, setRewardXp] = useState('850');

  const fetchRaids = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/boss-raids');
      if (res.ok) {
        const data = await res.json();
        setRaids(data.raids || []);
      }
    } catch (e) {
      console.error('Failed to fetch boss raids:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaids();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      setStatusMessage(null);

      const res = await fetch('/api/admin/boss-raids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          threat_level: threatLevel,
          max_hp: Number(maxHp),
          required_directives: Number(requiredDirectives),
          time_limit_hours: Number(timeLimitHours),
          reward_gold: Number(rewardGold),
          reward_xp: Number(rewardXp),
          is_active: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Boss Raid deployed and activated');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        fetchRaids();
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/boss-raids', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      if (res.ok) {
        setStatusMessage(`Boss Raid ${!currentActive ? 'activated' : 'deactivated'}`);
        fetchRaids();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetHp = async (id: string) => {
    if (!confirm('Reset boss HP back to 100% max?')) return;
    try {
      const res = await fetch('/api/admin/boss-raids', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reset_hp: true }),
      });
      if (res.ok) {
        setStatusMessage('Boss Raid HP restored');
        fetchRaids();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Boss Raids Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Deploy authoritative multi-stage Boss Raids, monitor participant damage, and configure protocol bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-crimson-threat text-white font-mono text-xs font-semibold hover:bg-crimson-threat/90 shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Boss Raid</span>
          </button>
          <button
            onClick={fetchRaids}
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

      {/* Raids Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            Loading boss raids from database...
          </div>
        ) : raids.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            No boss raids deployed. Click "Deploy Boss Raid" to activate an encounter.
          </div>
        ) : (
          raids.map((r) => {
            const hpPct = Math.round(((r.current_hp || 0) / (r.max_hp || 100)) * 100);
            return (
              <div
                key={r.id}
                className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-crimson-threat/10 text-crimson-threat font-mono text-[11px] font-bold border border-crimson-threat/20">
                        {r.threat_level}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          r.is_active ? 'bg-emerald-complete animate-pulse' : 'bg-text-muted'
                        }`}
                      />
                      <span className="font-mono text-[10px] text-text-muted">
                        {r.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(r.id, r.is_active)}
                        className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                          r.is_active
                            ? 'bg-crimson-threat/10 text-crimson-threat border-crimson-threat/30 hover:bg-crimson-threat/20'
                            : 'bg-emerald-complete/10 text-emerald-complete border-emerald-complete/30 hover:bg-emerald-complete/20'
                        }`}
                        title={r.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetHp(r.id)}
                        className="p-1.5 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle"
                        title="Reset HP"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-text-primary">{r.title}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{r.description}</p>
                  </div>

                  {/* HP Progress Bar */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-text-muted">Integrity (HP)</span>
                      <span className="font-bold text-crimson-threat">
                        {r.current_hp} / {r.max_hp} ({hpPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                      <div
                        className="h-full bg-crimson-threat rounded-full transition-all duration-300"
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between font-mono text-xs text-text-muted">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-streak">+{r.reward_gold} G</span>
                    <span>+{r.reward_xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{r.time_limit_hours}h limit</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deploy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Deploy Boss Raid Encounter</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Boss Protocol Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Architecture Overhaul"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Encounter context & directive requirements..."
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Threat Classification</label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Critical Threat">Critical Threat</option>
                  <option value="High Severity">High Severity</option>
                  <option value="Epic Anomaly">Epic Anomaly</option>
                  <option value="Legendary Encounter">Legendary Encounter</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Max HP</label>
                <input
                  type="number"
                  value={maxHp}
                  onChange={(e) => setMaxHp(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Gold Bounty</label>
                <input
                  type="number"
                  value={rewardGold}
                  onChange={(e) => setRewardGold(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">XP Bounty</label>
                <input
                  type="number"
                  value={rewardXp}
                  onChange={(e) => setRewardXp(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-crimson-threat text-white text-xs font-mono font-semibold hover:bg-crimson-threat/90 disabled:opacity-50 shadow-md"
              >
                {creating ? 'Deploying...' : 'Deploy Boss'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
