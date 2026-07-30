// app/lib/admin-auth.ts
// Admin auth check — accepts EITHER Bearer CRON_SECRET OR a valid session cookie.
// Used by all /api/admin/* POST/PUT/DELETE endpoints.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'dein_session';
const CRON_SECRET = process.env.CRON_SECRET;

export function isAdminRequest(request: Request): { ok: true; via: 'bearer' | 'session' } | { ok: false; response: NextResponse } {
  // Option 1: Bearer CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (CRON_SECRET && token === CRON_SECRET) {
      return { ok: true, via: 'bearer' };
    }
  }
  // Option 2: Valid session cookie (logged-in user)
  const cookie = cookies().get(COOKIE_NAME);
  if (cookie && cookie.value) {
    return { ok: true, via: 'session' };
  }
  return {
    ok: false,
    response: NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 }),
  };
}
