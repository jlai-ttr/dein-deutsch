// app/api/admin/vocab/bulk/route.ts
// POST /api/admin/vocab/bulk — bulk insert rows from TSV payload.
// Body: { tsv: string } — first line is header matching VOCAB_MASTER_HEADERS,
// OR use the canonical schema columns directly.

import { NextResponse } from 'next/server';
import { bulkInsertVocab, parseTSV, nextId } from '../../../../lib/sheet-write';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { fetchVocabMaster } from '../../../../lib/sheet-client';
import { VOCAB_MASTER_HEADERS, VocabMasterRow } from '../../../../lib/vocab-schema';
import { bustSheetCaches } from '../../../../lib/cache-bust';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = isAdminRequest(request);
  if (!auth.ok) return auth.response;

  let body: { tsv?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 });
  }

  if (!body.tsv || body.tsv.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'tsv required' }, { status: 400 });
  }

  const { header, rows } = parseTSV(body.tsv);
  if (header.length === 0 || rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty TSV' }, { status: 400 });
  }

  // Auto-generate id for rows missing one
  const existing = await fetchVocabMaster();
  const existingIds = existing.map((r) => r.id);
  const processed: Partial<VocabMasterRow>[] = rows.map((r) => {
    const row: Record<string, string> = {};
    for (const h of VOCAB_MASTER_HEADERS) row[h] = r[h] ?? '';
    let id = (row.id || '').trim();
    if (!id) {
      const pos = (row.pos || 'noun').trim();
      id = nextId(existingIds, pos);
      existingIds.push(id);
    }
    return { ...row, id } as Partial<VocabMasterRow>;
  });

  try {
    const result = await bulkInsertVocab(processed);
    const cache = bustSheetCaches();
    return NextResponse.json({ ok: true, ...result, cache });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
