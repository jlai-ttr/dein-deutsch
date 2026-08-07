// POST /api/auth/logout
// Clears the session cookie

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/app/lib/session';

export async function POST() {
  cookies().delete(SESSION_COOKIE_NAME);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}