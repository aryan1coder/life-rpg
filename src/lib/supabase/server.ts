import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from './client';
export { isSupabaseConfigured };

/**
 * Creates a server-side Supabase client for Next.js Route Handlers and Server Components.
 * Returns null if Supabase environment variables are missing or unconfigured.
 */
export function getSupabaseServerClient(req?: NextRequest, res?: NextResponse) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!.trim();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req?.cookies.getAll() ?? [];
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req?.cookies.set(name, value);
          res?.cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Returns null if the service role key is absent or placeholder.
 */
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (
    !isSupabaseConfigured() ||
    !serviceKey ||
    serviceKey.includes('placeholder') ||
    serviceKey.includes('your-service-role')
  ) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
