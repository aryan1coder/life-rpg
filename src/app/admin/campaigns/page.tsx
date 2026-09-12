'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, RefreshCw, X } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  theme: string;
  total_stages: number;
  reward_xp: number;
  reward_gold: number;
  is_active: boolean;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('System Sprint Cadence');
  const [stages, setStages] = useState('10');
  const [gold, setGold] = useState('500');
  const [xp, setXp] = useState('1500');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          theme,
          total_stages: Number(stages),
          reward_gold: Number(gold),
          reward_xp: Number(xp),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        fetchCampaigns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Campaigns & Events
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Publish multi-stage operational campaigns and special limited-time events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
          <button
            onClick={fetchCampaigns}
            className="p-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            Loading campaigns from database...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            No active campaigns defined. Click "New Campaign" to create multi-stage events.
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px] text-text-muted">
                  {c.theme}
                </span>
                <h3 className="font-display font-bold text-lg text-text-primary mt-2">{c.title}</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{c.description}</p>
              </div>
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-mono text-xs text-text-muted">
                <span>Stages: {c.total_stages}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-streak">+{c.reward_gold} G</span>
                  <span>+{c.reward_xp} XP</span>
                </div>
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
              <h3 className="font-display font-bold text-lg text-text-primary">Create Campaign</h3>
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
                placeholder="e.g. Operation Deep Forge"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Campaign narrative and rules..."
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Total Stages</label>
                <input
                  type="number"
                  value={stages}
                  onChange={(e) => setStages(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Gold Reward</label>
                <input
                  type="number"
                  value={gold}
                  onChange={(e) => setGold(e.target.value)}
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
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-semibold hover:bg-primary-hover shadow-md"
              >
                Publish Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
