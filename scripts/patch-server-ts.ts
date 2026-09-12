import fs from 'fs';

let content = fs.readFileSync('src/lib/supabase/server.ts', 'utf-8');

const getAuthenticatedSupabaseClientLogic = `
import { getAuthToken } from '../auth/session';

/**
 * Bypasses @supabase/ssr cookie limitations by explicitly injecting the extracted JWT.
 * Use this when @supabase/ssr fails to read chunked session cookies on Vercel.
 */
export function getAuthenticatedSupabaseClient(req: NextRequest) {
  if (!isSupabaseConfigured()) return null;
  
  const token = getAuthToken(req);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!.trim();

  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: token ? { Authorization: \`Bearer \${token}\` } : {},
    },
  });
}
`;

if (!content.includes('function getAuthenticatedSupabaseClient')) {
  content = content.replace("export { isSupabaseConfigured };", "export { isSupabaseConfigured };" + getAuthenticatedSupabaseClientLogic);
  fs.writeFileSync('src/lib/supabase/server.ts', content);
  console.log('Patched server.ts');
}
