// app/api/debug/noun-matrix/route.ts
// GET /api/debug/noun-matrix — read the raw "German Vocabulary - Nouns (Die Nomen)" tab in full
// Query params:
//   ?tab=<name>            (default: "German Vocabulary - Nouns (Die Nomen)")
//   ?rows=<int>            (optional: limit to first N rows of data)
//   ?onlySourceColumns=true (optional: return only the raw 6-column row arrays; false = structured objects)
//
// Temporary debug route — un-authenticated like sibling /api/debug/* routes.
// Delete once verb/adjective wiring is sorted.

import { NextResponse } from 'next/server';
import { getSheetsClient } from '../../../lib/sheet-client';

const DEFAULT_TAB = 'German Vocabulary - Nouns (Die Nomen)';

// (path note: file lives at app/api/debug/noun-matrix/route.ts; sibling
// app/api/debug/sheet-samples/route.ts uses the same `../../../lib/sheet-client`
// import — three levels up reaches app/, then descend into lib/.)

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tabName = url.searchParams.get('tab') || DEFAULT_TAB;
  const rowsParam = url.searchParams.get('rows');
  const onlySourceColumns = url.searchParams.get('onlySourceColumns') === 'true';

  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      return NextResponse.json({ ok: false, error: 'GOOGLE_SHEET_ID not set' }, { status: 500 });
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!A1:Z500`,
    });

    const allRows = (res.data.values || []) as string[][];
    if (allRows.length === 0) {
      return NextResponse.json({
        ok: true,
        tab: tabName,
        header: [],
        rowCount: 0,
        totalRowCount: 0,
        stats: { headerCount: 0, dataCount: 0, genderCounts: { der: 0, die: 0, das: 0, other: 0, empty: 0 } },
        rows: [],
      });
    }

    const header = allRows[0];
    const dataRows = allRows.slice(1).filter(r => r && r.some(cell => (cell || '').trim() !== ''));

    let returnedRows = dataRows;
    if (rowsParam && /^\d+$/.test(rowsParam)) {
      const n = parseInt(rowsParam, 10);
      returnedRows = dataRows.slice(0, n);
    }

    let structured: Array<Record<string, string>> | null = null;
    if (!onlySourceColumns) {
      structured = returnedRows.map(r => {
        const obj: Record<string, string> = {};
        for (let i = 0; i < header.length; i++) obj[header[i] || `col${i}`] = r[i] ?? '';
        return obj;
      });
    }

    // Stats
    const genderCounts = { der: 0, die: 0, das: 0, other: 0, empty: 0 };
    returnedRows.forEach(r => {
      const a = (r[0] || '').trim().toLowerCase();
      if (a === 'der') genderCounts.der++;
      else if (a === 'die') genderCounts.die++;
      else if (a === 'das') genderCounts.das++;
      else if (a === '') genderCounts.empty++;
      else genderCounts.other++;
    });

    return NextResponse.json({
      ok: true,
      tab: tabName,
      header,
      headerCount: header.length,
      totalRowCount: dataRows.length,
      rowCount: returnedRows.length,
      stats: {
        headerCount: header.length,
        dataCount: dataRows.length,
        headerCols: header,
        genderCounts,
      },
      rows: onlySourceColumns ? returnedRows : structured,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message, tab: tabName }, { status: 500 });
  }
}
