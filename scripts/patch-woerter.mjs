// scripts/patch-woerter.mjs
// Reads .tmp-freq.json, generates seed entries, patches woerter/page.tsx

import fs from 'node:fs';

const OUT_JSON = '.tmp-freq.json';
const TARGET = 'app/woerter/page.tsx';

// Words that are obviously too low-value to add as learning cards (names, English-leakage)
const SKIP = new Set([
  'the','a','an','and','or','but','of','in','to','for','with','at','by','from','on','as','is','are',
  'sir','mr','mrs','dr','prof','gen','col','sgt','john','tom','mike','frank','mary','george','alex',
  'charlie','david','peter','max','paul','joe','harry','jack','ben','sam','paris','york','new','team',
  'general','captain','agent','boss','partner','i','you','mom','dad','mama','papa','vati','mutti',
  'oma','opa','papa-','mama-','vati-','mutti-','oma-','opa-','chffffff','papa--','mama--','ma',
  'papa---','mama---','ma-','ma--','ma---','mr-','mr--','dr-','sir-','sir--','sir---','the-','the--',
  'a-','a--','a---','an-','an--','an---','and-','and--','and---','or-','or--','or---','but-','but--',
  'but---','of-','of--','of---','in-','in--','in---','to-','to--','to---','for-','for--','for---',
  'with-','with--','with---','at-','at--','at---','by-','by--','by---','from-','from--','from---',
  'on-','on--','on---','as-','as--','as---','is-','is--','is---','are-','are--','are---',
  // Movie subtitle artifacts / sound words
  'o','o-','o--','o---','oh-oh','oh-oh-','oh-oh--','oh-oh---','oh-oh-oh','yeah','yep','jawoll','jep',
  'uff','puh','hui','au','nö','jo','nee','nope','nix',
  // Names / characters (some are real first names from films, others are callsigns)
  'sagen-','sollen-','wäre-','solltest','tau','pass','film','new',
]);

const ART_HINTS = {
  'm':'der',
  'f':'die',
  'n':'das',
};

function inferGender(w) {
  // Very rough gender inference
  if (/ung$|heit$|keit$|tion$|ie$|enz$|ur$|e$/.test(w) && !w.endsWith('ment')) return 'f';
  if (/ment$|chen$|lein$|um$|ma$|nis$/.test(w)) return 'n';
  if (/er$|ling$|ismus$|ast$/.test(w) && w.length > 4) return 'm';
  return null;
}

const entries = JSON.parse(fs.readFileSync(OUT_JSON, 'utf-8'));
console.log(`Total: ${entries.length}`);

const filtered = entries.filter(e => {
  if (SKIP.has(e.w)) return false;
  // Also skip anything that's a pure digit or single-char artifact
  if (e.w.length <= 1) return false;
  if (/^\d/.test(e.w)) return false;
  return true;
});
console.log(`After filter: ${filtered.length}`);

// Generate JSX entries
const lines = filtered.map(e => {
  const id = `freq-${e.rank}`;
  const word = e.w.replace(/'/g, "\\'");
  const trans = e.en.replace(/'/g, "\\'");
  let line = `  { id: '${id}', word: '${word}', translation: '${trans}', pos: '${e.pos}'`;
  // Add gender for nouns (best-effort)
  if (e.pos === 'noun' && e.w.length > 3) {
    const g = inferGender(e.w);
    if (g) line += `, gender: '${g}'`;
  }
  line += `, level: '${e.level}', example: '', exampleEn: '' },`;
  return line;
});

const block = `
// ===== AUTO-GENERATED FREQUENCY DECK — Top 1000 German (OpenSubtitles 2018, hermitdave/FrequencyWords) =====
// Total: ${filtered.length} cards. Rank 1-${filtered.length}. CEFR level assigned by rank.
// Levels: A1 (rank 1-100), A2 (101-300), B1 (301-600), B2 (601-850), C1 (851-1000).
${lines.join('\n')}
`;

const file = fs.readFileSync(TARGET, 'utf-8');
// Find SEED_VOCAB closing
const startMarker = 'const SEED_VOCAB';
const endMarker = '];';
const startIdx = file.indexOf(startMarker);
const endIdx = file.indexOf(endMarker, startIdx);
if (startIdx < 0 || endIdx < 0) {
  console.error('Markers not found');
  process.exit(1);
}
console.log(`SEED_VOCAB: ${startIdx}-${endIdx}`);

const before = file.slice(0, endIdx);
const after = file.slice(endIdx);
const newFile = before + block + '\n' + after;

fs.writeFileSync(TARGET, newFile);
console.log(`Patched. Added ${filtered.length} entries.`);