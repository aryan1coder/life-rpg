import fs from 'fs';
import path from 'path';
import {
  Achievement,
  AvatarItem,
  AvatarSlot,
  CharacterAttributes,
  EquippedLoadout,
  Quest,
  RewardItem,
  UserAvatarLoadout,
  UserAvatarUnlock,
  UserProfile,
} from '../game/types';
import { Campaign } from '../game/campaigns';
import { BossRaid } from '../game/boss-raids';

export interface DatabaseState {
  profiles: Record<string, UserProfile>;
  attributes: Record<string, CharacterAttributes>;
  quests: Record<string, Quest[]>;
  inventory: Record<string, string[]>; // profile_id -> item_ids
  loadouts: Record<string, EquippedLoadout>;
  userAchievements: Record<string, Record<string, { is_unlocked: boolean; current_progress: number; unlocked_at?: string }>>;
  campaignProgress: Record<string, Record<string, number>>; // profile_id -> campaign_id -> stage
  bossRaidProgress: Record<string, Record<string, { completed_directives: number; is_completed: boolean; damage_dealt?: number }>>;
  avatarUnlocks?: Record<string, string[]>; // user_id -> avatar_item_ids
  avatarLoadouts?: Record<string, Record<string, string>>; // user_id -> slot -> avatar_item_id
  auditLogs?: Array<{ id: string; admin_user_id: string; action: string; target_type: string; target_id?: string | null; metadata?: Record<string, any>; created_at: string }>;
  goldTransactions?: Record<string, Array<{ id: string; profile_id: string; type: string; amount: number; balance_after: number; source: string; reference_id?: string; created_at: string }>>;
  customBossRaids?: Record<string, BossRaid>;
  customRewards?: Record<string, RewardItem>;
  customAvatarItems?: Record<string, AvatarItem>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'life_rpg_db.json');

// Default Curated Catalogs (Shared Seed Data)
export const SEED_AVATAR_ITEMS: AvatarItem[] = [
  {
    id: 'body_initiate_tunic',
    name: 'Initiate Tactical Garments',
    description: 'Clean, durable field garments with tailored utility seams.',
    slot: 'body',
    rarity: 'Common',
    asset_key: 'body_initiate',
    required_level: 1,
    is_active: true,
  },
  {
    id: 'legs_initiate_fatigues',
    name: 'Initiate Field Cargoes',
    description: 'Reinforced micro-ripstop field trousers for disciplined execution.',
    slot: 'legs',
    rarity: 'Common',
    asset_key: 'legs_initiate',
    required_level: 1,
    is_active: true,
  },
  {
    id: 'shoes_standard_trainers',
    name: 'Standard Low-Profile Striders',
    description: 'Lightweight ergonomic kinetic trainers for all-day focus blocks.',
    slot: 'shoes',
    rarity: 'Common',
    asset_key: 'shoes_initiate',
    required_level: 1,
    is_active: true,
  },
  {
    id: 'accessory_chrono_band',
    name: 'Kinetic Chrono-Band',
    description: 'Time-dilation biometric wrist tracker that logs focus blocks.',
    slot: 'accessory',
    rarity: 'Common',
    asset_key: 'acc_chrono',
    required_level: 2,
    is_active: true,
  },
  {
    id: 'face_focus_spectacles',
    name: 'Anti-Reflective Focus Spectacles',
    description: 'Blocks ambient visual noise and sharpens monitor contrast.',
    slot: 'face',
    rarity: 'Uncommon',
    asset_key: 'face_spectacles',
    required_level: 3,
    is_active: true,
  },
  {
    id: 'outerwear_ballistic_vest',
    name: 'Vanguard Ballistic Vest',
    description: 'Lightweight kevlar-weave chest rig engineered for rigorous routines.',
    slot: 'outerwear',
    rarity: 'Uncommon',
    asset_key: 'outer_ballistic',
    required_level: 4,
    is_active: true,
  },
  {
    id: 'shoes_reinforced_boots',
    name: 'Vanguard Commando Boots',
    description: 'High-traction composite footwear built for grueling daily demands.',
    slot: 'shoes',
    rarity: 'Uncommon',
    asset_key: 'shoes_boots',
    required_level: 5,
    is_active: true,
  },
  {
    id: 'face_hud_visor',
    name: 'Tactical HUD Monocle',
    description: 'Translucent amber optical display streaming telemetry in real-time.',
    slot: 'face',
    rarity: 'Rare',
    asset_key: 'face_visor',
    required_level: 6,
    is_active: true,
  },
  {
    id: 'weapon_energy_stylus',
    name: 'Resonance Neural Stylus',
    description: 'Precision capacitive instrument for frictionless interface execution.',
    slot: 'weapon_or_tool',
    rarity: 'Rare',
    asset_key: 'tool_stylus',
    required_level: 7,
    is_active: true,
  },
  {
    id: 'outerwear_storm_cloak',
    name: 'Phase-Insulated Storm Cloak',
    description: 'Matte charcoal weather-resistant mantle with concealed harness clips.',
    slot: 'outerwear',
    rarity: 'Rare',
    asset_key: 'outer_cloak',
    required_level: 8,
    is_active: true,
  },
  {
    id: 'head_stealth_cowl',
    name: 'Operative Shadow Cowl',
    description: 'Ergonomic sound-dampening acoustic hood for deep flow states.',
    slot: 'head',
    rarity: 'Rare',
    asset_key: 'head_cowl',
    required_level: 9,
    is_active: true,
  },
  {
    id: 'body_resonance_suit',
    name: 'Resonance Kinetic Under-Suit',
    description: 'Conductive nanofiber body suit channeling metabolic energy.',
    slot: 'body',
    rarity: 'Epic',
    asset_key: 'body_resonance',
    required_level: 10,
    is_active: true,
  },
  {
    id: 'aura_quantum_lattice',
    name: 'Quantum Focus Lattice',
    description: 'Geometric energy grid quietly circulating around the operator.',
    slot: 'aura',
    rarity: 'Epic',
    asset_key: 'aura_lattice',
    required_level: 10,
    is_active: true,
  },
  {
    id: 'accessory_drone_sentinel',
    name: 'Telemetry Companion Drone',
    description: 'Levitating micro-probe hovering at shoulder height.',
    slot: 'accessory',
    rarity: 'Epic',
    asset_key: 'acc_drone',
    required_level: 12,
    is_active: true,
  },
  {
    id: 'weapon_chronos_blade',
    name: 'Hyper-Threaded Chrono-Blade',
    description: 'Non-lethal ceremonial energy saber awarded to high-sprint commanders.',
    slot: 'weapon_or_tool',
    rarity: 'Epic',
    asset_key: 'tool_blade',
    required_level: 14,
    is_active: true,
  },
  {
    id: 'aura_celestial_halo',
    name: 'Sovereign Radiant Halo',
    description: 'Luminescent ring of persistent discipline crowning the master architect.',
    slot: 'aura',
    rarity: 'Legendary',
    asset_key: 'aura_halo',
    required_level: 16,
    is_active: true,
  },
  {
    id: 'background_stellar_nexus',
    name: 'Stellar Nexus Command Void',
    description: 'Deep cosmic dimensional viewport displaying macroscopic lifetime momentum.',
    slot: 'background',
    rarity: 'Legendary',
    asset_key: 'bg_nexus',
    required_level: 18,
    is_active: true,
  },
];

export const SEED_REWARDS: RewardItem[] = [
  {
    id: 'theme_deep_work_obsidian',
    name: 'Obsidian Deep-Work Environment',
    description: 'High contrast monochrome palette tailored for extreme late-night uninterrupted coding sprints.',
    category: 'Theme',
    rarity: 'Rare',
    cost_gold: 750,
    min_level_required: 10,
    preview_asset: 'theme-obsidian.png',
    metadata: { accentColor: '#6366F1', bgColor: '#0B0E15' },
    is_available: true,
  },
  {
    id: 'theme_cybernetic_neon',
    name: 'Cybernetic Grid Theme',
    description: 'High intensity cyan and violet luminescence for high frequency system monitoring.',
    category: 'Theme',
    rarity: 'Epic',
    cost_gold: 1200,
    min_level_required: 12,
    preview_asset: 'theme-cyber.png',
    metadata: { accentColor: '#06B6D4', bgColor: '#080B10' },
    is_available: true,
  },
  {
    id: 'theme_solar_gold',
    name: 'Solar Forge Theme',
    description: 'Warm radiant amber-gold UI accents reserved for high velocity sprint milestones.',
    category: 'Theme',
    rarity: 'Legendary',
    cost_gold: 2500,
    min_level_required: 15,
    preview_asset: 'theme-solar.png',
    metadata: { accentColor: '#F59E0B', bgColor: '#0D0F14' },
    is_available: true,
  },
  {
    id: 'frame_tactical_obsidian',
    name: 'Tactical Obsidian Frame',
    description: 'Matte carbon fiber avatar border with understated micro-chamfered corners.',
    category: 'Cosmetic',
    rarity: 'Uncommon',
    cost_gold: 350,
    min_level_required: 5,
    preview_asset: 'frame-obsidian.png',
    metadata: { borderStyle: 'chamfered' },
    is_available: true,
  },
  {
    id: 'frame_neural_luminescence',
    name: 'Neural Luminescence Shroud',
    description: 'Subtle breathing lavender halo surrounding player avatar.',
    category: 'Cosmetic',
    rarity: 'Epic',
    cost_gold: 950,
    min_level_required: 12,
    preview_asset: 'frame-neural.png',
    metadata: { glowColor: '#818CF8' },
    is_available: true,
  },
  {
    id: 'title_arch_strategist',
    name: 'Arch-Strategist',
    description: 'Conferred upon operators demonstrating exceptional macro-planning velocity.',
    category: 'Title',
    rarity: 'Epic',
    cost_gold: 800,
    min_level_required: 10,
    preview_asset: 'title-arch.png',
    metadata: { displayTag: 'Arch-Strategist II' },
    is_available: true,
  },
  {
    id: 'title_deep_worker',
    name: 'Deep Worker',
    description: 'Signifies mastery over distraction-free multi-hour flow states.',
    category: 'Title',
    rarity: 'Rare',
    cost_gold: 500,
    min_level_required: 8,
    preview_asset: 'title-deep.png',
    metadata: { displayTag: 'Deep Worker' },
    is_available: true,
  },
  {
    id: 'title_flow_architect',
    name: 'Flow State Architect',
    description: 'Mastery over cadence, habitual execution, and deep engineering discipline.',
    category: 'Title',
    rarity: 'Legendary',
    cost_gold: 2000,
    min_level_required: 15,
    preview_asset: 'title-flow.png',
    metadata: { displayTag: 'Flow State Architect' },
    is_available: true,
  },
  {
    id: 'badge_consistency_master',
    name: 'Consistency Master Insignia',
    description: 'Awarded for maintaining an active streak uninterrupted for over 14 cycles.',
    category: 'Badge',
    rarity: 'Rare',
    cost_gold: 600,
    min_level_required: 7,
    preview_asset: 'badge-consistency.png',
    metadata: { icon: 'local_fire_department' },
    is_available: true,
  },
  {
    id: 'badge_algorithm_savant',
    name: 'Algorithm Savant Emblem',
    description: 'Proof of completing 50+ computational problem directives.',
    category: 'Badge',
    rarity: 'Epic',
    cost_gold: 1100,
    min_level_required: 12,
    preview_asset: 'badge-savant.png',
    metadata: { icon: 'terminal' },
    is_available: true,
  },
  {
    id: 'boost_xp_surge_25',
    name: '25% Cognitive XP Surge',
    description: 'Provides +25% net XP multiplier across all quest completions for 24 operating hours.',
    category: 'Boost',
    rarity: 'Rare',
    cost_gold: 450,
    min_level_required: 3,
    preview_asset: 'boost-xp.png',
    metadata: { durationHours: 24, multiplier: 1.25 },
    is_available: true,
  },
  {
    id: 'boost_gold_bounty_50',
    name: '50% Vault Bounty Amplifier',
    description: 'Accelerates all quest Gold yields by +50% for 12 hours.',
    category: 'Boost',
    rarity: 'Epic',
    cost_gold: 650,
    min_level_required: 6,
    preview_asset: 'boost-gold.png',
    metadata: { durationHours: 12, multiplier: 1.5 },
    is_available: true,
  },
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_blood',
    title: 'First Directive Conquered',
    description: 'Execute and mark complete your very first quest protocol.',
    category: 'Milestones',
    reward_gold: 50,
    reward_xp: 100,
    target_value: 1,
    badge_icon: 'flag',
  },
  {
    id: 'ach_cadence_7',
    title: 'Weekly Operative',
    description: 'Sustain an unbroken focus streak across 7 consecutive cycles.',
    category: 'Consistency',
    reward_gold: 150,
    reward_xp: 300,
    target_value: 7,
    badge_icon: 'local_fire_department',
  },
  {
    id: 'ach_cadence_14',
    title: 'Fortnight Discipline',
    description: 'Maintain flawless execution cadence for 14 continuous days.',
    category: 'Consistency',
    reward_gold: 350,
    reward_xp: 700,
    target_value: 14,
    badge_icon: 'workspace_premium',
  },
  {
    id: 'ach_century_operative',
    title: 'Century Operative',
    description: 'Successfully complete 100 verified quest protocols in the system.',
    category: 'Execution',
    reward_gold: 750,
    reward_xp: 1500,
    target_value: 100,
    badge_icon: 'military_tech',
  },
  {
    id: 'ach_tier_10',
    title: 'Double Digit Operator',
    description: 'Cross the Level 10 threshold to unlock Tier II specialization.',
    category: 'Mastery',
    reward_gold: 500,
    reward_xp: 1000,
    target_value: 10,
    badge_icon: 'upgrade',
  },
  {
    id: 'ach_vault_wealthy',
    title: 'Vault Capitalist',
    description: 'Accumulate a net balance of 2,500 Gold in your personal vault.',
    category: 'Economy',
    reward_gold: 400,
    reward_xp: 600,
    target_value: 2500,
    badge_icon: 'monetization_on',
  },
  {
    id: 'ach_first_gear',
    title: 'Equipment Initialized',
    description: 'Acquire and equip your first tactical cosmetic or environment theme.',
    category: 'Milestones',
    reward_gold: 100,
    reward_xp: 200,
    target_value: 1,
    badge_icon: 'backpack',
  },
  {
    id: 'ach_boss_slayer',
    title: 'Boss Raid Conqueror',
    description: 'Neutralize an Epic Boss Raid protocol before countdown expiry.',
    category: 'Mastery',
    reward_gold: 600,
    reward_xp: 1200,
    target_value: 1,
    badge_icon: 'swords',
  },
];

export const DEFAULT_CAMPAIGN: Campaign = {
  id: 'campaign_hackathon_mvp',
  title: 'Ship Hackathon MVP',
  description: 'Execute end-to-end full stack architecture, database persistence, and design integration.',
  total_stages: 4,
  current_stage: 1,
  reward_gold: 850,
  reward_xp: 1500,
  is_completed: false,
};

export const DEFAULT_BOSS_RAID: BossRaid = {
  id: 'boss_q3_system_overhaul',
  title: 'Q3 Architecture Overhaul',
  description: 'Refactor distributed cache, synchronize database schemas, and deploy production load balancers.',
  threat_level: 'Critical Threat',
  max_hp: 100,
  current_hp: 100,
  required_directives: 3,
  directives_completed: 0,
  expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  reward_gold: 350,
  reward_xp: 850,
  is_completed: false,
  is_active: true,
};

/**
 * Standard production initial state for ANY newly registered operator.
 * Begins at Level 1, 0 XP, 0 Gold, 0 Streak.
 */
export function createFreshUserProfile(id: string, username = 'Operator'): UserProfile {
  return {
    id,
    username,
    display_name: username,
    bio: '',
    title: 'Initiate Strategist',
    role: 'player',
    level: 1,
    xp_current: 0,
    xp_next_level: 1000,
    gold_balance: 0,
    streak_days: 0,
    streak_multiplier: 1.0,
    last_active_date: new Date().toISOString().split('T')[0],
    avatar_url: '/avatar.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function createFreshAttributes(profile_id: string): CharacterAttributes {
  return {
    profile_id,
    intellect: 50,
    discipline: 50,
    vitality: 50,
    strength: 50,
    creativity: 50,
    today_intellect_delta: 0,
    today_discipline_delta: 0,
    today_vitality_delta: 0,
    today_strength_delta: 0,
    today_creativity_delta: 0,
    updated_at: new Date().toISOString(),
  };
}

export function createStarterQuests(profile_id: string): Quest[] {
  return [
    {
      id: `quest_${profile_id}_1`,
      profile_id,
      title: 'Initialize Cognitive Command Deck',
      description: 'Review system capabilities, configure operational profile, and review active directives.',
      category: 'Engineering',
      difficulty: 'Easy',
      attribute: 'Intellect',
      xp_reward: 80,
      gold_reward: 40,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `quest_${profile_id}_2`,
      profile_id,
      title: 'Establish Deep Work Protocol',
      description: 'Execute a 90-minute distraction-free engineering or writing session.',
      category: 'Work',
      difficulty: 'Normal',
      attribute: 'Discipline',
      xp_reward: 120,
      gold_reward: 65,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `quest_${profile_id}_3`,
      profile_id,
      title: 'Recovery & Sunlight Walk',
      description: 'Complete a 30-minute outdoor walk with hydration and natural light exposure.',
      category: 'Health',
      difficulty: 'Easy',
      attribute: 'Vitality',
      xp_reward: 80,
      gold_reward: 40,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

class StorageEngine {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read persistent DB file, initializing fresh state:', e);
    }

    const initial: DatabaseState = {
      profiles: {},
      attributes: {},
      quests: {},
      inventory: {},
      loadouts: {},
      userAchievements: {},
      campaignProgress: {},
      bossRaidProgress: {},
    };

    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public findProfileByEmailOrUsername(query: string): UserProfile | null {
    const q = query.toLowerCase().trim();
    for (const p of Object.values(this.state.profiles)) {
      if (p.id.toLowerCase() === q || p.username.toLowerCase() === q) {
        return p;
      }
    }
    return null;
  }

  public initFreshUser(userId: string, username: string): UserProfile {
    const profile = createFreshUserProfile(userId, username);
    const attrs = createFreshAttributes(userId);
    const starterQuests = createStarterQuests(userId);

    this.state.profiles[userId] = profile;
    this.state.attributes[userId] = attrs;
    this.state.quests[userId] = starterQuests;
    this.state.inventory[userId] = [];
    this.state.loadouts[userId] = { profile_id: userId };
    this.state.userAchievements[userId] = {};
    this.state.campaignProgress[userId] = { [DEFAULT_CAMPAIGN.id]: 0 };
    this.state.bossRaidProgress[userId] = {
      [DEFAULT_BOSS_RAID.id]: { completed_directives: 0, is_completed: false },
    };

    if (!this.state.avatarUnlocks) this.state.avatarUnlocks = {};
    this.state.avatarUnlocks[userId] = ['body_initiate_tunic', 'legs_initiate_fatigues', 'shoes_standard_trainers'];
    if (!this.state.avatarLoadouts) this.state.avatarLoadouts = {};
    this.state.avatarLoadouts[userId] = {
      body: 'body_initiate_tunic',
      legs: 'legs_initiate_fatigues',
      shoes: 'shoes_standard_trainers',
    };

    this.saveState(this.state);
    return profile;
  }

  public getProfile(id: string): UserProfile {
    if (!this.state.profiles[id]) {
      return this.initFreshUser(id, id);
    }
    return this.state.profiles[id];
  }

  public updateProfile(profile: UserProfile): void {
    this.state.profiles[profile.id] = profile;
    this.saveState(this.state);
  }

  public getAttributes(id: string): CharacterAttributes {
    if (!this.state.attributes[id]) {
      this.state.attributes[id] = createFreshAttributes(id);
      this.saveState(this.state);
    }
    return this.state.attributes[id];
  }

  public updateAttributes(attrs: CharacterAttributes): void {
    this.state.attributes[attrs.profile_id] = attrs;
    this.saveState(this.state);
  }

  public getQuests(id: string): Quest[] {
    if (!this.state.quests[id]) {
      this.state.quests[id] = createStarterQuests(id);
      this.saveState(this.state);
    }
    return this.state.quests[id];
  }

  public addQuest(quest: Quest): void {
    const list = this.getQuests(quest.profile_id);
    list.unshift(quest);
    this.state.quests[quest.profile_id] = list;
    this.saveState(this.state);
  }

  public updateQuest(quest: Quest): void {
    const list = this.getQuests(quest.profile_id);
    const idx = list.findIndex((q) => q.id === quest.id);
    if (idx !== -1) {
      list[idx] = quest;
      this.state.quests[quest.profile_id] = list;
      this.saveState(this.state);
    }
  }

  public deleteQuest(id: string, profile_id: string): boolean {
    const list = this.getQuests(profile_id);
    const initialLen = list.length;
    this.state.quests[profile_id] = list.filter((q) => q.id !== id);
    this.saveState(this.state);
    return this.state.quests[profile_id].length < initialLen;
  }

  public getInventory(id: string): string[] {
    return this.state.inventory[id] || [];
  }

  public addInventoryItem(profile_id: string, itemId: string): void {
    const inv = this.getInventory(profile_id);
    if (!inv.includes(itemId)) {
      inv.push(itemId);
      this.state.inventory[profile_id] = inv;
      this.saveState(this.state);
    }
  }

  public getLoadout(id: string): EquippedLoadout {
    if (!this.state.loadouts[id]) {
      this.state.loadouts[id] = { profile_id: id };
      this.saveState(this.state);
    }
    return this.state.loadouts[id];
  }

  public updateLoadout(loadout: EquippedLoadout): void {
    this.state.loadouts[loadout.profile_id] = loadout;
    this.saveState(this.state);
  }

  public getUserAchievements(id: string) {
    return this.state.userAchievements[id] || {};
  }

  public updateUserAchievements(id: string, map: Record<string, any>): void {
    this.state.userAchievements[id] = map;
    this.saveState(this.state);
  }

  public getCampaign(profile_id: string): Campaign {
    const userProgress = this.state.campaignProgress[profile_id]?.[DEFAULT_CAMPAIGN.id] ?? 0;
    return {
      ...DEFAULT_CAMPAIGN,
      current_stage: userProgress,
      is_completed: userProgress >= DEFAULT_CAMPAIGN.total_stages,
    };
  }

  public advanceCampaign(profile_id: string): Campaign {
    if (!this.state.campaignProgress[profile_id]) {
      this.state.campaignProgress[profile_id] = {};
    }
    const current = this.state.campaignProgress[profile_id][DEFAULT_CAMPAIGN.id] ?? 0;
    const next = Math.min(DEFAULT_CAMPAIGN.total_stages, current + 1);
    this.state.campaignProgress[profile_id][DEFAULT_CAMPAIGN.id] = next;
    this.saveState(this.state);
    return this.getCampaign(profile_id);
  }

  public getBossRaid(profile_id: string): BossRaid {
    const userProgress = this.state.bossRaidProgress[profile_id]?.[DEFAULT_BOSS_RAID.id];
    const completed = userProgress?.completed_directives ?? 0;
    return {
      ...DEFAULT_BOSS_RAID,
      directives_completed: completed,
      is_completed: completed >= DEFAULT_BOSS_RAID.required_directives,
    };
  }

  public advanceBossRaid(profile_id: string): BossRaid {
    if (!this.state.bossRaidProgress[profile_id]) {
      this.state.bossRaidProgress[profile_id] = {};
    }
    const current = this.state.bossRaidProgress[profile_id][DEFAULT_BOSS_RAID.id]?.completed_directives ?? 0;
    const next = Math.min(DEFAULT_BOSS_RAID.required_directives, current + 1);
    this.state.bossRaidProgress[profile_id][DEFAULT_BOSS_RAID.id] = {
      completed_directives: next,
      is_completed: next >= DEFAULT_BOSS_RAID.required_directives,
    };
    this.saveState(this.state);
    return this.getBossRaid(profile_id);
  }

  // ==========================================
  // AVATAR EVOLUTION & LOADOUT ENGINE
  // ==========================================
  public getAvatarItems(): AvatarItem[] {
    return SEED_AVATAR_ITEMS;
  }

  public getUserAvatarUnlocks(userId: string): string[] {
    if (!this.state.avatarUnlocks) this.state.avatarUnlocks = {};
    if (!this.state.avatarUnlocks[userId]) {
      // Default tier 1 starter items
      this.state.avatarUnlocks[userId] = [
        'body_initiate_tunic',
        'legs_initiate_fatigues',
        'shoes_standard_trainers',
      ];
      this.saveState(this.state);
    }
    return this.state.avatarUnlocks[userId];
  }

  public getUserAvatarLoadout(userId: string): Record<string, string> {
    if (!this.state.avatarLoadouts) this.state.avatarLoadouts = {};
    if (!this.state.avatarLoadouts[userId]) {
      this.state.avatarLoadouts[userId] = {
        body: 'body_initiate_tunic',
        legs: 'legs_initiate_fatigues',
        shoes: 'shoes_standard_trainers',
      };
      this.saveState(this.state);
    }
    return this.state.avatarLoadouts[userId];
  }

  public unlockAvatarItem(userId: string, itemId: string): boolean {
    const unlocks = this.getUserAvatarUnlocks(userId);
    if (!unlocks.includes(itemId)) {
      unlocks.push(itemId);
      this.state.avatarUnlocks![userId] = unlocks;
      this.saveState(this.state);
      return true;
    }
    return false;
  }

  public equipAvatarItem(userId: string, itemId: string): { success: boolean; error?: string } {
    const item = SEED_AVATAR_ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, error: 'Avatar item does not exist' };
    }

    const unlocks = this.getUserAvatarUnlocks(userId);
    if (!unlocks.includes(itemId)) {
      return { success: false, error: 'Cannot equip unowned avatar item' };
    }

    const profile = this.getProfile(userId);
    if (profile.level < item.required_level) {
      return { success: false, error: `Requires level ${item.required_level} to equip` };
    }

    const loadout = this.getUserAvatarLoadout(userId);
    loadout[item.slot] = itemId;
    this.state.avatarLoadouts![userId] = loadout;
    this.saveState(this.state);

    return { success: true };
  }

  public unequipAvatarSlot(userId: string, slot: string): { success: boolean } {
    const loadout = this.getUserAvatarLoadout(userId);
    if (loadout[slot]) {
      delete loadout[slot];
      this.state.avatarLoadouts![userId] = loadout;
      this.saveState(this.state);
    }
    return { success: true };
  }

  public evaluateAvatarUnlocksForLevel(userId: string, level: number): AvatarItem[] {
    const currentUnlocks = this.getUserAvatarUnlocks(userId);
    const eligibleItems = SEED_AVATAR_ITEMS.filter((item) => item.required_level <= level);
    const newlyUnlocked: AvatarItem[] = [];

    for (const item of eligibleItems) {
      if (!currentUnlocks.includes(item.id)) {
        currentUnlocks.push(item.id);
        newlyUnlocked.push(item);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.state.avatarUnlocks![userId] = currentUnlocks;
      this.saveState(this.state);
    }

    return newlyUnlocked;
  }

  // ==========================================
  // ADMIN & AUDIT LOGS
  // ==========================================
  public getAllProfiles(): UserProfile[] {
    return Object.values(this.state.profiles);
  }

  public addAuditLog(entry: { id?: string; admin_user_id?: string; admin_id?: string; action: string; target_type?: string; target_id?: string | null; metadata?: Record<string, any>; details?: Record<string, any>; created_at?: string }): void {
    if (!this.state.auditLogs) this.state.auditLogs = [];
    const normalized = {
      id: entry.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}`),
      admin_user_id: entry.admin_user_id || entry.admin_id || 'system',
      action: entry.action,
      target_type: entry.target_type || 'SYSTEM',
      target_id: entry.target_id || null,
      metadata: entry.metadata || entry.details || {},
      created_at: entry.created_at || new Date().toISOString(),
    };
    this.state.auditLogs.unshift(normalized);
    this.saveState(this.state);
  }

  public getAuditLogs(limit = 50): Array<{ id: string; admin_user_id: string; admin_id?: string; action: string; target_type: string; target_id?: string | null; metadata?: Record<string, any>; details?: Record<string, any>; created_at: string }> {
    if (!this.state.auditLogs) return [];
    return this.state.auditLogs.slice(0, limit).map(l => ({ ...l, admin_id: l.admin_user_id, details: l.metadata }));
  }

  // ==========================================
  // GOLD TRANSACTIONS (LEDGER)
  // ==========================================
  public addGoldTransaction(tx: { id?: string; profile_id: string; type: string; amount: number; balance_after: number; source: string; reference_id?: string; created_at?: string }): void {
    if (!this.state.goldTransactions) this.state.goldTransactions = {};
    if (!this.state.goldTransactions[tx.profile_id]) this.state.goldTransactions[tx.profile_id] = [];
    const normalized = {
      id: tx.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}`),
      profile_id: tx.profile_id,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balance_after,
      source: tx.source,
      reference_id: tx.reference_id,
      created_at: tx.created_at || new Date().toISOString(),
    };
    this.state.goldTransactions[tx.profile_id].unshift(normalized);
    this.saveState(this.state);
  }

  public getGoldTransactions(profile_id: string, limit = 50): Array<{ id: string; profile_id: string; type: string; amount: number; balance_after: number; source: string; reference_id?: string; created_at: string }> {
    if (!this.state.goldTransactions || !this.state.goldTransactions[profile_id]) return [];
    return this.state.goldTransactions[profile_id].slice(0, limit);
  }

  // ==========================================
  // BOSS RAIDS CMS & COMBAT
  // ==========================================
  public getBossRaids(): BossRaid[] {
    const list: BossRaid[] = [];
    if (this.state.customBossRaids) {
      list.push(...Object.values(this.state.customBossRaids));
    }
    if (list.length === 0) {
      list.push(DEFAULT_BOSS_RAID);
    }
    return list;
  }

  public createBossRaid(raid: Partial<BossRaid> & { id: string; title: string }): BossRaid {
    if (!this.state.customBossRaids) this.state.customBossRaids = {};
    const normalized: BossRaid = {
      id: raid.id,
      title: raid.title,
      description: raid.description || '',
      threat_level: raid.threat_level || 'Moderate',
      required_directives: raid.required_directives ?? 4,
      directives_completed: raid.directives_completed ?? 0,
      reward_xp: raid.reward_xp ?? 400,
      reward_gold: raid.reward_gold ?? 150,
      expires_at: raid.expires_at || new Date(Date.now() + 86400000).toISOString(),
      max_hp: raid.max_hp ?? 100,
      current_hp: raid.current_hp ?? raid.max_hp ?? 100,
      is_active: raid.is_active ?? true,
      is_completed: raid.is_completed ?? false,
    };
    this.state.customBossRaids[raid.id] = normalized;
    this.saveState(this.state);
    return normalized;
  }

  public updateBossRaid(raid: BossRaid): BossRaid {
    if (!this.state.customBossRaids) this.state.customBossRaids = {};
    this.state.customBossRaids[raid.id] = raid;
    this.saveState(this.state);
    return raid;
  }

  public attackBossRaid(profile_id: string, raidId: string, damage = 25): { raid: BossRaid; completedNow: boolean; rewardGold: number; rewardXp: number } {
    const raid = this.state.customBossRaids?.[raidId] || DEFAULT_BOSS_RAID;
    const nextHp = Math.max(0, raid.current_hp - damage);
    const completedNow = nextHp <= 0 && !raid.is_completed;

    const updatedRaid: BossRaid = {
      ...raid,
      current_hp: nextHp,
      directives_completed: raid.directives_completed + 1,
      is_completed: nextHp <= 0,
    };

    if (this.state.customBossRaids) {
      this.state.customBossRaids[raidId] = updatedRaid;
    }

    if (!this.state.bossRaidProgress[profile_id]) {
      this.state.bossRaidProgress[profile_id] = {};
    }
    const currentProgress = this.state.bossRaidProgress[profile_id][raidId] || { completed_directives: 0, is_completed: false, damage_dealt: 0 };
    this.state.bossRaidProgress[profile_id][raidId] = {
      completed_directives: currentProgress.completed_directives + 1,
      damage_dealt: (currentProgress.damage_dealt || 0) + damage,
      is_completed: nextHp <= 0,
    };

    if (completedNow) {
      const profile = this.getProfile(profile_id);
      profile.gold_balance += raid.reward_gold;
      profile.xp_current += raid.reward_xp;
      this.updateProfile(profile);

      this.addGoldTransaction({
        id: crypto.randomUUID(),
        profile_id,
        type: 'BOSS_REWARD',
        amount: raid.reward_gold,
        balance_after: profile.gold_balance,
        source: `Boss Raid Defeated: ${raid.title}`,
        reference_id: raid.id,
        created_at: new Date().toISOString(),
      });
    }

    this.saveState(this.state);
    return {
      raid: updatedRaid,
      completedNow,
      rewardGold: completedNow ? raid.reward_gold : 0,
      rewardXp: completedNow ? raid.reward_xp : 0,
    };
  }

  public tunePlayerState(profileId: string, updates: Partial<UserProfile>): UserProfile | null {
    const profile = this.getProfile(profileId);
    if (!profile) return null;
    const updated: UserProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.updateProfile(updated);
    return updated;
  }

  public createQuest(data: Partial<Quest> & { profile_id: string; title: string }): Quest {
    const newQuest: Quest = {
      id: data.id || `quest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      profile_id: data.profile_id,
      title: data.title,
      description: data.description || '',
      category: data.category || 'Personal',
      difficulty: data.difficulty || 'Normal',
      attribute: data.attribute || 'Intellect',
      xp_reward: data.xp_reward ?? 100,
      gold_reward: data.gold_reward ?? 25,
      frequency: data.frequency || 'Daily',
      status: data.status || 'active',
      is_system_directive: data.is_system_directive || false,
      due_date: data.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.addQuest(newQuest);
    return newQuest;
  }

  public completeQuest(profileId: string, questId: string): { quest: Quest; profile: UserProfile } | null {
    const quests = this.getQuests(profileId);
    const target = quests.find((q) => q.id === questId);
    if (!target || target.status === 'completed') {
      return null;
    }

    target.status = 'completed';
    target.updated_at = new Date().toISOString();
    this.updateQuest(target);

    const profile = this.getProfile(profileId);
    profile.xp_current += target.xp_reward;
    profile.gold_balance += target.gold_reward;
    this.updateProfile(profile);

    return { quest: target, profile };
  }

  public getRewards(): RewardItem[] {
    const list: RewardItem[] = [];
    if (this.state.customRewards) {
      list.push(...Object.values(this.state.customRewards));
    }
    return list;
  }

  public addRewardItem(item: RewardItem): RewardItem {
    if (!this.state.customRewards) this.state.customRewards = {};
    this.state.customRewards[item.id] = item;
    this.saveState(this.state);
    return item;
  }

  public addToInventory(profileId: string, itemId: string): void {
    this.addInventoryItem(profileId, itemId);
  }

  public getUserInventory(profileId: string): string[] {
    return this.getInventory(profileId);
  }

  public spendUserGold(profileId: string, amount: number): boolean {
    const profile = this.getProfile(profileId);
    if (!profile || profile.gold_balance < amount) return false;
    profile.gold_balance -= amount;
    this.updateProfile(profile);
    return true;
  }
}

// Global Singleton
export const db = new StorageEngine();
export const DataStore = db;
