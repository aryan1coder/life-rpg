'use client';

import React, { useEffect, useState } from 'react';
import {
  Shirt,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AvatarItem {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  asset_key: string;
  required_level: number;
  cost_gold: number;
  is_active: boolean;
}

export default function AdminAvatarPage() {
  const [items, setItems] = useState<AvatarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slot, setSlot] = useState('body');
  const [rarity, setRarity] = useState('Common');
  const [assetKey, setAssetKey] = useState('body_initiate');
  const [requiredLevel, setRequiredLevel] = useState('1');
  const [costGold, setCostGold] = useState('0');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/avatar');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch avatar items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      setStatusMessage(null);

      const res = await fetch('/api/admin/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          slot,
          rarity,
          asset_key: assetKey,
          required_level: Number(requiredLevel),
          cost_gold: Number(costGold),
          is_active: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Avatar item published to armory catalog');
        setShowCreateModal(false);
        setName('');
        setDescription('');
        fetchItems();
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
    if (!confirm('Are you sure you want to delete this avatar item?')) return;
    try {
      const res = await fetch(`/api/admin/avatar?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('Avatar item removed');
        fetchItems();
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
            Avatar Armory CMS
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Publish visual avatar equipment. Configure evolution tier level thresholds and gear slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Gear</span>
          </button>
          <button
            onClick={fetchItems}
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

      {/* Items Table */}
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated font-mono text-[11px] text-text-muted">
                <th className="py-3 px-4">ITEM NAME</th>
                <th className="py-3 px-4">SLOT</th>
                <th className="py-3 px-4">RARITY</th>
                <th className="py-3 px-4">REQ LEVEL</th>
                <th className="py-3 px-4">ASSET KEY</th>
                <th className="py-3 px-4">COST</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    Loading armory items from database...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No avatar gear defined. Click "New Gear" to create equipable items.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text-primary">{it.name}</div>
                      <div className="text-[10px] text-text-muted truncate max-w-xs">{it.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px] uppercase font-mono">
                        {it.slot}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">{it.rarity}</td>
                    <td className="py-3 px-4 font-bold text-text-primary">Level {it.required_level}</td>
                    <td className="py-3 px-4 text-text-muted font-mono text-[11px]">{it.asset_key}</td>
                    <td className="py-3 px-4 text-amber-streak font-semibold">{it.cost_gold} G</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-crimson-threat hover:bg-surface-elevated"
                        title="Delete item"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Create Avatar Gear</h3>
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
                placeholder="e.g. Tactical HUD Monocle"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gear lore and visual aesthetic details..."
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Equip Slot</label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                >
                  <option value="head">Head</option>
                  <option value="face">Face</option>
                  <option value="body">Body</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="legs">Legs</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessory">Accessory</option>
                  <option value="weapon_or_tool">Weapon / Tool</option>
                  <option value="aura">Aura</option>
                  <option value="background">Background</option>
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
                <label className="text-xs font-mono text-text-muted">Required Level</label>
                <input
                  type="number"
                  value={requiredLevel}
                  onChange={(e) => setRequiredLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted">Cost (Gold, 0=Free)</label>
                <input
                  type="number"
                  value={costGold}
                  onChange={(e) => setCostGold(e.target.value)}
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
                {creating ? 'Publishing...' : 'Publish Gear'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
