'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isConfigured) {
      setError('Supabase is not configured. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase client failed to initialize. Check .env.local configuration.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            display_name: username.trim(),
          },
        },
      });

      if (authError) {
        if (
          authError.status === 429 ||
          authError.message?.toLowerCase().includes('rate limit') ||
          authError.message?.toLowerCase().includes('too many')
        ) {
          setError('Too many signup attempts. Please wait a little before trying again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user && !data.session) {
        setInfoMessage('Registration successful! Check your email inbox to verify your address before authorizing your session.');
        setLoading(false);
        return;
      }

      router.push('/lobby');
    } catch (err: any) {
      setError(err?.message || 'Registration request failed. Please check network connection.');
      setLoading(false);
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

        {/* Supabase Unconfigured Status Notice */}
        {!isConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Supabase Connection Required</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              The command deck requires an active connection to your Supabase project. Operator registration cannot proceed until environment variables are configured in <code className="text-primary font-mono text-[11px]">.env.local</code>.
            </p>
            <div className="bg-bg-primary/80 rounded-xl p-3 border border-border-subtle font-mono text-[10px] text-text-muted space-y-1">
              <div className="text-amber-300 font-medium"># Required in .env.local:</div>
              <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-crimson-threat/10 border border-crimson-threat/20 flex items-center gap-2 text-xs text-crimson-threat">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs text-primary">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{infoMessage}</span>
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
                disabled={!isConfigured}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. OperatorOne"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!isConfigured}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!isConfigured}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isConfigured || loading}
            className={`mt-2 w-full py-3 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
              isConfigured
                ? 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-primary/20 cursor-pointer'
                : 'bg-surface-elevated text-text-muted border border-border-subtle cursor-not-allowed'
            }`}
          >
            {isConfigured ? (
              <>
                <span>{loading ? 'Initializing Profile...' : 'Initialize & Enter Command Deck'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Awaiting Supabase Connection</span>
              </>
            )}
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
