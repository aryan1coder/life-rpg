'use client';

import React, { useEffect, useState } from 'react';
import { Coins, Plus, Minus, RefreshCw, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

interface Transaction {
  id: string;
  profile_id: string;
  type: string;
  amount: number;
  balance_after: number;
  source: string;
  created_at: string;
  profiles?: {
    username: string;
    display_name?: string;
  };
}

export default function AdminEconomyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCirculation, setTotalCirculation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('500');
  const [reason, setReason] = useState('Administrative compensation');
  const [adjusting, setAdjusting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchEconomy = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/economy');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotalCirculation(data.totalCirculation || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomy();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    try {
      setAdjusting(true);
      const res = await fetch('/api/admin/economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: Number(amount),
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Successfully adjusted balance. New balance: ${data.newBalance} G`);
        setShowAdjustModal(false);
        setUserId('');
        fetchEconomy();
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Authoritative Economy Ledger
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time immutable audit trail for all Gold transactions, purchases, rewards, and admin grants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-semibold hover:bg-primary-hover shadow-lg transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Adjust Balance</span>
          </button>
          <button
            onClick={fetchEconomy}
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

      {/* Circulation Metric Card */}
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-text-muted">TOTAL VAULT CIRCULATION</span>
          <div className="text-3xl font-display font-bold text-amber-streak mt-1">
            {totalCirculation.toLocaleString()} G
          </div>
        </div>
        <Coins className="w-8 h-8 text-amber-streak/60" />
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated font-mono text-[11px] text-text-muted">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">OPERATOR</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">DELTA</th>
                <th className="py-3 px-4">BALANCE AFTER</th>
                <th className="py-3 px-4">SOURCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Loading ledger transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No transactions recorded. Ledger will track activity as players complete directives and buy rewards.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.amount >= 0;
                  return (
                    <tr key={tx.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="py-3 px-4 text-text-muted text-[11px]">
                        {new Date(tx.created_at).toLocaleTimeString()} {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-text-primary font-semibold">
                        {tx.profiles?.username || tx.profile_id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px]">
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold ${isCredit ? 'text-emerald-complete' : 'text-crimson-threat'}`}>
                        {isCredit ? `+${tx.amount}` : tx.amount} G
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{tx.balance_after} G</td>
                      <td className="py-3 px-4 text-text-muted text-[11px] truncate max-w-xs">{tx.source}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleAdjust}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">Administrative Ledger Adjustment</h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Target Operator User ID</label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID of target player"
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Adjustment Amount (+ for credit, - for debit)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted">Reason</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-elevated text-xs font-mono text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjusting}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-semibold hover:bg-primary-hover shadow-md disabled:opacity-50"
              >
                {adjusting ? 'Committing...' : 'Commit Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
