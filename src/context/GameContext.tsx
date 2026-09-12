'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Achievement,
  CharacterAttributes,
  EquippedLoadout,
  Quest,
  RewardItem,
  UserProfile,
} from '@/lib/game/types';
import { Campaign } from '@/lib/game/campaigns';
import { BossRaid } from '@/lib/game/boss-raids';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface GameContextType {
  profile: UserProfile | null;
  attributes: CharacterAttributes | null;
  quests: Quest[];
  loadout: EquippedLoadout | null;
  inventory: string[];
  rewards: RewardItem[];
  achievements: Achievement[];
  campaign: Campaign | null;
  bossRaid: BossRaid | null;
  loading: boolean;
  toasts: ToastMessage[];
  createQuestModalOpen: boolean;
  setCreateQuestModalOpen: (open: boolean) => void;
  redeemItemTarget: RewardItem | null;
  setRedeemItemTarget: (item: RewardItem | null) => void;
  insufficientFundsData: { required: number; balance: number; shortfall: number } | null;
  setInsufficientFundsData: (data: { required: number; balance: number; shortfall: number } | null) => void;
  levelUpModalData: { newLevel: number; levelsGained: number } | null;
  setLevelUpModalData: (data: { newLevel: number; levelsGained: number } | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  completeQuest: (id: string) => Promise<boolean>;
  createQuest: (data: Partial<Quest>) => Promise<boolean>;
  redeemReward: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string) => Promise<boolean>;
  unequipItem: (slot: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attributes, setAttributes] = useState<CharacterAttributes | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadout, setLoadout] = useState<EquippedLoadout | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bossRaid, setBossRaid] = useState<BossRaid | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [createQuestModalOpen, setCreateQuestModalOpen] = useState(false);
  const [redeemItemTarget, setRedeemItemTarget] = useState<RewardItem | null>(null);
  const [insufficientFundsData, setInsufficientFundsData] = useState<{ required: number; balance: number; shortfall: number } | null>(null);
  const [levelUpModalData, setLevelUpModalData] = useState<{ newLevel: number; levelsGained: number } | null>(null);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshAll = async () => {
    try {
      const [charRes, questsRes, rewardsRes, achRes] = await Promise.all([
        fetch('/api/character'),
        fetch('/api/quests'),
        fetch('/api/rewards'),
        fetch('/api/achievements'),
      ]);

      if (charRes.ok) {
        const data = await charRes.json();
        setProfile(data.profile);
        setAttributes(data.attributes);
        setLoadout(data.loadout);
        setCampaign(data.campaign);
        setBossRaid(data.bossRaid);
      }

      if (questsRes.ok) {
        const data = await questsRes.json();
        setQuests(data.quests);
      }

      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data.rewards);
        setInventory(data.inventory);
      }

      if (achRes.ok) {
        const data = await achRes.json();
        setAchievements(data.achievements);
      }
    } catch (e) {
      console.error('Failed to synchronize game state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const completeQuest = async (id: string): Promise<boolean> => {
    // Optimistic completion in UI
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'completed' as const } : q))
    );

    try {
      const res = await fetch(`/api/quests/${id}/complete`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Rollback on error
        await refreshAll();
        addToast({
          type: 'error',
          title: 'Directive Error',
          message: data.error || 'Failed to conclude protocol',
        });
        return false;
      }

      // Authoritative state update
      setProfile(data.profile);
      setAttributes(data.attributes);
      setQuests((prev) => prev.map((q) => (q.id === id ? data.quest : q)));

      addToast({
        type: 'success',
        title: '✓ Protocol Conquered',
        message: data.result.message,
      });

      if (data.result.leveledUp) {
        setLevelUpModalData({
          newLevel: data.result.newLevel,
          levelsGained: data.result.levelsGained,
        });
      }

      if (data.result.unlockedAchievements?.length > 0) {
        data.result.unlockedAchievements.forEach((ach: Achievement) => {
          addToast({
            type: 'info',
            title: 'Accolade Unlocked',
            message: `${ach.title}: ${ach.description}`,
          });
        });
      }

      return true;
    } catch (e: any) {
      await refreshAll();
      addToast({
        type: 'error',
        title: 'Connection Issue',
        message: 'Could not connect to command deck server.',
      });
      return false;
    }
  };

  const createQuest = async (questData: Partial<Quest>): Promise<boolean> => {
    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Creation Rejected',
          message: data.error || 'Unable to register directive',
        });
        return false;
      }

      setQuests((prev) => [data.quest, ...prev]);
      addToast({
        type: 'success',
        title: 'Protocol Initialized',
        message: `${data.quest.title} deployed to command log.`,
      });
      return true;
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Transmission Error',
        message: 'Server did not acknowledge quest creation.',
      });
      return false;
    }
  };

  const redeemReward = async (itemId: string): Promise<boolean> => {
    const item = rewards.find((r) => r.id === itemId);
    if (!item) return false;

    if (profile && profile.gold_balance < item.cost_gold) {
      setInsufficientFundsData({
        required: item.cost_gold,
        balance: profile.gold_balance,
        shortfall: item.cost_gold - profile.gold_balance,
      });
      return false;
    }

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.insufficientFunds) {
          setInsufficientFundsData({
            required: item.cost_gold,
            balance: profile?.gold_balance || 0,
            shortfall: data.shortfall,
          });
        } else {
          addToast({
            type: 'error',
            title: 'Redemption Rejected',
            message: data.error || 'Failed to redeem catalog item.',
          });
        }
        return false;
      }

      // Propagate state
      if (profile) {
        setProfile({ ...profile, gold_balance: data.newGoldBalance });
      }
      setInventory((prev) => [...prev, itemId]);

      addToast({
        type: 'success',
        title: 'Equipment Vault Acquired',
        message: `${item.name} added to your operational inventory.`,
      });

      setRedeemItemTarget(null);
      return true;
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Transaction Aborted',
        message: 'Network error during vault transaction.',
      });
      return false;
    }
  };

  const equipItem = async (itemId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/character/loadout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'equip', itemId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Equip Failed',
          message: data.error || 'Could not equip item.',
        });
        return false;
      }

      setLoadout(data.loadout);
      addToast({
        type: 'success',
        title: 'Loadout Synchronized',
        message: data.message,
      });
      return true;
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Loadout Sync Error',
        message: 'Could not communicate with profile service.',
      });
      return false;
    }
  };

  const unequipItem = async (slot: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/character/loadout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unequip', slot }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Unequip Failed',
          message: data.error || 'Could not unequip slot.',
        });
        return false;
      }

      setLoadout(data.loadout);
      addToast({
        type: 'info',
        title: 'Slot Cleared',
        message: data.message,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        attributes,
        quests,
        loadout,
        inventory,
        rewards,
        achievements,
        campaign,
        bossRaid,
        loading,
        toasts,
        createQuestModalOpen,
        setCreateQuestModalOpen,
        redeemItemTarget,
        setRedeemItemTarget,
        insufficientFundsData,
        setInsufficientFundsData,
        levelUpModalData,
        setLevelUpModalData,
        addToast,
        removeToast,
        completeQuest,
        createQuest,
        redeemReward,
        equipItem,
        unequipItem,
        refreshAll,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
