import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core background & canvas surfaces
        "bg-primary": "#0B0E15",
        "bg-secondary": "#11141C",
        "surface": "#151923",
        "surface-elevated": "#1B1F2A",
        "surface-container": "#1D2027",
        "surface-container-high": "#272A32",
        "surface-container-highest": "#32353D",
        "surface-container-low": "#191B23",
        "surface-container-lowest": "#0B0E15",
        "surface-bright": "#363941",

        // Borders
        "border-subtle": "rgba(255, 255, 255, 0.07)",
        "border-subtle-hover": "rgba(255, 255, 255, 0.15)",
        "border-focus": "rgba(99, 102, 241, 0.4)",
        "outline": "#908fa0",
        "outline-variant": "#464554",

        // Typography text tokens
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
        "text-disabled": "#334155",
        "on-surface": "#e1e2ec",
        "on-surface-variant": "#c7c4d7",
        "on-background": "#e1e2ec",

        // Primary Progression Accent (Electric Indigo)
        "primary": "#6366F1",
        "primary-hover": "#4F46E5",
        "primary-container": "#8083FF",
        "primary-subtle": "rgba(99, 102, 241, 0.12)",
        "primary-fixed": "#e1e0ff",
        "primary-fixed-dim": "#c0c1ff",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#0d0096",

        // Economy & Vault (Warm Radiant Gold)
        "secondary": "#F59E0B",
        "stitch-secondary": "#b9c8de",
        "on-secondary": "#233143",
        "secondary-container": "#39485a",
        "on-secondary-container": "#a7b6cc",
        "gold-accent": "#F59E0B",
        "gold-subtle": "rgba(245, 158, 11, 0.12)",

        // Telemetry & Tertiary Accent (Cyan)
        "tertiary": "#7bd0ff",
        "on-tertiary": "#00354a",
        "tertiary-container": "#009bd1",
        "on-tertiary-container": "#002d40",

        // Semantics & Status
        "emerald-complete": "#10B981",
        "emerald-subtle": "rgba(16, 185, 129, 0.12)",
        "amber-streak": "#F97316",
        "amber-subtle": "rgba(249, 115, 22, 0.12)",
        "crimson-threat": "#EF4444",
        "crimson-subtle": "rgba(239, 68, 68, 0.12)",

        // Character Core Attributes
        "attr-cyan": "#06B6D4",
        "attr-violet": "#8B5CF6",
        "attr-emerald": "#10B981",
        "attr-amber": "#F59E0B",
        "attr-rose": "#F43F5E",
      },
      spacing: {
        "gutter": "1.5rem",
        "gutter-sm": "1rem",
        "margin": "2rem",
        "margin-sm": "1rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
      },
      fontSize: {
        "display-hero": ["40px", { lineHeight: "48px", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-hero-mobile": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "500" }],
        "body-lg": ["15px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "label-code-lg": ["13px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-code-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "metric-numeral": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "Geist", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem", // 16px
        "3xl": "1.25rem", // 20px
      },
    },
  },
  plugins: [],
};

export default config;
