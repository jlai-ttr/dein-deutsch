// Middleware: protect all routes with session cookie
// Allow /login (the entry point) + /api/auth/* (login/logout endpoints)

import { NextResponse } from 'next/server';

const COOKIE_NAME = 'dein_session';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow auth API endpoints (otherwise login would be impossible)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Allow public read endpoints (in-app data fetches, no session needed)
  if (pathname === '/api/vocab' || pathname === '/api/wort-des-tages') {
    return NextResponse.next();
  }

  // Allow GET requests on debug endpoints (diagnostic tools, no session needed)
  if (pathname.startsWith('/api/debug/') && request.method === 'GET') {
    return NextResponse.next();
  }

  // Allow admin endpoints with Bearer token (CRON_SECRET) — they self-authenticate
  if (pathname.startsWith('/api/admin/')) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return NextResponse.next();
    }
  }

  // Allow cron endpoints with Bearer token (CRON_SECRET or VERCEL_CRON_SECRET)
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return NextResponse.next();
    }
  }

  // Check session cookie
  const cookie = request.cookies.get(COOKIE_NAME);

  if (!cookie || !cookie.value) {
    // No session — redirect to login (for HTML pages) or 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { ok: false, error: 'unauthenticated' },
        { status: 401 }
      );
    }
    // Redirect HTML pages to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|audio).*)'],
};
