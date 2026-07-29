'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';

// SM-2 Spaced Repetition Algorithm
// Based on SuperMemo SM-2: https://super-memory.com/english/ol/sm2.htm
//
// Each card has:
//   interval (days until next review)
//   repetition (number of successful reviews in a row)
//   easiness factor (starts at 2.5, never drops below 1.3)
//   due date (next review timestamp)
//   lapses (number of times forgotten)
//
// Quality 0-5: 0=total blackout, 5=perfect recall
// <3 = fail (reset to 1 day)
// >=3 = pass

interface VocabCard {
  id: string;
  word: string;
  translation: string;
  pos: string;          // part of speech (noun/verb/adj)
  gender?: string;      // der/die/das for nouns
  level: string;        // CEFR A1/B1/C1 etc.
  example: string;
  exampleEn: string;
  audio?: string;       // optional IPA

  // SM-2 state
  interval: number;     // days
  repetition: number;
  ef: number;           // easiness factor
  due: number;          // next due timestamp
  lapses: number;
  lastReviewed?: number;
  totalReviews: number;
  correctReviews: number;
}

const STORAGE_KEY = 'dein-deutsch-woerter-v2';

// Seed vocab — A1 starter pack (50 words across categories)
const SEED_VOCAB: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'>[] = [
  // Greetings & Basics
  { id: 'g1', word: 'Hallo', translation: 'hello', pos: 'interj', level: 'A1', example: 'Hallo, wie geht es dir?', exampleEn: 'Hello, how are you?' },
  { id: 'g2', word: 'Tschüss', translation: 'bye', pos: 'interj', level: 'A1', example: 'Tschüss, bis morgen!', exampleEn: 'Bye, see you tomorrow!' },
  { id: 'g3', word: 'Danke', translation: 'thanks', pos: 'interj', level: 'A1', example: 'Vielen Dank für deine Hilfe.', exampleEn: 'Thanks much for your help.' },
  { id: 'g4', word: 'Bitte', translation: 'please / you\'re welcome', pos: 'interj', level: 'A1', example: 'Einen Kaffee, bitte.', exampleEn: 'One coffee, please.' },
  { id: 'g5', word: 'Ja', translation: 'yes', pos: 'adv', level: 'A1', example: 'Ja, das stimmt.', exampleEn: 'Yes, that\'s correct.' },
  { id: 'g6', word: 'Nein', translation: 'no', pos: 'adv', level: 'A1', example: 'Nein, danke.', exampleEn: 'No, thanks.' },

  // Pronouns
  { id: 'p1', word: 'ich', translation: 'I', pos: 'pron', level: 'A1', example: 'Ich bin Student.', exampleEn: 'I am a student.' },
  { id: 'p2', word: 'du', translation: 'you (informal)', pos: 'pron', level: 'A1', example: 'Wo wohnst du?', exampleEn: 'Where do you live?' },
  { id: 'p3', word: 'er', translation: 'he', pos: 'pron', level: 'A1', example: 'Er kommt aus Berlin.', exampleEn: 'He comes from Berlin.' },
  { id: 'p4', word: 'sie', translation: 'she / they', pos: 'pron', level: 'A1', example: 'Sie arbeitet heute.', exampleEn: 'She works today.' },
  { id: 'p5', word: 'wir', translation: 'we', pos: 'pron', level: 'A1', example: 'Wir lernen Deutsch.', exampleEn: 'We are learning German.' },

  // Common nouns
  { id: 'n1', word: 'der Mann', translation: 'man', pos: 'noun', gender: 'm', level: 'A1', example: 'Der Mann liest ein Buch.', exampleEn: 'The man reads a book.' },
  { id: 'n2', word: 'die Frau', translation: 'woman', pos: 'noun', gender: 'f', level: 'A1', example: 'Die Frau arbeitet hier.', exampleEn: 'The woman works here.' },
  { id: 'n3', word: 'das Kind', translation: 'child', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Kind spielt im Park.', exampleEn: 'The child plays in the park.' },
  { id: 'n4', word: 'das Haus', translation: 'house', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Haus ist groß.', exampleEn: 'The house is big.' },
  { id: 'n5', word: 'das Auto', translation: 'car', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Auto ist rot.', exampleEn: 'The car is red.' },
  { id: 'n6', word: 'die Stadt', translation: 'city', pos: 'noun', gender: 'f', level: 'A1', example: 'Die Stadt ist schön.', exampleEn: 'The city is beautiful.' },
  { id: 'n7', word: 'das Buch', translation: 'book', pos: 'noun', gender: 'n', level: 'A1', example: 'Ich lese ein Buch.', exampleEn: 'I read a book.' },
  { id: 'n8', word: 'die Zeit', translation: 'time', pos: 'noun', gender: 'f', level: 'A1', example: 'Ich habe keine Zeit.', exampleEn: 'I have no time.' },

  // Common verbs
  { id: 'v1', word: 'sein', translation: 'to be', pos: 'verb', level: 'A1', example: 'Ich bin müde.', exampleEn: 'I am tired.' },
  { id: 'v2', word: 'haben', translation: 'to have', pos: 'verb', level: 'A1', example: 'Wir haben Hunger.', exampleEn: 'We are hungry.' },
  { id: 'v3', word: 'gehen', translation: 'to go / walk', pos: 'verb', level: 'A1', example: 'Ich gehe zur Schule.', exampleEn: 'I go to school.' },
  { id: 'v4', word: 'kommen', translation: 'to come', pos: 'verb', level: 'A1', example: 'Er kommt heute Abend.', exampleEn: 'He comes tonight.' },
  { id: 'v5', word: 'machen', translation: 'to do / make', pos: 'verb', level: 'A1', example: 'Was machst du?', exampleEn: 'What are you doing?' },
  { id: 'v6', word: 'wohnen', translation: 'to live (reside)', pos: 'verb', level: 'A1', example: 'Ich wohne in Berlin.', exampleEn: 'I live in Berlin.' },
  { id: 'v7', word: 'arbeiten', translation: 'to work', pos: 'verb', level: 'A1', example: 'Sie arbeitet im Büro.', exampleEn: 'She works in the office.' },
  { id: 'v8', word: 'lernen', translation: 'to learn', pos: 'verb', level: 'A1', example: 'Ich lerne Deutsch.', exampleEn: 'I am learning German.' },
  { id: 'v9', word: 'essen', translation: 'to eat', pos: 'verb', level: 'A1', example: 'Wir essen jetzt.', exampleEn: 'We are eating now.' },
  { id: 'v10', word: 'trinken', translation: 'to drink', pos: 'verb', level: 'A1', example: 'Er trinkt Kaffee.', exampleEn: 'He drinks coffee.' },
  { id: 'v11', word: 'sprechen', translation: 'to speak', pos: 'verb', level: 'A1', example: 'Sprechen Sie Englisch?', exampleEn: 'Do you speak English?' },
  { id: 'v12', word: 'lesen', translation: 'to read', pos: 'verb', level: 'A1', example: 'Ich lese ein Buch.', exampleEn: 'I read a book.' },

  // Key adjectives
  { id: 'a1', word: 'gut', translation: 'good', pos: 'adj', level: 'A1', example: 'Das Essen ist gut.', exampleEn: 'The food is good.' },
  { id: 'a2', word: 'schlecht', translation: 'bad', pos: 'adj', level: 'A1', example: 'Das Wetter ist schlecht.', exampleEn: 'The weather is bad.' },
  { id: 'a3', word: 'groß', translation: 'big / tall', pos: 'adj', level: 'A1', example: 'Mein Bruder ist groß.', exampleEn: 'My brother is tall.' },
  { id: 'a4', word: 'klein', translation: 'small', pos: 'adj', level: 'A1', example: 'Das Haus ist klein.', exampleEn: 'The house is small.' },
  { id: 'a5', word: 'neu', translation: 'new', pos: 'adj', level: 'A1', example: 'Mein Auto ist neu.', exampleEn: 'My car is new.' },
  { id: 'a6', word: 'alt', translation: 'old', pos: 'adj', level: 'A1', example: 'Das Buch ist alt.', exampleEn: 'The book is old.' },
  { id: 'a7', word: 'schön', translation: 'beautiful / nice', pos: 'adj', level: 'A1', example: 'Die Stadt ist schön.', exampleEn: 'The city is beautiful.' },
  { id: 'a8', word: 'müde', translation: 'tired', pos: 'adj', level: 'A1', example: 'Ich bin müde.', exampleEn: 'I am tired.' },

  // Time words
  { id: 't1', word: 'heute', translation: 'today', pos: 'adv', level: 'A1', example: 'Heute ist Montag.', exampleEn: 'Today is Monday.' },
  { id: 't2', word: 'morgen', translation: 'tomorrow', pos: 'adv', level: 'A1', example: 'Morgen komme ich.', exampleEn: 'Tomorrow I come.' },
  { id: 't3', word: 'jetzt', translation: 'now', pos: 'adv', level: 'A1', example: 'Was machst du jetzt?', exampleEn: 'What are you doing now?' },

  // Numbers
  { id: 't4', word: 'eins', translation: 'one', pos: 'num', level: 'A1', example: 'Ich möchte eins.', exampleEn: 'I want one.' },
  { id: 't5', word: 'zwei', translation: 'two', pos: 'num', level: 'A1', example: 'Zwei Kaffee, bitte.', exampleEn: 'Two coffees, please.' },
  { id: 't6', word: 'drei', translation: 'three', pos: 'num', level: 'A1', example: 'Drei Euro bitte.', exampleEn: 'Three euros please.' },

  // Colors
  { id: 'c1', word: 'rot', translation: 'red', pos: 'adj', level: 'A1', example: 'Das Auto ist rot.', exampleEn: 'The car is red.' },
  { id: 'c2', word: 'blau', translation: 'blue', pos: 'adj', level: 'A1', example: 'Der Himmel ist blau.', exampleEn: 'The sky is blue.' },
  { id: 'c3', word: 'grün', translation: 'green', pos: 'adj', level: 'A1', example: 'Das Gras ist grün.', exampleEn: 'The grass is green.' },

  // Food
  { id: 'f1', word: 'das Brot', translation: 'bread', pos: 'noun', gender: 'n', level: 'A1', example: 'Ich esse Brot.', exampleEn: 'I eat bread.' },
  { id: 'f2', word: 'das Wasser', translation: 'water', pos: 'noun', gender: 'n', level: 'A1', example: 'Kann ich Wasser haben?', exampleEn: 'Can I have water?' },
  { id: 'f3', word: 'der Kaffee', translation: 'coffee', pos: 'noun', gender: 'm', level: 'A1', example: 'Ich trinke Kaffee.', exampleEn: 'I drink coffee.' },
  { id: 'f4', word: 'der Tee', translation: 'tea', pos: 'noun', gender: 'm', level: 'A1', example: 'Möchtest du Tee?', exampleEn: 'Would you like tea?' },

  // Family
  { id: 'f5', word: 'die Mutter', translation: 'mother', pos: 'noun', gender: 'f', level: 'A1', example: 'Meine Mutter ist nett.', exampleEn: 'My mother is nice.' },
  { id: 'f6', word: 'der Vater', translation: 'father', pos: 'noun', gender: 'm', level: 'A1', example: 'Mein Vater arbeitet.', exampleEn: 'My father works.' },
  { id: 'f7', word: 'der Bruder', translation: 'brother', pos: 'noun', gender: 'm', level: 'A1', example: 'Mein Bruder ist Student.', exampleEn: 'My brother is a student.' },
  { id: 'f8', word: 'die Schwester', translation: 'sister', pos: 'noun', gender: 'f', level: 'A1', example: 'Meine Schwester lernt.', exampleEn: 'My sister studies.' },
];

function newCard(c: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'>): VocabCard {
  return {
    ...c,
    interval: 0,
    repetition: 0,
    ef: 2.5,
    due: Date.now(),
    lapses: 0,
    totalReviews: 0,
    correctReviews: 0,
  };
}

// SM-2 quality scale: 0 = Again (failure), 3 = Hard, 4 = Good, 5 = Easy
function applySM2(card: VocabCard, quality: number): VocabCard {
  const q = Math.max(0, Math.min(5, quality));
  const newCard = { ...card };

  newCard.totalReviews += 1;
  if (q >= 3) newCard.correctReviews += 1;

  if (q < 3) {
    // Failed — reset
    newCard.repetition = 0;
    newCard.interval = 1; // 1 day
    newCard.lapses += 1;
  } else {
    // Passed
    if (newCard.repetition === 0) {
      newCard.interval = 1;
    } else if (newCard.repetition === 1) {
      newCard.interval = 6;
    } else {
      newCard.interval = Math.round(newCard.interval * newCard.ef);
    }
    newCard.repetition += 1;
  }

  // Update easiness factor
  newCard.ef = Math.max(1.3, newCard.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  newCard.due = Date.now() + newCard.interval * 24 * 60 * 60 * 1000;
  newCard.lastReviewed = Date.now();

  return newCard;
}

export default function WoerterPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [reviewed, setReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [supportsTTS, setSupportsTTS] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupportsTTS(true);
    }

    // Load or seed
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCards(parsed);
      } catch (e) {
        setCards(SEED_VOCAB.map(newCard));
      }
    } else {
      setCards(SEED_VOCAB.map(newCard));
    }
  }, []);

  function save(next: VocabCard[]) {
    setCards(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Get due cards, sorted by overdue
  const dueCards = useMemo(() => {
    const now = Date.now();
    return cards
      .filter(c => c.due <= now)
      .sort((a, b) => a.due - b.due);
  }, [cards]);

  const currentCard = dueCards[0];

  function speak(de: string) {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(de);
    u.lang = 'de-DE';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  function rate(quality: number) {
    if (!currentCard) return;
    const updated = cards.map(c => (c.id === currentCard.id ? applySM2(c, quality) : c));
    save(updated);
    setReviewed(r => r + 1);
    if (quality >= 3) setCorrectCount(c => c + 1);
    setShowAnswer(false);
    if (quality < 3 && updated[0].lapses > 0) {
      // Card will be retested soon
    }
    // After advancing the card, check if more due
    const now = Date.now();
    const stillDue = updated.filter(c => c.due <= now);
    if (stillDue.length === 0) {
      setSessionDone(true);
    }
  }

  function addCustomCard(word: string, translation: string, example: string) {
    const card: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'> = {
      id: 'custom-' + Date.now(),
      word,
      translation,
      pos: 'custom',
      level: 'A1',
      example: example || word,
      exampleEn: translation,
    };
    save([...cards, newCard(card)]);
    setShowAddCard(false);
  }

  // Stats
  const stats = useMemo(() => {
    const total = cards.length;
    const learning = cards.filter(c => c.repetition < 3).length;
    const known = cards.filter(c => c.repetition >= 3 && c.interval >= 21).length;
    const mastered = cards.filter(c => c.interval >= 90).length;
    const avgAccuracy = reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 0;
    return { total, learning, known, mastered, avgAccuracy };
  }, [cards, reviewed, correctCount]);

  if (!mounted) return null;
  const t = getTheme(theme);

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontFamily: FONTS.reading }}>← zurück</Link>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', color: t.text, marginTop: 20 }}>Loading vocabulary…</h1>
      </div>
    );
  }

  // Session complete
  if (sessionDone || !currentCard) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
          ← zurück zum Haus
        </Link>

        <div style={{
          background: t.accentSoft, border: '1px solid ' + t.accent,
          borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', color: t.text, margin: '0 0 8px' }}>
            Session abgeschlossen!
          </h1>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1.1rem', color: t.textMuted, fontStyle: 'italic', margin: '0 0 24px' }}>
            Keine Karten mehr heute. Komm morgen wieder.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12,
            maxWidth: 600, margin: '0 auto 24px',
          }}>
            <Metric label="Überprüft" value={reviewed} t={t} />
            <Metric label="Richtig" value={correctCount} t={t} highlight />
            <Metric label="Genauigkeit" value={stats.avgAccuracy + '%'} t={t} />
            <Metric label="Mastered" value={stats.mastered + ' von ' + stats.total} t={t} />
          </div>

          <Link href="/" style={{
            display: 'inline-block', padding: '12px 24px',
            background: t.accent, color: t.onAccent, borderRadius: 8,
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 4px 0 ' + t.accentHover,
          }}>
            Zurück zum Haus →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 20, marginBottom: 16, boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Wörter · Spaced Repetition
            </div>
            <h1 style={{ fontFamily: FONTS.display, fontSize: '1.8rem', fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
              Heute lernen
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowAddCard(!showAddCard)} style={{
              padding: '6px 12px', background: t.bg, color: t.text,
              border: '1px solid ' + t.border, borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
            }}>
              + Karte
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, flexWrap: 'wrap' }}>
          <span><strong style={{ color: t.text }}>{dueCards.length}</strong> fällig</span>
          <span><strong style={{ color: t.accent }}>{reviewed}</strong> überprüft</span>
          <span>Accuracy: <strong style={{ color: t.success }}>{stats.avgAccuracy}%</strong></span>
          <span>Mastered: <strong style={{ color: t.accent }}>{stats.mastered}/{stats.total}</strong></span>
        </div>
      </div>

      {/* Add custom card form */}
      {showAddCard && (
        <AddCardForm onAdd={addCustomCard} onClose={() => setShowAddCard(false)} t={t} />
      )}

      {/* Active card */}
      <div style={{
        background: t.cardBg, border: '2px solid ' + t.accent,
        borderRadius: 16, padding: 40, marginBottom: 20,
        boxShadow: t.shadowStrong, minHeight: 360,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          padding: '4px 10px', background: t.accentSoft, color: t.accent,
          borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, marginBottom: 12,
        }}>
          {currentCard.level} · {currentCard.pos}
          {currentCard.gender && <span> · {currentCard.gender === 'm' ? 'der' : currentCard.gender === 'f' ? 'die' : 'das'}</span>}
        </div>

        <div style={{
          fontFamily: FONTS.display, fontSize: '3.5rem', fontWeight: 700,
          color: t.text, marginBottom: 8, textAlign: 'center', letterSpacing: '-0.02em',
        }}>
          {currentCard.word}
        </div>

        <button
          onClick={() => speak(currentCard.word)}
          disabled={!supportsTTS}
          style={{
            marginTop: 8, padding: '6px 12px', background: 'transparent',
            color: t.accent, border: '1px solid ' + t.accent, borderRadius: 6,
            cursor: supportsTTS ? 'pointer' : 'not-allowed', fontSize: '0.85rem',
            fontFamily: FONTS.body,
          }}
          title="Hear pronunciation"
        >
          🔊 Anhören
        </button>

        {/* Answer */}
        {showAnswer ? (
          <div style={{ marginTop: 24, textAlign: 'center', width: '100%', animation: 'fadeIn 0.3s' }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: '2rem', color: t.accent, fontWeight: 600,
              marginBottom: 16,
            }}>
              {currentCard.translation}
            </div>

            <div style={{
              background: t.bg, border: '1px dashed ' + t.border,
              borderRadius: 8, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.text, marginBottom: 4 }}>
                {currentCard.example}
              </div>
              <div style={{ fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontFamily: FONTS.reading }}>
                {currentCard.exampleEn}
              </div>
            </div>

            {/* Rating buttons */}
            <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Wie gut erinnerst du dich?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <RateButton
                quality={0}
                label="Again"
                shortcut="1"
                detail="< 1d"
                color={t.error}
                onClick={() => rate(0)}
                t={t}
              />
              <RateButton
                quality={3}
                label="Hard"
                shortcut="2"
                detail={cardInterval(currentCard, 3)}
                color={t.warning}
                onClick={() => rate(3)}
                t={t}
              />
              <RateButton
                quality={4}
                label="Good"
                shortcut="3"
                detail={cardInterval(currentCard, 4)}
                color={t.accent}
                onClick={() => rate(4)}
                t={t}
              />
              <RateButton
                quality={5}
                label="Easy"
                shortcut="4"
                detail={cardInterval(currentCard, 5)}
                color={t.success}
                onClick={() => rate(5)}
                t={t}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            style={{
              marginTop: 32, padding: '12px 32px',
              background: t.accent, color: t.onAccent,
              border: 'none', borderRadius: 10,
              fontSize: '1rem', fontWeight: 700,
              fontFamily: FONTS.display, letterSpacing: '0.05em',
              cursor: 'pointer', boxShadow: '0 4px 0 ' + t.accentHover,
            }}
          >
            Antwort zeigen · Space
          </button>
        )}
      </div>

      {/* Mastery progress bar */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 10,
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '0.85rem', color: t.textMuted }}>
          <span>Mastery Progress</span>
          <span style={{ fontFamily: FONTS.mono }}>{stats.mastered} / {stats.total}</span>
        </div>
        <div style={{ height: 8, background: t.bg, borderRadius: 4, overflow: 'hidden', border: '1px solid ' + t.border }}>
          <div style={{
            height: '100%',
            width: ((stats.mastered / stats.total) * 100) + '%',
            background: 'linear-gradient(90deg, ' + t.accentLight + ', ' + t.accent + ')',
            transition: 'width 0.4s',
          }} />
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: t.textFaint, fontFamily: FONTS.reading, fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
        💡 Spaced repetition algorithm adjusts intervals based on how well you remembered.
        Buttons: <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>1</kbd> Again · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>2</kbd> Hard · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>3</kbd> Good · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>4</kbd> Easy
      </p>
    </div>
  );
}

function cardInterval(card: VocabCard, q: number): string {
  const next = applySM2(card, q);
  const days = next.interval;
  if (days < 1) return '< 1d';
  if (days < 30) return days + 'd';
  if (days < 365) return Math.round(days / 30) + 'mo';
  return Math.round(days / 365) + 'y';
}

function RateButton({ label, shortcut, detail, color, onClick, t }: any) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 12,
        background: hover ? color : 'transparent',
        color: hover ? '#FFF' : color,
        border: '2px solid ' + color,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: FONTS.body,
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0', fontFamily: FONTS.display }}>
        {shortcut}
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.8, fontFamily: FONTS.mono }}>
        {detail}
      </div>
    </button>
  );
}

function Metric({ label, value, t, highlight }: any) {
  return (
    <div style={{
      background: highlight ? t.accentSoft : t.bg,
      border: '1px solid ' + (highlight ? t.accent : t.border),
      borderRadius: 8, padding: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: '1.4rem', fontWeight: 700, color: highlight ? t.accent : t.text }}>{value}</div>
    </div>
  );
}

function AddCardForm({ onAdd, onClose, t }: any) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');

  return (
    <div style={{
      background: t.bg, border: '1px solid ' + t.border,
      borderRadius: 10, padding: 16, marginBottom: 16,
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text, marginBottom: 12 }}>
        Add custom card
      </div>
      <input
        type="text"
        placeholder="Deutsches Wort (e.g., die Tasche)"
        value={word}
        onChange={e => setWord(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4 }}
      />
      <input
        type="text"
        placeholder="English translation"
        value={translation}
        onChange={e => setTranslation(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4 }}
      />
      <textarea
        placeholder="Example sentence (optional)"
        value={example}
        onChange={e => setExample(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: 12, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4, resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => word.trim() && translation.trim() && onAdd(word.trim(), translation.trim(), example.trim())}
          style={{ padding: '8px 16px', background: t.accent, color: t.onAccent, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          Save
        </button>
        <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', color: t.textMuted, border: '1px solid ' + t.border, borderRadius: 6, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
