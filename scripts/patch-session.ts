import fs from 'fs';

let content = fs.readFileSync('src/lib/auth/session.ts', 'utf-8');

const getAuthTokenLogic = `
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
`;

if (!content.includes('function getAuthToken')) {
  content = content + '\n' + getAuthTokenLogic;
  fs.writeFileSync('src/lib/auth/session.ts', content);
  console.log('Patched session.ts');
}
