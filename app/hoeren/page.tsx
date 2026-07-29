'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';
import { trackEvent } from '../lib/activity';

interface Lesson {
  id: string;
  level: string;
  title: string;
  enTitle: string;
  topic: string;
  sentences: { de: string; en: string }[];
}

const LESSONS: Lesson[] = [
  {
    id: 'a1-cafe',
    level: 'A1',
    title: 'Im Café',
    enTitle: 'At the Café',
    topic: 'Bestellung & Höflichkeit',
    sentences: [
      { de: 'Guten Tag! Was möchten Sie bestellen?', en: 'Good day! What would you like to order?' },
      { de: 'Einen Kaffee, bitte.', en: 'A coffee, please.' },
      { de: 'Gerne. Möchten Sie auch Kuchen?', en: 'Of course. Would you also like cake?' },
      { de: 'Ja, ein Stück Apfelkuchen, bitte.', en: 'Yes, a piece of apple cake, please.' },
      { de: 'Möchten Sie dazu Sahne?', en: 'Would you like whipped cream with that?' },
      { de: 'Ja, gerne. Was kostet das alles zusammen?', en: 'Yes, please. How much does that all cost together?' },
      { de: 'Das macht fünf Euro zwanzig.', en: 'That comes to five euros twenty.' },
      { de: 'Hier, bitte. Vielen Dank!', en: 'Here you go. Thanks very much!' },
      { de: 'Auf Wiedersehen!', en: 'Goodbye!' },
    ],
  },
  {
    id: 'a2-directions',
    level: 'A2',
    title: 'Wegbeschreibung',
    enTitle: 'Asking for directions',
    topic: 'Reisen',
    sentences: [
      { de: 'Entschuldigung, wie komme ich zum Bahnhof?', en: 'Excuse me, how do I get to the train station?' },
      { de: 'Gehen Sie geradeaus bis zur Ampel.', en: 'Go straight until the traffic light.' },
      { de: 'Dann biegen Sie links ab.', en: 'Then turn left.' },
      { de: 'Der Bahnhof ist auf der rechten Seite.', en: 'The station is on the right side.' },
      { de: 'Ist es weit von hier?', en: 'Is it far from here?' },
      { de: 'Nein, zu Fuß etwa fünf Minuten.', en: 'No, on foot about five minutes.' },
      { de: 'Gibt es einen Bus?', en: 'Is there a bus?' },
      { de: 'Ja, die Nummer vier hält direkt davor.', en: 'Yes, number four stops right in front of it.' },
      { de: 'Vielen Dank für Ihre Hilfe!', en: 'Thanks very much for your help!' },
    ],
  },
  {
    id: 'b1-meeting',
    level: 'B1',
    title: 'Im Meeting',
    enTitle: 'In a meeting',
    topic: 'Beruf',
    sentences: [
      { de: 'Guten Morgen zusammen, fangen wir an.', en: 'Good morning everyone, let\'s get started.' },
      { de: 'Auf der Tagesordnung steht heute das neue Projekt.', en: 'On the agenda today is the new project.' },
      { de: 'Wer möchte anfangen?', en: 'Who would like to start?' },
      { de: 'Ich kann kurz den aktuellen Stand zusammenfassen.', en: 'I can briefly summarize the current status.' },
      { de: 'Wir liegen gut im Zeitplan.', en: 'We\'re on track.' },
      { de: 'Welche Probleme sind aufgetreten?', en: 'What problems have arisen?' },
      { de: 'Es gab eine Verzögerung bei der Lieferung.', en: 'There was a delay in delivery.' },
      { de: 'Haben Sie eine Lösung vorgeschlagen?', en: 'Did you propose a solution?' },
      { de: 'Ja, wir haben den Lieferanten gewechselt.', en: 'Yes, we switched suppliers.' },
      { de: 'Gut. Dann machen wir so weiter.', en: 'Good. Let\'s continue like that.' },
    ],
  },
];

type Mode = 'listen' | 'dictation';

export default function HoerenPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [mode, setMode] = useState<Mode>('listen');
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mounted, setMounted] = useState(false);
  const [supportsTTS, setSupportsTTS] = useState(false);
  const [rate, setRate] = useState(0.7);
  const [playing, setPlaying] = useState(false);

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
  }, []);

  function speak(de: string) {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(de);
    u.lang = 'de-DE';
    u.rate = rate;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  }

  function speakAll() {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    const allText = lesson.sentences.map(s => s.de).join('. ');
    const u = new SpeechSynthesisUtterance(allText);
    u.lang = 'de-DE';
    u.rate = rate;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  }

  function stopAudio() {
    if (supportsTTS) window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function checkDictation() {
    trackEvent('listen');
    const correct = lesson.sentences[sentenceIdx];
    const userWords = userInput.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const correctWords = correct.de.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
    const matched = userWords.filter(w => correctWords.includes(w)).length;
    const accuracy = correctWords.length > 0 ? matched / correctWords.length : 0;
    const isCorrect = accuracy >= 0.8;
    setRevealed(true);
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    if (sentenceIdx + 1 >= lesson.sentences.length) {
      setSentenceIdx(0);
      setUserInput('');
      setRevealed(false);
    } else {
      setSentenceIdx(sentenceIdx + 1);
      setUserInput('');
      setRevealed(false);
    }
  }

  function prev() {
    if (sentenceIdx > 0) {
      setSentenceIdx(sentenceIdx - 1);
      setUserInput('');
      setRevealed(false);
    }
  }

  if (!mounted) return null;
  const t = getTheme(theme);

  const currentSentence = lesson.sentences[sentenceIdx];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {!supportsTTS && (
        <div style={{
          background: t.warning, color: 'white', padding: 16,
          borderRadius: 10, marginBottom: 16,
        }}>
          ⚠️ Your browser doesn't support text-to-speech. Try Chrome or Edge.
        </div>
      )}

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Hören · Listening Practice
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px' }}>
          Höre zu. Verstehe. Sprich nach.
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Listen to native-speed conversations. Switch to dictation mode to test comprehension.
        </p>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {(['listen', 'dictation'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '8px 14px',
              background: mode === m ? t.accent : 'transparent',
              color: mode === m ? t.onAccent : t.text,
              border: '1px solid ' + (mode === m ? t.accent : t.border),
              borderRadius: 6, fontSize: '0.85rem',
              fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
              fontFamily: FONTS.body,
            }}>
              {m === 'listen' ? '🎧 Listen' : '✍️ Dictation'}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson selector */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Lessons ({LESSONS.length})
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {LESSONS.map(l => (
            <button key={l.id} onClick={() => { setLesson(l); setSentenceIdx(0); setUserInput(''); setRevealed(false); }} style={{
              padding: '8px 12px',
              background: l.id === lesson.id ? t.accent : t.bg,
              color: l.id === lesson.id ? t.onAccent : t.text,
              border: '1px solid ' + (l.id === lesson.id ? t.accent : t.border),
              borderRadius: 6, fontSize: '0.85rem',
              fontWeight: l.id === lesson.id ? 700 : 400, cursor: 'pointer',
              fontFamily: FONTS.body,
            }}>
              <span style={{ padding: '2px 6px', background: l.id === lesson.id ? 'rgba(255,255,255,0.2)' : t.accentSoft, color: l.id === lesson.id ? 'white' : t.accent, borderRadius: 3, fontSize: '0.7rem', marginRight: 6 }}>{l.level}</span>
              {l.title}
            </button>
          ))}
        </div>
      </div>

      {/* Speed control */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 10,
        padding: 12, marginBottom: 16,
      }}>
        <label style={{ fontSize: '0.75rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Geschwindigkeit: {rate.toFixed(1)}×
        </label>
        <input type="range" min="0.5" max="1.2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
      </div>

      {/* Active sentence / dictation card */}
      <div style={{
        background: t.accentSoft, border: '1px solid ' + t.accent,
        borderRadius: 12, padding: 32, marginBottom: 16, textAlign: 'center',
        boxShadow: t.shadowStrong,
      }}>
        <div style={{ fontSize: '0.7rem', color: t.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {lesson.title} · {sentenceIdx + 1} / {lesson.sentences.length}
        </div>

        {mode === 'listen' ? (
          <>
            <button
              onClick={() => currentSentence && speak(currentSentence.de)}
              disabled={!supportsTTS}
              style={{
                marginTop: 16, padding: '12px 32px',
                background: t.accent, color: t.onAccent, border: 'none',
                borderRadius: 10, fontSize: '1.1rem', fontWeight: 700,
                fontFamily: FONTS.display, cursor: supportsTTS ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 0 ' + t.accentHover,
              }}
            >
              {playing ? '▶️ Playing…' : '🔊 Hören'}
            </button>
            {playing && (
              <button onClick={stopAudio} style={{
                marginTop: 8, marginLeft: 8, padding: '12px 20px',
                background: 'transparent', color: t.text,
                border: '1px solid ' + t.border, borderRadius: 10,
                cursor: 'pointer',
              }}>⏹</button>
            )}

            <div style={{
              fontFamily: FONTS.display, fontSize: '1.5rem', fontWeight: 600,
              color: t.text, marginTop: 20,
            }}>
              {currentSentence.de}
            </div>

            <div style={{
              fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted,
              fontStyle: 'italic', marginTop: 8,
            }}>
              {currentSentence.en}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => speak(currentSentence.de)}
              disabled={!supportsTTS}
              style={{
                marginTop: 16, padding: '10px 24px',
                background: t.accent, color: t.onAccent, border: 'none',
                borderRadius: 10, fontSize: '1rem', fontWeight: 700,
                fontFamily: FONTS.body, cursor: supportsTTS ? 'pointer' : 'not-allowed',
              }}
            >
              ▶️ Abspielen
            </button>

            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Hör zu und schreibe was du hörst…"
              disabled={revealed}
              rows={3}
              style={{
                width: '100%', marginTop: 20,
                padding: 16, background: t.cardBg, color: t.text,
                border: '1px solid ' + t.border, borderRadius: 8,
                fontFamily: FONTS.reading, fontSize: '1.1rem',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />

            {revealed && (
              <div style={{
                marginTop: 16, padding: 16, background: t.accentSoft,
                border: '1px dashed ' + t.accent, borderRadius: 8,
                fontFamily: FONTS.reading, fontSize: '1.1rem', color: t.text,
              }}>
                {currentSentence.de}
              </div>
            )}
          </>
        )}
      </div>

      {/* Nav */}
      {mode === 'dictation' && !revealed && (
        <button
          onClick={checkDictation}
          disabled={!userInput.trim()}
          style={{
            width: '100%', padding: '12px 24px',
            background: userInput.trim() ? t.accent : t.border,
            color: t.onAccent, border: 'none', borderRadius: 10,
            fontSize: '0.95rem', fontWeight: 700,
            fontFamily: FONTS.display, letterSpacing: '0.05em',
            cursor: userInput.trim() ? 'pointer' : 'not-allowed',
            opacity: userInput.trim() ? 1 : 0.5,
            boxShadow: '0 4px 0 ' + t.accentHover,
            marginBottom: 12,
          }}
        >
          ✓ Antwort prüfen
        </button>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={prev} disabled={sentenceIdx === 0} style={{
          flex: 1, padding: 12, background: t.cardBg, color: sentenceIdx === 0 ? t.textFaint : t.text,
          border: '1px solid ' + t.border, borderRadius: 8, cursor: sentenceIdx === 0 ? 'not-allowed' : 'pointer',
        }}>← Zurück</button>
        <button onClick={next} style={{
          flex: 1, padding: 12, background: t.cardBg, color: t.text,
          border: '1px solid ' + t.border, borderRadius: 8, cursor: 'pointer',
        }}>Weiter →</button>
      </div>

      <button
        onClick={() => mode === 'listen' && speakAll()}
        disabled={mode !== 'listen' || !supportsTTS}
        style={{
          width: '100%', marginTop: 12, padding: 12,
          background: 'transparent', color: t.textMuted,
          border: '1px solid ' + t.border, borderRadius: 8,
          fontSize: '0.85rem', cursor: supportsTTS && mode === 'listen' ? 'pointer' : 'not-allowed',
          fontFamily: FONTS.reading,
        }}
      >
        🎧 Play full conversation
      </button>

      {/* Score (dictation mode only) */}
      {mode === 'dictation' && score.total > 0 && (
        <div style={{
          marginTop: 20, padding: 12, background: t.accentSoft, borderRadius: 8,
          textAlign: 'center', color: t.text,
          fontFamily: FONTS.reading,
        }}>
          ✓ Score: <strong>{score.correct}/{score.total}</strong> ·{' '}
          {Math.round((score.correct / score.total) * 100)}% accuracy
        </div>
      )}
    </div>
  );
}
