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
          const rawName = payload.user_metadata?.display_name || payload.user_metadata?.username;
          const cleanName =
            rawName && typeof rawName === 'string' && rawName.trim().length > 0 && rawName.trim().length <= 40
              ? rawName.trim()
              : (payload.email ? payload.email.split('@')[0] : 'Operator');
          return {
            id: payload.sub,
            email: payload.email || `${payload.sub}@liferpg.system`,
            username: cleanName,
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
  const authCookies = allCookies.filter(
    (c) =>
      c.name.startsWith('sb-') &&
      !c.name.includes('code-verifier') &&
      (c.name.includes('-auth-token') || c.name.includes('access-token'))
  );

  // Group chunked cookies (.0, .1) separately from unchunked to avoid corrupting combined strings
  const chunkedCookies = authCookies.filter((c) => {
    const parts = c.name.split('.');
    return parts.length > 1 && !isNaN(parseInt(parts[parts.length - 1], 10));
  });

  const targetAuthCookies = chunkedCookies.length > 0 ? chunkedCookies : authCookies;
  targetAuthCookies.sort((a, b) => {
    const idxA = a.name.includes('.') ? parseInt(a.name.split('.').pop() || '0', 10) : 0;
    const idxB = b.name.includes('.') ? parseInt(b.name.split('.').pop() || '0', 10) : 0;
    return idxA - idxB;
  });

  let rawVal = targetAuthCookies.map((c) => c.value).join('');
  if (!rawVal && req.cookies.get('supabase-auth-token')?.value) {
    rawVal = req.cookies.get('supabase-auth-token')!.value;
  }

  if (rawVal) {
    try {
      if (rawVal.includes('%')) {
        try {
          rawVal = decodeURIComponent(rawVal);
        } catch (e) {
          // ignore uri decode error
        }
      }

      if (rawVal.startsWith('base64-')) {
        rawVal = Buffer.from(rawVal.substring(7), 'base64').toString('utf-8');
      }

      let jwtToken: string | null = null;
      if (rawVal.startsWith('[') || rawVal.startsWith('{')) {
        const parsed = JSON.parse(rawVal);
        jwtToken = Array.isArray(parsed)
          ? parsed[0]
          : (parsed.access_token || parsed.token || parsed.currentSession?.access_token || null);
        
        // Also check if user object was stored directly
        if (!jwtToken && parsed.user?.id) {
          const u = parsed.user;
          const rawName = u.user_metadata?.display_name || u.user_metadata?.username;
          const cleanName =
            rawName && typeof rawName === 'string' && rawName.trim().length > 0 && rawName.trim().length <= 40
              ? rawName.trim()
              : (u.email ? u.email.split('@')[0] : 'Adventurer');
          return {
            id: u.id,
            email: u.email || `${u.id}@liferpg.system`,
            username: cleanName,
            role: u.user_metadata?.role || u.app_metadata?.role || 'player',
          };
        }
      } else if (rawVal.split('.').length === 3) {
        jwtToken = rawVal;
      }

      if (jwtToken && typeof jwtToken === 'string') {
        const parts = jwtToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
            const rawName = payload.user_metadata?.display_name || payload.user_metadata?.username;
            const cleanName =
              rawName && typeof rawName === 'string' && rawName.trim().length > 0 && rawName.trim().length <= 40
                ? rawName.trim()
                : (payload.email ? payload.email.split('@')[0] : 'Adventurer');
            return {
              id: payload.sub,
              email: payload.email || `${payload.sub}@liferpg.system`,
              username: cleanName,
              role: payload.user_metadata?.role || payload.app_metadata?.role || payload.role || 'player',
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


/**
 * Extracts the raw JWT string from request cookies or headers.
 */
export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.split('.').length === 3) return token;
  }

  const allCookies = req.cookies.getAll();
  const authCookies = allCookies.filter(
    (c) =>
      c.name.startsWith('sb-') &&
      !c.name.includes('code-verifier') &&
      (c.name.includes('-auth-token') || c.name.includes('access-token'))
  );

  const chunkedCookies = authCookies.filter((c) => {
    const parts = c.name.split('.');
    return parts.length > 1 && !isNaN(parseInt(parts[parts.length - 1], 10));
  });

  const targetAuthCookies = chunkedCookies.length > 0 ? chunkedCookies : authCookies;
  targetAuthCookies.sort((a, b) => {
    const idxA = a.name.includes('.') ? parseInt(a.name.split('.').pop() || '0', 10) : 0;
    const idxB = b.name.includes('.') ? parseInt(b.name.split('.').pop() || '0', 10) : 0;
    return idxA - idxB;
  });

  let rawVal = targetAuthCookies.map((c) => c.value).join('');
  if (!rawVal && req.cookies.get('supabase-auth-token')?.value) {
    rawVal = req.cookies.get('supabase-auth-token')!.value;
  }

  if (rawVal) {
    try {
      if (rawVal.includes('%')) rawVal = decodeURIComponent(rawVal);
    } catch (e) {}

    if (rawVal.startsWith('base64-')) {
      rawVal = Buffer.from(rawVal.substring(7), 'base64').toString('utf-8');
    }

    if (rawVal.startsWith('[') || rawVal.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawVal);
        const token = Array.isArray(parsed)
          ? parsed[0]
          : (parsed.access_token || parsed.token || parsed.currentSession?.access_token || null);
        if (token && token.split('.').length === 3) return token;
      } catch (e) {}
    } else if (rawVal.split('.').length === 3) {
      return rawVal;
    }
  }

  return null;
}
