// app/api/vocab/route.ts
// GET /api/vocab — returns all active vocab from the Sheet
// Cached at edge for 1 hour. Refresh via /api/cron/refresh-vocab.

import { NextResponse } from 'next/server';
import { fetchVocabMaster } from '../../lib/sheet-client';

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  try {
    const rows = await fetchVocabMaster();
    return NextResponse.json({
      ok: true,
      count: rows.length,
      vocab: rows,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
