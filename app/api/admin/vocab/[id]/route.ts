// app/api/admin/vocab/[id]/route.ts
// DELETE /api/admin/vocab/[id] — delete a vocab_master row by id.

import { NextResponse } from 'next/server';
import { deleteVocabRow } from '../../../../lib/sheet-write';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { bustSheetCaches } from '../../../../lib/cache-bust';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = isAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await deleteVocabRow(params.id);
    const cache = bustSheetCaches();
    return NextResponse.json({ ok: true, ...result, id: params.id, cache });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
