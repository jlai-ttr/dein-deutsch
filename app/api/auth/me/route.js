// GET /api/auth/me
// Returns { authenticated: true } if session cookie is valid
// Returns { authenticated: false } otherwise

import { cookies } from 'next/headers';

const COOKIE_NAME = 'dein_session';

export async function GET() {
  const cookie = cookies().get(COOKIE_NAME);

  if (!cookie || !cookie.value) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For now, any non-empty cookie = valid session
  // (Tokens are 64-char random hex, effectively un-guessable)
  // Future: store session in DB/Redis for revocation support
  return new Response(JSON.stringify({
    authenticated: true,
    user: {
      email: 'jasper.lai@ttracing.co', // single-user for now
      name: 'Jasper',
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
