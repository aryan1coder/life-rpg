'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  Achievement,
  AvatarItem,
  CharacterAttributes,
  EquippedLoadout,
  Quest,
  RewardItem,
  UserProfile,
} from '@/lib/game/types';
import { Campaign } from '@/lib/game/campaigns';
import { BossRaid } from '@/lib/game/boss-raids';
import { createClient } from '@/lib/supabase/client';

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
  avatarItems: AvatarItem[];
  avatarUnlocks: string[];
  avatarLoadout: Record<string, string>;
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
  levelUpModalData: { newLevel: number; levelsGained: number; newlyUnlockedAvatarItems?: AvatarItem[] } | null;
  setLevelUpModalData: (data: { newLevel: number; levelsGained: number; newlyUnlockedAvatarItems?: AvatarItem[] } | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  completeQuest: (id: string) => Promise<boolean>;
  createQuest: (data: Partial<Quest>) => Promise<boolean>;
  redeemReward: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string) => Promise<boolean>;
  unequipItem: (slot: string) => Promise<boolean>;
  equipAvatarItem: (itemId: string) => Promise<boolean>;
  unequipAvatarSlot: (slot: string) => Promise<boolean>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
  strikeBossRaid: (raidId: string, damage?: number) => Promise<{ success: boolean; damageDealt?: number; isDefeated?: boolean; newHp?: number; error?: string }>;
  refreshAll: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attributes, setAttributes] = useState<CharacterAttributes | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadout, setLoadout] = useState<EquippedLoadout | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [avatarItems, setAvatarItems] = useState<AvatarItem[]>([]);
  const [avatarUnlocks, setAvatarUnlocks] = useState<string[]>([]);
  const [avatarLoadout, setAvatarLoadout] = useState<Record<string, string>>({});
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bossRaid, setBossRaid] = useState<BossRaid | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals & Navigation
  const [createQuestModalOpen, setCreateQuestModalOpen] = useState(false);
  const [redeemItemTarget, setRedeemItemTarget] = useState<RewardItem | null>(null);
  const [insufficientFundsData, setInsufficientFundsData] = useState<{ required: number; balance: number; shortfall: number } | null>(null);
  const [levelUpModalData, setLevelUpModalData] = useState<{ newLevel: number; levelsGained: number; newlyUnlockedAvatarItems?: AvatarItem[] } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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

  const logout = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setProfile(null);
      setAttributes(null);
      setQuests([]);
      setRewards([]);
      setInventory([]);
      setAchievements([]);
      setAvatarItems([]);
      setAvatarUnlocks([]);
      setAvatarLoadout({});
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const supabase = createClient();
    let token: string | null = null;
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || null;
      } catch (err) {
        // non-blocking
      }
    }

    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  };

  const refreshAll = async () => {
    // 1. Guard against fetching protected endpoints when on auth routes
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/auth')) {
        setLoading(false);
        return;
      }
    }

    try {
      // 2. Authoritative session verification via /api/character first
      const charRes = await authFetch('/api/character');

      if (charRes.status === 401) {
        setProfile(null);
        setAttributes(null);
        setQuests([]);
        setRewards([]);
        setInventory([]);
        setAchievements([]);
        setAvatarItems([]);
        setAvatarUnlocks([]);
        setAvatarLoadout({});
        setLoading(false);
        return;
      }

      if (!charRes.ok) {
        setLoading(false);
        return;
      }

      const data = await charRes.json();
      setProfile(data.profile);
      setAttributes(data.attributes);
      setLoadout(data.loadout);
      setCampaign(data.campaign);
      setBossRaid(data.bossRaid);

      // 3. Authenticated session verified: fetch auxiliary gameplay telemetry in parallel
      const [questsRes, rewardsRes, achRes, avatarRes] = await Promise.all([
        authFetch('/api/quests'),
        authFetch('/api/rewards'),
        authFetch('/api/achievements'),
        authFetch('/api/avatar/items'),
      ]);

      if (questsRes.ok) {
        const qData = await questsRes.json();
        setQuests(qData.quests || []);
      }

      if (rewardsRes.ok) {
        const rData = await rewardsRes.json();
        setRewards(rData.rewards || []);
        setInventory(rData.inventory || []);
      }

      if (achRes.ok) {
        const aData = await achRes.json();
        setAchievements(aData.achievements || []);
      }

      if (avatarRes.ok) {
        const avData = await avatarRes.json();
        setAvatarItems(avData.items || []);
        setAvatarUnlocks(avData.unlocks || []);
        setAvatarLoadout(avData.loadout || {});
      }
    } catch (e) {
      console.error('Failed to synchronize game state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [pathname]);

  // Listen to Supabase auth state transitions
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        refreshAll();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const completeQuest = async (id: string): Promise<boolean> => {
    // Optimistic completion in UI
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'completed' as const } : q))
    );

    try {
      const res = await authFetch(`/api/quests/${id}/complete`, { method: 'POST' });
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
          newlyUnlockedAvatarItems: data.result.newlyUnlockedAvatarItems,
        });

        // Synchronize avatar unlocks and items
        try {
          const avRes = await authFetch('/api/avatar/items');
          if (avRes.ok) {
            const avData = await avRes.json();
            setAvatarItems(avData.items || []);
            setAvatarUnlocks(avData.unlocks || []);
            setAvatarLoadout(avData.loadout || {});
          }
        } catch {
          // Non-blocking
        }
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
      const res = await authFetch('/api/quests', {
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
      const res = await authFetch('/api/rewards/redeem', {
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
      const res = await authFetch('/api/character/loadout', {
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
      const res = await authFetch('/api/character/loadout', {
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

  const equipAvatarItem = async (itemId: string): Promise<boolean> => {
    try {
      const res = await authFetch('/api/avatar/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Equip Failed',
          message: data.error || 'Could not equip avatar item.',
        });
        return false;
      }

      setAvatarLoadout(data.loadout);
      addToast({
        type: 'success',
        title: 'Gear Equipped',
        message: `Equipped ${data.equippedItem?.name || 'gear item'} to active loadout.`,
      });
      return true;
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Equip Failed',
        message: 'Could not connect to equipment server.',
      });
      return false;
    }
  };

  const unequipAvatarSlot = async (slot: string): Promise<boolean> => {
    try {
      const res = await authFetch('/api/avatar/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, unequip: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return false;
      }

      setAvatarLoadout(data.loadout);
      addToast({
        type: 'info',
        title: 'Slot Cleared',
        message: `Removed ${slot} gear piece.`,
      });
      return true;
    } catch {
      return false;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await authFetch('/api/character', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update profile');
      }

      const resData = await res.json();
      if (resData.profile) {
        setProfile(resData.profile);
      }
      addToast({
        type: 'success',
        title: 'Profile Synchronized',
        message: 'Identification record has been updated successfully.',
      });
      return true;
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Profile Update Failed',
        message: e.message || 'Could not persist profile changes.',
      });
      return false;
    }
  };

  const strikeBossRaid = async (raidId: string, damage: number = 25): Promise<{ success: boolean; damageDealt?: number; isDefeated?: boolean; newHp?: number; error?: string }> => {
    try {
      const res = await authFetch(`/api/boss-raids/${raidId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DIRECTIVE_STRIKE', damage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Strike Failed',
          message: data.error || 'Failed to execute tactical strike on boss encounter.',
        });
        return { success: false, error: data.error };
      }

      if (data.isDefeated) {
        addToast({
          type: 'success',
          title: '🔥 BOSS ENCOUNTER NEUTRALIZED',
          message: `Victory! Bounty claimed: +${data.rewardXp || 0} XP and +${data.rewardGold || 0} Gold!`,
        });
      } else {
        addToast({
          type: 'info',
          title: '🎯 Strike Confirmed',
          message: `Dealt ${data.damageDealt} damage! Boss HP reduced to ${data.newHp}.`,
        });
      }

      await refreshAll();
      return {
        success: true,
        damageDealt: data.damageDealt,
        isDefeated: data.isDefeated,
        newHp: data.newHp,
      };
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Network Anomaly',
        message: e.message || 'Strike could not be delivered.',
      });
      return { success: false, error: e.message };
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
        avatarItems,
        avatarUnlocks,
        avatarLoadout,
        campaign,
        bossRaid,
        loading,
        toasts,
        createQuestModalOpen,
        setCreateQuestModalOpen,
        profileModalOpen,
        setProfileModalOpen,
        redeemItemTarget,
        setRedeemItemTarget,
        insufficientFundsData,
        setInsufficientFundsData,
        levelUpModalData,
        setLevelUpModalData,
        sidebarOpen,
        setSidebarOpen,
        logout,
        addToast,
        removeToast,
        completeQuest,
        createQuest,
        redeemReward,
        equipItem,
        unequipItem,
        equipAvatarItem,
        unequipAvatarSlot,
        updateProfileData,
        strikeBossRaid,
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
