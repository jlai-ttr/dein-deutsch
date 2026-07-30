// app/lib/sheet-write.ts
// Google Sheets WRITE client — complements sheet-client.ts.
// Used by admin endpoints to upsert / insert / delete rows in vocab_master and wort_des_tages.

import { getSheetsClient } from './sheet-client';
import {
  VocabMasterRow,
  WortDesTagesRow,
  VOCAB_MASTER_HEADERS,
  WORT_DES_TAGES_HEADERS,
} from './vocab-schema';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const TAB = 'vocab_master';
const WORT_TAB = 'wort_des_tages';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function vocabRowToArray(row: VocabMasterRow): string[] {
  return VOCAB_MASTER_HEADERS.map((h) => ((row as unknown) as Record<string, unknown>)[h]?.toString() ?? '');
}

function wortRowToArray(row: WortDesTagesRow): string[] {
  return WORT_DES_TAGES_HEADERS.map((h) => ((row as unknown) as Record<string, unknown>)[h]?.toString() ?? '');
}

// Get the row index (1-based, sheet row number) of an id. Returns null if not found.
async function findRowIndexById(id: string): Promise<number | null> {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set');
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A:A`,
  });
  const ids = (res.data.values || []) as string[][];
  for (let i = 0; i < ids.length; i++) {
    if ((ids[i][0] || '').trim() === id) return i + 1; // sheet rows are 1-indexed
  }
  return null;
}

// Get next sequential id for a given pos: e.g. ('noun', 5) → 'noun-0005'
export function nextId(existingIds: string[], pos: string): string {
  const prefix = `${pos}-`;
  const nums = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length === 0 ? 1 : Math.max(...nums) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

// Upsert by id — updates existing row if id found, appends if new.
export async function upsertVocabRow(row: VocabMasterRow): Promise<{ action: 'updated' | 'inserted'; rowNumber: number }> {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set');
  const sheets = getSheetsClient();
  const updated: VocabMasterRow = { ...row, updated_at: todayISO() };
  const rowNum = await findRowIndexById(updated.id);
  const values = [vocabRowToArray(updated)];
  if (rowNum) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A${rowNum}:AC${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    return { action: 'updated', rowNumber: rowNum };
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A:AC`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    return { action: 'inserted', rowNumber: -1 };
  }
}

export async function deleteVocabRow(id: string): Promise<{ deleted: boolean; rowNumber: number | null }> {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set');
  const sheets = getSheetsClient();
  const rowNum = await findRowIndexById(id);
  if (!rowNum) return { deleted: false, rowNumber: null };

  // Get the sheet id for vocab_master
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'sheets.properties' });
  const sheet = (meta.data.sheets || []).find((s) => s.properties?.title === TAB);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId == null) throw new Error(`tab ${TAB} not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum },
          },
        },
      ],
    },
  });
  return { deleted: true, rowNumber: rowNum };
}

// Bulk insert — used by paste-TSV. Inserts all rows after the existing data.
// rows: array of partial VocabMasterRow (id required; other fields optional, will fill defaults).
export async function bulkInsertVocab(rows: Partial<VocabMasterRow>[]): Promise<{ inserted: number; firstRow: number }> {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set');
  if (rows.length === 0) return { inserted: 0, firstRow: 0 };
  const sheets = getSheetsClient();

  const fullRows: string[][] = rows.map((r) => {
    const merged: VocabMasterRow = {
      id: r.id || '',
      level: (r.level as VocabMasterRow['level']) || 'A1',
      topic: r.topic || 'starter',
      is_active: r.is_active || 'TRUE',
      de: r.de || '',
      pos: (r.pos as VocabMasterRow['pos']) || 'noun',
      en: r.en || '',
      pronunciation: r.pronunciation || '',
      ipa: r.ipa || '',
      gender: r.gender,
      plural: r.plural,
      genitive: r.genitive,
      separable: r.separable,
      prefix: r.prefix,
      verb_aux: r.verb_aux,
      verb_praeteritum: r.verb_praeteritum,
      verb_partizip_ii: r.verb_partizip_ii,
      conjugation_ich: r.conjugation_ich,
      conjugation_du: r.conjugation_du,
      conjugation_er: r.conjugation_er,
      conjugation_wir: r.conjugation_wir,
      conjugation_ihr: r.conjugation_ihr,
      conjugation_sie: r.conjugation_sie,
      comparative: r.comparative,
      superlative: r.superlative,
      example_de: r.example_de,
      example_en: r.example_en,
      notes: r.notes,
      updated_at: todayISO(),
    };
    return vocabRowToArray(merged);
  });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A:AC`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: fullRows },
  });
  // Find first row written
  const updatedRange = res.data.updates?.updatedRange || '';
  const m = updatedRange.match(/A(\d+):/);
  const firstRow = m ? parseInt(m[1], 10) : -1;
  return { inserted: fullRows.length, firstRow };
}

// Bulk seed wort_des_tages — picks N random rows from vocab_master and inserts them.
// Each wort row gets a sequential sort_index.
export async function seedWortDesTages(count: number, sourceVocab: VocabMasterRow[]): Promise<{ inserted: number; startIndex: number }> {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID not set');
  if (sourceVocab.length === 0) return { inserted: 0, startIndex: 0 };

  const sheets = getSheetsClient();
  // Get current max sort_index from wort_des_tages
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${WORT_TAB}!Y:Y`, // sort_index column
  });
  const existing = (res.data.values || []) as string[][];
  const maxIdx = existing.reduce((max, row) => {
    const n = parseInt(row[0] || '0', 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, -1);

  // Shuffle and pick N
  const shuffled = [...sourceVocab].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, count);

  const rows: string[][] = picks.map((v, i) => {
    const idx = maxIdx + 1 + i;
    const wort: WortDesTagesRow = {
      word: v.de,
      category: v.pos,
      gender: v.gender,
      plural: v.plural,
      genitive: v.genitive,
      pronunciation: v.pronunciation,
      ipa: v.ipa,
      meaning: v.en,
      meaning_en: v.en,
      example: v.example_de || '',
      example_en: v.example_en || '',
      separable: v.separable,
      prefix: v.prefix,
      verb_aux: v.verb_aux,
      verb_praeteritum: v.verb_praeteritum,
      verb_partizip_ii: v.verb_partizip_ii,
      conjugation_ich: v.conjugation_ich,
      conjugation_du: v.conjugation_du,
      conjugation_er: v.conjugation_er,
      conjugation_wir: v.conjugation_wir,
      conjugation_ihr: v.conjugation_ihr,
      conjugation_sie: v.conjugation_sie,
      comparative: v.comparative,
      superlative: v.superlative,
      sort_index: idx,
      is_active: 'TRUE',
      updated_at: todayISO(),
    };
    return wortRowToArray(wort);
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${WORT_TAB}!A:AA`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
  return { inserted: rows.length, startIndex: maxIdx + 1 };
}

// Parse TSV string into rows. Tabs = column separator. First row = header.
// Returns { header: string[], rows: Record<string, string>[] }
export function parseTSV(tsv: string): { header: string[]; rows: Record<string, string>[] } {
  const lines = tsv.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split('\t').map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t');
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = (cells[j] || '').trim();
    }
    rows.push(obj);
  }
  return { header, rows };
}

// Serialize rows back to TSV (for export)
export function rowsToTSV(header: string[], rows: Record<string, unknown>[]): string {
  const lines = [header.join('\t')];
  for (const row of rows) {
    const cells = header.map((h) => (row[h] ?? '').toString());
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}
