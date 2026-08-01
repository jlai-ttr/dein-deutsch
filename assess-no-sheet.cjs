// Test the engine WITHOUT Sheet lookup (so we see how rule-based prediction performs on Sheet's words)
const { predict: predictWithSheet } = require('./lib/gender-engine');

// Build a version of predict() without Sheet lookup
const SHEET_LOOKUP = require('./lib/sheet-lookup.json');
const fs = require('fs');
const https = require('https');
const token = 'dd-2026-migrate-9x8y7z';
const opts = {
  hostname: 'dein-deutsch.vercel.app',
  path: '/api/admin/vocab/list',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
};

// Monkey-patch the engine to remove Sheet lookup
// We need a predict function that doesn't use Sheet
// Easiest: modify the require cache
delete require.cache[require.resolve('./lib/gender-engine')];

// Override SHEET_LOOKUP to be empty
const enginePath = require.resolve('./lib/gender-engine');
let engineCode = fs.readFileSync(enginePath, 'utf-8');
engineCode = engineCode.replace(
  "const SHEET_LOOKUP = require('./sheet-lookup.json'); // populated separately",
  "const SHEET_LOOKUP = {}; // EMPTY for this test"
);

// Write temp version
fs.writeFileSync('./lib/gender-engine-no-sheet.js', engineCode);
const { predict } = require('./lib/gender-engine-no-sheet');

https.get(opts, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const data = JSON.parse(body);
    const nouns = data.vocab.filter(v => v.pos === 'noun' && v.gender && v.plural);
    
    let correct = 0, wrong = 0, unknown = 0;
    const results = [];
    const tierStats = {};
    
    for (const n of nouns) {
      // L201: Sheet stores gender as m/f/n codes (vocab-schema.ts). Normalize to der/die/das for compare.
      const expected = { m: 'der', f: 'die', n: 'das' }[n.gender.toLowerCase()] || n.gender.toLowerCase();
      const result = predict(n.de);
      
      let status;
      if (result.gender === 'unknown') {
        unknown++;
        status = 'UNKNOWN';
      } else if (result.gender === expected) {
        correct++;
        status = 'CORRECT';
      } else {
        wrong++;
        status = 'WRONG';
      }
      
      tierStats[result.tier] = (tierStats[result.tier] || { t: 0, c: 0 });
      tierStats[result.tier].t++;
      if (status === 'CORRECT') tierStats[result.tier].c++;
      
      results.push({
        id: n.id, de: n.de, expected: n.gender, got: result.gender,
        tier: result.tier, note: result.note, status, actualPlural: n.plural, predPlural: result.plural
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ENGINE WITHOUT SHEET LOOKUP — RULE-BASED ON 94 SHEET NOUNS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Correct:  ' + correct + ' (' + (correct/nouns.length*100).toFixed(1) + '%)');
    console.log('Wrong:    ' + wrong + ' (' + (wrong/nouns.length*100).toFixed(1) + '%)');
    console.log('Unknown:  ' + unknown + ' (' + (unknown/nouns.length*100).toFixed(1) + '%)');
    console.log('');
    
    const byStatus = { CORRECT: [], WRONG: [], UNKNOWN: [] };
    results.forEach(r => byStatus[r.status].push(r));
    
    console.log('### CORRECT');
    console.log('');
    byStatus.CORRECT.forEach(r => {
      const line = r.id.padEnd(11) + ' | ' + r.de.padEnd(15) + ' | OK ' + r.expected.padEnd(4) + ' | tier: ' + r.tier + (r.note ? ' [' + r.note + ']' : '');
      console.log(line);
    });
    
    console.log('');
    console.log('### WRONG');
    console.log('');
    if (byStatus.WRONG.length === 0) console.log('  (none)');
    else byStatus.WRONG.forEach(r => {
      const line = r.id.padEnd(11) + ' | ' + r.de.padEnd(15) + ' | expected ' + r.expected + ' -> got ' + r.got + ' | tier: ' + r.tier + (r.note ? ' [' + r.note + ']' : '');
      console.log(line);
    });
    
    console.log('');
    console.log('### UNKNOWN');
    console.log('');
    if (byStatus.UNKNOWN.length === 0) console.log('  (none)');
    else byStatus.UNKNOWN.forEach(r => {
      const line = r.id.padEnd(11) + ' | ' + r.de.padEnd(15) + ' | ' + r.expected.padEnd(4) + ' | no rule';
      console.log(line);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  TIER BREAKDOWN');
    console.log('═══════════════════════════════════════════════════════════════');
    Object.entries(tierStats).sort((a,b) => b[1].t - a[1].t).forEach(([t, s]) => {
      console.log('  ' + t.padEnd(30) + ': ' + s.c + '/' + s.t + ' (' + (s.c/s.t*100).toFixed(0) + '%)');
    });
  });
});