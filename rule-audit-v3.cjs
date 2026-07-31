// rule-audit-v3.cjs
// FINAL audit: explicit rule mapping (no fuzzy match) + word-level test + study guide

const fs = require('fs');
const path = require('path');

const SUFFIX_RULES = require('./audit/rules-stub.cjs').SUFFIX_RULES;
const { predict, A1_A2, TOP_FREQ, SHEET_LOOKUP } = require('./lib/gender-engine.js');
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit/rule-spec.json'), 'utf8'));

// ============================================================================
// Explicit mapping: spec_id -> list of engine rule indices that cover it
// (built manually based on inspection; this is the source of truth)
// ============================================================================
const SPEC_TO_ENGINE_MAP = {
  1: [0],   // -chen, -lein → das (rule 0: chen$|lein$)
  2: [],    // Male humans/animals → semantic, no rule
  3: [],    // Metals/elements → semantic, no rule
  4: [1, 2, 3],   // -ung, -heit, -keit, -schaft
  5: [4, 5],   // -ion, -tur, -sur, -ik, -is
  6: [10],  // -ei (caught by -e$ rule)
  7: [6],   // -in (human fem)
  8: [],    // Action + t/st/ft (no direct rule — handled by -e$ or specific compounds)
  9: [10],  // -e (Fem)
  10: [50], // -er (Masc, drop -en)
  11: [11, 12, 13], // -ismus, -us, -os
  12: [14, 15, 16], // -ent, -ant, -ist
  13: [17], // -or
  14: [18], // -ig
  15: [50], // -er (Masc, tools/birds)
  16: [50], // -er (Neut, abstracts) — engine says der, conflict
  17: [19, 20], // -ar, -ier (Masc)
  18: [19, 20], // -ar, -ier (Neut) — engine says der for -ier, conflict
  19: [21], // -nis
  20: [22, 23, 24, 25], // -um, -tum, -ment, -ma
  21: [26], // -iv
  22: [27], // -ab, -alb
  23: [28], // -ieb
  24: [29], // -b (Native Masc)
  25: [30], // -of, -uf, -ief
  26: [31], // -iff, -af
  27: [32], // -und
  28: [33], // -ild, -eld
  29: [34, 35], // -ad, -ind, -and (Masc)
  30: [34, 35], // -ad, -ind, -and (Neut) — engine says der, conflict
  31: [36], // -end (Masc)
  32: [36], // -end (Neut)
  33: [37], // -rd (Masc)
  34: [37], // -rd (Neut)
  35: [],   // -ee (substances) — semantic / context
  36: [],   // -ee (abstract/French) — semantic / context
  37: [38, 39], // -ag/-eg/-og, -ug
  38: [40], // silent -h (Masc)
  39: [40], // silent -h (Neut)
  40: [40], // silent -h (Fem)
  41: [41], // -ack, -ock, -uck
  42: [42], // -eck, -ück
  43: [43, 44], // -l, -ll (Masc)
  44: [43, 44], // -l, -ll (Neut)
  45: [45], // -aum, -amm, -urm, -elm
  46: [],   // -m (Neut roots) — no direct rule
  47: [46], // -orm
  48: [47], // -opf, -umpf, -ampf
  49: [48], // -wur, -lur
  50: [49], // -pur, -nur
  51: [51], // -r (Neut)
  52: [51], // -r (Fem)
  53: [52], // -eis, -uss, -ess, -rs, -ls
  54: [53], // -ass, -oss (Masc)
  55: [53], // -ass, -oss (Neut)
  56: [54], // -ast, -ost, -ust
  57: [55], // -est, -elt, -ert
  58: [],   // -port, -ort (loans) — no direct rule (engine has no -ort rule)
  59: [],   // Native -ort (Masc) — no direct rule
  60: [],   // Native -ort (Neut) — no direct rule
  61: [],   // Antwort — no direct rule
  62: [56], // -atz, -itz, -utz, -z
  63: [57], // -etz
  64: [58, 59], // -c, -j, -w, -x, -y, -p
  65: [],   // Komposita — handled by compound decomposition tier
};

// ============================================================================
// Helpers
// ============================================================================
function normalizeGender(g) {
  if (!g) return null;
  const lower = g.toLowerCase();
  if (lower.includes('masculine') || lower === 'der') return 'der';
  if (lower.includes('feminine') || lower === 'die') return 'die';
  if (lower.includes('neuter') || lower === 'das') return 'das';
  if (lower.includes('root dependent') || lower.includes('root-dependent')) return 'root';
  return null;
}

function extractExamples(text) {
  if (!text) return [];
  const examples = [];
  // Pattern 1: "Word → Plural" pairs
  const re1 = /(?:das |der |die |^|\s|,|\()(([A-ZÄÖÜ][a-zäöüß-]{2,}))(\s*→\s*([A-Za-zäöüß,\s]+?))(?=[.,;\)]|$)/gm;
  let m;
  while ((m = re1.exec(text)) !== null) {
    const word = m[1].trim();
    const plural = m[4] ? m[4].trim().split(/[,\s]/)[0] : null;
    if (word.length > 2) {
      examples.push({ word, plural, source: 'arrow' });
    }
  }
  // Pattern 2: Words in lists (Mädchen, Eis, Nuss)
  // Only include if: capitalized, 3+ chars, contains German letters (äöüß) OR ends in common German noun ending
  const re2 = /\b([A-ZÄÖÜ][a-zäöüß-]{2,})\b/g;
  // Filter: skip English words and category labels
  const englishWords = new Set(['Trap', 'Traps', 'Masc', 'Fem', 'Neut', 'Greek', 'Latin', 'English', 'French', 'German', 'Override', 'Overrides', 'Critical', 'Boundaries', 'Exceptions', 'Stem', 'Stems', 'Add', 'Plus', 'Varies', 'Drop', 'Drops', 'Rare', 'Common', 'Best', 'Worst', 'Note', 'Hint', 'Tip', 'Tips', 'Pronoun', 'Pronouns', 'Shift', 'Category', 'Gender', 'Plural', 'Article', 'Example', 'Examples', 'Word', 'Words', 'Tool', 'Tools', 'Bird', 'Birds', 'Loanword', 'Loanwords', 'Native', 'Foreign', 'Root', 'Root-dependent']);
  while ((m = re2.exec(text)) !== null) {
    const word = m[1];
    if (word.length > 2 && !englishWords.has(word) && !examples.find(e => e.word === word)) {
      // Sanity: must look like a German noun (allow compound containing - or hyphens)
      // Must contain at least 3 lowercase letters or a German special char
      const lc = word.slice(1);
      if (lc.length >= 3 && /[a-zäöüß]/.test(lc)) {
        examples.push({ word, plural: null, source: 'list' });
      }
    }
  }
  return examples;
}

// ============================================================================
// Build entries
// ============================================================================
const entries = spec.rows.map((r, i) => {
  const id = i + 1;
  return {
    spec_id: id,
    category: r['Rule Category'],
    indicator: r['Indicator / Ending'],
    dictated_gender: r['Dictated Gender'],
    dictated_gender_norm: normalizeGender(r['Dictated Gender']),
    plural: r['Plural Morphological Shift'],
    exceptions: r['Critical Boundaries & Exceptions'],
    examples: extractExamples(r['Critical Boundaries & Exceptions']),
    engine_rule_indices: SPEC_TO_ENGINE_MAP[id] || [],
  };
});

// ============================================================================
// Validate each example through engine
// ============================================================================
const ruleMismatches = [];
entries.forEach(e => {
  if (e.engine_rule_indices.length === 0) return;
  if (e.dictated_gender_norm === 'root') return;
  const matching = e.engine_rule_indices.map(idx => SUFFIX_RULES[idx]).filter(Boolean);
  const conflicts = matching.filter(r => r.gender !== e.dictated_gender_norm && r.gender !== 'root');
  if (conflicts.length > 0) {
    ruleMismatches.push({
      spec_id: e.spec_id,
      indicator: e.indicator,
      spec_gender: e.dictated_gender_norm,
      conflicting_rules: conflicts.map(r => ({
        index: SUFFIX_RULES.indexOf(r),
        suffix: r.suffix.source,
        gender: r.gender,
        score: r.score,
        note: r.note,
      })),
    });
  }
});

const testCases = [];
entries.forEach(e => {
  e.examples.forEach(ex => {
    let result;
    try {
      result = predict(ex.word);
    } catch (err) {
      result = { gender: null, tier: 'error', confidence: 0 };
    }
    testCases.push({
      spec_id: e.spec_id,
      category: e.category,
      indicator: e.indicator,
      word: ex.word,
      expected_gender: e.dictated_gender_norm,
      engine_gender: result.gender,
      engine_tier: result.tier,
      agrees: result.gender === e.dictated_gender_norm,
    });
  });
});

// ============================================================================
// Stats
// ============================================================================
const stats = {
  spec_entries: entries.length,
  engine_rules: SUFFIX_RULES.length,
  spec_with_engine_rules: entries.filter(e => e.engine_rule_indices.length > 0).length,
  spec_without_engine_rules: entries.filter(e => e.engine_rule_indices.length === 0).length,
  rule_mismatches: ruleMismatches.length,
  total_examples: testCases.length,
  examples_agrees: testCases.filter(t => t.agrees).length,
  examples_disagrees: testCases.filter(t => !t.agrees).length,
};

// ============================================================================
// Save JSON
// ============================================================================
fs.writeFileSync(path.join(__dirname, 'audit/rule-audit-v3.json'), JSON.stringify({
  stats,
  ruleMismatches,
  entries: entries.map(e => ({
    spec_id: e.spec_id,
    category: e.category,
    indicator: e.indicator,
    dictated_gender: e.dictated_gender_norm,
    engine_rule_indices: e.engine_rule_indices,
    engine_rule_display: e.engine_rule_indices.map(idx => `${idx}:${SUFFIX_RULES[idx].suffix.source}→${SUFFIX_RULES[idx].gender}(${SUFFIX_RULES[idx].score})`),
  })),
  test_cases: testCases,
}, null, 2));

// ============================================================================
// Generate Study Guide Markdown
// ============================================================================
function mdGender(g) {
  if (g === 'der') return '**der** 🔵';
  if (g === 'die') return '**die** 🔴';
  if (g === 'das') return '**das** 🟢';
  if (g === 'root') return '*root-dep* ⚪';
  return g;
}

function mdPlural(p) {
  if (!p) return '—';
  const lower = p.toLowerCase();
  if (lower.includes('no change')) return '*no change*';
  if (lower.includes('add -s')) return 'add **-s**';
  if (lower.includes('add -nen')) return 'add **-nen**';
  if (lower.includes('add -se')) return 'add **-se**';
  if (lower.includes('add -en')) {
    if (lower.includes('+ umlaut')) return 'add **-en** + Umlaut';
    return 'add **-en**';
  }
  if (lower.includes('add -er')) {
    if (lower.includes('+ umlaut')) return 'add **-er** + Umlaut';
    return 'add **-er**';
  }
  if (lower.includes('add -e')) {
    if (lower.includes('+ umlaut')) return 'add **-e** + Umlaut';
    return 'add **-e**';
  }
  if (lower.includes('drop suffix')) return 'drop suffix + add -en';
  if (lower.includes('varies')) return '*varies*';
  if (lower.includes('uncountable')) return '*uncountable*';
  return p;
}

// Group by category
const byCategory = {};
entries.forEach(e => {
  if (!byCategory[e.category]) byCategory[e.category] = [];
  byCategory[e.category].push(e);
});

const categoryOrder = [
  'Supreme Structural', 'Supreme Semantic',
  'Structural (Fem)', 'Structural (Masc)', 'Structural (Neut)',
  'Phonetic (-b, -f)', 'Phonetic (-ee)', 'Phonetic (-d)',
  'Phonetic (-g)', 'Phonetic (-h)', 'Phonetic (-k)',
  'Phonetic (-l)', 'Phonetic (-m)', 'Phonetic (-pf)',
  'Phonetic (-r)', 'Phonetic (-s)', 'Phonetic (-t)',
  'Phonetic (-ort)', 'Phonetic (-z)',
  'Foreign Loans', 'Semantic',
];
const sortedCategories = Object.keys(byCategory).sort((a, b) => {
  const ai = categoryOrder.indexOf(a); const bi = categoryOrder.indexOf(b);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

let md = '';
md += '# 📚 German Noun Matrix — Master Study Guide\n\n';
md += '> **Source**: `German Noun Matrix` tab in Google Sheet (65 rule entries)\n';
md += '> **Engine**: `lib/gender-engine.js` (60 SUFFIX_RULES)\n';
md += '> **Generated**: 2026-07-31 23:00 MYT\n';
md += '> **Purpose**: Master reference for German noun gender + plural practice\n\n';

md += '---\n\n';

md += '## 📊 Audit Summary\n\n';
md += '| Metric | Value |\n|---|---|\n';
md += `| Spec rule entries | **${stats.spec_entries}** |\n`;
md += `| Engine SUFFIX_RULES | **${stats.engine_rules}** |\n`;
md += `| Spec entries mapped to engine rule(s) | ${stats.spec_with_engine_rules}/${stats.spec_entries} (${(stats.spec_with_engine_rules/stats.spec_entries*100).toFixed(0)}%) |\n`;
md += `| Spec entries without engine rule | ${stats.spec_without_engine_rules} |\n`;
md += `| Spec↔Engine rule mismatches | **${stats.rule_mismatches}** |\n`;
md += `| Example words extracted | ${stats.total_examples} |\n`;
md += `| Engine agrees with spec on examples | **${stats.examples_agrees}/${stats.total_examples}** (${stats.total_examples > 0 ? (stats.examples_agrees/stats.total_examples*100).toFixed(1) : '—'}%) |\n`;
md += `| Engine disagrees | ${stats.examples_disagrees} |\n\n`;

md += '## 🎯 How To Use This Guide\n\n';
md += '1. **Category** = which tier the rule belongs to (Supreme → Structural → Phonetic → Foreign Loans → Semantic)  \n';
md += '2. **Pattern** = what ending or shape to look for  \n';
md += '3. **Gender** = the article (der/die/das) the pattern dictates  \n';
md += '4. **Plural** = how the plural is formed  \n';
md += '5. **Boundaries** = critical exceptions, traps, and edge cases  \n';
md += '6. **Practice** = example words to drill  \n';
md += '7. **Engine status** = which engine rule covers this (✅ agrees / ⚠️ partial / 🚫 no rule)  \n\n';

md += '**Legend**:  \n';
md += '- 🔵 der / 🔴 die / 🟢 das — gender of the article  \n';
md += '- ✅ Engine rule agrees with spec  \n';
md += '- ⚠️ Engine rule partially matches or has known weakness  \n';
md += '- 🚫 No direct engine suffix rule — relies on lookup, compound, or semantic tier  \n\n';

md += '---\n\n';

sortedCategories.forEach(cat => {
  md += `## 📂 ${cat}\n\n`;
  
  byCategory[cat].forEach(e => {
    md += `### Rule #${e.spec_id}: ${e.indicator}\n\n`;
    md += `| Field | Value |\n|---|---|\n`;
    md += `| **Gender** | ${mdGender(e.dictated_gender_norm)} |\n`;
    md += `| **Plural** | ${mdPlural(e.plural)} |\n`;
    
    if (e.engine_rule_indices.length === 0) {
      md += `| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |\n`;
    } else {
      const rules = e.engine_rule_indices.map(idx => {
        const r = SUFFIX_RULES[idx];
        const suffix = r.suffix.source;
        const agrees = r.gender === e.dictated_gender_norm || r.gender === 'root';
        return `${agrees ? '✅' : '⚠️'} Rule ${idx}: \`${suffix}\` → ${r.gender} (score ${r.score})`;
      });
      md += `| **Engine Rule(s)** | ${rules.join('<br>')} |\n`;
    }
    
    md += '\n';
    
    if (e.exceptions && e.exceptions.trim()) {
      md += `**Critical Boundaries & Exceptions:**\n\n`;
      md += `> ${e.exceptions}\n\n`;
    }
    
    if (e.examples && e.examples.length > 0) {
      md += `**📝 Practice examples** (${e.examples.length}):\n\n`;
      e.examples.forEach(ex => {
        const plural = ex.plural ? ` → ${ex.plural}` : '';
        let engineGuess = '';
        try {
          const r = predict(ex.word);
          const mark = r.gender === e.dictated_gender_norm ? '✓' : '✗';
          engineGuess = ` <sub>${mark} engine: ${r.gender} (${r.tier})</sub>`;
        } catch (err) {
          engineGuess = ` <sub>✗ engine error</sub>`;
        }
        md += `- \`${ex.word}\`${plural}${engineGuess}\n`;
      });
      md += '\n';
    }
    
    md += '---\n\n';
  });
});

// Add rule mismatch report
if (ruleMismatches.length > 0) {
  md += '## ⚠️ Rule Mismatches (spec says X, engine rule says Y)\n\n';
  md += 'These are places where the engine\'s suffix rule disagrees with the spec. Often the engine is correct via lookup, but the rule itself is fragile:\n\n';
  md += '| Spec Rule | Indicator | Spec Gender | Conflicting Engine Rules |\n|---|---|---|---|\n';
  ruleMismatches.forEach(m => {
    const conflictStr = m.conflicting_rules.map(c => 
      `Rule ${c.index}: \`${c.suffix}\` → ${c.gender} (score ${c.score})`
    ).join('<br>');
    md += `| #${m.spec_id} | ${m.indicator} | ${mdGender(m.spec_gender)} | ${conflictStr} |\n`;
  });
  md += '\n';
}

// Add spec rules without direct engine rule
const noRuleEntries = entries.filter(e => e.engine_rule_indices.length === 0);
if (noRuleEntries.length > 0) {
  md += `## 🚫 Spec Rules Without Direct Engine Suffix Rule (${noRuleEntries.length})\n\n`;
  md += 'These rely on lookup tables (A1/A2, TopFreq, Sheet) or compound decomposition. Engine can still get them right via memory, but won\'t generalize:\n\n';
  md += '| # | Category | Indicator | Gender |\n|---|---|---|---|\n';
  noRuleEntries.forEach(e => {
    md += `| ${e.spec_id} | ${e.category} | ${e.indicator} | ${mdGender(e.dictated_gender_norm)} |\n`;
  });
  md += '\n';
}

md += '## 🎓 Practice Order Recommendation\n\n';
md += 'Based on the rule reliability (high score + low exceptions), study in this order:\n\n';
md += '1. **Supreme Structural** (1 rule): `-chen, -lein` → always das  \n';
md += '2. **Supreme Semantic** (2 rules): male humans/animals → der; metals → das  \n';
md += '3. **Structural Fem** (high reliability): `-ung, -heit, -keit, -schaft, -ion, -tur, -ik, -in, -ei`  \n';
md += '4. **Structural Masc** (high reliability): `-ismus, -ent, -ant, -ist, -ig`  \n';
md += '5. **Structural Neut** (high reliability): `-nis, -um, -tum, -ment, -ma`  \n';
md += '6. **Phonetic** (medium reliability, study patterns one letter at a time)  \n';
md += '7. **Foreign Loans** (root-dependent, learn by exposure)  \n';
md += '8. **Compounds** (last word governs)  \n\n';

md += '## 🔁 Drill Strategy\n\n';
md += 'For each rule:\n';
md += '1. Read the indicator and dictated gender  \n';
md += '2. Make up 3 example words matching the pattern  \n';
md += '3. Try to remember 1 trap from the exceptions  \n';
md += '4. Move to next rule only after you can produce 5 correct words in 30 seconds  \n\n';

md += '---\n\n';
md += '*Generated by rule-audit-v3.cjs · For Jasper\'s noun practice*\n';

fs.writeFileSync(path.join(__dirname, 'audit/study-guide.md'), md);

// Console summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('  RULE AUDIT V3 — Explicit mapping + word-level test');
console.log('═══════════════════════════════════════════════════════════════');
console.log();
console.log('Spec rule entries:           ' + stats.spec_entries);
console.log('Engine SUFFIX_RULES:         ' + stats.engine_rules);
console.log('Spec mapped to engine rule:  ' + stats.spec_with_engine_rules + '/' + stats.spec_entries + ' (' + (stats.spec_with_engine_rules/stats.spec_entries*100).toFixed(0) + '%)');
console.log('Spec WITHOUT engine rule:    ' + stats.spec_without_engine_rules);
console.log('Rule mismatches:             ' + stats.rule_mismatches);
console.log('Total example words:         ' + stats.total_examples);
console.log('Engine agrees on examples:   ' + stats.examples_agrees + '/' + stats.total_examples + ' (' + (stats.examples_agrees/stats.total_examples*100).toFixed(1) + '%)');
console.log('Engine disagrees on examples: ' + stats.examples_disagrees);
console.log();
console.log('Outputs:');
console.log('  - audit/rule-audit-v3.json');
console.log('  - audit/study-guide.md  ← THE STUDY GUIDE');

if (ruleMismatches.length > 0) {
  console.log();
  console.log('═══ RULE MISMATCHES (spec ≠ engine rule) ═══');
  ruleMismatches.forEach(m => {
    console.log('  Rule ' + m.spec_id + ': ' + m.indicator + ' → spec=' + m.spec_gender);
    m.conflicting_rules.forEach(c => {
      console.log('     engine rule ' + c.index + ': ' + c.suffix + ' → ' + c.gender + ' (score ' + c.score + ')');
    });
  });
}
