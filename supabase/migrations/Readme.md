# LIFE RPG

> **Turn real life into a progression system.**

LIFE RPG is a full-stack gamified productivity platform that transforms real-world tasks into RPG-style quests.

Instead of treating productivity like a checklist, LIFE RPG turns everyday actions into a progression journey where users can complete quests, earn XP and Gold, level up their character, unlock rewards, evolve their avatar, maintain streaks, and participate in larger challenges.

Built for the **Tech Zephyr 4.0 Web Hackathon**.

---

## ✨ Why LIFE RPG?

Traditional productivity applications often reduce progress to:

`Task → Checkbox → Done`

LIFE RPG changes the loop into:

`Real-world action → Quest → XP + Gold → Progression → Rewards → Character Evolution`

The goal is simple:

**Make completing real-life responsibilities feel rewarding.**

---

## 🎮 Core Experience

### 🗺️ Quests

Turn real-world tasks into actionable RPG directives.

Users can:

- Create quests
- Categorize quests
- Set difficulty
- Complete quests
- Earn XP
- Earn Gold
- Track progression
- Maintain activity streaks

Quest completion is handled through the server-side game engine rather than trusting the client.

---

### ⚡ XP & Level Progression

LIFE RPG uses a progression system where XP determines character level.

Progression includes:

- Current XP
- XP required for the next level
- Level progression
- Multi-level XP gains
- Level-up events
- Character progression
- Attribute progression

XP rewards are calculated server-side to prevent client-side manipulation.

---

### 🪙 Gold Economy

Completing quests can reward Gold.

Gold can then be used inside the reward economy.

The economy supports:

- Gold balance
- Gold transactions
- Reward redemption
- Inventory ownership
- Purchase validation
- Insufficient balance handling
- Server-authoritative transactions

Users cannot simply modify their Gold balance from the browser.

---

### 🧬 Avatar Evolution

The player's avatar evolves as they progress.

The progression system is designed around the idea that the character should visually communicate the user's journey.

Example progression:

```text
Level 1
  ↓
Basic Character

Level 2–3
  ↓
Early Accessories

Level 4–5
  ↓
Improved Outfit

Level 6–7
  ↓
Advanced Gear

Level 8–9
  ↓
Stronger Visual Identity

Level 10+
  ↓
Advanced Character Evolution

Level 16+
  ↓
Elite / Legendary Progression
```

Avatar items can be unlocked and equipped through the progression system.

The character's visual evolution is connected to actual game state.

---

## 🏆 Rewards

The Rewards system provides a virtual economy where users can spend earned Gold.

Users can:

- Browse available rewards
- View reward details
- Check prices
- Redeem rewards
- Receive items in inventory
- Equip supported items
- Track Gold transactions

Reward redemption is validated on the server.

---

## 🎒 Inventory

Inventory contains rewards and progression items owned by the current user.

The system supports:

- Owned items
- Equipped items
- Unlock state
- Item requirements
- Ownership validation
- Empty states
- Loading states
- Error states

A user cannot equip or manipulate another user's inventory.

---

## 👤 Character

The Character screen acts as the user's RPG progression profile.

It includes:

- Character level
- XP progression
- Attributes
- Streak
- Gold
- Progression history
- Avatar evolution
- Unlockable equipment
- Character customization
- Rank/title information

The character state is generated from the authenticated user's data.

---

## 🔥 Streaks

Consistency matters.

LIFE RPG tracks user activity streaks and uses them as part of the progression experience.

The system handles:

- Daily activity
- Current streak
- Streak continuation
- Streak reset
- Streak multiplier
- Activity dates

Streak calculations are handled by the application game engine.

---

## 👑 Boss Raids

Boss Raids turn larger goals into shared or long-form challenges.

A Boss Raid can contain:

- Boss information
- Health/progress
- Active state
- Player contribution
- Raid actions
- Progress tracking
- Completion state

Boss Raid content is controlled through the Admin Panel.

---

## 🏅 Achievements

Achievements recognize meaningful progression milestones.

The system supports:

- Achievement definitions
- Unlock requirements
- User achievement state
- Progress tracking
- Achievement history

Achievements are tied to actual game state rather than static UI.

---

# 🛡️ Admin Panel

LIFE RPG includes a protected administrative system for managing gameplay content.

Admin functionality includes:

```text
/admin
/admin/players
/admin/quests
/admin/rewards
/admin/avatar
/admin/boss-raids
/admin/achievements
/admin/campaigns
/admin/economy
/admin/qa/avatar-lab
/admin/audit-log
/admin/settings
```

Administrators can manage the gameplay ecosystem without modifying application source code.

### Admin capabilities

- Manage players
- Create quests/directives
- Create rewards
- Manage avatar items
- Create Boss Raids
- Manage achievements
- Manage campaigns
- Monitor economy
- Access Avatar QA Lab
- Review audit logs
- Manage system settings

Admin authorization is enforced server-side.

---

# 🧪 Avatar QA Lab

The Avatar QA Lab is an internal development tool integrated into the Admin Panel.

It allows developers/admins to inspect avatar progression across different levels.

Example test levels:

```text
Level 1
Level 2
Level 4
Level 6
Level 8
Level 10
Level 12
Level 15
Level 16
Level 20
```

The QA system is designed to use the same progression and avatar rendering systems as the real application rather than creating a disconnected fake preview.

---

# 🔐 Security

Security is a core part of LIFE RPG.

The application is designed around:

- Supabase Authentication
- Authenticated sessions
- PostgreSQL
- Row Level Security
- Server-side authorization
- User ownership validation
- Server-authoritative game calculations
- Protected API routes
- Admin role authorization
- Atomic economy transactions

The client is treated as untrusted.

---

## 🔒 Multi-user Isolation

Every player has an independent game state.

Users should only be able to access:

- Their own profile
- Their own quests
- Their own quest logs
- Their own progression
- Their own inventory
- Their own avatar loadout
- Their own achievements
- Their own economy history

Database-level RLS policies provide an additional security boundary.

---

# 🗄️ Database

LIFE RPG uses **PostgreSQL through Supabase**.

The database architecture contains systems for:

```text
Profiles
Character Attributes
Quests
Quest Logs
Streaks
Attribute Logs

Rewards
Inventory
Equipped Items
Gold Transactions

Avatar Items
Avatar Unlocks
Avatar Loadout

Boss Raids
Boss Raid Progress
Boss Raid Actions

Achievements
Campaigns
Campaign Progress

Admin Audit Logs
System Settings
```

Gameplay content is intended to be manageable through the Admin Panel rather than relying on hardcoded demo data.

---

# 🧱 Architecture

High-level architecture:

```text
                         ┌──────────────────────┐
                         │      LIFE RPG UI     │
                         │  Next.js + React + TS │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API / Server      │
                         │ Server-side Game Logic│
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
            ┌─────────────────┐          ┌─────────────────┐
            │ Supabase Auth   │          │ PostgreSQL      │
            │ Authentication  │          │ + RLS           │
            └─────────────────┘          └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js server/API routes
- Server-side game engine
- Supabase

## Database

- PostgreSQL
- Supabase Row Level Security

## Authentication

- Supabase Auth

## Deployment

- Vercel
- Supabase

## Development

- Node.js
- npm
- Git
- GitHub
- VS Code

---

# 🎨 Design Philosophy

LIFE RPG intentionally avoids the visual language of generic enterprise dashboards.

The design direction combines:

- Apple-inspired simplicity
- Linear-style information hierarchy
- Modern RPG progression
- Cinematic dark surfaces
- Strong typography
- Clean spacing
- Subtle motion
- Responsive layouts

The RPG identity comes primarily from:

```text
XP
Levels
Attributes
Quests
Streaks
Rewards
Inventory
Avatar Evolution
Boss Raids
Achievements
```

rather than excessive neon effects or complicated HUD elements.

---

# 📱 Responsive Experience

LIFE RPG is designed for:

- Desktop
- Laptop
- Tablet
- Mobile portrait
- Mobile landscape

The mobile experience adapts navigation and content density while preserving the core game loop.

---

# ♿ Accessibility

The application aims to provide:

- Keyboard navigation
- Focus states
- Semantic structure
- Accessible interactive controls
- Screen-reader-friendly structure
- Responsive layouts
- Clear visual hierarchy

Primary interactions should remain usable with:

```text
Tab
Enter
Space
Escape
```

---

# ⚙️ Local Development

## Requirements

Install:

- Node.js
- npm
- Git
- A Supabase project

---

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/life-rpg.git
cd life-rpg
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create:

```text
.env.local
```

Use `.env.example` as the template.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Server-only secrets must never be exposed to the browser.

---

## 4. Configure Supabase

Create a Supabase project and apply the database migrations from the repository.

The migrations establish:

- Core schema
- Authentication integration
- RLS
- Quest system
- Economy
- Avatar evolution
- Boss Raids
- Achievements
- Campaigns
- Admin system
- Indexes and constraints

Do not expose private Supabase credentials in the frontend or commit them to Git.

---

## 5. Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Testing

Run the automated test suite:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Start the production server locally:

```bash
npm start
```

---

# 🔍 Recommended End-to-End Test

Before deployment, verify the complete game loop:

```text
Signup
  ↓
Login
  ↓
Lobby / Home
  ↓
Create Quest
  ↓
Complete Quest
  ↓
XP + Gold
  ↓
Level Progression
  ↓
Avatar Evolution
  ↓
Rewards
  ↓
Redeem Reward
  ↓
Inventory
  ↓
Equip Item
  ↓
Achievements
  ↓
Refresh
  ↓
Logout
  ↓
Login Again
```

The state should persist through Supabase.

---

# 🚀 Deployment

## Vercel

The recommended deployment target is Vercel.

Connect the GitHub repository to Vercel and configure the required environment variables.

Required public variables include:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Add any server-only variables required by the application without exposing them to client-side code.

---

# 🔑 Environment Security

Never commit:

```text
.env
.env.local
.env.*.local
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
database passwords
private API keys
```

The repository should contain only safe configuration examples.

---

# 📂 Project Structure

A simplified project structure:

```text
life-rpg/
│
├── app/
│   ├── auth/
│   ├── home/
│   ├── quests/
│   ├── character/
│   ├── rewards/
│   ├── inventory/
│   ├── achievements/
│   ├── admin/
│   └── api/
│
├── components/
│
├── lib/
│   ├── game-engine/
│   ├── supabase/
│   └── ...
│
├── supabase/
│   └── migrations/
│
├── docs/
│
├── public/
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── ...
```

---

# 🧠 Game Loop

The fundamental LIFE RPG loop is:

```text
REAL LIFE
   │
   ▼
QUEST
   │
   ▼
ACTION
   │
   ▼
XP + GOLD
   │
   ├───────────────┐
   ▼               ▼
LEVEL UP         ECONOMY
   │               │
   ▼               ▼
AVATAR          REWARDS
EVOLUTION          │
   │               ▼
   └──────────► INVENTORY
                    │
                    ▼
                 EQUIPMENT
                    │
                    ▼
              CHARACTER POWER
```

---

# 🎯 Product Vision

LIFE RPG is built around one idea:

> **Progress should feel visible.**

Whether the task is studying, exercising, reading, completing an assignment, working on a project, or maintaining a personal routine, the user should feel that the action contributes to something larger.

Instead of asking:

**"What did I finish today?"**

LIFE RPG asks:

**"What did I progress toward?"**

---

# 🏗️ Hackathon

Built for:

**Tech Zephyr 4.0 Web Hackathon**

The project focuses on the hackathon's core concept of transforming everyday tasks into an interactive progression experience.

---

# 📌 Project Status

LIFE RPG is being developed as a production-oriented full-stack web application.

Current systems include:

- Authentication
- User profiles
- Quest system
- XP progression
- Gold economy
- Character attributes
- Streaks
- Rewards
- Inventory
- Avatar evolution
- Boss Raids
- Achievements
- Campaigns
- Admin Panel
- Avatar QA Lab
- Supabase persistence
- Row Level Security
- Responsive UI

---

# 👨‍💻 Development

Built with a focus on:

**Product Design × Game Mechanics × Full-Stack Engineering**

The application prioritizes real persistence, secure user isolation, server-authoritative progression, responsive UX, and a polished modern interface.

---

# 📜 License

This project is created for educational and hackathon purposes.

---

## LIFE RPG

**Complete the quest.  
Earn the XP.  
Build your character.**
