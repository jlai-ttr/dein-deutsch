// backfill-to-sheet.cjs
// Reads SEED_VOCAB from app/woerter/page.tsx, transforms to vocab-schema format,
// outputs two TSV files you can paste into Google Sheets:
//   out/vocab_master.tsv  (paste into 'vocab_master' tab)
//   out/wort_des_tages.tsv (paste into 'wort_des_tages' tab — uses 30 words from wort-des-tages.ts)

const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\user\\.openclaw\\workspace-telegram\\dein-deutsch';

// === Read woerter/page.tsx and extract SEED_VOCAB ===
const woerterPath = path.join(ROOT, 'app', 'woerter', 'page.tsx');
const woerterFile = fs.readFileSync(woerterPath, 'utf8');
const seedIdx = woerterFile.indexOf('SEED_VOCAB:');
const typeBracket = woerterFile.indexOf('[', seedIdx);
const arrStart = woerterFile.indexOf('[', woerterFile.indexOf('=', typeBracket));

// Walk to find balanced ]
function findBalancedEnd(text, start, openCh, closeCh) {
  let depth = 0, i = start;
  let inString = false, strCh = '', prev = '';
  let inComment = false, lineComment = false;
  while (i < text.length) {
    const c = text[i];
    if (lineComment) { if (c === '\n') lineComment = false; i++; continue; }
    if (inString) { if (c === strCh && prev !== '\\') inString = false; prev = c; i++; continue; }
    if (inComment) { if (c === '*' && text[i+1] === '/') { inComment = false; i += 2; continue; } i++; continue; }
    if (c === '/' && text[i+1] === '/') { lineComment = true; i += 2; continue; }
    if (c === '/' && text[i+1] === '*') { inComment = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = true; strCh = c; prev = c; i++; continue; }
    if (c === openCh) depth++;
    if (c === closeCh) { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

const arrEnd = findBalancedEnd(woerterFile, arrStart, '[', ']');
const section = woerterFile.substring(arrStart, arrEnd + 1);

// Extract top-level objects
function extractObjects(text) {
  const objs = [];
  let depth = 0, start = -1;
  let inS = false, sCh = '', pr = '';
  for (let k = 0; k < text.length; k++) {
    const c = text[k];
    if (inS) { if (c === sCh && pr !== '\\') inS = false; pr = c; continue; }
    if (c === '"' || c === "'" || c === '`') { inS = true; sCh = c; pr = c; continue; }
    if (c === '{') { if (depth === 0) start = k + 1; depth++; }
    else if (c === '}') { depth--; if (depth === 0 && start > 0) { objs.push(text.substring(start, k)); start = -1; } }
  }
  return objs;
}

const objs = extractObjects(section).filter(o => /id:/.test(o));
console.log('SEED cards found:', objs.length);

// Parse a card object — extract each field
function parseCard(text) {
  const card = {};
  // Helper: extract single-quoted string after key:
  function get(key) {
    const re = new RegExp(`\\b${key}:\\s*'([^']*)'`);
    const m = text.match(re);
    return m ? m[1] : undefined;
  }
  card.id = get('id');
  card.word = get('word');
  card.translation = get('translation');
  card.pos = get('pos');
  card.level = get('level');
  card.gender = get('gender');
  card.example = get('example');
  card.exampleEn = get('exampleEn');
  return card;
}

const parsed = objs.map(parseCard).filter(c => c.id && c.word);
console.log('Parsed successfully:', parsed.length);

// === Read wort-des-tages.ts ===
const wortPath = path.join(ROOT, 'app', 'lib', 'wort-des-tages.ts');
const wortFile = fs.readFileSync(wortPath, 'utf8');

// === TSV header (matches vocab-schema.ts VOCAB_MASTER_HEADERS) ===
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

// pos mapping from SEED_VOCAB's terse names to schema names
const POS_MAP = {
  noun: 'noun',
  verb: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  pron: 'pronoun',
  num: 'numeral',
  conj: 'conjunction',
  interj: 'interjection',
  phrase: 'phrase',
  expression: 'expression',
};

// topic from id prefix
function topicFromId(id) {
  if (id.startsWith('b')) return 'business';
  if (id.startsWith('f')) return 'freq';
  return 'starter'; // g, p, q, n, v, a, t, c, m, d, w, e
}

function toRow(card) {
  const isNoun = card.pos === 'noun';
  const isVerb = card.pos === 'verb';
  const isAdj = card.pos === 'adjective';
  return [
    card.id,                                                          // id
    card.level || 'A1',                                               // level
    topicFromId(card.id),                                             // topic
    'TRUE',                                                           // is_active
    card.word,                                                        // de
    POS_MAP[card.pos] || card.pos,                                    // pos
    card.translation || '',                                           // en
    '',                                                               // pronunciation (manual fill)
    '',                                                               // ipa (manual fill)
    card.gender || '',                                                // gender
    isNoun ? '' : '',                                                 // plural (none for SEED)
    isNoun && card.gender ? '' : '',                                  // genitive (none for SEED)
    '',                                                               // separable
    '',                                                               // prefix
    isVerb ? 'haben' : '',                                            // verb_aux (default; many verbs need correction)
    '',                                                               // verb_praeteritum
    '',                                                               // verb_partizip_ii
    '', '', '', '', '', '',                                           // conjugation 6
    isAdj ? '' : '',                                                  // comparative
    isAdj ? '' : '',                                                  // superlative
    card.example || '',                                               // example_de
    card.exampleEn || '',                                             // example_en
    '',                                                               // notes
    '2026-07-30',                                                     // updated_at
  ];
}

// Build TSV
function tsvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  // Replace tabs/newlines that would break TSV
  return s.replace(/[\t\r\n]/g, ' ').replace(/\s+/g, ' ');
}

const outDir = path.join(ROOT, 'out');
fs.mkdirSync(outDir, { recursive: true });

const lines = [];
lines.push(HEADERS.join('\t'));
parsed.forEach(card => {
  lines.push(toRow(card).map(tsvEscape).join('\t'));
});
fs.writeFileSync(path.join(outDir, 'vocab_master.tsv'), lines.join('\n'), 'utf8');
console.log('Wrote', lines.length - 1, 'rows to out/vocab_master.tsv');

// === Also write wort_des_tages.tsv from wort-des-tages.ts ===
const WORT_HEADERS = [
  'word', 'category', 'gender', 'plural', 'genitive',
  'pronunciation', 'ipa',
  'meaning', 'meaning_en', 'example', 'example_en',
  'separable', 'prefix', 'verb_aux', 'verb_praeteritum', 'verb_partizip_ii',
  'conjugation_ich', 'conjugation_du', 'conjugation_er', 'conjugation_wir', 'conjugation_ihr', 'conjugation_sie',
  'comparative', 'superlative',
  'sort_index', 'is_active', 'updated_at',
];

// Parse wort-des-tages.ts entries — each is {...}
function parseWortEntries(text) {
  // Find WORTE_DES_TAGES = [...], skip past the type bracket
  const kwIdx = text.indexOf('WORTE_DES_TAGES');
  const firstBracket = text.indexOf('[', kwIdx);
  const arrStart = text.indexOf('[', text.indexOf('=', firstBracket));
  const arrEnd = findBalancedEnd(text, arrStart, '[', ']');
  const section = text.substring(arrStart, arrEnd + 1);
  return extractObjects(section).filter(o => /word:/.test(o));
}

function parseWortCard(text) {
  const card = {};
  function get(key) {
    const re = new RegExp(`\\b${key}:\\s*'([^']*)'`);
    const m = text.match(re);
    return m ? m[1] : undefined;
  }
  card.word = get('word');
  card.category = get('category');
  card.gender = get('gender');
  card.plural = get('plural');
  card.genitive = get('genitive');
  card.pronunciation = get('pronunciation');
  card.ipa = get('ipa');
  card.meaning = get('meaning');
  card.meaningEn = get('meaningEn');
  card.example = get('example');
  card.exampleEn = get('exampleEn');
  card.comparative = get('comparative');
  card.superlative = get('superlative');
  return card;
}

const wortObjs = parseWortEntries(wortFile);
const wortCards = wortObjs.map(parseWortCard).filter(c => c.word);
console.log('Wort entries found:', wortCards.length);

const wortLines = [];
wortLines.push(WORT_HEADERS.join('\t'));
wortCards.forEach((card, i) => {
  const isNoun = card.category === 'noun';
  const isAdj = card.category === 'adjective';
  wortLines.push([
    card.word,                                          // word
    card.category || '',                                // category
    card.gender || '',                                  // gender
    card.plural || '',                                  // plural
    card.genitive || '',                                // genitive
    card.pronunciation || '',                           // pronunciation
    card.ipa || '',                                     // ipa
    card.meaning || '',                                 // meaning
    card.meaningEn || '',                               // meaning_en
    card.example || '',                                 // example
    card.exampleEn || '',                               // example_en
    '',                                                 // separable
    '',                                                 // prefix
    '',                                                 // verb_aux
    '',                                                 // verb_praeteritum
    '',                                                 // verb_partizip_ii
    '', '', '', '', '', '',                             // conjugation 6
    card.comparative || '',                             // comparative
    card.superlative || '',                             // superlative
    String(i),                                          // sort_index
    'TRUE',                                             // is_active
    '2026-07-30',                                       // updated_at
  ].map(tsvEscape).join('\t'));
});
fs.writeFileSync(path.join(outDir, 'wort_des_tages.tsv'), wortLines.join('\n'), 'utf8');
console.log('Wrote', wortLines.length - 1, 'rows to out/wort_des_tages.tsv');

console.log('\nDone. Files in out/:');
console.log('  - vocab_master.tsv (paste into Sheet tab "vocab_master")');
console.log('  - wort_des_tages.tsv (paste into Sheet tab "wort_des_tages")');