import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const allCookies = request.cookies.getAll();
  const hasSbCookie = allCookies.some(
    (c) =>
      c.name.startsWith('sb-') &&
      (c.name.includes('-auth-token') || c.name === 'sb-access-token')
  ) || Boolean(request.cookies.get('supabase-auth-token')?.value);
  const isAuthenticated = Boolean(sessionCookie || hasSbCookie);

  const protectedRoutes = ['/home', '/quests', '/character', '/rewards', '/inventory', '/achievements'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

  // 1. Guard protected screens
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already authenticated operators away from login/signup
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/quests/:path*',
    '/character/:path*',
    '/rewards/:path*',
    '/inventory/:path*',
    '/achievements/:path*',
    '/auth/:path*',
  ],
};
