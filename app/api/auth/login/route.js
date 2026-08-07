// POST /api/auth/login
// Body: { password: "..." }
// Verifies against DEIN_DEUTSCH_PASSWORD env var. Refuses to issue tokens
// in production if DEIN_DEUTSCH_PASSWORD is unset (fail-closed).
// Sets HttpOnly cookie session, valid 30 days.

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/app/lib/session';

// Constant-time string comparison to prevent timing attacks
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fail-closed: in production, require DEIN_DEUTSCH_PASSWORD to be set
    const validPassword = process.env.DEIN_DEUTSCH_PASSWORD;
    if (!validPassword) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[auth/login] DEIN_DEUTSCH_PASSWORD not set in production — refusing login');
        return new Response(JSON.stringify({ ok: false, error: 'auth misconfigured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Dev convenience: fall back to a clear dev default with warning
      console.warn('[auth/login] DEIN_DEUTSCH_PASSWORD not set — using dev fallback "dein-deutsch"');
      const devDefault = 'dein-deutsch';
      if (!safeCompare(password, devDefault)) {
        await new Promise(r => setTimeout(r, 500));
        return new Response(JSON.stringify({ ok: false, error: 'wrong password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      if (!safeCompare(password, validPassword)) {
        await new Promise(r => setTimeout(r, 500));
        return new Response(JSON.stringify({ ok: false, error: 'wrong password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Issue signed session token
    const issued = createSessionToken();
    if (!issued) {
      return new Response(JSON.stringify({ ok: false, error: 'session signing misconfigured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { token, expiresAt } = issued;

    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return new Response(JSON.stringify({
      ok: true,
      expiresAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}