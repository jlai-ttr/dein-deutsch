// app/lib/admin-auth.ts
// Admin auth check — accepts EITHER Bearer CRON_SECRET OR a valid signed session cookie.
// In production, CRON_SECRET must be set in env vars (no fallback).
//
// Used by all /api/admin/* POST/PUT/DELETE endpoints.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './session';

const COOKIE_NAME = SESSION_COOKIE_NAME;

export function isAdminRequest(request: Request): { ok: true; via: 'bearer' | 'session' } | { ok: false; response: NextResponse } {
  // Option 1: Bearer CRON_SECRET (must be set in env, no fallback in prod)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      if (process.env.NODE_ENV === 'production') {
        return {
          ok: false,
          response: NextResponse.json({ ok: false, error: 'auth misconfigured' }, { status: 503 }),
        };
      }
      // Dev convenience: refuse any bearer attempt if CRON_SECRET is unset in dev too
      // (so devs are forced to set it in .env.local)
      return {
        ok: false,
        response: NextResponse.json({ ok: false, error: 'CRON_SECRET not set' }, { status: 503 }),
      };
    }
    if (token === cronSecret) {
      return { ok: true, via: 'bearer' };
    }
  }
  // Option 2: Valid signed session cookie (logged-in user)
  const cookie = cookies().get(COOKIE_NAME);
  if (cookie && cookie.value) {
    const verification = verifySessionToken(cookie.value);
    if (verification.authenticated) {
      return { ok: true, via: 'session' };
    }
    // Invalid signature — clear the bad cookie
    cookies().delete(COOKIE_NAME);
  }
  return {
    ok: false,
    response: NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 }),
  };
}