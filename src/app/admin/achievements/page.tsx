'use client';

import React, { useEffect, useState } from 'react';
import { Award, Plus, RefreshCw, X, Coins, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_gold: number;
  reward_xp: number;
  target_value: number;
  badge_icon: string;
  is_active: boolean;
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Milestones');
  const [goldReward, setGoldReward] = useState('50');
  const [xpReward, setXpReward] = useState('100');
  const [targetValue, setTargetValue] = useState('1');

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/achievements');
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          reward_gold: Number(goldReward),
          reward_xp: Number(xpReward),
          target_value: Number(targetValue),
          badge_icon: 'flag',
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        fetchAchievements();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Achievements CMS
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Define master milestones and badge conferring requirements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Achievement</span>
          </button>
          <button
            onClick={fetchAchievements}
            className="p-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            Loading achievements...
          </div>
        ) : achievements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            No achievements defined yet.
          </div>
        ) : (
          achievements.map((a) => (
            <div key={a.id} className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px] text-text-muted w-fit">
                  {a.category}
                </span>
                <h3 className="font-display font-bold text-base text-text-primary">{a.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{a.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between font-mono text-xs text-text-muted">
                <span className="text-amber-streak">+{a.reward_gold} G</span>
                <span>+{a.reward_xp} XP</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Create Achievement</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Operative"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conferral requirement lore..."
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Gold Bounty</label>
                <input
                  type="number"
                  value={goldReward}
                  onChange={(e) => setGoldReward(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">XP Bounty</label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-semibold hover:bg-primary-hover disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Achievement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
