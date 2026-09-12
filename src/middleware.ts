import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Compatibility redirect: /home always redirects to /lobby
  if (pathname === '/home' || pathname.startsWith('/home/')) {
    return NextResponse.redirect(new URL('/lobby', request.url));
  }

  const session = getAuthSession(request);
  const isAuthenticated = Boolean(session);

  const protectedRoutes = ['/lobby', '/quests', '/character', '/rewards', '/inventory', '/achievements', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

  // 2. Guard protected screens: unauthenticated operators redirect ONCE to /auth/login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect authenticated operators away from login/signup to /lobby
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/lobby', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/lobby/:path*',
    '/home/:path*',
    '/quests/:path*',
    '/character/:path*',
    '/rewards/:path*',
    '/inventory/:path*',
    '/achievements/:path*',
    '/auth/:path*',
    '/admin/:path*',
  ],
};
