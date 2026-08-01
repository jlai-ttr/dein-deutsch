// Generate SPEC_TO_ENGINE_MAP by exact-pattern matching
const { SUFFIX_RULES } = require('./audit/rules-stub.cjs');

// Patterns from spec rules (matches engine regex suffix pattern)
const SPEC_PATTERNS = {
  1: 'chen$|lein$',
  2: null,
  3: null,
  4: 'ung$|heit$|keit$|schaft$',
  5: 'ion$|tur$|sur$|ik$',
  6: 'ei$',  // caught by e$ (engine doesn't have dedicated ei rule)
  7: 'ier$',  // -ier French Abstract
  8: 'in$',
  9: null,
  10: 'e$',
  11: 'er$',
  12: 'ismus$|us$|os$',
  13: 'ent$|ant$|ist$|et$',
  14: 'eur$',  // human professions
  15: 'eur$|euer$',  // inanimate
  16: 'or$',
  17: 'ig$',
  18: 'er$',
  19: 'er$',
  20: 'ar$|ier$',
  21: 'ar$|ier$',
  22: 'nis$',
  23: 'um$|tum$|ment$|ma$',
  24: 'iv$',
  25: 'ab$|alb$',
  26: 'ieb$',
  27: 'b$',
  28: 'of$|uf$|ief$',
  29: 'iff$|af$',
  30: 'und$',
  31: 'ild$|eld$',
  32: 'ad$|ind$',
  33: 'and$|ind$|ad$',
  34: 'end$',
  35: 'end$',
  36: 'rd$',
  37: 'rd$',
  38: null,
  39: null,
  40: 'ag$|eg$|og$',
  41: 'h$',
  42: 'h$',
  43: 'h$',
  44: 'ack$|ock$|uck$',
  45: 'eck$|ück$',
  46: 'l$',
  47: 'l$|ll$',
  48: 'aum$|amm$|urm$|elm$',
  49: null,
  50: 'orm$',
  51: 'opf$|umpf$|ampf$',
  52: 'wur$|lur$',
  53: 'pur$|nur$',
  54: 'r$',
  55: 'r$',
  56: 'eis$|uss$|rs$|ls$',
  57: 'ass$|oss$',
  58: 'ass$|oss$',
  59: 'ast$|ost$|ust$',
  60: 'est$|elt$|ert$',
  61: null,
  62: null,
  63: null,
  64: null,
  65: 'atz$|itz$|utz$|z$',
  66: 'etz$',
  67: 'c$|j$|w$|x$|y$|p$',
  68: null,
};

const map = {};
for (let id = 1; id <= 68; id++) {
  const want = SPEC_PATTERNS[id];
  if (!want) { map[id] = []; continue; }
  const indices = [];
  const wantAlts = want.split('|'); // ['ung$', 'heit$', 'keit$', 'schaft$']
  for (let i = 0; i < SUFFIX_RULES.length; i++) {
    const have = SUFFIX_RULES[i].suffix.source;
    // Split engine rule by | as well
    const haveAlts = have.split('|');
    // Match if ANY spec alternative matches engine rule exactly (power-of-1 strategy)
    const anyMatch = wantAlts.some(w => haveAlts.includes(w));
    if (anyMatch) indices.push(i);
  }
  map[id] = indices;
}

console.log('SPEC_TO_ENGINE_MAP = {');
for (let id = 1; id <= 68; id++) {
  const arr = map[id];
  const len = arr.length;
  const note = `matched ${len} rule(s)`;
  console.log(`  ${id}: [${arr.join(', ')}],  // ${note}`);
}
console.log('};');
