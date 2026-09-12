-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 002_auth_profiles.sql
-- Purpose: Real Supabase Auth triggers and server-authoritative admin security functions.
-- ZERO seed/demo player data.

-- 1. Function: Check if current authenticated user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Function: Securely promote an account to admin by email (SQL / Owner Tooling Only)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  target_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Look up target user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(target_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Operator with email % not found in auth.users', target_email;
  END IF;

  -- Ensure corresponding profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_user_id
  ) INTO profile_exists;

  IF NOT profile_exists THEN
    RAISE EXCEPTION 'Profile for operator % (ID: %) does not exist in public.profiles', target_email, target_user_id;
  END IF;

  -- Authoritatively promote to admin
  UPDATE public.profiles
  SET role = 'admin',
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Revoke public execution of promote_to_admin to prevent privilege escalation
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(TEXT) TO service_role;

-- 3. Function: Automatic new operator initialization on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  default_username TEXT;
  clean_display_name TEXT;
BEGIN
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'Operator_' || SUBSTRING(NEW.id::TEXT, 1, 6)
  );

  clean_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    default_username
  );

  -- Insert fresh profile (Level 1, 0 XP, 0 Gold, 0 Streak, Role player)
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    role,
    title,
    level,
    xp_current,
    xp_next_level,
    gold_balance,
    streak_days,
    streak_multiplier,
    last_active_date,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    default_username,
    clean_display_name,
    'player',
    'Novice',
    1,
    0,
    1000,
    0,
    0,
    1.00,
    CURRENT_DATE,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = NOW();

  -- Insert initial character attributes
  INSERT INTO public.character_attributes (
    profile_id,
    intellect,
    discipline,
    vitality,
    strength,
    creativity,
    today_intellect_delta,
    today_discipline_delta,
    today_vitality_delta,
    today_strength_delta,
    today_creativity_delta,
    updated_at
  ) VALUES (
    NEW.id,
    10,
    10,
    10,
    10,
    10,
    0,
    0,
    0,
    0,
    0,
    NOW()
  )
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Trigger on auth.users registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
