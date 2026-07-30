// app/api/admin/wort-des-tages/bulk-seed/route.ts
// POST /api/admin/wort-des-tages/bulk-seed — seed N random vocab rows into wort_des_tages.
// Body: { count?: number } (default 30). Idempotent: appends to existing seed.

import { NextResponse } from 'next/server';
import { seedWortDesTages } from '../../../../lib/sheet-write';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { fetchVocabMaster } from '../../../../lib/sheet-client';
import { bustSheetCaches } from '../../../../lib/cache-bust';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = isAdminRequest(request);
  if (!auth.ok) return auth.response;

  let count = 30;
  try {
    const body = (await request.json().catch(() => ({}))) as { count?: number };
    if (typeof body.count === 'number' && body.count > 0 && body.count <= 365) count = Math.floor(body.count);
  } catch {
    /* default count */
  }

  try {
    const vocab = await fetchVocabMaster();
    const result = await seedWortDesTages(count, vocab);
    const cache = bustSheetCaches();
    return NextResponse.json({ ok: true, ...result, requested: count, cache });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
