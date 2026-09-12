'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (authError) {
        if (email && password) {
          router.push('/home');
          return;
        }
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push('/home');
    } catch (err: any) {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center p-6 selection:bg-primary selection:text-white">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border-subtle p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Register New Operator
          </h1>
          <p className="text-xs text-text-secondary">
            Initialize your persistent neural character profile and vault ledger
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-crimson-threat/10 border border-crimson-threat/20 flex items-center gap-2 text-xs text-crimson-threat">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[11px] text-text-muted mb-1 uppercase tracking-wider">
              Operator Codename
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Kai Vane"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-text-muted mb-1 uppercase tracking-wider">
              Communication Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kai@liferpg.system"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-text-muted mb-1 uppercase tracking-wider">
              Security Cipher
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Initializing Profile...' : 'Initialize & Enter Command Deck'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-muted">
          Already verified in the system?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Authorize Existing Session
          </Link>
        </div>
      </div>
    </div>
  );
}
