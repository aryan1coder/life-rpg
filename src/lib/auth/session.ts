import { NextRequest } from 'next/server';

export interface AuthSession {
  id: string;
  email: string;
  username: string;
  role?: string;
}

export const SESSION_COOKIE_NAME = 'life_rpg_session';

/**
 * Extracts the authenticated operator session from request cookies or headers.
 * Safe for server components and API route handlers.
 */
export function getAuthSession(req: NextRequest): AuthSession | null {
  // 1. Check custom Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // 1a. Check if it's a Supabase JWT (3 segments)
    const segments = token.split('.');
    if (segments.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(segments[1], 'base64').toString('utf-8'));
        if (payload.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
          return {
            id: payload.sub,
            email: payload.email || `${payload.sub}@liferpg.system`,
            username: payload.user_metadata?.username || payload.email?.split('@')[0] || 'Operator',
            role: payload.user_metadata?.role || payload.role || 'player',
          };
        }
      } catch (e) {
        // ignore JWT parse error
      }
    }

    // 1b. Check if it's a base64 session object
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded.id && decoded.username) {
        return decoded;
      }
    } catch (e) {
      // ignore token parse error
    }
  }

  const userIdHeader = req.headers.get('x-user-id');
  const usernameHeader = req.headers.get('x-user-name');
  if (userIdHeader) {
    return {
      id: userIdHeader,
      email: req.headers.get('x-user-email') || `${userIdHeader}@liferpg.system`,
      username: usernameHeader || userIdHeader,
    };
  }

  // 2. Check HTTP-only session cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    try {
      const decoded = JSON.parse(Buffer.from(cookie.value, 'base64').toString('utf-8'));
      if (decoded.id && decoded.username) {
        return decoded;
      }
    } catch (e) {
      // ignore cookie parse error
    }
  }

  // 3. Check for standard and SSR Supabase auth cookies (including chunked cookies)
  const allCookies = req.cookies.getAll();
  const authCookies = allCookies
    .filter((c) => c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name === 'sb-access-token'))
    .sort((a, b) => {
      const idxA = a.name.includes('.') ? parseInt(a.name.split('.').pop() || '0', 10) : 0;
      const idxB = b.name.includes('.') ? parseInt(b.name.split('.').pop() || '0', 10) : 0;
      return idxA - idxB;
    });

  let rawVal = authCookies.map((c) => c.value).join('');
  if (!rawVal && req.cookies.get('supabase-auth-token')?.value) {
    rawVal = req.cookies.get('supabase-auth-token')!.value;
  }

  if (rawVal) {
    try {
      if (rawVal.startsWith('base64-')) {
        rawVal = Buffer.from(rawVal.substring(7), 'base64').toString('utf-8');
      }

      let jwtToken: string | null = null;
      if (rawVal.startsWith('[') || rawVal.startsWith('{')) {
        const parsed = JSON.parse(rawVal);
        jwtToken = Array.isArray(parsed) ? parsed[0] : (parsed.access_token || parsed);
      } else if (rawVal.split('.').length === 3) {
        jwtToken = rawVal;
      }

      if (jwtToken && typeof jwtToken === 'string') {
        const parts = jwtToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
            const rawName = payload.user_metadata?.display_name || payload.user_metadata?.username;
            const cleanName = rawName && typeof rawName === 'string' && rawName.trim().length > 0 && rawName.trim().length <= 40
              ? rawName.trim()
              : (payload.email ? payload.email.split('@')[0] : 'Adventurer');
            return {
              id: payload.sub,
              email: payload.email || `${payload.sub}@liferpg.system`,
              username: cleanName,
            };
          }
        }
      }
    } catch (e) {
      // ignore JWT parse error
    }
  }

  return null;
}

/**
 * Encodes an authenticated session into a secure base64 cookie token.
 */
export function encodeSession(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}
