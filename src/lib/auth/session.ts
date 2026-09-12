import { NextRequest } from 'next/server';

export interface AuthSession {
  id: string;
  email: string;
  username: string;
}

export const SESSION_COOKIE_NAME = 'life_rpg_session';

/**
 * Extracts the authenticated operator session from request cookies or headers.
 * Safe for server components and API route handlers.
 */
export function getAuthSession(req: NextRequest): AuthSession | null {
  // 1. Check custom Authorization or X-User-Id header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
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

  // 3. Check for standard Supabase auth token cookies
  const sbToken = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token');
  if (sbToken?.value) {
    try {
      const parts = sbToken.value.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.sub) {
          return {
            id: payload.sub,
            email: payload.email || `${payload.sub}@liferpg.system`,
            username: payload.user_metadata?.username || 'Operator',
          };
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
