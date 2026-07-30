// app/lib/use-sheet-vocab.ts
// Hook: load vocab from /api/vocab, merge with localStorage state.
// Returns a function that adds API-supplied cards to existing localStorage cards.

import { useEffect, useState } from 'react';

interface SheetVocabRow {
  id: string;
  level: string;
  topic: string;
  de: string;
  pos: string;
  en: string;
  pronunciation?: string;
  ipa?: string;
  gender?: string;
  plural?: string;
  genitive?: string;
  verb_aux?: string;
  verb_praeteritum?: string;
  verb_partizip_ii?: string;
  conjugation_ich?: string;
  conjugation_du?: string;
  conjugation_er?: string;
  conjugation_wir?: string;
  conjugation_ihr?: string;
  conjugation_sie?: string;
  comparative?: string;
  superlative?: string;
  example_de?: string;
  example_en?: string;
}

export interface VocabCard {
  id: string;
  word: string;
  translation: string;
  pos: string;
  gender?: string;
  level: string;
  example: string;
  exampleEn: string;
  audio?: string;
  interval: number;
  repetition: number;
  ef: number;
  due: number;
  lapses: number;
  lastReviewed?: number;
  totalReviews: number;
  correctReviews: number;
}

function newCardFromSheet(row: SheetVocabRow): Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'> {
  return {
    id: row.id,
    word: row.de,
    translation: row.en || '',
    pos: row.pos,
    gender: row.gender || undefined,
    level: row.level || 'A1',
    example: row.example_de || '',
    exampleEn: row.example_en || '',
    audio: row.ipa || row.pronunciation || undefined,
  };
}

export function useSheetVocab(): { sheetCards: SheetVocabRow[]; loading: boolean; error: string | null } {
  const [sheetCards, setSheetCards] = useState<SheetVocabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/vocab', { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && Array.isArray(data.vocab)) {
          setSheetCards(data.vocab);
        } else {
          setError(data.error || 'No vocab');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { sheetCards, loading, error };
}

export function mergeSheetIntoLocal<T extends { id: string }>(
  localCards: T[],
  sheetRows: SheetVocabRow[]
): T[] {
  if (sheetRows.length === 0) return localCards;
  const existingIds = new Set(localCards.map(c => c.id));
  const newOnes: T[] = [];
  for (const row of sheetRows) {
    if (!existingIds.has(row.id)) {
      const partial = newCardFromSheet(row) as unknown as T;
      // Add SM-2 defaults — only on objects that have those fields
      const card = partial as unknown as VocabCard;
      card.interval = 0;
      card.repetition = 0;
      card.ef = 2.5;
      card.due = Date.now();
      card.lapses = 0;
      card.totalReviews = 0;
      card.correctReviews = 0;
      newOnes.push(card as unknown as T);
    }
  }
  if (newOnes.length === 0) return localCards;
  return [...localCards, ...newOnes];
}

export type { VocabCard as SheetVocabCard };
