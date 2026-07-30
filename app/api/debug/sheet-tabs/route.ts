// app/api/debug/sheet-tabs/route.ts
// GET /api/debug/sheet-tabs — diagnostic: list all tabs in the Sheet
// Temporary debug route, can be deleted after Sheet structure is confirmed.

import { NextResponse } from 'next/server';
import { listTabs } from '../../../lib/sheet-client';

export async function GET() {
  try {
    const tabs = await listTabs();
    return NextResponse.json({
      ok: true,
      sheetId: process.env.GOOGLE_SHEET_ID,
      hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      tabCount: tabs.length,
      tabs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
