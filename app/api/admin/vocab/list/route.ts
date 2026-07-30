// app/api/admin/vocab/list/route.ts
// GET /api/admin/vocab/list — list all vocab_master rows. Admin only.

import { NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { fetchVocabMaster, fetchWortDesTages } from '../../../../lib/sheet-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = isAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const [vocab, wort] = await Promise.all([fetchVocabMaster(), fetchWortDesTages()]);
    return NextResponse.json({
      ok: true,
      vocab,
      wortCount: wort.length,
      vocabCount: vocab.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
