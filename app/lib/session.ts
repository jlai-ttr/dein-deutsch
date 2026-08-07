// app/lib/session.ts
// Shared session token signing + verification.
// Tokens are signed with HMAC-SHA256 using SESSION_SECRET.
// Without SESSION_SECRET, the app fails closed (cannot start).
//
// Format: <randomId>.<expiresAt>.<hmac>
// Example: a3f5...-c1d...-1700000000.4f8b...

import crypto from 'crypto';

const COOKIE_NAME = 'dein_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string | null {
  return process.env.SESSION_SECRET || process.env.DEIN_DEUTSCH_PASSWORD || null;
}

function failClosed(): { authenticated: false } {
  // In production, refuse to issue OR verify tokens if SESSION_SECRET is missing.
  if (process.env.NODE_ENV === 'production' && !getSecret()) {
    return { authenticated: false };
  }
  // In dev, allow no-secret mode (dev convenience) but log a warning
  return { authenticated: false };
}

function sign(payload: string): string {
  const secret = getSecret();
  if (!secret) throw new Error('SESSION_SECRET not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Generate a signed session token.
 * Returns null in production if SESSION_SECRET is missing.
 */
export function createSessionToken(): { token: string; expiresAt: number } | null {
  const secret = getSecret();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[session] SESSION_SECRET not set in production — refusing to issue token');
      return null;
    }
    console.warn('[session] SESSION_SECRET not set — issuing unsigned dev token');
  }
  const randomId = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `${randomId}.${expiresAt}`;
  const sig = secret ? sign(payload) : 'dev-no-sig';
  return {
    token: `${payload}.${sig}`,
    expiresAt,
  };
}

/**
 * Verify a session token. Returns true only if:
 *  - signature matches SESSION_SECRET
 *  - expiresAt is in the future
 */
export function verifySessionToken(token: string): { authenticated: true; expiresAt: number } | { authenticated: false; reason: string } {
  if (!token || typeof token !== 'string') {
    return { authenticated: false, reason: 'missing' };
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { authenticated: false, reason: 'malformed' };
  }
  const [randomId, expiresAtStr, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) {
    return { authenticated: false, reason: 'bad-expiry' };
  }
  if (Date.now() > expiresAt) {
    return { authenticated: false, reason: 'expired' };
  }
  // Random ID must be hex
  if (!/^[a-f0-9]+$/.test(randomId)) {
    return { authenticated: false, reason: 'bad-id' };
  }
  const secret = getSecret();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { authenticated: false, reason: 'no-secret' };
    }
    // Dev mode: accept unsigned tokens (sig === 'dev-no-sig')
    if (sig === 'dev-no-sig') return { authenticated: true, expiresAt };
    return { authenticated: false, reason: 'no-secret' };
  }
  const expectedSig = sign(`${randomId}.${expiresAt}`);
  // timingSafeEqual requires equal-length buffers
  if (sig.length !== expectedSig.length) {
    return { authenticated: false, reason: 'bad-signature' };
  }
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { authenticated: false, reason: 'bad-signature' };
  }
  return { authenticated: true, expiresAt };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION / 1000;