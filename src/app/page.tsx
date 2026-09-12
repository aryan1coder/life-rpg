'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  const { profile } = useGame();
  const isAuthenticated = Boolean(profile);
  const [selectedSpec, setSelectedSpec] = useState<'tactical' | 'bio' | 'architect'>('tactical');

  return (
    <div className="bg-[#050608] text-[#F3F4F6] min-h-screen antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient Apple-style Top Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[640px] mesh-glow pointer-events-none -z-10" />
      <div className="fixed -top-40 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-10 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* iOS Frosted Glass Top Navigation */}
      <header className="sticky top-4 z-50 px-4 max-w-6xl mx-auto w-full">
        <nav className="glass-panel rounded-full px-5 py-2.5 flex items-center justify-between transition-all">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(99,102,241,0.35)]">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">LIFE RPG</span>
              <span className="text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                OS 4
              </span>
            </div>
          </Link>

          {/* Streamlined Centered Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a className="hover:text-white transition-colors tracking-wide" href="#hud">
              Command Deck
            </a>
            <a className="hover:text-white transition-colors tracking-wide" href="#directives">
              Architecture
            </a>
            <a className="hover:text-white transition-colors tracking-wide" href="#archetypes">
              Specializations
            </a>
            <a className="hover:text-white transition-colors tracking-wide" href="#engine">
              Engine Specs
            </a>
          </div>

          {/* Dynamic Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/lobby"
                  className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all flex items-center gap-1.5"
                >
                  <span>Enter Command Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-2 py-1"
                >
                  Operator Access
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all"
                >
                  Begin Directive
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Flow */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          {/* iOS Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-indigo-300 text-xs font-medium tracking-wide mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Executive Behavioral OS</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Gamify Reality. <br />
            <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Level Up Your Existence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed max-w-2xl mb-10">
            Transform habits, biometric routines, and operational milestones into intuitive quests with real-time neural telemetry and Apple-grade precision.
          </p>

          {/* High-Impact Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
            <Link
              href={isAuthenticated ? '/lobby' : '/auth/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm sm:text-base tracking-tight shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Enter Command Deck' : 'Begin Directive'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {!isAuthenticated && (
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-pill text-neutral-300 hover:text-white text-sm font-medium tracking-tight hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Register Operator</span>
              </Link>
            )}
          </div>

          {/* Genuine Technical Capabilities Strip (No fake stats) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-neutral-400 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Supabase PostgreSQL + SSR Auth</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Deterministic Progression Math</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero LocalStorage State</span>
            </div>
          </div>
        </section>

        {/* Apple Health / RPG Command Deck Showcase */}
        <section className="w-full mb-28" id="hud">
          <div className="glass-panel rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Terminal Status Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-white font-medium tracking-tight">Active Deck Terminal</span>
                <span className="text-[11px] font-mono text-neutral-500">// NODE 01 SECURE</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span className="hidden sm:inline text-neutral-500">ENGINE LATENCY 4ms</span>
                <span className="text-sky-400">STATE SYNC: REALTIME</span>
              </div>
            </div>

            {/* HUD Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Widget: Character Spec Telemetry */}
              <div className="lg:col-span-4 glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] text-indigo-400 font-medium tracking-wider uppercase">
                      TELEMETRY MATRIX
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                      TIER I
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/10 border border-white/10 flex items-center justify-center p-2 shadow-inner">
                      <Terminal className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base leading-tight">
                        Adaptive Profile
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">Real-Time Attributes</p>
                    </div>
                  </div>

                  {/* Attribute Bars */}
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400 font-medium">Focus Velocity (INT)</span>
                        <span className="text-white font-mono text-xs">92%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400 font-medium">Stamina Retention (CON)</span>
                        <span className="text-white font-mono text-xs">88%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400 font-medium">Execution Willpower (STR)</span>
                        <span className="text-white font-mono text-xs">95%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-neutral-400 font-medium">Circadian Discipline (DEX)</span>
                        <span className="text-white font-mono text-xs">84%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>DETERMINISTIC XP</span>
                  <span className="text-indigo-300 font-semibold">POLYNOMIAL CURVE</span>
                </div>
              </div>

              {/* Center Widget: Active Directives Stream */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold tracking-wider text-white uppercase">
                        Active Directives
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                      Live Queue
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Directive 1 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <h4 className="text-sm font-semibold text-white">Deep Work Sprint Alpha</h4>
                        </div>
                        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full font-medium">
                          DAILY
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-2">Zero-distraction 90-minute architecture session.</p>
                      <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Clock className="w-3 h-3 text-neutral-400" /> 90 MINS
                        </span>
                        <span className="text-indigo-400 font-medium">+150 XP · 40 G</span>
                      </div>
                    </div>

                    {/* Directive 2 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-medium text-neutral-400 line-through">
                            Morning Circadian Light Protocol
                          </h4>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          +100 XP
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">Outdoor natural sunlight exposure within 30 min of waking.</p>
                    </div>

                    {/* Directive 3 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          <h4 className="text-sm font-medium text-neutral-300">Resistance Training Protocol</h4>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400">HABIT</span>
                      </div>
                      <p className="text-xs text-neutral-500">Compound strength lifts with strict form discipline.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-[11px]">AUTONOMOUS QUEST ENGINE</span>
                  <span className="text-emerald-400 text-[11px] font-mono">INSTANT VERIFICATION</span>
                </div>
              </div>

              {/* Right Widget: Telemetry Radar Hub */}
              <div className="lg:col-span-3 glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Telemetry Radar
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">
                      REALTIME
                    </span>
                  </div>

                  {/* Radar Graphic */}
                  <div className="flex items-center justify-center py-2 relative">
                    <svg className="w-36 h-36 text-indigo-500" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                      <circle cx="50" cy="50" fill="none" r="28" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
                      <circle cx="50" cy="50" fill="none" r="14" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                      <line stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" x1="50" x2="50" y1="6" y2="94" />
                      <line stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" x1="6" x2="94" y1="50" y2="50" />
                      <polygon fill="currentColor" fillOpacity="0.25" points="50,14 82,42 70,82 28,75 18,38" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="50" cy="14" fill="#818CF8" r="2.5" />
                      <circle cx="82" cy="42" fill="#818CF8" r="2.5" />
                      <circle cx="70" cy="82" fill="#38BDF8" r="2.5" />
                      <circle cx="28" cy="75" fill="#818CF8" r="2.5" />
                      <circle cx="18" cy="38" fill="#38BDF8" r="2.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-mono text-[10px] text-indigo-300 font-semibold">96.4</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 font-medium block">CONSISTENCY</span>
                      <span className="font-mono text-base font-semibold text-sky-400">100%</span>
                    </div>
                    <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 font-medium block">STREAK MULT</span>
                      <span className="font-mono text-base font-semibold text-indigo-300">1.5x</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-400">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-mono">Biometric Telemetry Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Architecture */}
        <section className="w-full mb-28" id="directives">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase block mb-2">
                System Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered for Frictionless Momentum
              </h2>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm mt-3 md:mt-0 font-normal">
              Replacing chaotic dopamine loops with calm, measurable, high-stakes progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 01 */}
            <div className="glass-panel rounded-3xl p-7 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-indigo-400 tracking-wider uppercase block mb-2">
                  Module 01
                </span>
                <h3 className="text-lg font-semibold text-white mb-2.5">Directive Engine</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Algorithmic breakdowns transform daunting multi-month targets into calibrated daily micro-directives with dynamic XP modifiers and anti-burnout guards.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                AUTONOMOUS CALIBRATION
              </div>
            </div>

            {/* Module 02 */}
            <div className="glass-panel rounded-3xl p-7 hover:border-sky-500/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-sky-400 tracking-wider uppercase block mb-2">
                  Module 02
                </span>
                <h3 className="text-lg font-semibold text-white mb-2.5">Dynamic Character Attributes</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Real-time recalculation of five core cognitive and physical vectors (STR, DEX, INT, CON, CHA) tied directly to completed directives and streak longevity.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                REALTIME RADAR CALCULATION
              </div>
            </div>

            {/* Module 03 */}
            <div className="glass-panel rounded-3xl p-7 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-indigo-400 tracking-wider uppercase block mb-2">
                  Module 03
                </span>
                <h3 className="text-lg font-semibold text-white mb-2.5">Economy & Accolades</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Complete directives to earn non-inflationary Gold currency. Unlock cosmetic titles, interface themes, and permanent milestone medals in the tactical armory.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                VERIFIED ARMORY VAULT
              </div>
            </div>
          </div>
        </section>

        {/* Specialization Archetypes */}
        <section className="w-full mb-28" id="archetypes">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase block mb-2">
              Operator Specialization
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Choose Your Operating Paradigm
            </h2>
            <p className="text-sm text-neutral-400">
              Tailor your dashboard telemetry weights to match your primary operational pursuit.
            </p>
          </div>

          {/* Interactive Class Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tactical Execution */}
            <div
              onClick={() => setSelectedSpec('tactical')}
              className={`glass-panel rounded-3xl p-7 relative flex flex-col justify-between cursor-pointer transition-all ${
                selectedSpec === 'tactical'
                  ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/30'
                  : 'hover:border-white/20'
              }`}
            >
              {selectedSpec === 'tactical' && (
                <div className="absolute top-6 right-6 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium font-mono">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-indigo-400 font-semibold block mb-2">SPEC // 01</span>
                <h3 className="text-xl font-bold text-white mb-2">Tactical Execution</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  Tailored for deep work velocity, technical problem solving, and aggressive delivery timelines. Built for software engineers and systems builders.
                </p>
                <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>+25% Deep Work Focus Modifier</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Output Velocity Optimization</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio-Sync / Core */}
            <div
              onClick={() => setSelectedSpec('bio')}
              className={`glass-panel rounded-3xl p-7 relative flex flex-col justify-between cursor-pointer transition-all ${
                selectedSpec === 'bio'
                  ? 'border-sky-500/50 shadow-[0_0_30px_rgba(56,189,248,0.2)] ring-1 ring-sky-500/30'
                  : 'hover:border-white/20'
              }`}
            >
              {selectedSpec === 'bio' && (
                <div className="absolute top-6 right-6 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-medium font-mono">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-sky-400 font-semibold block mb-2">SPEC // 02</span>
                <h3 className="text-xl font-bold text-white mb-2">Bio-Sync / Core</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  Physical conditioning, nutrition protocols, Zone-2 endurance, and circadian restoration. Treats recovery as a core performance attribute.
                </p>
                <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>+30% Stamina Regeneration</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Circadian Discipline Priority</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Architect */}
            <div
              onClick={() => setSelectedSpec('architect')}
              className={`glass-panel rounded-3xl p-7 relative flex flex-col justify-between cursor-pointer transition-all ${
                selectedSpec === 'architect'
                  ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/30'
                  : 'hover:border-white/20'
              }`}
            >
              {selectedSpec === 'architect' && (
                <div className="absolute top-6 right-6 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium font-mono">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-indigo-400 font-semibold block mb-2">SPEC // 03</span>
                <h3 className="text-xl font-bold text-white mb-2">Strategic Architect</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  Macro milestone execution, venture roadmap development, capital allocation, and compounding multi-year vision achievements.
                </p>
                <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>+40% Milestone Compounding</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Long-Horizon Execution Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Engine Specs & Security Pillars (Honest Architecture Overview) */}
        <section className="w-full mb-28" id="engine">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-mono text-sky-400 tracking-wider uppercase block mb-2">
                Production Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Engine Specs & Persistence Guarantees
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mt-2 md:mt-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>PRODUCTION AUDITED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-indigo-400 block mb-2">PILLAR 01</span>
                <h3 className="text-base font-semibold text-white mb-2">Real PostgreSQL Persistence</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Powered by Supabase Auth and PostgreSQL. User profiles, active directives, inventory items, and unlocked accolades persist in verified relational tables with row-level security.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-neutral-500">
                SQL MIGRATIONS 001–005
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-sky-400 block mb-2">PILLAR 02</span>
                <h3 className="text-base font-semibold text-white mb-2">Zero LocalStorage State</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Game state, profile data, and session credentials are never stored in vulnerable browser localStorage. Sessions are maintained via secure, encrypted HttpOnly cookie tokens.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-neutral-500">
                SSR COOKIE ARCHITECTURE
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-emerald-400 block mb-2">PILLAR 03</span>
                <h3 className="text-base font-semibold text-white mb-2">Deterministic Progression Math</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Mathematical polynomial level curve ensures zero XP overflow errors, exact level-up transitions, dynamic streak multiplier calculations, and verifiable attribute progression.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-neutral-500">
                20/20 VERIFIED TEST SUITE
              </div>
            </div>
          </div>
        </section>

        {/* Closing Apple Keynote Call to Action */}
        <section className="w-full mb-12">
          <div className="glass-panel rounded-3xl p-10 sm:p-16 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
            </div>
            <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase mb-3">
              COMMAND TERMINAL READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 max-w-xl">
              Claim Your Callsign. <br />
              Initialize Protocol.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mb-8 leading-relaxed">
              Deploy your operator profile and convert your daily existence into a quiet, high-stakes kinetic command console.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={isAuthenticated ? '/lobby' : '/auth/login'}
                className="px-8 py-4 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm tracking-tight shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2"
              >
                <span>{isAuthenticated ? 'Enter Command Deck' : 'Begin Directive'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/signup"
                  className="px-6 py-4 rounded-full glass-pill text-neutral-300 hover:text-white text-sm font-medium tracking-tight hover:border-white/20 transition-all"
                >
                  Register Operator
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Apple-Style Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 pb-12 pt-6 border-t border-white/5 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </div>
          <span className="text-neutral-400 font-medium">LIFE RPG OS</span>
          <span>© 2025 All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <a className="hover:text-neutral-300 transition-colors" href="#hud">
            COMMAND DECK
          </a>
          <a className="hover:text-neutral-300 transition-colors" href="#directives">
            DIRECTIVES
          </a>
          <a className="hover:text-neutral-300 transition-colors" href="#archetypes">
            SPECIALIZATIONS
          </a>
          <a className="hover:text-neutral-300 transition-colors" href="#engine">
            ENGINE SPECS
          </a>
        </div>
      </footer>
    </div>
  );
}
