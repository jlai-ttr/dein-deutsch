'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

interface SheetVocabRow {
  id: string;
  de: string;
  en: string;
  pos: string;
  level: string;
  pronunciation?: string;
  ipa?: string;
  gender?: string;
  plural?: string;
  example_de?: string;
  example_en?: string;
}

interface Translation {
  text: string;
  pronunciation: string;
  example?: string;
  source: 'sheet' | 'dictionary' | 'fallback';
  matchedId?: string;
  pos?: string;
  level?: string;
  gender?: string;
  plural?: string;
}

const DICT_DE_TO_EN: Record<string, { en: string; pronunciation: string; example?: string }> = {
  'hallo': { en: 'hello', pronunciation: 'HAH-loh', example: 'Hallo, wie geht es dir?' },
  'tschuess': { en: 'bye', pronunciation: 'CHOOSS', example: 'Tschüss, bis morgen!' },
  'tschuß': { en: 'bye', pronunciation: 'CHOOSS', example: 'Tschüss, bis morgen!' },
  'tschüss': { en: 'bye (informal)', pronunciation: 'CHOOSS', example: 'Tschüss, bis morgen!' },
  'danke': { en: 'thanks', pronunciation: 'DAHN-keh', example: 'Vielen Dank für deine Hilfe.' },
  'bitte': { en: 'please / you\'re welcome', pronunciation: 'BIT-teh', example: 'Einen Kaffee, bitte.' },
  'ja': { en: 'yes', pronunciation: 'YAH' },
  'nein': { en: 'no', pronunciation: 'NAYN' },
  'ich': { en: 'I', pronunciation: 'IKH', example: 'Ich bin Student.' },
  'du': { en: 'you (informal)', pronunciation: 'DOO', example: 'Wo wohnst du?' },
  'er': { en: 'he', pronunciation: 'AIR' },
  'sie': { en: 'she / they / formal you', pronunciation: 'ZEE' },
  'es': { en: 'it', pronunciation: 'ESS' },
  'wir': { en: 'we', pronunciation: 'VEER' },
  'ihr': { en: 'you (plural)', pronunciation: 'EER' },
  'der mann': { en: 'man', pronunciation: 'dair MAHN', example: 'Der Mann liest ein Buch.' },
  'die frau': { en: 'woman', pronunciation: 'dee FROW', example: 'Die Frau arbeitet hier.' },
  'das kind': { en: 'child', pronunciation: 'dass KINT', example: 'Das Kind spielt im Park.' },
  'das haus': { en: 'house', pronunciation: 'dass HOWS' },
  'das auto': { en: 'car', pronunciation: 'dass OW-toh' },
  'die stadt': { en: 'city', pronunciation: 'dee SHTAT' },
  'das buch': { en: 'book', pronunciation: 'dass BOOKH' },
  'die zeit': { en: 'time', pronunciation: 'dee TSAYT' },
  'die mutter': { en: 'mother', pronunciation: 'dee MOO-ter' },
  'der vater': { en: 'father', pronunciation: 'dair FAH-ter' },
  'der bruder': { en: 'brother', pronunciation: 'dair BROO-der' },
  'die schwester': { en: 'sister', pronunciation: 'dee SHVES-ter' },
  'das brot': { en: 'bread', pronunciation: 'dass BROAT' },
  'das wasser': { en: 'water', pronunciation: 'dass VAH-ser' },
  'der kaffee': { en: 'coffee', pronunciation: 'dair KAF-ay' },
  'der tee': { en: 'tea', pronunciation: 'dair TAY' },
  'sein': { en: 'to be', pronunciation: 'ZAYN', example: 'Ich bin müde.' },
  'haben': { en: 'to have', pronunciation: 'HAH-ben', example: 'Wir haben Hunger.' },
  'gehen': { en: 'to go / to walk', pronunciation: 'GAY-en', example: 'Ich gehe zur Schule.' },
  'kommen': { en: 'to come', pronunciation: 'KOM-en', example: 'Er kommt heute.' },
  'machen': { en: 'to do / to make', pronunciation: 'MAKH-en', example: 'Was machst du?' },
  'wohnen': { en: 'to live / reside', pronunciation: 'VOH-nen', example: 'Ich wohne in Berlin.' },
  'arbeiten': { en: 'to work', pronunciation: 'AR-bai-ten', example: 'Sie arbeitet im Büro.' },
  'lernen': { en: 'to learn', pronunciation: 'LER-nen', example: 'Ich lerne Deutsch.' },
  'essen': { en: 'to eat', pronunciation: 'ESS-en', example: 'Wir essen jetzt.' },
  'trinken': { en: 'to drink', pronunciation: 'TRING-ken', example: 'Er trinkt Kaffee.' },
  'sprechen': { en: 'to speak', pronunciation: 'SHPREKH-en', example: 'Sprechen Sie Englisch?' },
  'lesen': { en: 'to read', pronunciation: 'LAY-zen', example: 'Ich lese ein Buch.' },
  'helfen': { en: 'to help', pronunciation: 'HEL-fen', example: 'Kannst du mir helfen?' },
  'gut': { en: 'good', pronunciation: 'GOOT', example: 'Das Essen ist gut.' },
  'schlecht': { en: 'bad', pronunciation: 'SHLEKHT' },
  'groß': { en: 'big / tall', pronunciation: 'GROASS' },
  'gross': { en: 'big / tall', pronunciation: 'GROASS' },
  'klein': { en: 'small', pronunciation: 'KLAYN' },
  'neu': { en: 'new', pronunciation: 'NOY' },
  'alt': { en: 'old', pronunciation: 'ALT' },
  'schön': { en: 'beautiful / nice', pronunciation: 'SHURN' },
  'schoen': { en: 'beautiful / nice', pronunciation: 'SHURN' },
  'müde': { en: 'tired', pronunciation: 'MYOO-deh' },
  'muede': { en: 'tired', pronunciation: 'MYOO-deh' },
  'heute': { en: 'today', pronunciation: 'HOY-teh' },
  'morgen': { en: 'tomorrow / morning', pronunciation: 'MOR-gen' },
  'gestern': { en: 'yesterday', pronunciation: 'GES-tern' },
  'jetzt': { en: 'now', pronunciation: 'YETST' },
  'eins': { en: 'one', pronunciation: 'AYNS' },
  'zwei': { en: 'two', pronunciation: 'TSVAY' },
  'drei': { en: 'three', pronunciation: 'DRY' },
  'vier': { en: 'four', pronunciation: 'FEER' },
  'fünf': { en: 'five', pronunciation: 'FUEENF' },
  'fuenf': { en: 'five', pronunciation: 'FUEENF' },
  'sechs': { en: 'six', pronunciation: 'ZEKS' },
  'sieben': { en: 'seven', pronunciation: 'ZEE-ben' },
  'acht': { en: 'eight', pronunciation: 'AKHT' },
  'neun': { en: 'nine', pronunciation: 'NOYN' },
  'zehn': { en: 'ten', pronunciation: 'TSAYN' },
  'rot': { en: 'red', pronunciation: 'ROAT' },
  'blau': { en: 'blue', pronunciation: 'BLOW' },
  'grün': { en: 'green', pronunciation: 'GROON' },
  'gruen': { en: 'green', pronunciation: 'GROON' },
};

const DICT_EN_TO_DE: Record<string, { de: string; pronunciation: string; example?: string }> = {
  'hello': { de: 'hallo', pronunciation: 'HAH-loh', example: 'Hallo, wie geht es dir?' },
  'hi': { de: 'hallo (informal)', pronunciation: 'HAH-loh' },
  'bye': { de: 'tschuess', pronunciation: 'CHOOSS' },
  'goodbye': { de: 'auf wiedersehen', pronunciation: 'OWF VEE-der-zayn' },
  'thanks': { de: 'danke', pronunciation: 'DAHN-keh' },
  'thank you': { de: 'danke', pronunciation: 'DAHN-keh' },
  'please': { de: 'bitte', pronunciation: 'BIT-teh' },
  'you\'re welcome': { de: 'bitte (you\'re welcome)', pronunciation: 'BIT-teh' },
  'yes': { de: 'ja', pronunciation: 'YAH' },
  'no': { de: 'nein', pronunciation: 'NAYN' },
  'i': { de: 'ich', pronunciation: 'IKH', example: 'Ich bin Student.' },
  'you': { de: 'du', pronunciation: 'DOO' },
  'he': { de: 'er', pronunciation: 'AIR' },
  'she': { de: 'sie', pronunciation: 'ZEE' },
  'they': { de: 'sie', pronunciation: 'ZEE' },
  'we': { de: 'wir', pronunciation: 'VEER' },
  'man': { de: 'der Mann', pronunciation: 'dair MAHN', example: 'Der Mann liest ein Buch.' },
  'woman': { de: 'die Frau', pronunciation: 'dee FROW' },
  'child': { de: 'das Kind', pronunciation: 'dass KINT' },
  'house': { de: 'das Haus', pronunciation: 'dass HOWS' },
  'home': { de: 'das Haus / nach Hause', pronunciation: 'dass HOWS' },
  'car': { de: 'das Auto', pronunciation: 'dass OW-toh' },
  'city': { de: 'die Stadt', pronunciation: 'dee SHTAT' },
  'book': { de: 'das Buch', pronunciation: 'dass BOOKH' },
  'time': { de: 'die Zeit', pronunciation: 'dee TSAYT' },
  'mother': { de: 'die Mutter', pronunciation: 'dee MOO-ter' },
  'mom': { de: 'die Mutter / Mama', pronunciation: 'dee MOO-ter' },
  'father': { de: 'der Vater', pronunciation: 'dair FAH-ter' },
  'dad': { de: 'der Vater / Papa', pronunciation: 'dair FAH-ter' },
  'brother': { de: 'der Bruder', pronunciation: 'dair BROO-der' },
  'sister': { de: 'die Schwester', pronunciation: 'dee SHVES-ter' },
  'bread': { de: 'das Brot', pronunciation: 'dass BROAT' },
  'water': { de: 'das Wasser', pronunciation: 'dass VAH-ser' },
  'coffee': { de: 'der Kaffee', pronunciation: 'dair KAF-ay' },
  'tea': { de: 'der Tee', pronunciation: 'dair TAY' },
  'beer': { de: 'das Bier', pronunciation: 'dass BEER' },
  'wine': { de: 'der Wein', pronunciation: 'dair VAYN' },
  'to be': { de: 'sein', pronunciation: 'ZAYN', example: 'Ich bin müde.' },
  'to have': { de: 'haben', pronunciation: 'HAH-ben' },
  'to go': { de: 'gehen', pronunciation: 'GAY-en' },
  'to come': { de: 'kommen', pronunciation: 'KOM-en' },
  'to do': { de: 'machen / tun', pronunciation: 'MAKH-en' },
  'to make': { de: 'machen', pronunciation: 'MAKH-en' },
  'to live': { de: 'wohnen (reside) / leben (be alive)', pronunciation: 'VOH-nen' },
  'to work': { de: 'arbeiten', pronunciation: 'AR-bai-ten' },
  'to learn': { de: 'lernen', pronunciation: 'LER-nen' },
  'to eat': { de: 'essen', pronunciation: 'ESS-en' },
  'to drink': { de: 'trinken', pronunciation: 'TRING-ken' },
  'to speak': { de: 'sprechen', pronunciation: 'SHPREKH-en' },
  'to read': { de: 'lesen', pronunciation: 'LAY-zen' },
  'to help': { de: 'helfen', pronunciation: 'HEL-fen' },
  'good': { de: 'gut', pronunciation: 'GOOT' },
  'bad': { de: 'schlecht', pronunciation: 'SHLEKHT' },
  'big': { de: 'groß', pronunciation: 'GROASS' },
  'small': { de: 'klein', pronunciation: 'KLAYN' },
  'new': { de: 'neu', pronunciation: 'NOY' },
  'old': { de: 'alt', pronunciation: 'ALT' },
  'beautiful': { de: 'schön', pronunciation: 'SHURN' },
  'nice': { de: 'schön / nett', pronunciation: 'SHURN' },
  'tired': { de: 'müde', pronunciation: 'MYOO-deh' },
  'today': { de: 'heute', pronunciation: 'HOY-teh' },
  'tomorrow': { de: 'morgen', pronunciation: 'MOR-gen' },
  'yesterday': { de: 'gestern', pronunciation: 'GES-tern' },
  'now': { de: 'jetzt', pronunciation: 'YETST' },
  'one': { de: 'eins', pronunciation: 'AYNS' },
  'two': { de: 'zwei', pronunciation: 'TSVAY' },
  'three': { de: 'drei', pronunciation: 'DRY' },
  'four': { de: 'vier', pronunciation: 'FEER' },
  'five': { de: 'fünf', pronunciation: 'FUEENF' },
  'six': { de: 'sechs', pronunciation: 'ZEKS' },
  'seven': { de: 'sieben', pronunciation: 'ZEE-ben' },
  'eight': { de: 'acht', pronunciation: 'AKHT' },
  'nine': { de: 'neun', pronunciation: 'NOYN' },
  'ten': { de: 'zehn', pronunciation: 'TSAYN' },
  'red': { de: 'rot', pronunciation: 'ROAT' },
  'blue': { de: 'blau', pronunciation: 'BLOW' },
  'green': { de: 'grün', pronunciation: 'GROON' },
  'son': { de: 'der Sohn', pronunciation: 'dair ZOHN' },
  'daughter': { de: 'die Tochter', pronunciation: 'dee TOKH-ter' },
};

// Strip leading article + gender for matching ("der Mann" → "mann")
function stripArticle(s: string): string {
  return s.replace(/^(der|die|das|ein|eine|einen|einem|einer)\s+/i, '').trim();
}

// Normalize string for fuzzy matching: lowercase, trim, drop punctuation
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?;:]/g, '');
}

export default function TranslatePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'en-de' | 'de-en'>('en-de');
  const [result, setResult] = useState<Translation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<Array<{ input: string; dir: 'en-de' | 'de-en'; result: Translation }>>([]);
  const [sheetVocab, setSheetVocab] = useState<SheetVocabRow[]>([]);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [myVocabIds, setMyVocabIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dein-deutsch-theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    try {
      const h = localStorage.getItem('dein-deutsch-translate-history');
      if (h) setHistory(JSON.parse(h));
    } catch (e) {}
    try {
      const v = localStorage.getItem('dein-deutsch-woerter-v3');
      if (v) {
        const parsed = JSON.parse(v);
        const ids = new Set<string>();
        if (Array.isArray(parsed)) parsed.forEach((c: any) => { if (c.id) ids.add(c.id); });
        setMyVocabIds(ids);
      }
    } catch (e) {}

    // Fetch Sheet vocab in background
    fetch('/api/vocab')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.ok && Array.isArray(data.vocab)) {
          // Filter to single-word entries (skip phrases for clean lookup)
          const single = (data.vocab as SheetVocabRow[]).filter(v => {
            if (!v.de || !v.en) return false;
            // Skip if de has space AND no article ("im büro", etc.)
            // Keep nouns with articles (strip on lookup)
            return true;
          });
          setSheetVocab(single);
        }
      })
      .catch(() => { /* silent — fall back to hardcoded dict */ })
      .finally(() => setSheetLoading(false));
  }, []);

  // Build lookup maps for Sheet vocab
  const sheetDeIndex = useMemo(() => {
    const m = new Map<string, SheetVocabRow>();
    for (const row of sheetVocab) {
      const de = normalize(row.de);
      m.set(de, row);
      // Also index without article
      const stripped = normalize(stripArticle(row.de));
      if (stripped && stripped !== de) m.set(stripped, row);
    }
    return m;
  }, [sheetVocab]);

  const sheetEnIndex = useMemo(() => {
    const m = new Map<string, SheetVocabRow>();
    for (const row of sheetVocab) {
      const en = normalize(row.en);
      // EN side may have "the man" → also index "man"
      const stripped = normalize(en.replace(/^(a|an|the)\s+/i, ''));
      if (stripped && stripped !== en) m.set(stripped, row);
      m.set(en, row);
    }
    return m;
  }, [sheetVocab]);

  function lookupSheet(text: string, dir: 'en-de' | 'de-en'): SheetVocabRow | null {
    const n = normalize(text);
    const stripped = normalize(stripArticle(text));
    const idx = dir === 'en-de' ? sheetEnIndex : sheetDeIndex;
    return idx.get(n) || idx.get(stripped) || null;
  }

  function translate(text: string, direction: 'en-de' | 'de-en'): Translation | null {
    const cleaned = normalize(text);
    const dict = direction === 'en-de' ? DICT_EN_TO_DE : DICT_DE_TO_EN;

    // 1) Sheet first (your real vocab, larger + curated)
    const sheetHit = lookupSheet(text, direction);
    if (sheetHit) {
      const de = sheetHit.de;
      const en = sheetHit.en;
      // Build pronunciation from ipa or pronunciation, fallback to nothing
      const pronunciation = sheetHit.ipa || sheetHit.pronunciation || '';
      const example = sheetHit.example_de || sheetHit.example_en
        ? `${sheetHit.example_de || ''}${sheetHit.example_en ? ' — ' + sheetHit.example_en : ''}`
        : undefined;
      return {
        text: direction === 'en-de' ? de : en,
        pronunciation,
        example,
        source: 'sheet',
        matchedId: sheetHit.id,
        pos: sheetHit.pos,
        level: sheetHit.level,
        gender: sheetHit.gender,
        plural: sheetHit.plural,
      };
    }

    // 2) Hardcoded A1 dictionary fallback
    if (dict[cleaned]) {
      const result = dict[cleaned];
      return {
        text: direction === 'en-de' ? (result as any).de : (result as any).en,
        pronunciation: result.pronunciation,
        example: result.example,
        source: 'dictionary',
      };
    }
    const noPunct = cleaned.replace(/[.,!?;:]/g, '');
    if (dict[noPunct]) {
      const result = dict[noPunct];
      return {
        text: direction === 'en-de' ? (result as any).de : (result as any).en,
        pronunciation: result.pronunciation,
        example: result.example,
        source: 'dictionary',
      };
    }
    const firstWord = cleaned.split(/\s+/)[0];
    if (dict[firstWord]) {
      const result = dict[firstWord];
      return {
        text: direction === 'en-de' ? (result as any).de : (result as any).en,
        pronunciation: result.pronunciation,
        example: result.example,
        source: 'dictionary',
      };
    }

    return null;
  }

  function doTranslate() {
    if (!input.trim()) return;
    const r = translate(input, direction);
    if (r) {
      setResult(r);
      setNotFound(false);
      const entry = { input: input.trim(), dir: direction, result: r };
      const next = [entry, ...history.filter(h => h.input !== entry.input)].slice(0, 15);
      setHistory(next);
      localStorage.setItem('dein-deutsch-translate-history', JSON.stringify(next));
    } else {
      setResult(null);
      setNotFound(true);
    }
  }

  function addToMyVocab() {
    if (!result || result.source !== 'sheet' || !result.matchedId) return;
    const id = result.matchedId;
    const de = result.text;
    const en = direction === 'en-de' ? input : result.text;
    const rawDe = direction === 'en-de' ? result.text : input;
    // Use the sheet row's pos/gender/etc.
    const sheetRow = sheetVocab.find(r => r.id === id);
    const newCard = {
      id,
      word: rawDe,
      translation: en,
      pos: sheetRow?.pos || 'noun',
      gender: sheetRow?.gender || '',
      level: sheetRow?.level || 'A1',
      example: sheetRow?.example_de || '',
      exampleEn: sheetRow?.example_en || '',
      audio: undefined,
      interval: 0,
      repetition: 0,
      ef: 2.5,
      due: Date.now(),
      lapses: 0,
      totalReviews: 0,
      lastReviewed: undefined,
      addedAt: Date.now(),
    };
    try {
      const raw = localStorage.getItem('dein-deutsch-woerter-v3');
      const arr = raw ? JSON.parse(raw) : [];
      // Avoid duplicates
      if (!arr.some((c: any) => c.id === id)) {
        const next = [newCard, ...arr];
        localStorage.setItem('dein-deutsch-woerter-v3', JSON.stringify(next));
        setMyVocabIds(prev => new Set([...prev, id]));
      }
    } catch (e) {
      // ignore — localStorage may be unavailable
    }
  }

  function clearAll() {
    setInput('');
    setResult(null);
    setNotFound(false);
  }

  if (!mounted) return null;
  const t = getTheme(theme);
  const inMyVocab = result?.matchedId ? myVocabIds.has(result.matchedId) : false;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Translate · Wörterbuch
            </div>
            <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              English ↔ German
            </h1>
            <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
              {sheetLoading ? 'Loading your vocab…' : `${sheetVocab.length} words from your Sheet · ${Object.keys(DICT_DE_TO_EN).length} A1 starters`}
            </p>
          </div>
          {sheetVocab.length > 0 && (
            <span style={{
              padding: '4px 10px', background: t.success + '22', color: t.success,
              borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, fontFamily: FONTS.mono,
            }}>
              ● SHEET LIVE
            </span>
          )}
        </div>
      </div>

      {/* Direction toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', background: t.cardBg,
        border: '1px solid ' + t.border, borderRadius: 8,
        padding: 8, marginBottom: 16,
      }}>
        <button
          onClick={() => setDirection('en-de')}
          style={{
            flex: 1, padding: '10px', borderRadius: 6,
            background: direction === 'en-de' ? t.accent : 'transparent',
            color: direction === 'en-de' ? t.onAccent : t.text,
            border: 'none', fontWeight: direction === 'en-de' ? 700 : 400,
            cursor: 'pointer', fontFamily: FONTS.body, fontSize: '0.95rem',
            transition: 'all 0.15s',
          }}
        >
          English → Deutsch
        </button>
        <button
          onClick={() => setDirection('de-en')}
          style={{
            flex: 1, padding: '10px', borderRadius: 6,
            background: direction === 'de-en' ? t.accent : 'transparent',
            color: direction === 'de-en' ? t.onAccent : t.text,
            border: 'none', fontWeight: direction === 'de-en' ? 700 : 400,
            cursor: 'pointer', fontFamily: FONTS.body, fontSize: '0.95rem',
            transition: 'all 0.15s',
          }}
        >
          Deutsch → English
        </button>
      </div>

      {/* Input */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 16, marginBottom: 16, boxShadow: t.shadow,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doTranslate()}
          placeholder={direction === 'en-de' ? 'Type English word (e.g., son, mother, learn)' : 'Tippe deutsches Wort (z.B. Sohn, Mutter, lernen)'}
          style={{
            width: '100%', padding: '14px 16px',
            background: t.inputBg, color: t.text,
            border: '1px solid ' + t.border, borderRadius: 8,
            fontSize: '1.1rem', fontFamily: FONTS.reading,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={doTranslate}
            disabled={!input.trim()}
            style={{
              flex: 1, padding: '12px 24px',
              background: input.trim() ? t.accent : t.border,
              color: t.onAccent, border: 'none', borderRadius: 10,
              fontSize: '1rem', fontWeight: 700,
              fontFamily: FONTS.display, letterSpacing: '0.05em',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.5,
              boxShadow: input.trim() ? '0 4px 0 ' + t.accentHover : 'none',
            }}
          >
            🔍 Übersetzen
          </button>
          <button
            onClick={clearAll}
            style={{
              padding: '12px 20px',
              background: 'transparent', color: t.textMuted,
              border: '1px solid ' + t.border, borderRadius: 10,
              fontSize: '0.95rem', cursor: 'pointer',
              fontFamily: FONTS.body,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          background: result.source === 'sheet' ? t.accentSoft : t.cardBg,
          border: '1px solid ' + t.accent,
          borderRadius: 12, padding: 24, marginBottom: 20,
          boxShadow: t.shadowStrong,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: '0.7rem', color: t.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {direction === 'en-de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {result.level && (
                <span style={{ padding: '2px 8px', background: t.bg, color: t.accent, borderRadius: 3, fontSize: '0.7rem', fontWeight: 700, fontFamily: FONTS.mono }}>
                  {result.level}
                </span>
              )}
              {result.pos && (
                <span style={{ padding: '2px 8px', background: t.bg, color: t.textMuted, borderRadius: 3, fontSize: '0.7rem', fontFamily: FONTS.mono }}>
                  {result.pos}
                </span>
              )}
              <span style={{
                padding: '2px 8px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600,
                background: result.source === 'sheet' ? t.success + '22' : t.bg,
                color: result.source === 'sheet' ? t.success : t.textMuted,
                fontFamily: FONTS.mono,
              }}>
                {result.source === 'sheet' ? '📚 YOUR SHEET' : '📖 A1 STARTER'}
              </span>
            </div>
          </div>

          <div style={{
            fontFamily: FONTS.display, fontSize: '2.4rem', fontWeight: 700,
            color: t.text, marginBottom: 8, letterSpacing: '-0.01em',
          }}>
            {result.text}
          </div>

          {(result.gender || result.plural) && (
            <div style={{ marginBottom: 8, fontFamily: FONTS.reading, color: t.textMuted, fontStyle: 'italic' }}>
              {result.gender && <span style={{ marginRight: 12 }}><strong>{result.gender}</strong> {result.text}</span>}
              {result.plural && <span>pl: {result.plural}</span>}
            </div>
          )}

          {result.pronunciation && (
            <div style={{
              fontFamily: FONTS.mono, fontSize: '0.95rem', color: t.textMuted,
              padding: '6px 12px', background: t.bg, borderRadius: 6,
              display: 'inline-block', letterSpacing: '0.05em',
              marginTop: 4,
            }}>
              {result.pronunciation}
            </div>
          )}

          {result.example && (
            <div style={{
              marginTop: 16, padding: 12, background: t.cardBg,
              borderRadius: 8, border: '1px dashed ' + t.accent,
            }}>
              <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Beispielsatz · Example
              </div>
              <div style={{ fontFamily: FONTS.reading, fontSize: '0.95rem', color: t.text, fontStyle: 'italic' }}>
                {result.example}
              </div>
            </div>
          )}

          {/* Add to my vocab (only for Sheet hits not already in my vocab) */}
          {result.source === 'sheet' && result.matchedId && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed ' + t.border }}>
              {inMyVocab ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: '0.85rem', color: t.success, fontFamily: FONTS.body, fontWeight: 600,
                }}>
                  ✓ Already in your vocab ({myVocabIds.size} total)
                </div>
              ) : (
                <button
                  onClick={addToMyVocab}
                  style={{
                    padding: '8px 16px',
                    background: t.success, color: 'white',
                    border: 'none', borderRadius: 6,
                    fontSize: '0.85rem', fontWeight: 600,
                    fontFamily: FONTS.body, cursor: 'pointer',
                    boxShadow: '0 2px 0 ' + t.success + 'cc',
                  }}
                >
                  ＋ Add to my vocab
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Not found */}
      {notFound && !result && (
        <div style={{
          background: t.cardBg, border: '1px dashed ' + t.border,
          borderRadius: 12, padding: 24, marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📖</div>
          <p style={{ fontFamily: FONTS.reading, color: t.textMuted, fontStyle: 'italic' }}>
            "<strong style={{ color: t.text }}>{input}</strong>" nicht gefunden.
          </p>
          <p style={{ fontSize: '0.85rem', color: t.textFaint, fontFamily: FONTS.reading, marginTop: 8 }}>
            {sheetVocab.length} words in your Sheet + {Object.keys(DICT_DE_TO_EN).length} A1 starters checked. Try <Link href="/admin/vocab" style={{ color: t.accent }}>adding to Sheet</Link>.
          </p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{
          background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
          padding: 20, boxShadow: t.shadow,
        }}>
          <h2 style={{ fontFamily: FONTS.display, fontSize: '1.2rem', color: t.text, margin: '0 0 12px' }}>
            Letzte Übersetzungen · Recent ({history.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.slice(0, 8).map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(h.input);
                  setDirection(h.dir);
                  setResult(h.result);
                  setNotFound(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: t.bg,
                  border: '1px solid ' + t.border, borderRadius: 6,
                  cursor: 'pointer', fontFamily: FONTS.body, fontSize: '0.85rem',
                  color: t.text, textAlign: 'left',
                }}
              >
                <span style={{ color: t.textMuted, fontSize: '0.75rem', minWidth: 30 }}>{h.dir === 'en-de' ? 'EN→' : 'DE→'}</span>
                <span style={{ fontWeight: 600 }}>{h.input}</span>
                <span style={{ color: t.textFaint }}>→</span>
                <span style={{ color: t.accent, flex: 1 }}>{h.result.text}</span>
                <span style={{ fontSize: '0.7rem', color: t.textFaint }}>{h.result.source === 'sheet' ? '📚' : '📖'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: t.textFaint, marginTop: 20, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        💡 Real apps use Gemini or DeepL for full coverage. Sheet-backed lookup covers your curated vocab.
      </p>
    </div>
  );
}