// scripts/consolidate-from-existing-tabs.cjs
// One-shot: reads 3 existing tabs from user's Sheet, outputs vocab_master TSV.
// Schemas (verified via /api/debug/sheet-samples on 2026-07-30):
//   Nouns:        Article | Singular | Plural | English | Example DE | Example EN
//   Adjectives+:  German | Word Type | English | Example DE | Example EN
//   Verbs:        Infinitive | 3rd Person | Past | Perfect | English | Example DE | Example EN

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

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

// Final schema for vocab_master (29 cols)
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

function tsvEscape(v) {
  if (v == null) return '';
  return String(v).replace(/[\t\r\n]/g, ' ').replace(/\s+/g, ' ');
}

function emptyRow() {
  return HEADERS.map(() => '');
}

async function readTab(tabName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z`,
  });
  return (res.data.values || []);
}

// Convert German Word Type to our POS slug
function normalizePos(wordType) {
  if (!wordType) return '';
  const t = String(wordType).toLowerCase().trim();
  if (t.includes('adj')) return 'adjective';
  if (t.includes('adv')) return 'adverb';
  if (t.includes('verb')) return 'verb';
  if (t.includes('noun')) return 'noun';
  if (t.includes('pronoun')) return 'pronoun';
  if (t.includes('prep')) return 'preposition';
  if (t.includes('conj')) return 'conjunction';
  if (t.includes('interj')) return 'interjection';
  return t;
}

function buildNounRow(id, row) {
  // row = [article, singular, plural, english, example_de, example_en]
  const r = emptyRow();
  r[0] = id;        // id
  r[1] = 'A1';      // level
  r[2] = 'noun';    // topic
  r[3] = 'TRUE';    // is_active
  r[4] = (row[1] || '').trim();   // de (singular)
  r[5] = 'noun';    // pos
  r[6] = (row[3] || '').trim();   // en
  // pronunciation, ipa — skip
  r[9] = (row[0] || '').trim();   // gender (der/die/das)
  r[10] = (row[2] || '').trim();  // plural
  // genitive — skip (not in source)
  // verb fields — skip
  // comparative/superlative — skip
  r[25] = (row[4] || '').trim();  // example_de
  r[26] = (row[5] || '').trim();  // example_en
  r[28] = '2026-07-30';           // updated_at
  return r;
}

function buildAdjRow(id, row) {
  // row = [german, word_type, english, example_de, example_en]
  const r = emptyRow();
  r[0] = id;
  r[1] = 'A1';
  r[2] = 'adjective';
  r[3] = 'TRUE';
  r[4] = (row[0] || '').trim();
  r[5] = normalizePos(row[1]);
  r[6] = (row[2] || '').trim();
  r[25] = (row[3] || '').trim();
  r[26] = (row[4] || '').trim();
  r[28] = '2026-07-30';
  return r;
}

function buildVerbRow(id, row) {
  // row = [infinitive, 3rd, past, perfect, english, example_de, example_en]
  const r = emptyRow();
  r[0] = id;
  r[1] = 'A1';
  r[2] = 'verb';
  r[3] = 'TRUE';
  r[4] = (row[0] || '').trim();
  r[5] = 'verb';
  r[6] = (row[4] || '').trim();
  r[14] = 'hat';                  // verb_aux
  r[15] = (row[2] || '').trim();  // verb_praeteritum
  r[16] = (row[3] || '').trim();  // verb_partizip_ii
  // conjugation_ich — leave blank (could derive from infinitive + 3rd person)
  r[25] = (row[5] || '').trim();  // example_de
  r[26] = (row[6] || '').trim();  // example_en
  r[28] = '2026-07-30';
  return r;
}

async function main() {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets.properties.title',
  });
  const allTabs = (meta.data.sheets || []).map(s => s.properties?.title || '');
  console.log('Tabs:', allTabs);

  const outRows = [HEADERS];
  const seenByTab = {};

  // Nouns
  const NOUN_TAB = 'German Vocabulary - Nouns (Die Nomen)';
  if (allTabs.includes(NOUN_TAB)) {
    const rows = await readTab(NOUN_TAB);
    const data = rows.slice(1);
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[1]) continue;
      const id = `noun-${String(i + 1).padStart(4, '0')}`;
      outRows.push(buildNounRow(id, row));
      count++;
    }
    seenByTab[NOUN_TAB] = count;
  }

  // Adj+Adv+Others (one tab)
  const ADJ_TAB = 'German Vocabulary - Adjectives, Adverbs & Others';
  if (allTabs.includes(ADJ_TAB)) {
    const rows = await readTab(ADJ_TAB);
    const data = rows.slice(1);
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      const pos = normalizePos(row[1]);
      const table = pos === 'adverb' ? 'adverb' : pos === 'adjective' ? 'adjective' : 'other';
      const id = `${table}-${String(i + 1).padStart(4, '0')}`;
      outRows.push(buildAdjRow(id, row));
      count++;
    }
    seenByTab[ADJ_TAB] = count;
  }

  // Verbs
  const VERB_TAB = 'German Vocabulary - Verbs (Die Verben)';
  if (allTabs.includes(VERB_TAB)) {
    const rows = await readTab(VERB_TAB);
    const data = rows.slice(1);
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      const id = `verb-${String(i + 1).padStart(4, '0')}`;
      outRows.push(buildVerbRow(id, row));
      count++;
    }
    seenByTab[VERB_TAB] = count;
  }

  console.log('Rows per tab:', seenByTab);
  console.log('Total:', outRows.length - 1);

  const tsv = outRows.map(r => r.map(tsvEscape).join('\t')).join('\n');
  const outPath = path.join(__dirname, '..', 'out', 'vocab_master_consolidated.tsv');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, tsv, 'utf8');
  console.log(`Written to: ${outPath}`);
  console.log('Next: paste this into a new "vocab_master" tab in the Sheet');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
