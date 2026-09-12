-- LIFE RPG SEED CATALOG DATA
-- Migration: 003_seed_catalog.sql

-- 1. SEED REWARD ITEMS
INSERT INTO public.reward_items (id, name, description, category, rarity, cost_gold, min_level_required, preview_asset, metadata)
VALUES
  ('theme_deep_work_obsidian', 'Obsidian Deep-Work Environment', 'High contrast monochrome palette tailored for extreme late-night uninterrupted coding sprints.', 'Theme', 'Rare', 750, 10, 'theme-obsidian.png', '{"accentColor": "#6366F1", "bgColor": "#0B0E15"}'),
  ('theme_cybernetic_neon', 'Cybernetic Grid Theme', 'High intensity cyan and violet luminescence for high frequency system monitoring.', 'Theme', 'Epic', 1200, 12, 'theme-cyber.png', '{"accentColor": "#06B6D4", "bgColor": "#080B10"}'),
  ('theme_solar_gold', 'Solar Forge Theme', 'Warm radiant amber-gold UI accents reserved for high velocity sprint milestones.', 'Theme', 'Legendary', 2500, 15, 'theme-solar.png', '{"accentColor": "#F59E0B", "bgColor": "#0D0F14"}'),
  ('frame_tactical_obsidian', 'Tactical Obsidian Frame', 'Matte carbon fiber avatar border with understated micro-chamfered corners.', 'Cosmetic', 'Uncommon', 350, 5, 'frame-obsidian.png', '{"borderStyle": "chamfered"}'),
  ('frame_neural_luminescence', 'Neural Luminescence Shroud', 'Subtle breathing lavender halo surrounding player avatar.', 'Cosmetic', 'Epic', 950, 12, 'frame-neural.png', '{"glowColor": "#818CF8"}'),
  ('title_arch_strategist', 'Arch-Strategist', 'Conferred upon operators demonstrating exceptional macro-planning velocity.', 'Title', 'Epic', 800, 10, 'title-arch.png', '{"displayTag": "Arch-Strategist II"}'),
  ('title_deep_worker', 'Deep Worker', 'Signifies mastery over distraction-free multi-hour flow states.', 'Title', 'Rare', 500, 8, 'title-deep.png', '{"displayTag": "Deep Worker"}'),
  ('title_flow_architect', 'Flow State Architect', 'Mastery over cadence, habitual execution, and deep engineering discipline.', 'Title', 'Legendary', 2000, 15, 'title-flow.png', '{"displayTag": "Flow State Architect"}'),
  ('badge_consistency_master', 'Consistency Master Insignia', 'Awarded for maintaining an active streak uninterrupted for over 14 cycles.', 'Badge', 'Rare', 600, 7, 'badge-consistency.png', '{"icon": "local_fire_department"}'),
  ('badge_algorithm_savant', 'Algorithm Savant Emblem', 'Proof of completing 50+ computational problem directives.', 'Badge', 'Epic', 1100, 12, 'badge-savant.png', '{"icon": "terminal"}'),
  ('boost_xp_surge_25', '25% Cognitive XP Surge', 'Provides +25% net XP multiplier across all quest completions for 24 operating hours.', 'Boost', 'Rare', 450, 3, 'boost-xp.png', '{"durationHours": 24, "multiplier": 1.25}'),
  ('boost_gold_bounty_50', '50% Vault Bounty Amplifier', 'Accelerates all quest Gold yields by +50% for 12 hours.', 'Boost', 'Epic', 650, 6, 'boost-gold.png', '{"durationHours": 12, "multiplier": 1.50}')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED MASTER ACHIEVEMENTS
INSERT INTO public.achievements (id, title, description, category, reward_gold, reward_xp, target_value, badge_icon)
VALUES
  ('ach_first_blood', 'First Directive Conquered', 'Execute and mark complete your very first quest protocol.', 'Milestones', 50, 100, 1, 'flag'),
  ('ach_cadence_7', 'Weekly Operative', 'Sustain an unbroken focus streak across 7 consecutive cycles.', 'Consistency', 150, 300, 7, 'local_fire_department'),
  ('ach_cadence_14', 'Fortnight Discipline', 'Maintain flawless execution cadence for 14 continuous days.', 'Consistency', 350, 700, 14, 'workspace_premium'),
  ('ach_century_operative', 'Century Operative', 'Successfully complete 100 verified quest protocols in the system.', 'Execution', 750, 1500, 100, 'military_tech'),
  ('ach_tier_10', 'Double Digit Operator', 'Cross the Level 10 threshold to unlock Tier II specialization.', 'Mastery', 500, 1000, 10, 'upgrade'),
  ('ach_vault_wealthy', 'Vault Capitalist', 'Accumulate a net balance of 2,500 Gold in your personal vault.', 'Economy', 400, 600, 2500, 'monetization_on'),
  ('ach_first_gear', 'Equipment Initialized', 'Acquire and equip your first tactical cosmetic or environment theme.', 'Milestones', 100, 200, 1, 'backpack'),
  ('ach_boss_slayer', 'Boss Raid Conqueror', 'Neutralize an Epic Boss Raid protocol before countdown expiry.', 'Mastery', 600, 1200, 1, 'swords')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CAMPAIGNS
INSERT INTO public.campaigns (id, title, description, total_stages, reward_gold, reward_xp)
VALUES
  ('campaign_hackathon_mvp', 'Ship Hackathon MVP', 'Execute end-to-end full stack architecture, database persistence, and design integration.', 4, 850, 1500)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BOSS RAIDS
INSERT INTO public.boss_raids (id, title, description, threat_level, required_directives, time_limit_hours, reward_gold, reward_xp)
VALUES
  ('boss_q3_system_overhaul', 'Q3 Architecture Overhaul', 'Refactor distributed cache, synchronize database schemas, and deploy production load balancers.', 'Critical Threat', 3, 24, 350, 850)
ON CONFLICT (id) DO NOTHING;
