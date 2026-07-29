'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, Sparkles } from 'lucide-react';

interface VocabCard {
  id: number;
  de: string;
  en: string;
  my: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  interval: number;
  ease: number;
  due: number;
  reps: number;
}

const SEED_VOCAB: Omit<VocabCard, 'id' | 'interval' | 'ease' | 'due' | 'reps'>[] = [
  { de: 'Hallo', en: 'Hello', my: 'Helo', pronunciation: 'HAH-lo', example: 'Hallo, wie geht es dir?', exampleTranslation: 'Hello, how are you?', category: 'Greetings', level: 'A1' },
  { de: 'Guten Tag', en: 'Good day', my: 'Selamat hari', pronunciation: 'GOO-ten TAHK', example: 'Guten Tag, Herr Schmidt.', exampleTranslation: 'Good day, Mr. Schmidt.', category: 'Greetings', level: 'A1' },
  { de: 'Tschüss', en: 'Bye', my: 'Selamat tinggal', pronunciation: 'CHOOSS', example: 'Tschüss, bis morgen!', exampleTranslation: 'Bye, see you tomorrow!', category: 'Greetings', level: 'A1' },
  { de: 'Danke', en: 'Thanks', my: 'Terima kasih', pronunciation: 'DAHN-keh', example: 'Danke schön!', exampleTranslation: 'Thank you very much!', category: 'Greetings', level: 'A1' },
  { de: 'Bitte', en: 'Please', my: 'Sila', pronunciation: 'BIT-teh', example: 'Bitte, ein Bier.', exampleTranslation: 'A beer, please.', category: 'Greetings', level: 'A1' },
  { de: 'Ja', en: 'Yes', my: 'Ya', pronunciation: 'YAH', example: 'Ja, gerne.', exampleTranslation: 'Yes, gladly.', category: 'Basics', level: 'A1' },
  { de: 'Nein', en: 'No', my: 'Tidak', pronunciation: 'NAYNE', example: 'Nein, danke.', exampleTranslation: 'No, thanks.', category: 'Basics', level: 'A1' },
  { de: 'Wasser', en: 'Water', my: 'Air', pronunciation: 'VAH-ser', example: 'Ein Glas Wasser, bitte.', exampleTranslation: 'A glass of water, please.', category: 'Food', level: 'A1' },
  { de: 'Kaffee', en: 'Coffee', my: 'Kopi', pronunciation: 'KAF-fay', example: 'Kaffee oder Tee?', exampleTranslation: 'Coffee or tea?', category: 'Food', level: 'A1' },
  { de: 'Brot', en: 'Bread', my: 'Roti', pronunciation: 'BROAT', example: 'Ich esse Brot.', exampleTranslation: 'I eat bread.', category: 'Food', level: 'A1' },
  { de: 'Auto', en: 'Car', my: 'Kereta', pronunciation: 'OW-toh', example: 'Mein Auto ist neu.', exampleTranslation: 'My car is new.', category: 'Transport', level: 'A1' },
  { de: 'Haus', en: 'House', my: 'Rumah', pronunciation: 'HOWS', example: 'Mein Haus ist groß.', exampleTranslation: 'My house is big.', category: 'Home', level: 'A1' },
  { de: 'Familie', en: 'Family', my: 'Keluarga', pronunciation: 'fa-MEE-li-eh', example: 'Meine Familie ist groß.', exampleTranslation: 'My family is big.', category: 'Family', level: 'A1' },
  { de: 'Vater', en: 'Father', my: 'Bapa', pronunciation: 'FAH-ter', example: 'Mein Vater ist 50.', exampleTranslation: 'My father is 50.', category: 'Family', level: 'A1' },
  { de: 'Mutter', en: 'Mother', my: 'Ibu', pronunciation: 'MOO-ter', example: 'Meine Mutter kocht gern.', exampleTranslation: 'My mother likes to cook.', category: 'Family', level: 'A1' },
];

function sm2(card: VocabCard, quality: number): VocabCard {
  let { ease, interval, reps } = card;
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  return { ...card, ease, interval, reps, due: Date.now() + interval * 86400000 };
}

export default function WoerterPage() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('dein-vocab');
    if (stored) {
      try {
        setCards(JSON.parse(stored));
        return;
      } catch (e) {}
    }
    const seeded: VocabCard[] = SEED_VOCAB.map((v, i) => ({
      ...v,
      id: i + 1,
      interval: 0,
      ease: 2.5,
      due: Date.now() - 1,
      reps: 0,
    }));
    setCards(seeded);
    localStorage.setItem('dein-vocab', JSON.stringify(seeded));
  }, []);

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('dein-vocab', JSON.stringify(cards));
    }
  }, [cards]);

  const now = Date.now();
  const dueCards = cards.map((c, idx) => ({ c, idx })).filter(({ c }) => c.due <= now);
  const current = dueCards[currentIdx];

  const review = (quality: number) => {
    if (!current) return;
    const updated = sm2(current.c, quality);
    const newCards = [...cards];
    newCards[current.idx] = updated;
    setCards(newCards);
    setShowAnswer(false);
    if (quality >= 3) {
      setStreak(streak + 1);
      setXp(xp + 5);
    } else {
      setStreak(0);
    }
    setCurrentIdx((i) => i + 1);
  };

  if (cards.length === 0) return <div className="p-6">Loading...</div>;

  if (!current) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-6">
        <Link href="/" className="text-gray-500 mb-4 inline-block">← Back</Link>
        <h1 className="text-3xl font-extrabold mb-2">Wörter</h1>
        <div className="duo-card p-6 text-center bg-gradient-to-br from-frog to-green-500 text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-3" />
          <div className="text-2xl font-extrabold mb-2">Alles erledigt!</div>
          <div className="text-sm">No cards due. Come back tomorrow.</div>
        </div>
      </div>
    );
  }

  const progress = (currentIdx / Math.max(dueCards.length, 1)) * 100;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        <Link href="/" className="text-gray-500">✕</Link>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4">
          <div className="bg-frog h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">🔥</span>
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="duo-card p-8 w-full text-center">
          <div className="text-xs text-gray-500 mb-4">WAS BEDEUTET...</div>
          <div className="text-5xl font-extrabold mb-3">{current.c.de}</div>
          <div className="text-lg text-gray-500 mb-6">[{current.c.pronunciation}]</div>
          <button className="text-eagle mb-4">
            <Volume2 className="w-8 h-8 mx-auto" />
          </button>

          {showAnswer ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-frog">{current.c.en}</div>
              <div className="text-sm text-gray-600">{current.c.my}</div>
              <div className="text-sm italic text-gray-500 mt-4 border-t pt-4">"{current.c.example}"</div>
              <div className="text-xs text-gray-400">{current.c.exampleTranslation}</div>
            </div>
          ) : (
            <button onClick={() => setShowAnswer(true)} className="duo-btn duo-btn-green w-full py-4">
              ANTWORT ZEIGEN
            </button>
          )}
        </div>
      </div>

      {showAnswer && (
        <div className="grid grid-cols-4 gap-2 p-4">
          <button onClick={() => review(1)} className="duo-btn duo-btn-red py-3 text-xs">Nochmal</button>
          <button onClick={() => review(2)} className="duo-btn bg-flame text-white py-3 text-xs">Schwer</button>
          <button onClick={() => review(3)} className="duo-btn duo-btn-blue py-3 text-xs">Gut</button>
          <button onClick={() => review(5)} className="duo-btn duo-btn-green py-3 text-xs">Einfach</button>
        </div>
      )}
    </div>
  );
}
