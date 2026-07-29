// POST /api/auth/login
// Body: { password: "..." }
// Verifies against DEIN_DEUTSCH_PASSWORD env var (or default "dein-deutsch")
// Sets HttpOnly cookie session, valid 30 days

import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'dein_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Generate a random session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Constant-time string comparison to prevent timing attacks
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
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

    // Get password from env var, or use a sensible default
    // (User can override in Vercel dashboard)
    const validPassword = process.env.DEIN_DEUTSCH_PASSWORD || 'dein-deutsch';

    if (!safeCompare(password, validPassword)) {
      // Add small delay to slow brute-force attacks
      await new Promise(r => setTimeout(r, 500));
      return new Response(JSON.stringify({ ok: false, error: 'wrong password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate session token
    const token = generateToken();
    const expiresAt = Date.now() + SESSION_DURATION;

    // Store session in cookie
    cookies().set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION / 1000,
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
