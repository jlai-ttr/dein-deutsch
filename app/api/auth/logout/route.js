// POST /api/auth/logout
// Clears the session cookie

import { cookies } from 'next/headers';

const COOKIE_NAME = 'dein_session';

export async function POST() {
  cookies().delete(COOKIE_NAME);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
