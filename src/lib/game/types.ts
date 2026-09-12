export type AttributeName = 'Intellect' | 'Discipline' | 'Vitality' | 'Strength' | 'Creativity';

export type QuestCategory = 'Work' | 'Study' | 'Fitness' | 'Personal' | 'Creative' | 'Health' | 'Engineering';

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Epic';

export type QuestFrequency = 'Once' | 'Daily' | 'Weekly' | 'Campaign' | 'Boss Raid';

export type QuestStatus = 'active' | 'completed' | 'archived';

export type ItemCategory = 'Theme' | 'Cosmetic' | 'Badge' | 'Title' | 'Boost' | 'Unlock';

export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  role?: 'player' | 'admin';
  title: string;
  level: number;
  xp_current: number;
  xp_next_level: number;
  gold_balance: number;
  streak_days: number;
  streak_multiplier: number;
  last_active_date: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterAttributes {
  profile_id: string;
  intellect: number;
  discipline: number;
  vitality: number;
  strength: number;
  creativity: number;
  today_intellect_delta: number;
  today_discipline_delta: number;
  today_vitality_delta: number;
  today_strength_delta: number;
  today_creativity_delta: number;
  updated_at: string;
}

export interface Quest {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  attribute: AttributeName;
  xp_reward: number;
  gold_reward: number;
  frequency: QuestFrequency;
  status: QuestStatus;
  is_system_directive?: boolean;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  cost_gold: number;
  min_level_required: number;
  preview_asset?: string;
  metadata?: Record<string, any>;
  is_available: boolean;
}

export interface EquippedLoadout {
  profile_id: string;
  theme_id?: string | null;
  frame_id?: string | null;
  title_id?: string | null;
  badge_id?: string | null;
  boost_id?: string | null;
  boost_expires_at?: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Milestones' | 'Consistency' | 'Execution' | 'Mastery' | 'Economy';
  reward_gold: number;
  reward_xp: number;
  target_value: number;
  badge_icon: string;
  current_progress?: number;
  is_unlocked?: boolean;
  unlocked_at?: string | null;
}

export interface QuestCompletionResult {
  success: boolean;
  xpGained: number;
  goldGained: number;
  attributeGained: { name: AttributeName; amount: number };
  leveledUp: boolean;
  newLevel: number;
  levelsGained: number;
  newXp: number;
  newXpNextLevel: number;
  newGold: number;
  newStreak: number;
  newStreakMultiplier: number;
  unlockedAchievements: Achievement[];
  newlyUnlockedAvatarItems?: AvatarItem[];
  message: string;
}

export type AvatarSlot =
  | 'head'
  | 'face'
  | 'body'
  | 'outerwear'
  | 'legs'
  | 'shoes'
  | 'accessory'
  | 'weapon_or_tool'
  | 'aura'
  | 'background';

export interface AvatarItem {
  id: string;
  name: string;
  description?: string;
  slot: AvatarSlot;
  rarity: ItemRarity;
  asset_key: string;
  required_level: number;
  attribute_requirements?: Record<string, number>;
  is_active: boolean;
  created_at?: string;
}

export interface UserAvatarUnlock {
  id: string;
  user_id: string;
  avatar_item_id: string;
  unlocked_at: string;
}

export interface UserAvatarLoadout {
  id?: string;
  user_id: string;
  slot: AvatarSlot;
  avatar_item_id: string;
  equipped_at: string;
}

