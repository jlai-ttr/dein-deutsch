'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

type ExerciseType = 'fill' | 'scramble' | 'choice';

interface FillExercise {
  type: 'fill';
  prompt: string;
  en: string;
  // The sentence with one ___ where the blank goes
  sentence: string;
  answer: string;
  options: string[];
  hint: string;
}

interface ScrambleExercise {
  type: 'scramble';
  prompt: string;
  en: string;
  // Words out of order
  words: string[];
  // Correct order
  answer: string[];
  hint: string;
}

interface ChoiceExercise {
  type: 'choice';
  prompt: string;
  en: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

type Exercise = FillExercise | ScrambleExercise | ChoiceExercise;

// Exercises — fill-the-blank for cases/verbs, scramble for word order, choice for understanding
const EXERCISES_A1: Exercise[] = [
  // Fill-in-the-blank
  {
    type: 'fill',
    prompt: 'Akkusativ — Masculine',
    en: 'Accusative masculine: the direct object changes "der" → "den".',
    sentence: 'Ich sehe ___ Mann. (Akkusativ)',
    answer: 'den',
    options: ['der', 'den', 'dem', 'des'],
    hint: 'Akkusativ masculine is the same as "der" + ending: ___',
  },
  {
    type: 'fill',
    prompt: 'Akkusativ — Feminine',
    en: 'Accusative feminine: same as nominative — "die".',
    sentence: 'Ich trinke ___ Kaffee.',
    answer: 'den',
    options: ['der', 'die', 'das', 'den'],
    hint: 'Feminine article "die" stays the same.',
  },
  {
    type: 'fill',
    prompt: 'Modal verb — können',
    en: '"Ich kann ___." (I can swim.)',
    sentence: 'Ich kann gut ___ .',
    answer: 'schwimmen',
    options: ['schwimmen', 'schwimmt', 'geschwommen', 'schwamm'],
    hint: 'Infinitive goes at the end. "Schwimmen" = to swim.',
  },
  {
    type: 'fill',
    prompt: 'Modal verb — wollen',
    en: '"Ich will nach Hause ___." (I want to go home.)',
    sentence: 'Ich will nach Hause ___ .',
    answer: 'gehen',
    options: ['gehe', 'gehen', 'geht', 'ging'],
    hint: 'Modal + infinitive. The infinitive goes at the end.',
  },
  {
    type: 'fill',
    prompt: 'Modal verb — müssen',
    en: '"Ich muss jetzt ___." (I have to go now.)',
    sentence: 'Ich muss jetzt ___ .',
    answer: 'gehen',
    options: ['gehen', 'geht', 'ging', 'gegangen'],
    hint: 'Müssen = must/have to. Infinitive at end.',
  },
  {
    type: 'fill',
    prompt: 'Possessive — mein',
    en: '"My brother comes today." — Ich has a masculine accusative.',
    sentence: 'Ich sehe ___ Bruder. (my, accusative masculine)',
    answer: 'meinen',
    options: ['mein', 'meine', 'meinen', 'meinem'],
    hint: 'mein + accusative masculine ending (-en)',
  },
  {
    type: 'fill',
    prompt: 'Negation — kein',
    en: '"I have no time."',
    sentence: 'Ich habe ___ Zeit. (no time, feminine)',
    answer: 'keine',
    options: ['kein', 'keine', 'keinen', 'keinem'],
    hint: '"kein" negates "ein" — feminine form is "keine"',
  },

  // Scramble
  {
    type: 'scramble',
    prompt: 'Word Order — Simple sentence',
    en: '"I am learning German."',
    words: ['Ich', 'lerne', 'Deutsch'],
    answer: ['Ich', 'lerne', 'Deutsch'],
    hint: 'Subject + verb + object. Verb comes second (V2).',
  },
  {
    type: 'scramble',
    prompt: 'Word Order — Time + Subject',
    en: '"Tomorrow I go to Berlin."',
    words: ['nach', 'ich', 'morgen', 'fahre', 'Berlin'],
    answer: ['morgen', 'fahre', 'ich', 'nach', 'Berlin'],
    hint: 'Time (morgen) goes first. Verb (fahre) MUST be 2nd.',
  },
  {
    type: 'scramble',
    prompt: 'Word Order — TeKaMoLo',
    en: '"I travel tomorrow by train to Munich."',
    words: ['München', 'fahre', 'morgen', 'mit', 'ich', 'dem', 'Zug', 'nach'],
    answer: ['ich', 'fahre', 'morgen', 'mit', 'dem', 'Zug', 'nach', 'München'],
    hint: 'Subject + verb + Time + Manner + Place',
  },
  {
    type: 'scramble',
    prompt: 'Modal verb — position',
    en: '"I want to learn German."',
    words: ['Ich', 'lernen', 'will', 'Deutsch'],
    answer: ['Ich', 'will', 'Deutsch', 'lernen'],
    hint: 'Modal verb in position 2. Infinitive at end.',
  },

  // Choice
  {
    type: 'choice',
    prompt: 'Case selection',
    en: '"I see the cat." Which case?',
    question: 'Welcher Fall? "Ich sehe die Katze."',
    options: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'],
    answer: 1,
    explanation: '"Ich sehe die Katze" — die Katze is the direct object (what is being seen). Direct object = Akkusativ.',
  },
  {
    type: 'choice',
    prompt: 'Case selection',
    en: '"The cat sleeps." Which case?',
    question: 'Welcher Fall? "Die Katze schläft."',
    options: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'],
    answer: 0,
    explanation: '"Die Katze" is the subject — the one doing the sleeping. Subject = Nominativ.',
  },
  {
    type: 'choice',
    prompt: 'Article selection',
    en: 'Choose the correct article. "We see ___ man." (masc)',
    question: 'Ich sehe ___ Mann.',
    options: ['der', 'den', 'dem', 'des'],
    answer: 1,
    explanation: '"den Mann" = accusative masculine. The masculine article changes der → den in Akkusativ.',
  },
  {
    type: 'choice',
    prompt: 'Modal verb choice',
    en: 'Pick the right modal. "You ___ go now." (permission)',
    question: 'Du ___ jetzt gehen.',
    options: ['kannst', 'musst', 'darfst', 'willst'],
    answer: 2,
    explanation: '"darfst" = may/are allowed to. "Du darfst gehen" = "You may go." Permission uses "dürfen."',
  },
  {
    type: 'choice',
    prompt: 'Modal verb choice',
    en: 'Pick the right modal. "I ___ work." (obligation)',
    question: 'Ich ___ arbeiten.',
    options: ['kann', 'muss', 'darf', 'mag'],
    answer: 1,
    explanation: '"muss" = must. "Ich muss arbeiten" = "I must work." Obligation uses "müssen."',
  },
];

export default function UebenPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fillText, setFillText] = useState('');
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    // Shuffle for variety
    const shuffled = [...EXERCISES_A1].sort(() => Math.random() - 0.5);
    setExercises(shuffled);
  }, []);

  const ex = exercises[idx];

  useEffect(() => {
    if (!ex) return;
    if (ex.type === 'scramble') {
      // Shuffle the words but ensure not in correct order
      let shuffled = [...ex.words];
      let attempts = 0;
      while (attempts < 5 && shuffled.every((w, i) => w === ex.answer[i])) {
        shuffled = [...ex.words].sort(() => Math.random() - 0.5);
        attempts++;
      }
      setScrambled(shuffled);
    }
    setSelectedOption(null);
    setFillText('');
    setShowResult(null);
  }, [idx, ex]);

  function checkFill() {
    if (!ex || ex.type !== 'fill') return;
    const correct = fillText.trim().toLowerCase() === ex.answer.toLowerCase();
    setShowResult(correct ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function checkScramble() {
    if (!ex || ex.type !== 'scramble') return;
    const correct = scrambled.length === ex.answer.length && scrambled.every((w, i) => w === ex.answer[i]);
    setShowResult(correct ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function checkChoice() {
    if (!ex || ex.type !== 'choice') return;
    const correct = selectedOption === ex.answer;
    setShowResult(correct ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    if (idx + 1 >= exercises.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  }

  function moveScrambled(from: number, to: number) {
    if (showResult) return;
    const next = [...scrambled];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    setScrambled(next);
  }

  if (!mounted || exercises.length === 0) return null;
  const t = getTheme(theme);

  if (done) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic', textDecoration: 'none' }}>← zurück</Link>
        <div style={{
          background: t.accentSoft, border: '1px solid ' + t.accent,
          borderRadius: 12, padding: 40, textAlign: 'center', marginTop: 20,
        }}>
          <div style={{ fontSize: '3rem' }}>🌿</div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', color: t.text, margin: '0 0 8px' }}>Übung abgeschlossen!</h1>
          <div style={{ fontFamily: FONTS.display, fontSize: '3rem', fontWeight: 700, color: t.accent, margin: '16px 0' }}>
            {score.correct} / {score.total}
          </div>
          <p style={{ fontFamily: FONTS.reading, color: t.textMuted, fontStyle: 'italic' }}>
            {Math.round((score.correct / score.total) * 100)}% richtig
          </p>
          <Link href="/" style={{
            display: 'inline-block', marginTop: 20, padding: '12px 24px',
            background: t.accent, color: t.onAccent, borderRadius: 8,
            textDecoration: 'none', fontWeight: 600,
          }}>
            Zurück zum Haus
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Üben · Practice Drills
            </div>
            <h1 style={{ fontFamily: FONTS.display, fontSize: '1.6rem', fontWeight: 700, color: t.text, margin: 0 }}>{ex.prompt}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Aufgabe</div>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.4rem', fontWeight: 700, color: t.accent }}>
              {idx + 1} / {exercises.length}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <span style={{
            padding: '2px 8px', background: t.bg, color: t.textMuted,
            borderRadius: 4, fontSize: '0.7rem', fontFamily: FONTS.mono,
            border: '1px solid ' + t.border,
          }}>
            {ex.type === 'fill' ? 'Lückentext' : ex.type === 'scramble' ? 'Sätze ordnen' : 'Multiple Choice'}
          </span>
          <span style={{ fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
            {ex.en}
          </span>
        </div>
      </div>

      {/* Exercise card */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 32, marginBottom: 16, boxShadow: t.shadow,
      }}>
        {/* FILL */}
        {ex.type === 'fill' && (
          <>
            <div style={{
              fontFamily: FONTS.reading, fontSize: '1.4rem', color: t.text,
              marginBottom: 16, textAlign: 'center',
            }}>
              {ex.sentence.replace('___', '______')}
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontFamily: FONTS.reading }}>
              💡 {ex.hint}
            </div>

            {/* Options as buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              {ex.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setFillText(opt)}
                  disabled={!!showResult}
                  style={{
                    padding: 14,
                    background: fillText === opt ? t.accent : t.bg,
                    color: fillText === opt ? t.onAccent : t.text,
                    border: '2px solid ' + (fillText === opt ? t.accent : t.border),
                    borderRadius: 8, cursor: showResult ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem', fontFamily: FONTS.display, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* SCRAMBLE */}
        {ex.type === 'scramble' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
              EN: {ex.en}
            </div>

            {/* Build sentence area */}
            <div style={{
              minHeight: 60, padding: 16, background: t.bg, borderRadius: 8,
              border: '1px dashed ' + t.border, marginBottom: 12,
              display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
            }}>
              {scrambled.length === 0 ? (
                <span style={{ color: t.textFaint, fontFamily: FONTS.reading, fontStyle: 'italic' }}>Tap words below to build the sentence…</span>
              ) : (
                scrambled.map((w, i) => (
                  <button
                    key={i + '-' + w}
                    onClick={() => {
                      // Move to end or remove
                      const next = scrambled.filter((_, idx) => idx !== i);
                      setScrambled(next);
                    }}
                    disabled={!!showResult}
                    style={{
                      padding: '6px 12px', background: t.cardBg, color: t.text,
                      border: '1px solid ' + t.border, borderRadius: 6,
                      cursor: showResult ? 'not-allowed' : 'pointer',
                      fontFamily: FONTS.reading, fontSize: '0.95rem',
                    }}
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            {/* Word bank */}
            <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Word bank
            </div>
            <div style={{
              padding: 12, background: t.bg, borderRadius: 8, border: '1px solid ' + t.border,
              display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12,
            }}>
              {ex.words.map((w, i) => {
                const used = scrambled.includes(w);
                return (
                  <button
                    key={i + '-' + w}
                    onClick={() => !used && setScrambled([...scrambled, w])}
                    disabled={used || !!showResult}
                    style={{
                      padding: '6px 12px',
                      background: used ? t.bg : t.cardBg,
                      color: used ? t.textFaint : t.text,
                      border: '1px solid ' + t.border,
                      borderRadius: 6,
                      cursor: used ? 'default' : 'pointer',
                      fontFamily: FONTS.reading,
                      fontSize: '0.95rem',
                      opacity: used ? 0.4 : 1,
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
              💡 {ex.hint}
            </div>
          </>
        )}

        {/* CHOICE */}
        {ex.type === 'choice' && (
          <>
            <div style={{
              fontFamily: FONTS.reading, fontSize: '1.4rem', color: t.text,
              marginBottom: 16, textAlign: 'center',
            }}>
              {ex.question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {ex.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  disabled={!!showResult}
                  style={{
                    padding: 14,
                    background: selectedOption === i ? t.accent : t.bg,
                    color: selectedOption === i ? t.onAccent : t.text,
                    border: '2px solid ' + (selectedOption === i ? t.accent : t.border),
                    borderRadius: 8, cursor: showResult ? 'not-allowed' : 'pointer',
                    fontSize: '1rem', fontFamily: FONTS.display,
                    textAlign: 'left',
                    fontWeight: selectedOption === i ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Result feedback */}
        {showResult && (
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 8,
            background: showResult === 'correct' ? t.accentSoft : (t.error + '22'),
            border: '1px solid ' + (showResult === 'correct' ? t.accent : t.error),
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.1rem', fontWeight: 600, color: showResult === 'correct' ? t.accent : t.error, marginBottom: 6 }}>
              {showResult === 'correct' ? '✓ Richtig!' : '✗ Leider falsch'}
            </div>
            {(ex.type === 'fill' || ex.type === 'scramble') && showResult === 'wrong' && (
              <div style={{ fontFamily: FONTS.reading, fontSize: '0.95rem', color: t.text }}>
                Korrekt: <strong>{Array.isArray((ex as any).answer) ? (ex as any).answer.join(' ') : (ex as any).answer}</strong>
              </div>
            )}
            {ex.type === 'choice' && (
              <div style={{ fontFamily: FONTS.reading, fontSize: '0.95rem', color: t.text, lineHeight: 1.5 }}>
                {(ex as ChoiceExercise).explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={() => {
          if (showResult) {
            next();
          } else if (ex.type === 'fill') {
            if (fillText) checkFill();
          } else if (ex.type === 'scramble') {
            if (scrambled.length === ex.answer.length) checkScramble();
          } else if (ex.type === 'choice') {
            if (selectedOption !== null) checkChoice();
          }
        }}
        disabled={
          (!showResult && (
            (ex.type === 'fill' && !fillText) ||
            (ex.type === 'scramble' && scrambled.length !== ex.answer.length) ||
            (ex.type === 'choice' && selectedOption === null)
          ))
        }
        style={{
          width: '100%',
          padding: '14px 24px',
          background: showResult ? t.accent : t.border,
          color: t.onAccent,
          border: 'none', borderRadius: 10,
          fontSize: '1rem', fontWeight: 700,
          fontFamily: FONTS.display, letterSpacing: '0.05em',
          cursor: 'pointer',
          opacity: (
            (showResult) ||
            (ex.type === 'fill' && fillText) ||
            (ex.type === 'scramble' && scrambled.length === ex.answer.length) ||
            (ex.type === 'choice' && selectedOption !== null)
          ) ? 1 : 0.5,
          boxShadow: '0 4px 0 ' + t.accentHover,
        }}
      >
        {showResult ? (idx + 1 >= exercises.length ? 'Ergebnis' : 'Nächste Aufgabe →') : 'Antwort prüfen'}
      </button>

      {/* Score */}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading }}>
        Score: <strong style={{ color: t.accent }}>{score.correct}/{score.total}</strong> · {(score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0)}%
      </div>
    </div>
  );
}
