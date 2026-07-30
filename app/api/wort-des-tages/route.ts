// app/api/wort-des-tages/route.ts
// GET /api/wort-des-tages — returns today's word of the day
// Cache invalidated at midnight MYT.

import { NextResponse } from 'next/server';
import { fetchWortDesTages, pickTodaysWord } from '../../lib/sheet-client';

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  try {
    const rows = await fetchWortDesTages();
    const word = pickTodaysWord(rows);
    if (!word) {
      return NextResponse.json({ ok: false, error: 'No active words' }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      word,
      dayOfYear: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000),
      totalWords: rows.length,
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
