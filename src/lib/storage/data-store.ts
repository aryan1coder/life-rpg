import fs from 'fs';
import path from 'path';
import {
  Achievement,
  CharacterAttributes,
  EquippedLoadout,
  Quest,
  RewardItem,
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
  bossRaidProgress: Record<string, Record<string, { completed_directives: number; is_completed: boolean }>>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'life_rpg_db.json');

// Default Curated Catalogs
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
  current_stage: 3,
  reward_gold: 850,
  reward_xp: 1500,
  is_completed: false,
};

export const DEFAULT_BOSS_RAID: BossRaid = {
  id: 'boss_q3_system_overhaul',
  title: 'Q3 Architecture Overhaul',
  description: 'Refactor distributed cache, synchronize database schemas, and deploy production load balancers.',
  threat_level: 'Critical Threat',
  required_directives: 3,
  directives_completed: 1,
  expires_at: new Date(Date.now() + 2 * 3600 * 1000 + 18 * 60 * 1000 + 42 * 1000).toISOString(),
  reward_gold: 350,
  reward_xp: 850,
  is_completed: false,
};

export function getDefaultUserProfile(id = 'kai_operator', username = 'Kai'): UserProfile {
  return {
    id,
    username,
    title: 'Arch-Strategist II',
    level: 12,
    xp_current: 8260,
    xp_next_level: 10000,
    gold_balance: 1420,
    streak_days: 14,
    streak_multiplier: 1.15,
    last_active_date: new Date().toISOString().split('T')[0],
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function getDefaultAttributes(profile_id = 'kai_operator'): CharacterAttributes {
  return {
    profile_id,
    intellect: 86,
    discipline: 91,
    vitality: 78,
    strength: 72,
    creativity: 64,
    today_intellect_delta: 5,
    today_discipline_delta: 2,
    today_vitality_delta: 4,
    today_strength_delta: 3,
    today_creativity_delta: 1,
    updated_at: new Date().toISOString(),
  };
}

export function getDefaultQuests(profile_id = 'kai_operator'): Quest[] {
  return [
    {
      id: 'quest_algo_practice',
      profile_id,
      title: 'Algorithm Practice & Graph Traversal',
      description: 'Solve 2 hard LeetCode problems on shortest-path and topological ordering.',
      category: 'Study',
      difficulty: 'Normal',
      attribute: 'Intellect',
      xp_reward: 120,
      gold_reward: 65,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quest_distributed_systems',
      profile_id,
      title: 'Distributed Consensus Audit',
      description: 'Review Raft leader election edge cases and write safety invariant tests.',
      category: 'Engineering',
      difficulty: 'Hard',
      attribute: 'Intellect',
      xp_reward: 240,
      gold_reward: 120,
      frequency: 'Campaign',
      status: 'active',
      due_date: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quest_strength_training',
      profile_id,
      title: 'Heavy Barbell Compound Session',
      description: 'Complete 5x5 heavy squat & deadlift routine with disciplined rest periods.',
      category: 'Fitness',
      difficulty: 'Normal',
      attribute: 'Strength',
      xp_reward: 140,
      gold_reward: 70,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quest_deep_work_sprint',
      profile_id,
      title: 'Four-Hour Unbroken Flow Block',
      description: 'Zero notification workspace session dedicated to core application pipeline.',
      category: 'Work',
      difficulty: 'Hard',
      attribute: 'Discipline',
      xp_reward: 180,
      gold_reward: 90,
      frequency: 'Daily',
      status: 'active',
      due_date: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quest_sleep_hygiene',
      profile_id,
      title: '8-Hour Sleep Recovery & Hydration Protocol',
      description: 'Ensure 8+ hours uninterrupted sleep with morning sunlight exposure.',
      category: 'Health',
      difficulty: 'Easy',
      attribute: 'Vitality',
      xp_reward: 90,
      gold_reward: 45,
      frequency: 'Daily',
      status: 'completed',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'quest_ui_design_polishing',
      profile_id,
      title: 'Micro-Interaction Polish & Framer Tuning',
      description: 'Tune 180ms ease transitions across command deck dialogs and chips.',
      category: 'Creative',
      difficulty: 'Normal',
      attribute: 'Creativity',
      xp_reward: 130,
      gold_reward: 60,
      frequency: 'Weekly',
      status: 'completed',
      completed_at: new Date().toISOString(),
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

    const defaultProfile = getDefaultUserProfile();
    const defaultAttrs = getDefaultAttributes(defaultProfile.id);
    const defaultQuests = getDefaultQuests(defaultProfile.id);

    const initial: DatabaseState = {
      profiles: { [defaultProfile.id]: defaultProfile },
      attributes: { [defaultProfile.id]: defaultAttrs },
      quests: { [defaultProfile.id]: defaultQuests },
      inventory: {
        [defaultProfile.id]: [
          'theme_deep_work_obsidian',
          'frame_tactical_obsidian',
          'title_arch_strategist',
          'badge_consistency_master',
          'boost_xp_surge_25',
        ],
      },
      loadouts: {
        [defaultProfile.id]: {
          profile_id: defaultProfile.id,
          theme_id: 'theme_deep_work_obsidian',
          frame_id: 'frame_tactical_obsidian',
          title_id: 'title_arch_strategist',
          badge_id: 'badge_consistency_master',
          boost_id: 'boost_xp_surge_25',
          boost_expires_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        },
      },
      userAchievements: {
        [defaultProfile.id]: {
          ach_first_blood: { is_unlocked: true, current_progress: 1, unlocked_at: new Date().toISOString() },
          ach_cadence_7: { is_unlocked: true, current_progress: 14, unlocked_at: new Date().toISOString() },
          ach_cadence_14: { is_unlocked: true, current_progress: 14, unlocked_at: new Date().toISOString() },
          ach_tier_10: { is_unlocked: true, current_progress: 12, unlocked_at: new Date().toISOString() },
          ach_first_gear: { is_unlocked: true, current_progress: 5, unlocked_at: new Date().toISOString() },
          ach_century_operative: { is_unlocked: false, current_progress: 69 },
          ach_vault_wealthy: { is_unlocked: false, current_progress: 1420 },
          ach_boss_slayer: { is_unlocked: false, current_progress: 0 },
        },
      },
      campaignProgress: {
        [defaultProfile.id]: { campaign_hackathon_mvp: 3 },
      },
      bossRaidProgress: {
        [defaultProfile.id]: { boss_q3_system_overhaul: { completed_directives: 1, is_completed: false } },
      },
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

  public getProfile(id = 'kai_operator'): UserProfile {
    if (!this.state.profiles[id]) {
      this.state.profiles[id] = getDefaultUserProfile(id, id === 'kai_operator' ? 'Kai' : id);
      this.saveState(this.state);
    }
    return this.state.profiles[id];
  }

  public updateProfile(profile: UserProfile): void {
    this.state.profiles[profile.id] = profile;
    this.saveState(this.state);
  }

  public getAttributes(id = 'kai_operator'): CharacterAttributes {
    if (!this.state.attributes[id]) {
      this.state.attributes[id] = getDefaultAttributes(id);
      this.saveState(this.state);
    }
    return this.state.attributes[id];
  }

  public updateAttributes(attrs: CharacterAttributes): void {
    this.state.attributes[attrs.profile_id] = attrs;
    this.saveState(this.state);
  }

  public getQuests(id = 'kai_operator'): Quest[] {
    if (!this.state.quests[id]) {
      this.state.quests[id] = getDefaultQuests(id);
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

  public deleteQuest(id: string, profile_id = 'kai_operator'): boolean {
    const list = this.getQuests(profile_id);
    const initialLen = list.length;
    this.state.quests[profile_id] = list.filter((q) => q.id !== id);
    this.saveState(this.state);
    return this.state.quests[profile_id].length < initialLen;
  }

  public getInventory(id = 'kai_operator'): string[] {
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

  public getLoadout(id = 'kai_operator'): EquippedLoadout {
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

  public getUserAchievements(id = 'kai_operator') {
    return this.state.userAchievements[id] || {};
  }

  public updateUserAchievements(id: string, map: Record<string, any>): void {
    this.state.userAchievements[id] = map;
    this.saveState(this.state);
  }

  public getCampaign(): Campaign {
    return DEFAULT_CAMPAIGN;
  }

  public getBossRaid(): BossRaid {
    return DEFAULT_BOSS_RAID;
  }
}

// Global Singleton
export const db = new StorageEngine();
