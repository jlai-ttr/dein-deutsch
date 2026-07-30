// app/lib/sheet-client.ts
// Google Sheets API client — service account auth
// Reads vocab_master and wort_des_tages tabs from a single Sheet.

import { google, sheets_v4 } from 'googleapis';
import { VocabMasterRow, WortDesTagesRow, VOCAB_MASTER_HEADERS, WORT_DES_TAGES_HEADERS } from './vocab-schema';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!SHEET_ID) {
  // eslint-disable-next-line no-console
  console.warn('[sheet-client] GOOGLE_SHEET_ID missing — sheet reads will fail');
}
if (!SERVICE_ACCOUNT_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[sheet-client] GOOGLE_SERVICE_ACCOUNT_KEY missing — sheet reads will fail');
}

function parseKey(): { client_email: string; private_key: string } {
  if (!SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var not set');
  }
  // The env var may be either raw JSON or a JSON-string with escaped newlines.
  // Handle both: if raw, parse as JSON; if contains literal "\n", replace with real newlines.
  const raw = SERVICE_ACCOUNT_KEY.trim();
  const parsed = JSON.parse(raw) as { client_email: string; private_key: string };
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

let cachedClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;
  const { client_email, private_key } = parseKey();
  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  cachedClient = google.sheets({ version: 'v4', auth });
  return cachedClient;
}

type RawRow = string[];

function rowToObject(headers: string[], row: RawRow): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const val = row[i] ?? '';
    // Coerce booleans and numbers if asked
    obj[key] = val;
  }
  return obj;
}

function validateVocabMasterRow(obj: Record<string, string>): VocabMasterRow | null {
  if (!obj.id || !obj.level || !obj.de || !obj.pos) return null;
  if (obj.is_active && obj.is_active.toUpperCase() === 'FALSE') return null;
  return obj as unknown as VocabMasterRow;
}

function validateWortDesTagesRow(obj: Record<string, string>, sortIndex: number): WortDesTagesRow | null {
  if (!obj.word) return null;
  if (obj.is_active && obj.is_active.toUpperCase() === 'FALSE') return null;
  return {
    ...obj,
    sort_index: obj.sort_index || String(sortIndex),
  } as unknown as WortDesTagesRow;
}

export async function fetchVocabMaster(): Promise<VocabMasterRow[]> {
  if (!SHEET_ID) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'vocab_master!A1:AC',
  });
  const values = (res.data.values || []) as RawRow[];
  if (values.length === 0) return [];
  const headerRow = values[0];
  if (!headerRow || headerRow.length < VOCAB_MASTER_HEADERS.length) {
    // eslint-disable-next-line no-console
    console.warn('[sheet-client] vocab_master header row missing or too short');
    return [];
  }
  const dataRows = values.slice(1);
  const out: VocabMasterRow[] = [];
  for (const row of dataRows) {
    const obj = rowToObject(VOCAB_MASTER_HEADERS, row);
    const validated = validateVocabMasterRow(obj);
    if (validated) out.push(validated);
  }
  return out;
}

export async function fetchWortDesTages(): Promise<WortDesTagesRow[]> {
  if (!SHEET_ID) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'wort_des_tages!A1:AA',
  });
  const values = (res.data.values || []) as RawRow[];
  if (values.length === 0) return [];
  const headerRow = values[0];
  if (!headerRow || headerRow.length < WORT_DES_TAGES_HEADERS.length) {
    return [];
  }
  const dataRows = values.slice(1);
  const out: WortDesTagesRow[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const obj = rowToObject(WORT_DES_TAGES_HEADERS, dataRows[i]);
    const validated = validateWortDesTagesRow(obj, i);
    if (validated) out.push(validated);
  }
  return out;
}

// Day-of-year rotation: today's word = allActiveRows[dayOfYear % activeRows.length]
export function pickTodaysWord(rows: WortDesTagesRow[], date: Date = new Date()): WortDesTagesRow | null {
  if (rows.length === 0) return null;
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % rows.length;
  return rows[idx];
}

// Test helper: list all tabs in the Sheet (for diagnostics)
export async function listTabs(): Promise<string[]> {
  if (!SHEET_ID) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets.properties.title',
  });
  return (res.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);
}
