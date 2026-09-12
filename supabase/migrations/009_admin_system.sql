-- LIFE RPG PRODUCTION SCHEMA
-- Migration: 009_admin_system.sql
-- Purpose: Admin audit trail and system configuration settings.
-- Restricted exclusively to authenticated administrators.

-- 1. ADMIN AUDIT LOGS (Immutable audit trail of all privileged mutations)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SYSTEM SETTINGS (Global game flags, maintenance state, economy rate parameters)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- ROW LEVEL SECURITY
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Audit Logs: Strictly admin readable and insertable
DROP POLICY IF EXISTS "Allow admin read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Allow admin read audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Allow admin insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- System Settings: Authenticated operators can read public config; Admins manage all
DROP POLICY IF EXISTS "Allow read system settings" ON public.system_settings;
CREATE POLICY "Allow read system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow admin manage system settings" ON public.system_settings;
CREATE POLICY "Allow admin manage system settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
