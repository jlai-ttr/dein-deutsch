// app/api/admin/sheet-migrate/route.ts
// POST /api/admin/sheet-migrate — runs the one-shot migration via the Sheet API.
// Creates `vocab_master` + `wort_des_tages` tabs if missing, populates them.
// Requires header: Authorization: Bearer <CRON_SECRET>
// SAFE TO RE-RUN — overwrites data idempotently.

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const HEADERS = [
  'id', 'level', 'topic', 'is_active',
  'de', 'pos', 'en', 'pronunciation', 'ipa',
  'gender', 'plural', 'genitive',
  'separable', 'prefix', 'verb_aux', 'verb_praeteritum', 'verb_partizip_ii',
  'conjugation_ich', 'conjugation_du', 'conjugation_er', 'conjugation_wir', 'conjugation_ihr', 'conjugation_sie',
  'comparative', 'superlative',
  'example_de', 'example_en', 'notes',
  'updated_at',
];

const WORT_HEADERS = [
  'word', 'category', 'gender', 'plural', 'genitive', 'pronunciation', 'ipa',
  'meaning', 'meaning_en', 'example', 'example_en',
  'separable', 'prefix', 'verb_aux', 'verb_praeteritum', 'verb_partizip_ii',
  'conjugation_ich', 'conjugation_du', 'conjugation_er', 'conjugation_wir', 'conjugation_ihr', 'conjugation_sie',
  'comparative', 'superlative', 'sort_index', 'is_active', 'updated_at',
];

function emptyRow(n: number): string[] {
  return Array(n).fill('');
}

function normalizePos(wordType: string | undefined): string {
  if (!wordType) return '';
  const t = String(wordType).toLowerCase().trim();
  if (t.includes('adj')) return 'adjective';
  if (t.includes('adv')) return 'adverb';
  if (t.includes('verb')) return 'verb';
  if (t.includes('pron')) return 'pronoun';
  return t;
}

function buildNounRow(id: string, row: string[]): string[] {
  const r = emptyRow(HEADERS.length);
  r[0] = id; r[1] = 'A1'; r[2] = 'noun'; r[3] = 'TRUE';
  r[4] = (row[1] || '').trim();
  r[5] = 'noun';
  r[6] = (row[3] || '').trim();
  r[9] = (row[0] || '').trim();
  r[10] = (row[2] || '').trim();
  r[25] = (row[4] || '').trim();
  r[26] = (row[5] || '').trim();
  r[28] = '2026-07-30';
  return r;
}

function buildAdjRow(id: string, row: string[], table: string): string[] {
  const r = emptyRow(HEADERS.length);
  r[0] = id; r[1] = 'A1'; r[2] = table; r[3] = 'TRUE';
  r[4] = (row[0] || '').trim();
  r[5] = normalizePos(row[1]);
  r[6] = (row[2] || '').trim();
  r[25] = (row[3] || '').trim();
  r[26] = (row[4] || '').trim();
  r[28] = '2026-07-30';
  return r;
}

function buildVerbRow(id: string, row: string[]): string[] {
  const r = emptyRow(HEADERS.length);
  r[0] = id; r[1] = 'A1'; r[2] = 'verb'; r[3] = 'TRUE';
  r[4] = (row[0] || '').trim();
  r[5] = 'verb';
  r[6] = (row[4] || '').trim();
  r[14] = 'hat';
  r[15] = (row[2] || '').trim();
  r[16] = (row[3] || '').trim();
  r[25] = (row[5] || '').trim();
  r[26] = (row[6] || '').trim();
  r[28] = '2026-07-30';
  return r;
}

function getSheetsClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY missing');
  const key = JSON.parse(keyJson);
  key.private_key = key.private_key.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function ensureTab(sheets: ReturnType<typeof getSheetsClient>, sheetId: string, tabName: string) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: 'sheets.properties.title',
  });
  const existing = (meta.data.sheets || []).map(s => s.properties?.title || '');
  if (existing.includes(tabName)) return false;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
  });
  return true;
}

async function readTab(sheets: ReturnType<typeof getSheetsClient>, sheetId: string, tabName: string): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!A1:Z`,
  });
  return (res.data.values || []) as string[][];
}

async function writeTab(sheets: ReturnType<typeof getSheetsClient>, sheetId: string, tabName: string, rows: string[][]) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `${tabName}!A1:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

export async function POST(request: Request) {
  const CRON_SECRET = process.env.CRON_SECRET;
  // Fail-closed: in production, require CRON_SECRET. Dev fallback removed.
  if (!CRON_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
    }
    // Dev convenience: keep behavior permissive for local dev, but log a warning
    console.warn('[admin/sheet-migrate] CRON_SECRET not set — open access in dev mode');
  } else {
    const authHeader = request.headers.get('authorization');
    const provided = authHeader?.replace(/^Bearer\s+/i, '');
    if (provided !== CRON_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) {
    return NextResponse.json({ ok: false, error: 'GOOGLE_SHEET_ID missing' }, { status: 500 });
  }

  try {
    const sheets = getSheetsClient();
    const NOUN_TAB = 'German Vocabulary - Nouns (Die Nomen)';
    const ADJ_TAB = 'German Vocabulary - Adjectives, Adverbs & Others';
    const VERB_TAB = 'German Vocabulary - Verbs (Die Verben)';

    const vocabRows: string[][] = [HEADERS];

    const nounRows = await readTab(sheets, SHEET_ID, NOUN_TAB);
    for (let i = 0; i < nounRows.length - 1; i++) {
      const row = nounRows[i + 1];
      if (!row || !row[1]) continue;
      vocabRows.push(buildNounRow(`noun-${String(i + 1).padStart(4, '0')}`, row));
    }

    const adjRows = await readTab(sheets, SHEET_ID, ADJ_TAB);
    for (let i = 0; i < adjRows.length - 1; i++) {
      const row = adjRows[i + 1];
      if (!row || !row[0]) continue;
      const pos = normalizePos(row[1]);
      const table = pos === 'adverb' ? 'adverb' : pos === 'adjective' ? 'adjective' : 'other';
      vocabRows.push(buildAdjRow(`${table}-${String(i + 1).padStart(4, '0')}`, row, table));
    }

    const verbRows = await readTab(sheets, SHEET_ID, VERB_TAB);
    for (let i = 0; i < verbRows.length - 1; i++) {
      const row = verbRows[i + 1];
      if (!row || !row[0]) continue;
      vocabRows.push(buildVerbRow(`verb-${String(i + 1).padStart(4, '0')}`, row));
    }

    const createdVocab = await ensureTab(sheets, SHEET_ID, 'vocab_master');
    await writeTab(sheets, SHEET_ID, 'vocab_master', vocabRows);

    // Wort des Tages seed (will be expanded by user later)
    const wortRows: string[][] = [WORT_HEADERS];
    const seed = [
      { word: 'Sehnsucht', category: 'noun', gender: 'die', plural: 'die Sehnsüchte', genitive: 'der Sehnsucht', pronunciation: 'ˈzeːnˌzʊxt', meaning: 'longing', meaning_en: 'deep melancholic longing', example: 'Ich habe Sehnsucht nach Hause.', example_en: 'I long for home.' },
      { word: 'Glücksmoment', category: 'noun', gender: 'der', plural: 'die Glücksmomente', pronunciation: 'ˈɡlʏksˌmomɛnt', meaning: 'happy moment', meaning_en: 'a brief moment of happiness', example: 'Das war ein echter Glücksmoment.', example_en: 'That was a real happy moment.' },
    ];
    for (let i = 0; i < seed.length; i++) {
      const s = seed[i];
      const r = emptyRow(WORT_HEADERS.length);
      r[0] = s.word; r[1] = s.category; r[2] = s.gender || '';
      r[3] = s.plural || ''; r[4] = s.genitive || '';
      r[5] = s.pronunciation || ''; r[6] = s.pronunciation || '';
      r[7] = s.meaning; r[8] = s.meaning_en;
      r[9] = s.example; r[10] = s.example_en;
      r[24] = String(i + 1); r[25] = 'TRUE'; r[26] = '2026-07-30';
      wortRows.push(r);
    }

    const createdWort = await ensureTab(sheets, SHEET_ID, 'wort_des_tages');
    await writeTab(sheets, SHEET_ID, 'wort_des_tages', wortRows);

    return NextResponse.json({
      ok: true,
      createdVocabMasterTab: createdVocab,
      createdWortTab: createdWort,
      vocabRowsWritten: vocabRows.length - 1,
      wortRowsWritten: wortRows.length - 1,
      sourceTabs: { nounRows: nounRows.length - 1, adjRows: adjRows.length - 1, verbRows: verbRows.length - 1 },
      nextStep: 'Hit GET /api/vocab to verify reads work',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST with Authorization: Bearer <CRON_SECRET> to run one-shot migration',
    expected: 'Creates vocab_master + wort_des_tages tabs, populates from existing 3 tabs',
  });
}
