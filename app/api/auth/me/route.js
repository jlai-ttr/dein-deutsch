// GET /api/auth/me
// Returns { authenticated: true } only if the session cookie is a valid
// signed token (HMAC-SHA256 with SESSION_SECRET) and not expired.
// Returns { authenticated: false } otherwise — including any unsigned,
// malformed, or expired tokens.

import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/app/lib/session';

export async function GET() {
  const cookie = cookies().get(SESSION_COOKIE_NAME);

  if (!cookie || !cookie.value) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = verifySessionToken(cookie.value);
  if (!result.authenticated) {
    // Clear the invalid cookie so the client doesn't keep sending it
    cookies().delete(SESSION_COOKIE_NAME);
    return new Response(JSON.stringify({ authenticated: false, reason: result.reason }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    authenticated: true,
    expiresAt: result.expiresAt,
    user: {
      email: 'jasper.lai@ttracing.co', // single-user for now
      name: 'Jasper',
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}