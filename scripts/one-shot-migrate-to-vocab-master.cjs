// scripts/one-shot-migrate-to-vocab-master.cjs
// One-shot: creates a "vocab_master" tab in the Sheet, populates with rows
// from the 3 existing tabs (using verified schema mapping), and saves a wort_des_tages
// sample (optional). After this runs, no manual paste needed.
//
// Run: node scripts/one-shot-migrate-to-vocab-master.cjs
// Idempotent: re-running updates the tab instead of erroring.

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const VOCAB_TAB = 'vocab_master';
const WORT_TAB = 'wort_des_tages';

if (!SHEET_ID || !SERVICE_ACCOUNT_KEY) {
  console.error('Set GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY env vars first');
  process.exit(1);
}

const key = JSON.parse(SERVICE_ACCOUNT_KEY);
key.private_key = key.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

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

function emptyRow(n) {
  return Array(n).fill('');
}

function tsvEscape(v) {
  if (v == null) return '';
  return String(v).replace(/[\t\r\n]/g, ' ').replace(/\s+/g, ' ');
}

async function readTab(tabName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z`,
  });
  return res.data.values || [];
}

function normalizePos(wordType) {
  if (!wordType) return '';
  const t = String(wordType).toLowerCase().trim();
  if (t.includes('adj')) return 'adjective';
  if (t.includes('adv')) return 'adverb';
  if (t.includes('verb')) return 'verb';
  if (t.includes('pron')) return 'pronoun';
  return t;
}

function buildNounRow(id, row) {
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

function buildAdjRow(id, row, table) {
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

function buildVerbRow(id, row) {
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

async function ensureTab(tabName) {
  // Check if tab exists
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets.properties.title',
  });
  const existing = (meta.data.sheets || []).map(s => s.properties?.title || '');
  if (existing.includes(tabName)) {
    console.log(`Tab "${tabName}" already exists — will overwrite data`);
    return false; // not created
  }
  // Create new tab
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });
  console.log(`Created tab "${tabName}"`);
  return true; // newly created
}

async function writeTab(tabName, rows) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`Wrote ${rows.length} rows to "${tabName}"`);
}

async function buildVocabRows() {
  const NOUN_TAB = 'German Vocabulary - Nouns (Die Nomen)';
  const ADJ_TAB = 'German Vocabulary - Adjectives, Adverbs & Others';
  const VERB_TAB = 'German Vocabulary - Verbs (Die Verben)';

  const outRows = [HEADERS];

  const nounRows = await readTab(NOUN_TAB);
  for (let i = 0; i < nounRows.length - 1; i++) {
    const row = nounRows[i + 1];
    if (!row || !row[1]) continue;
    outRows.push(buildNounRow(`noun-${String(i + 1).padStart(4, '0')}`, row));
  }

  const adjRows = await readTab(ADJ_TAB);
  for (let i = 0; i < adjRows.length - 1; i++) {
    const row = adjRows[i + 1];
    if (!row || !row[0]) continue;
    const pos = normalizePos(row[1]);
    const table = pos === 'adverb' ? 'adverb' : pos === 'adjective' ? 'adjective' : 'other';
    outRows.push(buildAdjRow(`${table}-${String(i + 1).padStart(4, '0')}`, row, table));
  }

  const verbRows = await readTab(VERB_TAB);
  for (let i = 0; i < verbRows.length - 1; i++) {
    const row = verbRows[i + 1];
    if (!row || !row[0]) continue;
    outRows.push(buildVerbRow(`verb-${String(i + 1).padStart(4, '0')}`, row));
  }

  return outRows;
}

// Wort des Tages seed (matches home page curated set + Sehnsucht for "longing")
function buildWortRows() {
  const outRows = [WORT_HEADERS];

  // Sample WdT entries that complement the local wort-des-tages.ts
  const sample = [
    {
      word: 'Sehnsucht', category: 'noun', gender: 'die', plural: 'die Sehnsüchte',
      genitive: 'der Sehnsucht',
      pronunciation: 'ˈzeːnˌzʊxt', ipa: 'ˈzeːnˌzʊxt',
      meaning: 'longing, yearning', meaning_en: 'a deep, melancholic longing',
      example: 'Ich habe Sehnsucht nach Hause.', example_en: 'I feel a longing for home.',
      sort_index: '1', is_active: 'TRUE',
    },
    {
      word: 'Glücksmoment', category: 'noun', gender: 'der', plural: 'die Glücksmomente',
      pronunciation: 'ˈɡlʏksˌmomɛnt', ipa: 'ˈɡlʏksˌmomɛnt',
      meaning: 'happy moment', meaning_en: 'a brief moment of happiness',
      example: 'Das war ein echter Glücksmoment.', example_en: 'That was a real happy moment.',
      sort_index: '2', is_active: 'TRUE',
    },
  ];

  for (const s of sample) {
    const r = emptyRow(WORT_HEADERS.length);
    r[0] = s.word;
    r[1] = s.category;
    r[2] = s.gender || '';
    r[3] = s.plural || '';
    r[4] = s.genitive || '';
    r[5] = s.pronunciation || '';
    r[6] = s.ipa || '';
    r[7] = s.meaning;
    r[8] = s.meaning_en;
    r[9] = s.example;
    r[10] = s.example_en;
    r[24] = s.sort_index;
    r[25] = s.is_active;
    r[26] = '2026-07-30';
    outRows.push(r);
  }

  return outRows;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('=== DRY RUN — nothing will be written ===');

  const vocabRows = await buildVocabRows();
  const wortRows = buildWortRows();

  console.log(`Vocab rows (incl. header): ${vocabRows.length}`);
  console.log(`Wort rows (incl. header): ${wortRows.length}`);

  if (dryRun) {
    console.log('First 3 vocab rows:');
    for (let i = 0; i < Math.min(3, vocabRows.length); i++) {
      console.log(JSON.stringify(vocabRows[i]));
    }
    return;
  }

  await ensureTab(VOCAB_TAB);
  await writeTab(VOCAB_TAB, vocabRows);

  await ensureTab(WORT_TAB);
  await writeTab(WORT_TAB, wortRows);

  console.log('\n✅ Done. Now hit /api/vocab to verify.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
