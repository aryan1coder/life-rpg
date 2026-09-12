'use client';

import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: any;
  created_at: string;
  profiles?: {
    username: string;
    display_name?: string;
  };
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Immutable log of all privileged commands, content creations, player state tunings, and economy modifications.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-mono"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated text-[11px] text-text-muted">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">ACTION</th>
                <th className="py-3 px-4">TARGET TYPE</th>
                <th className="py-3 px-4">TARGET ID</th>
                <th className="py-3 px-4">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-4 text-text-muted text-[11px]">
                      {new Date(l.created_at).toLocaleTimeString()} {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-primary font-bold text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{l.target_type}</td>
                    <td className="py-3 px-4 text-text-muted text-[11px] truncate max-w-[150px]">
                      {l.target_id || '—'}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-[11px] truncate max-w-xs">
                      {l.metadata ? JSON.stringify(l.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
