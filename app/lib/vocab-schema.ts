// app/lib/vocab-schema.ts
// Shared TypeScript types for Dein Deutsch content — must match Google Sheet columns exactly.
// Sheet is the AUTHORING layer. This file is the SOURCE OF TRUTH for types.

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type PosCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'numeral' | 'conjunction' | 'interjection' | 'phrase' | 'expression';
export type Gender = 'm' | 'f' | 'n';
export type Auxiliary = 'haben' | 'sein';

export interface VerbConjugation {
  ich: string;
  du: string;
  er: string;        // er/sie/es — Präsens 3rd pers sg
  wir: string;
  ihr: string;
  sie: string;       // sie/Sie — Präsens 3rd pers pl
}

export interface VocabMasterRow {
  // Identity
  id: string;                    // 'a1-001', 'biz-002', 'freq-247' — unique, kebab-case
  level: CEFRLevel;              // 'A1'
  topic: string;                 // 'starter' | 'business' | 'travel' | 'medical' | 'it' | 'freq' | 'daily' | 'kultur'
  is_active: 'TRUE' | 'FALSE';   // Soft-delete: FALSE hides card but keeps row for history

  // Core word
  de: string;                    // 'der Mann' — include article if noun, else bare word
  pos: PosCategory;              // 'noun' | 'verb' | 'adjective' | ...
  en: string;                    // 'man' — English meaning
  pronunciation: string;         // 'man' — IPA or simple phonetic, e.g. '/man/' or 'VAHN-der-loost'
  ipa: string;                   // '/man/' — strict IPA (preferred). If empty, fallback to pronunciation.

  // NOUN-specific (only when pos === 'noun')
  gender?: Gender;               // 'm' | 'f' | 'n'
  plural?: string;               // 'die Männer' | '—' | '(keine Plural)'
  genitive?: string;             // 'des Mannes' (optional — only for m/n nouns that need it)

  // VERB-specific (only when pos === 'verb')
  separable?: 'TRUE' | 'FALSE';  // Is it a trennbares Verb?
  prefix?: string;               // 'auf' | 'mit' | 'an' (only if separable)
  verb_aux?: Auxiliary;          // 'haben' | 'sein'
  verb_praeteritum?: string;     // 'ging' (3rd pers sg Präteritum)
  verb_partizip_ii?: string;     // 'gegangen'
  conjugation_ich?: string;
  conjugation_du?: string;
  conjugation_er?: string;
  conjugation_wir?: string;
  conjugation_ihr?: string;
  conjugation_sie?: string;

  // ADJECTIVE-specific (only when pos === 'adjective')
  comparative?: string;          // 'größer'
  superlative?: string;          // 'am größten'

  // Examples (always helpful, optional but preferred)
  example_de?: string;           // 'Der Mann geht zur Arbeit.'
  example_en?: string;           // 'The man goes to work.'
  notes?: string;                // Mnemonic, etymology, anything

  // Metadata
  updated_at: string;            // ISO date '2026-07-30' — set when row is edited
}

export interface WortDesTagesRow {
  word: string;
  category: PosCategory;
  gender?: Gender;
  plural?: string;
  genitive?: string;
  pronunciation: string;
  ipa: string;
  meaning: string;               // German meaning (primary)
  meaning_en?: string;
  example: string;               // German example
  example_en?: string;
  // VERB-specific
  separable?: 'TRUE' | 'FALSE';
  prefix?: string;
  verb_aux?: Auxiliary;
  verb_praeteritum?: string;
  verb_partizip_ii?: string;
  conjugation_ich?: string;
  conjugation_du?: string;
  conjugation_er?: string;
  conjugation_wir?: string;
  conjugation_ihr?: string;
  conjugation_sie?: string;
  // ADJECTIVE-specific
  comparative?: string;
  superlative?: string;
  // Ordering
  sort_index: number;            // 0, 1, 2... — day-of-year mod N picks row[dayOfYear % N]
  is_active: 'TRUE' | 'FALSE';   // Set FALSE to retire a word without losing the row
  updated_at: string;
}

// === SHEET COLUMN ORDERS ===
// MUST match your Google Sheet tab layout exactly.

// Row 1 of 'vocab_master' tab — paste these as the header row:
export const VOCAB_MASTER_HEADERS = [
  'id', 'level', 'topic', 'is_active',
  'de', 'pos', 'en', 'pronunciation', 'ipa',
  'gender', 'plural', 'genitive',
  'separable', 'prefix', 'verb_aux', 'verb_praeteritum', 'verb_partizip_ii',
  'conjugation_ich', 'conjugation_du', 'conjugation_er', 'conjugation_wir', 'conjugation_ihr', 'conjugation_sie',
  'comparative', 'superlative',
  'example_de', 'example_en', 'notes',
  'updated_at',
];

// Row 1 of 'wort_des_tages' tab:
export const WORT_DES_TAGES_HEADERS = [
  'word', 'category', 'gender', 'plural', 'genitive',
  'pronunciation', 'ipa',
  'meaning', 'meaning_en', 'example', 'example_en',
  'separable', 'prefix', 'verb_aux', 'verb_praeteritum', 'verb_partizip_ii',
  'conjugation_ich', 'conjugation_du', 'conjugation_er', 'conjugation_wir', 'conjugation_ihr', 'conjugation_sie',
  'comparative', 'superlative',
  'sort_index', 'is_active', 'updated_at',
];

// === HELPER: derive der/die/das from gender ===
export function getArticle(g?: Gender): string {
  if (g === 'm') return 'der';
  if (g === 'f') return 'die';
  if (g === 'n') return 'das';
  return '';
}

// === HELPER: build display noun declension ===
export function formatNounDeclension(row: { gender?: Gender; plural?: string; genitive?: string }): string {
  const article = getArticle(row.gender);
  if (!article) return '';
  const plural = row.plural || '—';
  return `${article} (Pl: ${plural})`;
}

// === VALIDATION (used by API endpoint) ===
export function validateVocabRow(row: Partial<VocabMasterRow>): string[] {
  const errors: string[] = [];
  if (!row.id) errors.push('id required');
  if (!row.level) errors.push('level required');
  if (!row.de) errors.push('de required');
  if (!row.pos) errors.push('pos required');
  if (row.pos === 'noun' && !row.gender) errors.push(`noun "${row.de}" missing gender`);
  if (row.pos === 'noun' && !row.plural) errors.push(`noun "${row.de}" missing plural`);
  if (row.pos === 'verb' && !row.verb_praeteritum) errors.push(`verb "${row.de}" missing verb_praeteritum`);
  if (row.pos === 'verb' && !row.verb_partizip_ii) errors.push(`verb "${row.de}" missing verb_partizip_ii`);
  if (row.is_active && !['TRUE', 'FALSE'].includes(row.is_active)) errors.push('is_active must be TRUE/FALSE');
  return errors;
}