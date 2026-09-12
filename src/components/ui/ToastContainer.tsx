'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-surface-elevated/95 border-emerald-complete/30 text-text-primary'
                : isError
                ? 'bg-surface-elevated/95 border-crimson-threat/40 text-text-primary'
                : 'bg-surface-elevated/95 border-primary/30 text-text-primary'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-complete" />}
              {isError && <AlertCircle className="w-4 h-4 text-crimson-threat" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-primary" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold tracking-tight">{toast.title}</div>
              <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary p-0.5 transition-colors"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
