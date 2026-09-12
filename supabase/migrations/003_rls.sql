-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 003_rls.sql
-- Purpose: Row Level Security for core profiles and attributes.
-- Enforces strict multi-user tenant isolation and admin access.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_attributes ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile without escalating role; Admins can update any profile
DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
CREATE POLICY "Allow users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (public.is_admin() OR (auth.uid() = id AND role = 'player'));

-- Allow auth triggers (service role) and authenticated signup to insert profiles
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- CHARACTER ATTRIBUTES POLICIES
DROP POLICY IF EXISTS "Allow users read own attributes" ON public.character_attributes;
CREATE POLICY "Allow users read own attributes"
  ON public.character_attributes FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow users update own attributes" ON public.character_attributes;
CREATE POLICY "Allow users update own attributes"
  ON public.character_attributes FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin())
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow insert attributes" ON public.character_attributes;
CREATE POLICY "Allow insert attributes"
  ON public.character_attributes FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());
