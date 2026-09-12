'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Coins,
  Shield,
  Layers,
} from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  cost_gold: number;
  min_level_required: number;
  preview_asset: string;
  stock: number | null;
  is_available: boolean;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cosmetic');
  const [rarity, setRarity] = useState('Rare');
  const [costGold, setCostGold] = useState('500');
  const [minLevel, setMinLevel] = useState('1');
  const [stock, setStock] = useState('');

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/rewards');
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch (e) {
      console.error('Failed to fetch rewards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      setStatusMessage(null);

      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          rarity,
          cost_gold: Number(costGold),
          min_level_required: Number(minLevel),
          preview_asset: 'theme-obsidian.png',
          stock: stock.trim() ? Number(stock) : null,
          is_available: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Reward item published to shop catalog');
        setShowCreateModal(false);
        setName('');
        setDescription('');
        setStock('');
        fetchRewards();
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
    if (!confirm('Are you sure you want to remove this reward from the catalog?')) return;
    try {
      const res = await fetch(`/api/admin/rewards?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('Reward item removed');
        fetchRewards();
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
            Rewards Shop CMS
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Create items for player acquisition using Gold. Configure rarity, level barriers, and inventory stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reward</span>
          </button>
          <button
            onClick={fetchRewards}
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

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            Loading reward catalog from database...
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            No rewards in catalog. Click "New Reward" to publish shop items.
          </div>
        ) : (
          rewards.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px] text-text-secondary">
                    {r.category}
                  </span>
                  <span className="font-mono text-[10px] text-primary font-bold">{r.rarity}</span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-text-primary">{r.name}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5 text-amber-streak font-semibold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{r.cost_gold} G</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-[11px]">Req Lvl {r.min_level_required}</span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1 rounded text-text-muted hover:text-crimson-threat"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Create Reward Item</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tactical Obsidian Theme"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item lore & UI aesthetic details..."
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
                  <option value="Theme">Theme</option>
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Badge">Badge</option>
                  <option value="Title">Title</option>
                  <option value="Boost">Boost</option>
                  <option value="Avatar">Avatar</option>
                  <option value="Utility">Utility</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Rarity</label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Cost (Gold)</label>
                <input
                  type="number"
                  value={costGold}
                  onChange={(e) => setCostGold(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Min Level Required</label>
                <input
                  type="number"
                  value={minLevel}
                  onChange={(e) => setMinLevel(e.target.value)}
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
                {creating ? 'Publishing...' : 'Publish Reward'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
