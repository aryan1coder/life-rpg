# PostgreSQL Database Schema & Migration Guide

## Migration Manifest

All schema migrations are located in `supabase/migrations/`:
1. `001_initial_schema.sql` — Base tables, indexes, check constraints, foreign keys.
2. `002_rls_policies.sql` — Multi-tenant Row Level Security policies.
3. `003_seed_catalog.sql` — Curated reward catalog, master achievements, default campaign and boss raid.

## Execution via Supabase CLI
```bash
# Apply migrations locally
supabase db reset

# Link to remote Supabase project
supabase link --project-ref your-project-ref
supabase db push
```

## Entity Relationship Diagram
```
auth.users (Supabase Auth)
     │ 1:1
     ▼
public.profiles
     ├── 1:1 ── public.character_attributes
     ├── 1:1 ── public.streaks
     ├── 1:1 ── public.equipped_items
     ├── 1:N ── public.quests
     │             └── 1:N ── public.quest_logs
     ├── 1:N ── public.xp_transactions
     ├── 1:N ── public.gold_transactions
     ├── 1:N ── public.attribute_logs
     ├── 1:N ── public.user_inventory ── N:1 ── public.reward_items
     ├── 1:N ── public.user_achievements ── N:1 ── public.achievements
     ├── 1:N ── public.campaign_progress ── N:1 ── public.campaigns
     └── 1:N ── public.boss_raid_progress ── N:1 ── public.boss_raids
```
