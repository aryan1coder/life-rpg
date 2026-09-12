---
name: Kinetic Command Deck
colors:
  surface: '#151923'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353d'
  bg-primary: '#0B0E15'
  bg-secondary: '#11141C'
  surface-elevated: '#1B1F2A'
  border-subtle: rgba(255, 255, 255, 0.07)
  border-focus: rgba(99, 102, 241, 0.4)
  emerald-complete: '#10B981'
  amber-streak: '#F97316'
  crimson-threat: '#EF4444'
  text-primary: '#F1F5F9'
  text-secondary: '#94A3B8'
  text-muted: '#64748B'
typography:
  headline-hero:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-hero-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  stat-numeric:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a disciplined, modern productivity operating environment where high-leverage execution meets understated RPG mastery. The visual tone aligns with modern craft tooling—combining the clean structural confidence of modern engineering dashboards with the tactile poise of premium operating systems, layered with subtle game mechanics.

It deliberately eliminates gamified kitsch: there are no saturated neon sci-fi glows, no faux-military telemetry noise, and no aggressive HUD borders. Progression is expressed through pristine visual hierarchy, crisp typographic cadence, and deliberate color signals against quiet, deeply layered dark surfaces. The user feels calm, empowered, and in total control of their execution loop.

## Colors

The palette is engineered around an 85–90% neutral dark canvas to provide immense visual rest and focus, punctuated only by purposeful semantic accents:

- **Neutral Foundations**: Deep void background (`#0B0E15`), stepping cleanly into secondary panels (`#11141C`), card surfaces (`#151923`), and elevated interactive states (`#1B1F2A`). All layer boundaries rely on a hairline border of `rgba(255, 255, 255, 0.07)` rather than high-contrast outlines.
- **Electric Indigo (`#6366F1`)**: The primary vehicle of intentionality. Used strictly for XP progress vectors, selected navigation items, active filter toggles, and primary commitments.
- **Prestige Gold (`#F59E0B`)**: Handled with absolute restraint. Reserved exclusively for active currency balances, rare artifact tiers, and high-level milestones.
- **Status Accents**:
  - **Emerald (`#10B981`)**: Finished states, positive completion delta, and checked objectives.
  - **Amber (`#F97316`)**: Daily streaks, cadence momentum, and time-critical timers.
  - **Crimson (`#EF4444`)**: Boss threats, raid health bars, and hard deadline warnings.
  - **Cyan (`#06B6D4`)**: Intellect metrics, focus depth metrics, and skill-tree analysis.
- **Typography & Text Contrast**: Content is delivered in Slate-100 (`#F1F5F9`) for headers and primary values, Slate-400 (`#94A3B8`) for descriptions, and Slate-500 (`#64748B`) for structural meta-labels, easily satisfying WCAG AAA standards on dark surfaces.

## Typography

Typography establishes an effortless, modern editorial feel while reserving mechanical precision strictly for telemetry values:

- **Headlines (`Geist`)**: Tight, contemporary, and engineered with subtle negative tracking. Headlines convey quiet executive authority without theatrical stylization.
- **Body & Continuous Text (`Inter`)**: Neutral, transparent, and frictionless. Used across task directives, documentation modules, notes, and dialog prompts.
- **Telemetry & Numbers (`JetBrains Mono`)**: Confined strictly to numerical calculations, timestamp durations, experience points, currency counters, and small status pill meta-labels. Never used for general body copy or titles.

## Layout & Spacing

The layout model is anchored by a structured desktop-first responsive grid that optimizes spatial breathing room and cognitive focus:

- **Desktop (1280px+)**: 12-column fluid grid with standard `1.5rem` gutters and `2rem` outer page margins. Primary layouts allocate a left utility column (3 cols) for character trajectory and status metrics, a central execution canvas (6 cols) for active tasks, projects, and quest queues, and a right ledger (3 cols) for streaks, calendar telemetry, and inventory assets.
- **Tablet (768px – 1279px)**: 8-column layout. Character progress condenses into a horizontal metric strip; main focus tasks occupy 5 columns with auxiliary stats taking 3 columns.
- **Mobile (<768px)**: 4-column single-column flow with persistent top and bottom telemetry anchors and collapsible operational views.
- **Spacing Rhythm**: Internal card layouts maintain consistent `1.5rem` padding for prominent modules and `1rem` for nested or secondary list cards. Gaps adhere cleanly to base-4 intervals (`4px`, `8px`, `16px`, `24px`, `32px`).

## Elevation & Depth

Visual hierarchy is maintained through subtle tonal layering and hairline edge definitions, completely eschewing harsh drop shadows, outer colored halos, or heavy glass blurs:

- **Base Layer (Canvas)**: Solid `#0B0E15`.
- **Card Layer (Default Surface)**: Solid or ultra-subtle tinted surface `#151923` framed with an exact `1px` border of `rgba(255, 255, 255, 0.07)`. No heavy drop shadows are applied at rest.
- **Hover & Interaction State**: Elevation is signaled via surface brightness (`#1B1F2A`) and a delicate ambient shadow: `0 4px 20px -2px rgba(0, 0, 0, 0.45)`, coupled with an edge border transition to `rgba(255, 255, 255, 0.12)`.
- **Modals & Overlays**: `#151923` rendered with a clean `1px solid rgba(255, 255, 255, 0.12)` boundary, backdropped by an ambient dim wash of `#000000` at 60% opacity with `8px` backdrop blur.

## Shapes

The design system employs a refined, rounded geometric profile matching modern desktop OS hardware standards:

- **Cards & Primary Modules**: Built strictly with `16px` to `20px` corner radii, lending surfaces an inviting, humanized, tactile presence while retaining crisp structural alignment.
- **Inputs & Secondary Controls**: Standardized at `8px` to `10px` corner radii for immediate utility and clear touch targets.
- **Badges, Tags & Numeric Micro-Pills**: Set to `6px` or full pill geometry (`9999px`) for reward tokens and attribute chips.

## Components

### Buttons
- **Primary CTA**: Background `#6366F1`, text `#FFFFFF`, font `Inter` (weight 500), border radius `10px`. Transitions on hover to `#4F46E5` without external glow effects.
- **Secondary Action**: Surface `#1B1F2A`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F1F5F9`. Hover transitions background to `rgba(255, 255, 255, 0.06)`.
- **Tertiary / Ghost**: Transparent surface, text `#94A3B8`, hovering to `#F1F5F9` with subtle `#151923` fill.

### Cards & Quest Containers
- **Container**: `16px` to `20px` rounded corners, background `#151923`, `1px` border of `rgba(255, 255, 255, 0.07)`. Internal padding `20px` to `24px`.
- **Active Task Item**: Flat list row with a minimalist indicator. Checkbox hover reveals a soft `#10B981` tint. Completed tasks shift typography to Slate-500 with a muted strikethrough.
- **Meta Telemetry Strip**: Discrete pills at the bottom of the card housing `JetBrains Mono` tags (`+150 XP`, `+25 GOLD`) using neutral dark containers with faint chromatic text accents.

### Checkboxes & Selection Controls
- **Standard Checkbox**: `18px` square with `5px` corner radius. Border `1px solid rgba(255, 255, 255, 0.2)`. On check: smooth fill to Emerald (`#10B981`) with a sharp white check icon, accompanied by a micro-scale bounce.

### Progression & Stat Gauges
- **XP Bar**: Minimalist `4px` or `6px` track height. Background `#1B1F2A`, fill `#6366F1`. Free of noisy animations or lens flares. Clean integer indicator (`1,450 / 2,000 XP`) placed in `JetBrains Mono` adjacent to the bar.
- **Attribute Cards (STR, INT, DIS)**: Compact cards showing 2-character attribute keys in muted mono uppercase, accompanied by thin linear progress bars colored according to domain (Cyan for INT, Indigo for DIS, Amber for STR).

### Input Fields
- **Text & Search Fields**: Background `#11141C`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F1F5F9`, placeholder `#64748B`. Focused state applies `border-color: rgba(99, 102, 241, 0.5)` with zero heavy glow bloom.

### Streak & Reward Badges
- **Streak Pill**: Compact container with an amber dot indicator or small flame glyph, displaying consecutive days in `JetBrains Mono` (`14 DAYS`) with `#F97316` text on `#1B1F2A` background.