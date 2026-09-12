'use client';

import React from 'react';
import { AvatarItem, AvatarSlot } from '@/lib/game/types';
import { getEvolutionTierForLevel } from '@/lib/game/progression';
import { Sparkles, Shield, Zap, Eye, Compass, Terminal, Award } from 'lucide-react';

interface AvatarRendererProps {
  level: number;
  equippedLoadout?: Record<string, string>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showBadge?: boolean;
  className?: string;
  animate?: boolean;
}

export function AvatarRenderer({
  level,
  equippedLoadout = {},
  size = 'md',
  showBadge = true,
  className = '',
  animate = true,
}: AvatarRendererProps) {
  const evolution = getEvolutionTierForLevel(level);

  // Equipped slot lookups
  const hasHead = Boolean(equippedLoadout['head']);
  const hasFace = Boolean(equippedLoadout['face']);
  const hasOuter = Boolean(equippedLoadout['outerwear']);
  const hasTool = Boolean(equippedLoadout['weapon_or_tool']);
  const hasAura = Boolean(equippedLoadout['aura']) || evolution.tier >= 6;
  const hasDrone = equippedLoadout['accessory'] === 'accessory_drone_sentinel' || evolution.tier >= 7;
  const hasHalo = equippedLoadout['aura'] === 'aura_celestial_halo' || evolution.tier >= 8;
  const hasVisor = equippedLoadout['face'] === 'face_hud_visor' || evolution.tier >= 4;
  const hasCloak = equippedLoadout['outerwear'] === 'outerwear_storm_cloak' || evolution.tier >= 5;
  const hasVest = equippedLoadout['outerwear'] === 'outerwear_ballistic_vest' || evolution.tier >= 3;
  const hasBlade = equippedLoadout['weapon_or_tool'] === 'weapon_chronos_blade' || evolution.tier >= 7;

  // Size dimensions
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-32 h-40',
    lg: 'w-48 h-60',
    xl: 'w-64 h-80',
    hero: 'w-72 h-96 sm:w-80 sm:h-[420px] lg:w-96 lg:h-[480px]',
  }[size];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* SVG Canvas Container */}
      <div className={`relative ${sizeClasses} rounded-3xl overflow-hidden flex items-center justify-center p-2`}>
        {/* Ambient Backlight Glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-30 blur-2xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: evolution.accentColor }}
        />

        {/* Layer 0: Background Canvas */}
        <svg
          viewBox="0 0 400 500"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear and Radial Gradients */}
            <radialGradient id={`bgGlow_${evolution.tier}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={evolution.accentColor} stopOpacity="0.25" />
              <stop offset="60%" stopColor="#151923" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B0E15" stopOpacity="0.95" />
            </radialGradient>

            <linearGradient id="bodySuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2432" />
              <stop offset="50%" stopColor="#171A24" />
              <stop offset="100%" stopColor="#10121A" />
            </linearGradient>

            <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D3345" />
              <stop offset="100%" stopColor="#1A1E29" />
            </linearGradient>

            <linearGradient id="accentGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={evolution.accentColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Background Card Rect */}
          <rect
            x="10"
            y="10"
            width="380"
            height="480"
            rx="28"
            fill={`url(#bgGlow_${evolution.tier})`}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />

          {/* Ambient Grid Lines in Background */}
          <g opacity="0.12" stroke="currentColor" className="text-white" strokeWidth="0.75">
            <line x1="10" y1="120" x2="390" y2="120" strokeDasharray="4 4" />
            <line x1="10" y1="240" x2="390" y2="240" strokeDasharray="4 4" />
            <line x1="10" y1="360" x2="390" y2="360" strokeDasharray="4 4" />
            <line x1="120" y1="10" x2="120" y2="490" strokeDasharray="4 4" />
            <line x1="280" y1="10" x2="280" y2="490" strokeDasharray="4 4" />
            <circle cx="200" cy="220" r="140" strokeWidth="1" />
          </g>

          {/* Layer 1: Aura / Celestial Halo (Tier 6+) */}
          {hasAura && (
            <g className={animate ? 'animate-spin' : ''} style={{ transformOrigin: '200px 220px', animationDuration: '24s' }}>
              <circle cx="200" cy="220" r="150" stroke={evolution.accentColor} strokeWidth="1.5" strokeDasharray="12 8" opacity="0.45" />
              <circle cx="200" cy="220" r="165" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="4 16" opacity="0.3" />
            </g>
          )}

          {hasHalo && (
            <ellipse cx="200" cy="85" rx="55" ry="14" fill="none" stroke="#FCD34D" strokeWidth="2.5" opacity="0.85" filter="drop-shadow(0 0 8px #F59E0B)" />
          )}

          {/* Layer 2: Character Silhouette & Garments */}

          {/* Phase Cloak Backdrop (Tier 5+) */}
          {hasCloak && (
            <path
              d="M130 180 Q100 320 85 450 L315 450 Q300 320 270 180 Z"
              fill="#13151D"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1.5"
            />
          )}

          {/* Legs & Trousers (Fully Clothed) */}
          <g>
            {/* Left Leg */}
            <path
              d="M165 310 L155 430 L185 430 L195 310 Z"
              fill="url(#bodySuitGrad)"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
            />
            {/* Right Leg */}
            <path
              d="M205 310 L215 430 L245 430 L235 310 Z"
              fill="url(#bodySuitGrad)"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
            />
            {/* Boots / Kinetic Footwear */}
            <path d="M150 430 L150 455 L190 455 L188 430 Z" fill="#242938" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
            <path d="M210 430 L212 455 L252 455 L250 430 Z" fill="#242938" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
            {/* Kinetic Sole Accent */}
            <line x1="150" y1="453" x2="190" y2="453" stroke={evolution.accentColor} strokeWidth="2.5" opacity="0.8" />
            <line x1="212" y1="453" x2="252" y2="453" stroke={evolution.accentColor} strokeWidth="2.5" opacity="0.8" />
          </g>

          {/* Torso & Field Tunic */}
          <g>
            <path
              d="M145 180 L255 180 L240 320 L160 320 Z"
              fill="url(#bodySuitGrad)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1.5"
            />

            {/* Utility Belt */}
            <rect x="155" y="305" width="90" height="15" rx="3" fill="#242938" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <rect x="190" y="303" width="20" height="19" rx="3" fill={evolution.accentColor} opacity="0.9" />

            {/* Vanguard Ballistic Vest (Tier 3+) */}
            {hasVest && (
              <path
                d="M152 185 L248 185 L240 285 L160 285 Z"
                fill="url(#armorGrad)"
                stroke={evolution.accentColor}
                strokeWidth="1.5"
                opacity="0.9"
              />
            )}

            {/* Seams & Kinetic Telemetry Lines */}
            <line x1="175" y1="185" x2="185" y2="280" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <line x1="225" y1="185" x2="215" y2="280" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <circle cx="200" cy="235" r="5" fill={evolution.accentColor} opacity="0.8" />
          </g>

          {/* Arms & Hands */}
          <g>
            {/* Left Arm */}
            <path
              d="M145 180 L120 280 L140 285 L160 195 Z"
              fill="url(#bodySuitGrad)"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
            />
            {/* Right Arm */}
            <path
              d="M255 180 L280 280 L260 285 L240 195 Z"
              fill="url(#bodySuitGrad)"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
            />
            {/* Tactical Wrist Gauntlet (Left) */}
            <rect x="120" y="260" width="22" height="16" rx="2" fill="#242938" stroke={evolution.accentColor} strokeWidth="1" />
          </g>

          {/* Neck & Head */}
          <g>
            {/* Neck */}
            <rect x="188" y="150" width="24" height="35" rx="4" fill="#E2E8F0" opacity="0.9" />

            {/* Head Silhouette */}
            <ellipse cx="200" cy="130" rx="34" ry="40" fill="#E2E8F0" />

            {/* Hair / Stylized Hood */}
            {hasHead ? (
              <path
                d="M165 130 C165 90 235 90 235 130 C230 115 170 115 165 130 Z"
                fill="#1E2230"
                stroke={evolution.accentColor}
                strokeWidth="1.5"
              />
            ) : (
              <path
                d="M166 125 C166 95 234 95 234 125 Q200 110 166 125 Z"
                fill="#1E2230"
              />
            )}

            {/* Tactical HUD Visor / Monocle (Tier 4+) */}
            {hasVisor ? (
              <g>
                <path
                  d="M175 125 L225 125 L220 137 L180 137 Z"
                  fill={evolution.accentColor}
                  fillOpacity="0.45"
                  stroke={evolution.accentColor}
                  strokeWidth="1.5"
                />
                <circle cx="210" cy="131" r="2.5" fill="#FFFFFF" />
              </g>
            ) : (
              /* Minimal Eyes */
              <g opacity="0.6">
                <rect x="182" y="128" width="8" height="3" rx="1.5" fill="#334155" />
                <rect x="210" y="128" width="8" height="3" rx="1.5" fill="#334155" />
              </g>
            )}
          </g>

          {/* Layer 3: Equipped Signature Weapon / Tool */}
          {hasBlade && (
            <g>
              <line x1="280" y1="285" x2="310" y2="160" stroke="#38BDF8" strokeWidth="3" filter="drop-shadow(0 0 6px #38BDF8)" />
              <line x1="275" y1="290" x2="282" y2="280" stroke="#FFFFFF" strokeWidth="4" />
            </g>
          )}

          {/* Layer 4: Companion Telemetry Drone (Tier 7+) */}
          {hasDrone && (
            <g className={animate ? 'animate-bounce' : ''} style={{ animationDuration: '3s' }}>
              <rect x="75" y="130" width="28" height="28" rx="8" fill="#1B1F2A" stroke={evolution.accentColor} strokeWidth="1.5" />
              <circle cx="89" cy="144" r="5" fill="#38BDF8" opacity="0.9" />
              <line x1="89" y1="120" x2="89" y2="128" stroke="#38BDF8" strokeWidth="1.5" />
            </g>
          )}

          {/* Ground Contact Shadow */}
          <ellipse cx="200" cy="465" rx="80" ry="10" fill="black" opacity="0.4" />
        </svg>

        {/* Level Emblem Overlay in Corner */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated/80 backdrop-blur-md border border-border-subtle shadow-md">
          <Award className="w-3 h-3 text-primary" />
          <span className="font-mono text-[10px] text-text-primary font-semibold">
            LVL {level}
          </span>
        </div>

        {/* Evolution Tier Badge in Corner */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-elevated/80 backdrop-blur-md border border-border-subtle shadow-md">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: evolution.accentColor }} />
          <span className="font-mono text-[10px] text-text-secondary font-medium uppercase">
            TIER {evolution.tier}
          </span>
        </div>
      </div>

      {/* Evolution Descriptor Label */}
      {showBadge && (
        <div className="mt-3 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: evolution.accentColor }}
            />
            <span className="font-display font-semibold text-sm text-text-primary">
              {evolution.name}
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-mono mt-0.5 max-w-[240px] truncate">
            {evolution.signatureGear}
          </span>
        </div>
      )}
    </div>
  );
}
