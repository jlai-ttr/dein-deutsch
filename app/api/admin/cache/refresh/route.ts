// app/api/admin/cache/refresh/route.ts
// POST /api/admin/cache/refresh — force-refresh the Sheet-backed vocab cache
// Accepts Authorization header from:
//   - User CRON_SECRET (manual POST or external cron)
//   - Vercel's VERCEL_CRON_SECRET (automatic cron from vercel.json)
// MOVED from /api/cron/refresh-vocab on 2026-07-30 — the /api/cron/* middleware
// allowlist wasn't deploying, so the route lives under /api/admin/* instead.

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { fetchVocabMaster, fetchWortDesTages } from '../../../../lib/sheet-client';

const USER_SECRET = process.env.CRON_SECRET;
const VERCEL_SECRET = process.env.VERCEL_CRON_SECRET;

function isAuthorized(provided: string | null): boolean {
  if (!provided) return false;
  if (USER_SECRET && provided === USER_SECRET) return true;
  if (VERCEL_SECRET && provided === VERCEL_SECRET) return true;
  return false;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '') ?? null;
  if (!isAuthorized(providedSecret)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [vocab, wort] = await Promise.all([
      fetchVocabMaster(),
      fetchWortDesTages(),
    ]);
    revalidatePath('/api/vocab');
    revalidatePath('/api/wort-des-tages');
    return NextResponse.json({
      ok: true,
      vocabCount: vocab.length,
      wortCount: wort.length,
      refreshedAt: new Date().toISOString(),
      triggeredBy: providedSecret === USER_SECRET ? 'user' : providedSecret === VERCEL_SECRET ? 'vercel-cron' : 'unknown',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '') ?? null;
  if (!isAuthorized(providedSecret)) {
    return NextResponse.json({
      ok: true,
      hint: 'POST with Authorization: Bearer <CRON_SECRET> to force refresh',
      vercelCronConfigured: !!VERCEL_SECRET,
      schedule: 'every 6 hours (vercel.json)',
    });
  }
  try {
    const [vocab, wort] = await Promise.all([
      fetchVocabMaster(),
      fetchWortDesTages(),
    ]);
    revalidatePath('/api/vocab');
    revalidatePath('/api/wort-des-tages');
    return NextResponse.json({
      ok: true,
      vocabCount: vocab.length,
      wortCount: wort.length,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
