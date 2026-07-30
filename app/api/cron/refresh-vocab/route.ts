// app/api/cron/refresh-vocab/route.ts
// POST /api/cron/refresh-vocab — force-refresh the vocab cache
// Protected by CRON_SECRET env var header.

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { fetchVocabMaster, fetchWortDesTages } from '../../../lib/sheet-client';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '');
  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// GET variant for testing without secret
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST with Authorization: Bearer <CRON_SECRET> to force refresh',
  });
}
