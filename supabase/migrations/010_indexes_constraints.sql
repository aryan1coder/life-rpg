-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 010_indexes_constraints.sql
-- Purpose: Performance indexes and relational integrity constraints across all tables.

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_quests_profile_status ON public.quests(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_quests_system ON public.quests(is_system_directive);
CREATE INDEX IF NOT EXISTS idx_quest_logs_profile ON public.quest_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_inventory_profile ON public.user_inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_gold_tx_profile ON public.gold_transactions(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avatar_unlocks_user ON public.user_avatar_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_loadout_user ON public.user_avatar_loadout(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_progress_profile ON public.boss_raid_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_boss_actions_raid ON public.boss_raid_actions(boss_raid_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_profile ON public.user_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_profile ON public.campaign_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_time ON public.admin_audit_logs(admin_user_id, created_at DESC);
