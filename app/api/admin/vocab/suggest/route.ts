// app/api/admin/vocab/suggest/route.ts
// POST /api/admin/vocab/suggest — given a German noun, return gender + plural candidate.
// Uses the 99.6%-accurate engine + suffix rules. No admin required (read-only endpoint).

import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { predict: predictGender } = require('@/lib/gender-engine');

export const dynamic = 'force-dynamic';

// Article-aware tokenizer: 'der Tisch' → { stem: 'Tisch', article: 'der' }
//                         'Tisch'    → { stem: 'Tisch', article: null }
function tokenize(word: string): { stem: string; article: 'der' | 'die' | 'das' | null } {
  const m = word.match(/^(der|die|das)\s+(.+)$/i);
  if (m) return { stem: m[2].trim(), article: m[1].toLowerCase() as 'der' | 'die' | 'das' };
  return { stem: word.trim(), article: null };
}

function articleToGender(a: 'der' | 'die' | 'das'): 'm' | 'f' | 'n' {
  return a === 'der' ? 'm' : a === 'die' ? 'f' : 'n';
}

function pluralize(stem: string, gender: 'm' | 'f' | 'n'): string {
  // Heuristic plural rules. Good enough for common cases — admin can correct.
  // Returns 'die <form>' for display.
  const lower = stem.toLowerCase();

  // Loanwords ending in -s often keep -s
  if (/(Laptop|Computer|Ticket|Team|Restaurant|Hotel)$/.test(stem)) return 'die ' + stem + 's';

  // Feminine: often -en or -n or -s
  if (gender === 'f') {
    if (/e$/.test(stem) && !/(e|ie|ee)$/.test(stem)) return 'die ' + stem + 'n'; // Lampe → Lampen
    if (/ung$/.test(stem)) return 'die ' + stem + 'en'; // Zeitung → Zeitungen
    if (/tion$/.test(stem)) return 'die ' + stem + 'en'; // Aktion → Aktionen
    if (/heit$|keit$/.test(stem)) return 'die ' + stem + 'en'; // Freiheit → Freiheiten
    if (/ie$/.test(stem)) return 'die ' + stem + 'n'; // Energie → Energien
    return 'die ' + stem + 'en';
  }

  // Neuter: often no plural or -en/-er/-s
  if (gender === 'n') {
    if (/ment$/.test(stem)) return 'die ' + stem + 's'; // Dokument → Dokumente (but often -e)
    if (/chen$|lein$/.test(stem)) return 'die ' + stem; // Mädchen → Mädchen
    if (/o$/.test(stem)) return 'die ' + stem + 's'; // Auto → Autos
    if (/ma$/.test(stem)) return 'die ' + stem + 'ta'; // Thema → Themen
    return 'die ' + stem + 'e'; // Jahr → Jahre
  }

  // Masculine
  if (/eur$/.test(stem)) return 'die ' + stem + 'e'; // Friseur → Friseure
  if (/ist$/.test(stem)) return 'die ' + stem + 'en'; // Tourist → Touristen
  if (/or$/.test(stem)) return 'die ' + stem + 'en'; // Autor → Autoren
  if (/ling$/.test(stem)) return 'die ' + stem + 'e'; // Frühling → Frühlinge
  if (/ent$/.test(stem)) return 'die ' + stem + 'en'; // Student → Studenten
  if (/ismus$/.test(stem)) return 'die ' + stem.replace(/ismus$/, 'ismen'); // Optimismus → Optimismen
  return 'die ' + stem + 'e'; // Tisch → Tische
}

export async function POST(request: Request) {
  console.log('[suggest] POST hit, typeof predictGender:', typeof predictGender);
  try {
    const body = await request.json() as { word?: string };
    if (!body.word || typeof body.word !== 'string') {
      return NextResponse.json({ ok: false, error: 'word required' }, { status: 400 });
    }

    const { stem, article } = tokenize(body.word);
    let predicted: 'der' | 'die' | 'das' | null = null;
    let confidence = 0;

    if (article) {
      predicted = article;
      confidence = 100; // user provided article
    } else {
      try {
        const result = predictGender(stem);
        // Engine returns 'der'/'die'/'das' for sheet matches but 'm'/'f'/'n' for tier 6.
        // Normalize to article form.
        const raw = result.gender;
        if (raw === 'm' || raw === 'der') predicted = 'der';
        else if (raw === 'f' || raw === 'die') predicted = 'die';
        else if (raw === 'n' || raw === 'das') predicted = 'das';
        else predicted = null;
        confidence = Math.round((result.confidence || 0) * 100);
      } catch (e) {
        console.error('[suggest] engine error:', (e as Error).message);
      }
    }

    if (!predicted) {
      return NextResponse.json({ ok: false, error: 'could not predict gender', stem, debug: { predictType: typeof predictGender } });
    }

    const gender = articleToGender(predicted);
    const plural = pluralize(stem, gender);

    return NextResponse.json({
      ok: true,
      input: body.word,
      stem,
      article: predicted,
      gender,
      plural,
      confidence,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}