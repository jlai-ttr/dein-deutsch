// scripts/consolidate-from-existing-tabs.cjs
// One-shot: reads 4 existing tabs (noun, adj, adverb, verbs) from user's Sheet,
// outputs a vocab_master TSV they can paste into a NEW unified tab.
// Run with: node scripts/consolidate-from-existing-tabs.cjs

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

const POS_MAP = {
  noun: 'noun',
  adj: 'adjective',
  adverb: 'adverb',
  verbs: 'verb',
};

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

async function readTab(tabName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1:Z`,
  });
  return (res.data.values || []);
}

async function main() {
  // 1. List all tabs
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets.properties.title',
  });
  const allTabs = (meta.data.sheets || []).map(s => s.properties?.title || '');
  console.log('Tabs in Sheet:', allTabs);

  // 2. Read each of the 4 expected tabs
  const outRows = [HEADERS];
  let totalRows = 0;
  const seenByTab = {};

  for (const [tabName, pos] of Object.entries(POS_MAP)) {
    if (!allTabs.includes(tabName)) {
      console.log(`Skip: tab "${tabName}" not found in Sheet`);
      continue;
    }
    const rows = await readTab(tabName);
    if (rows.length === 0) continue;
    const dataRows = rows.slice(1); // skip header
    let count = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length === 0) continue;
      // Heuristic: assume col A is German word, col B is English (since we don't know exact schema)
      // We'll map to vocab_master with everything in 'en' column
      const de = (row[0] || '').trim();
      const en = (row[1] || '').trim();
      if (!de) continue;
      const id = `${tabName}-${String(i + 1).padStart(3, '0')}`;
      // New schema-aligned row
      const newRow = [
        id,        // id
        'A1',      // level (default; user updates)
        tabName,   // topic
        'TRUE',    // is_active
        de,        // de
        pos,       // pos
        en,        // en
        '',        // pronunciation
        '',        // ipa
        pos === 'noun' && row[2] ? row[2] : '', // gender (if 3rd col exists on noun tab)
        '', '',    // plural, genitive
        '', '', pos === 'verb' ? 'haben' : '', '', '', // verb fields
        '', '', '', '', '', '', // conjugation 6
        '', '',    // comparative, superlative
        '', '',    // example_de, example_en
        '',        // notes
        '2026-07-30', // updated_at
      ];
      outRows.push(newRow);
      count++;
    }
    seenByTab[tabName] = count;
    totalRows += count;
  }

  console.log('Rows per tab:', seenByTab);
  console.log('Total rows:', totalRows);

  // 3. Write to TSV
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
