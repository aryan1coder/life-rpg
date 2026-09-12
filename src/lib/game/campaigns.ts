export interface Campaign {
  id: string;
  title: string;
  description: string;
  total_stages: number;
  current_stage: number;
  reward_gold: number;
  reward_xp: number;
  is_completed: boolean;
}

export function advanceCampaignStage(campaign: Campaign): {
  updatedCampaign: Campaign;
  completedNow: boolean;
} {
  const nextStage = Math.min(campaign.total_stages, campaign.current_stage + 1);
  const completedNow = nextStage >= campaign.total_stages && !campaign.is_completed;

  return {
    updatedCampaign: {
      ...campaign,
      current_stage: nextStage,
      is_completed: nextStage >= campaign.total_stages,
    },
    completedNow,
  };
}
