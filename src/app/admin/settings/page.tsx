'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [xpMult, setXpMult] = useState('1.0');
  const [goldMult, setGoldMult] = useState('1.0');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || [];
        for (const s of settings) {
          if (s.key === 'maintenance_mode') setMaintenance(Boolean(s.value?.enabled));
          if (s.key === 'xp_multiplier') setXpMult(String(s.value?.multiplier || '1.0'));
          if (s.key === 'gold_multiplier') setGoldMult(String(s.value?.multiplier || '1.0'));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);

      await Promise.all([
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'maintenance_mode', value: { enabled: maintenance }, description: 'Global system maintenance state' }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'xp_multiplier', value: { multiplier: Number(xpMult) }, description: 'Global base XP multiplier' }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'gold_multiplier', value: { multiplier: Number(goldMult) }, description: 'Global base Gold yield multiplier' }),
        }),
      ]);

      setStatusMessage('System configuration saved successfully');
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            System & Parameter Settings
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Configure global engine multipliers, operational flags, and maintenance directives.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-primary/30 text-xs font-mono text-text-primary">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-xl flex flex-col gap-5 p-6 rounded-2xl bg-surface border border-border-subtle">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated border border-border-subtle">
          <div>
            <div className="text-sm font-semibold text-text-primary font-mono">Maintenance Mode</div>
            <div className="text-xs text-text-muted">Pause player actions and display system downtime banner</div>
          </div>
          <input
            type="checkbox"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5 font-mono text-xs">
          <label className="text-text-muted">Global XP Yield Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={xpMult}
            onChange={(e) => setXpMult(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5 font-mono text-xs">
          <label className="text-text-muted">Global Gold Bounty Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={goldMult}
            onChange={(e) => setGoldMult(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
