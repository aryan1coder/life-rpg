-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 001_core_schema.sql
-- Purpose: Defines core player identity, RPG progression stats, and character attributes.
-- ZERO seed/demo player data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Player Identity & RPG Progression State)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  title TEXT NOT NULL DEFAULT 'Novice',
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp_current INTEGER NOT NULL DEFAULT 0 CHECK (xp_current >= 0),
  xp_next_level INTEGER NOT NULL DEFAULT 1000 CHECK (xp_next_level > 0),
  gold_balance INTEGER NOT NULL DEFAULT 0 CHECK (gold_balance >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  streak_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (streak_multiplier >= 1.00),
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent Column Guarantees (Ensures existing tables acquire all required columns before 002 runs)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'player';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Novice';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_current INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_next_level INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure CHECK constraints exist on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('player', 'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_level_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_level_check CHECK (level >= 1);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_gold_balance_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_gold_balance_check CHECK (gold_balance >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_xp_current_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_xp_current_check CHECK (xp_current >= 0);
  END IF;
END $$;

-- 2. CHARACTER ATTRIBUTES (5-Capacity Cognitive & Physical Matrix)
CREATE TABLE IF NOT EXISTS public.character_attributes (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  intellect INTEGER NOT NULL DEFAULT 10 CHECK (intellect >= 0),
  discipline INTEGER NOT NULL DEFAULT 10 CHECK (discipline >= 0),
  vitality INTEGER NOT NULL DEFAULT 10 CHECK (vitality >= 0),
  strength INTEGER NOT NULL DEFAULT 10 CHECK (strength >= 0),
  creativity INTEGER NOT NULL DEFAULT 10 CHECK (creativity >= 0),
  today_intellect_delta INTEGER NOT NULL DEFAULT 0,
  today_discipline_delta INTEGER NOT NULL DEFAULT 0,
  today_vitality_delta INTEGER NOT NULL DEFAULT 0,
  today_strength_delta INTEGER NOT NULL DEFAULT 0,
  today_creativity_delta INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent Column Guarantees for character_attributes
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS intellect INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS discipline INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS vitality INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS strength INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS creativity INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_intellect_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_discipline_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_vitality_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_strength_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS today_creativity_delta INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.character_attributes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
