import { createBrowserClient } from '@supabase/ssr';

/**
 * Validates whether Supabase environment variables have been provided
 * with actual project credentials (not placeholders or empty strings).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();

  if (!url || !anonKey) return false;
  if (url.includes('placeholder') || url.includes('your-project')) return false;
  if (anonKey.includes('placeholder') || anonKey.includes('your-anon-key')) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Creates a browser-side Supabase client if credentials are configured.
 * Returns null if Supabase is unconfigured, preventing bogus network requests.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!.trim();

  return createBrowserClient(url, anonKey);
}
