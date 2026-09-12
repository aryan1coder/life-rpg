'use client';

import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';

interface Directive {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  attribute: string;
  xp_reward: number;
  gold_reward: number;
  frequency: string;
  status: string;
  is_system_directive: boolean;
  created_at: string;
}

export default function AdminQuestsPage() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [difficulty, setDifficulty] = useState('Normal');
  const [attribute, setAttribute] = useState('Discipline');
  const [xpReward, setXpReward] = useState('150');
  const [goldReward, setGoldReward] = useState('40');
  const [frequency, setFrequency] = useState('Daily');

  const fetchDirectives = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/quests');
      if (res.ok) {
        const data = await res.json();
        setDirectives(data.quests || []);
      }
    } catch (e) {
      console.error('Failed to fetch directives:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectives();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      setStatusMessage(null);

      const res = await fetch('/api/admin/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          attribute,
          xp_reward: Number(xpReward),
          gold_reward: Number(goldReward),
          frequency,
          is_system_directive: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Global system directive initialized successfully');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        fetchDirectives();
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this directive?')) return;
    try {
      const res = await fetch(`/api/admin/quests?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('Directive decommissioned');
        fetchDirectives();
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
            Directives & Quest Protocols
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Publish global system directives, configure cadence frequencies, and manage quest parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Directive</span>
          </button>
          <button
            onClick={fetchDirectives}
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

      {/* Directives Table */}
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated font-mono text-[11px] text-text-muted">
                <th className="py-3 px-4">DIRECTIVE TITLE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">DIFFICULTY</th>
                <th className="py-3 px-4">ATTRIBUTE</th>
                <th className="py-3 px-4">YIELD</th>
                <th className="py-3 px-4">FREQUENCY</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    Loading directives from database...
                  </td>
                </tr>
              ) : directives.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No directives defined. Initialize a directive to activate player quests.
                  </td>
                </tr>
              ) : (
                directives.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text-primary">{d.title}</div>
                      {d.description && <div className="text-[11px] text-text-muted truncate max-w-xs">{d.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px]">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-text-secondary">{d.difficulty}</span>
                    </td>
                    <td className="py-3 px-4 text-primary font-semibold">{d.attribute}</td>
                    <td className="py-3 px-4">
                      <span className="text-text-primary">+{d.xp_reward} XP</span>
                      <span className="text-amber-streak ml-2">+{d.gold_reward} G</span>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{d.frequency}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-crimson-threat hover:bg-surface-elevated transition-colors"
                        title="Delete directive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Directive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Initialize Global Directive</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Directive Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Work: Refactor Core Module"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief tactical objective details..."
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Personal">Personal</option>
                  <option value="Creative">Creative</option>
                  <option value="Health">Health</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Normal">Normal</option>
                  <option value="Hard">Hard</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Target Capacity</label>
                <select
                  value={attribute}
                  onChange={(e) => setAttribute(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Intellect">Intellect</option>
                  <option value="Discipline">Discipline</option>
                  <option value="Vitality">Vitality</option>
                  <option value="Strength">Strength</option>
                  <option value="Creativity">Creativity</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Once">Once</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Boss Raid">Boss Raid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">XP Yield</label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Gold Yield</label>
                <input
                  type="number"
                  value={goldReward}
                  onChange={(e) => setGoldReward(e.target.value)}
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
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-semibold hover:bg-primary-hover disabled:opacity-50 shadow-md"
              >
                {creating ? 'Publishing...' : 'Publish Directive'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
