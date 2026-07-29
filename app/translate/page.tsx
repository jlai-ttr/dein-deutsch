'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Volume2, Copy, History, Star } from 'lucide-react';

const seedTranslations: Record<string, { de: string; my: string; pronunciation: string; category: string }> = {
  'hello': { de: 'Hallo', my: 'Helo', pronunciation: 'HAH-lo', category: 'Greetings' },
  'goodbye': { de: 'Tschüss', my: 'Selamat tinggal', pronunciation: 'CHOOSS', category: 'Greetings' },
  'thank you': { de: 'Danke', my: 'Terima kasih', pronunciation: 'DAHN-keh', category: 'Greetings' },
  'please': { de: 'Bitte', my: 'Sila', pronunciation: 'BIT-teh', category: 'Greetings' },
  'yes': { de: 'Ja', my: 'Ya', pronunciation: 'YAH', category: 'Basics' },
  'no': { de: 'Nein', my: 'Tidak', pronunciation: 'NAYNE', category: 'Basics' },
  'water': { de: 'Wasser', my: 'Air', pronunciation: 'VAH-ser', category: 'Food' },
  'coffee': { de: 'Kaffee', my: 'Kopi', pronunciation: 'KAF-fay', category: 'Food' },
  'bread': { de: 'Brot', my: 'Roti', pronunciation: 'BROAT', category: 'Food' },
  'house': { de: 'Haus', my: 'Rumah', pronunciation: 'HOWS', category: 'Home' },
  'car': { de: 'Auto', my: 'Kereta', pronunciation: 'OW-toh', category: 'Transport' },
  'work': { de: 'Arbeit', my: 'Kerja', pronunciation: 'AR-byte', category: 'Work' },
  'money': { de: 'Geld', my: 'Wang', pronunciation: 'GELT', category: 'Money' },
  'time': { de: 'Zeit', my: 'Masa', pronunciation: 'TSAYT', category: 'Time' },
  'family': { de: 'Familie', my: 'Keluarga', pronunciation: 'fa-MEE-li-eh', category: 'Family' },
  'mother': { de: 'Mutter', my: 'Ibu', pronunciation: 'MOO-ter', category: 'Family' },
  'father': { de: 'Vater', my: 'Bapa', pronunciation: 'FAH-ter', category: 'Family' },
  'good': { de: 'gut', my: 'bagus', pronunciation: 'GOOT', category: 'Adjectives' },
  'bad': { de: 'schlecht', my: 'buruk', pronunciation: 'SHLEKHT', category: 'Adjectives' },
  'big': { de: 'groß', my: 'besar', pronunciation: 'GROSS', category: 'Adjectives' },
  'small': { de: 'klein', my: 'kecil', pronunciation: 'KLAYNE', category: 'Adjectives' },
  'expensive': { de: 'teuer', my: 'mahal', pronunciation: 'TOY-er', category: 'Adjectives' },
  'cheap': { de: 'billig', my: 'murah', pronunciation: 'BIL-lich', category: 'Adjectives' },
  'where': { de: 'wo', my: 'di mana', pronunciation: 'VOH', category: 'Questions' },
  'what': { de: 'was', my: 'apa', pronunciation: 'VAHS', category: 'Questions' },
  'when': { de: 'wann', my: 'bila', pronunciation: 'VAHN', category: 'Questions' },
  'how': { de: 'wie', my: 'bagaimana', pronunciation: 'VEE', category: 'Questions' },
  'who': { de: 'wer', my: 'siapa', pronunciation: 'VAIR', category: 'Questions' },
  'price': { de: 'Preis', my: 'Harga', pronunciation: 'PRYCE', category: 'Business' },
  'invoice': { de: 'Rechnung', my: 'Invois', pronunciation: 'REKH-noong', category: 'Business' },
  'order': { de: 'Bestellung', my: 'Pesanan', pronunciation: 'be-SHTEL-oong', category: 'Business' },
  'delivery': { de: 'Lieferung', my: 'Penghantaran', pronunciation: 'LEE-fehr-oong', category: 'Business' },
  'supplier': { de: 'Lieferant', my: 'Pembekal', pronunciation: 'LEE-fehr-ant', category: 'Business' },
  'customer': { de: 'Kunde', my: 'Pelanggan', pronunciation: 'KOON-deh', category: 'Business' },
  'discount': { de: 'Rabatt', my: 'Diskaun', pronunciation: 'RAH-baht', category: 'Business' },
};

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'en-de' | 'de-en'>('en-de');
  const [result, setResult] = useState<{ de: string; my: string; pronunciation: string; category: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  function translate() {
    const key = input.toLowerCase().trim();
    const found = seedTranslations[key];
    if (found) {
      setResult(found);
      if (!history.includes(input)) {
        setHistory([input, ...history].slice(0, 10));
      }
    } else {
      setResult({ de: 'Nicht gefunden', my: 'Not found', pronunciation: 'NIKHT ge-FOON-den', category: '—' });
    }
  }

  function toggleFavorite() {
    if (!result) return;
    const text = result.de;
    if (favorites.includes(text)) {
      setFavorites(favorites.filter(f => f !== text));
    } else {
      setFavorites([...favorites, text]);
    }
  }

  const quickWords = Object.keys(seedTranslations).slice(0, 12);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      <Link href="/" className="text-gray-500 mb-4 inline-block">← Back</Link>
      <h1 className="text-3xl font-extrabold mb-2">Translate</h1>
      <p className="text-gray-500 mb-6">English ⇄ German · Malaysian included</p>

      {/* Direction toggle */}
      <div className="duo-card p-2 mb-4 flex items-center gap-2">
        <button
          onClick={() => setDirection('en-de')}
          className={`flex-1 py-2 rounded-xl font-bold ${direction === 'en-de' ? 'bg-frog text-white' : 'text-gray-500'}`}
        >
          EN → DE
        </button>
        <button onClick={() => setDirection(direction === 'en-de' ? 'de-en' : 'en-de')} className="p-2">
          <ArrowLeftRight className="w-5 h-5 text-gray-500" />
        </button>
        <button
          onClick={() => setDirection('de-en')}
          className={`flex-1 py-2 rounded-xl font-bold ${direction === 'de-en' ? 'bg-frog text-white' : 'text-gray-500'}`}
        >
          DE → EN
        </button>
      </div>

      {/* Input */}
      <div className="duo-card p-4 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && translate()}
          placeholder={direction === 'en-de' ? 'Type English word...' : 'Type German word...'}
          className="w-full outline-none text-lg"
        />
        <button onClick={translate} className="duo-btn duo-btn-green w-full mt-3 py-2">
          TRANSLATE
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="duo-card p-6 bg-gradient-to-br from-frog to-green-500 text-white mb-4">
          <div className="text-xs opacity-80 mb-1">{result.category}</div>
          <div className="text-3xl font-extrabold mb-2">{result.de}</div>
          <div className="text-sm opacity-90 mb-3">[{result.pronunciation}]</div>
          <div className="text-sm">🇲🇾 {result.my}</div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-white/20 py-2 rounded-xl font-bold flex items-center justify-center gap-1">
              <Volume2 className="w-4 h-4" /> Listen
            </button>
            <button onClick={toggleFavorite} className="flex-1 bg-white/20 py-2 rounded-xl font-bold flex items-center justify-center gap-1">
              <Star className={`w-4 h-4 ${favorites.includes(result.de) ? 'fill-gold text-gold' : ''}`} />
              {favorites.includes(result.de) ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Quick words */}
      <div className="mb-4">
        <div className="font-bold text-sm text-gray-500 mb-2">QUICK WORDS</div>
        <div className="flex flex-wrap gap-2">
          {quickWords.map((w) => (
            <button
              key={w}
              onClick={() => { setInput(w); translate(); }}
              className="duo-card px-3 py-2 text-sm"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="font-bold text-sm text-gray-500 mb-2 flex items-center gap-1">
            <History className="w-4 h-4" /> HISTORY
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setInput(h); translate(); }}
                className="duo-card p-3 w-full text-left flex items-center justify-between"
              >
                <span>{h}</span>
                <span className="text-frog font-bold">{seedTranslations[h.toLowerCase()]?.de}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
