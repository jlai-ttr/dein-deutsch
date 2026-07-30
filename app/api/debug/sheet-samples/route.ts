// app/api/debug/sheet-samples/route.ts
// GET /api/debug/sheet-samples — dump first 3 rows of each tab for schema inspection
// Temporary debug route — delete once vocab_master is wired.

import { NextResponse } from 'next/server';
import { dumpTabSamples } from '../../../lib/sheet-client';

export async function GET() {
  try {
    const samples = await dumpTabSamples(3);
    return NextResponse.json({
      ok: true,
      sheetId: process.env.GOOGLE_SHEET_ID,
      tabCount: Object.keys(samples).length,
      samples,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}