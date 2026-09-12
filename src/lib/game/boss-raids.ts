export interface BossRaid {
  id: string;
  title: string;
  description: string;
  threat_level: string;
  max_hp: number;
  current_hp: number;
  required_directives: number;
  directives_completed: number;
  expires_at: string;
  start_at?: string;
  reward_gold: number;
  reward_xp: number;
  is_completed: boolean;
  is_active: boolean;
}

export function advanceBossRaidProgress(bossRaid: BossRaid, damageAmount: number = 25): {
  updatedRaid: BossRaid;
  completedNow: boolean;
} {
  const nextCompleted = Math.min(bossRaid.required_directives, bossRaid.directives_completed + 1);
  const nextHp = Math.max(0, bossRaid.current_hp - damageAmount);
  const completedNow = (nextCompleted >= bossRaid.required_directives || nextHp <= 0) && !bossRaid.is_completed;

  return {
    updatedRaid: {
      ...bossRaid,
      current_hp: nextHp,
      directives_completed: nextCompleted,
      is_completed: nextCompleted >= bossRaid.required_directives || nextHp <= 0,
    },
    completedNow,
  };
}

export function formatTimeRemaining(expiresAtIso: string): string {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) return '00:00:00 EXPIRED';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} remaining`;
}
