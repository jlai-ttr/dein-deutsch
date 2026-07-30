// app/api/admin/vocab/save/route.ts
// POST /api/admin/vocab/save — upsert a single vocab_master row by id.
// Body: VocabMasterRow (full or partial). If id exists in sheet, updates in place; else appends.

import { NextResponse } from 'next/server';
import { upsertVocabRow } from '../../../../lib/sheet-write';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { validateVocabRow, VocabMasterRow } from '../../../../lib/vocab-schema';
import { bustSheetCaches } from '../../../../lib/cache-bust';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = isAdminRequest(request);
  if (!auth.ok) return auth.response;

  let body: Partial<VocabMasterRow>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  }

  const errors = validateVocabRow(body);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: 'validation', details: errors }, { status: 400 });
  }

  try {
    const result = await upsertVocabRow(body as VocabMasterRow);
    const cache = bustSheetCaches();
    return NextResponse.json({ ok: true, ...result, id: body.id, cache });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
