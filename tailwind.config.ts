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

        // Typography text tokens
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
        "text-disabled": "#334155",

        // Primary Progression Accent (Electric Indigo)
        "primary": "#6366F1",
        "primary-hover": "#4F46E5",
        "primary-container": "#8083FF",
        "primary-subtle": "rgba(99, 102, 241, 0.12)",
        "on-primary": "#FFFFFF",

        // Economy & Vault (Warm Radiant Gold)
        "secondary": "#F59E0B",
        "gold-accent": "#F59E0B",
        "gold-subtle": "rgba(245, 158, 11, 0.12)",

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
