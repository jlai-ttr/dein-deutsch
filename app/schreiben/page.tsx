'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';

const PROMPTS = [
  { level: 'A1', topic: 'Über dich', en: 'About yourself', de: 'Stelle dich vor. Wie heißt du? Wo wohnst du? Was ist dein Hobby?', minWords: 30 },
  { level: 'A1', topic: 'Deine Familie', en: 'Your family', de: 'Beschreibe deine Familie. Wie viele Personen? Was machen sie?', minWords: 30 },
  { level: 'A2', topic: 'Letztes Wochenende', en: 'Last weekend', de: 'Was hast du letztes Wochenende gemacht? Wohin bist du gegangen? Was hast du gegessen?', minWords: 60 },
  { level: 'A2', topic: 'Im Restaurant', en: 'At a restaurant', de: 'Beschreibe deinen letzten Restaurantbesuch. Was hast du bestellt? Wie war das Essen?', minWords: 60 },
  { level: 'B1', topic: 'Eine Reise', en: 'A trip', de: 'Erzähle von einer Reise, die du gemacht hast. Wohin? Wie lange? Was war das beste Erlebnis?', minWords: 120 },
  { level: 'B1', topic: 'Dein Traumjob', en: 'Your dream job', de: 'Was ist dein Traumjob? Warum? Was muss man dafür können?', minWords: 120 },
  { level: 'B2', topic: 'Eine Meinung', en: 'An opinion', de: 'Sollte Homeoffice erlaubt sein? Nimm Stellung und begründe deine Meinung mit Argumenten.', minWords: 200 },
  { level: 'C1', topic: 'Eine Analyse', en: 'An analysis', de: 'Analysiere die Auswirkungen der Digitalisierung auf die Arbeitswelt. Diskutiere Vor- und Nachteile.', minWords: 300 },
];

export default function SchreibenPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<Array<{ prompt: string; text: string; date: string }>>([]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    const savedIdx = localStorage.getItem('dein-deutsch-schreiben-idx');
    if (savedIdx) setPromptIdx(parseInt(savedIdx, 10));
    const savedHistory = localStorage.getItem('dein-deutsch-schreiben-history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  function selectPrompt(idx: number) {
    setPromptIdx(idx);
    setSubmitted(false);
    setText('');
    localStorage.setItem('dein-deutsch-schreiben-idx', idx.toString());
  }

  function analyzeText(t: string) {
    const words = t.trim().split(/\s+/).filter(Boolean).length;
    const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : '0';

    // Simple checks
    const hasVerb = /(?:bin|habe|werde|ist|sind|kann|muss|will|soll|möchte)\w*/i.test(t);
    const hasCapital = /[A-ZÄÖÜ]/.test(t);
    const hasUmlaut = /[äöüßÄÖÜ]/.test(t);

    // Heuristic CEFR estimate
    let estLevel = 'A1';
    if (words > 50 && hasVerb) estLevel = 'A2';
    if (words > 100 && sentences > 5) estLevel = 'B1';
    if (words > 180 && parseFloat(avgWordsPerSentence) > 10) estLevel = 'B2';
    if (words > 250 && parseFloat(avgWordsPerSentence) > 12) estLevel = 'C1';

    return { words, sentences, avgWordsPerSentence, hasVerb, hasCapital, hasUmlaut, estLevel };
  }

  function submit() {
    if (!text.trim()) return;
    const prompt = PROMPTS[promptIdx];
    const entry = {
      prompt: prompt.de,
      text,
      date: new Date().toISOString().slice(0, 10),
    };
    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('dein-deutsch-schreiben-history', JSON.stringify(newHistory));
    setSubmitted(true);
  }

  if (!mounted) return null;
  const t = getTheme(theme);
  const prompt = PROMPTS[promptIdx];
  const analysis = submitted ? analyzeText(text) : null;
  const meetsMin = text.trim().split(/\s+/).filter(Boolean).length >= prompt.minWords;

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
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Schreiben · Writing Practice
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Heute schreiben wir…
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Daily prompt. Write without translating in your head. Klick "Submit" when finished for instant analysis.
        </p>
      </div>

      {/* Prompt selector */}
      <div style={{
        background: t.bg, border: '1px solid ' + t.border, borderRadius: 10,
        padding: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Choose your level ({PROMPTS.length} prompts)
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => selectPrompt(i)}
              style={{
                padding: '6px 10px',
                background: i === promptIdx ? t.accent : t.cardBg,
                color: i === promptIdx ? t.onAccent : t.text,
                border: '1px solid ' + (i === promptIdx ? t.accent : t.border),
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: i === promptIdx ? 700 : 500,
                cursor: 'pointer',
                fontFamily: FONTS.mono,
              }}
              title={p.topic}
            >
              {p.level}
            </button>
          ))}
        </div>
      </div>

      {/* Active prompt */}
      <div style={{
        background: t.accentSoft, border: '1px solid ' + t.accent,
        borderRadius: 12, padding: 24, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{
            padding: '4px 12px', background: t.accent, color: t.onAccent,
            borderRadius: 4, fontSize: '0.8rem', fontWeight: 700,
          }}>{prompt.level}</span>
          <span style={{ fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
            Min: {prompt.minWords} Wörter
          </span>
        </div>
        <div style={{ fontFamily: FONTS.reading, fontSize: '1.15rem', color: t.text, lineHeight: 1.6 }}>
          {prompt.de}
        </div>
        <div style={{ marginTop: 8, fontSize: '0.9rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
          EN: {prompt.en}
        </div>
      </div>

      {/* Writing area */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schreibe hier auf Deutsch…"
        disabled={submitted}
        style={{
          width: '100%',
          minHeight: 280,
          padding: 20,
          background: t.cardBg,
          color: t.text,
          border: '1px solid ' + t.border,
          borderRadius: 10,
          fontSize: '1.05rem',
          fontFamily: FONTS.reading,
          lineHeight: 1.7,
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        className="duo-reading"
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem', color: t.textMuted }}>
        <span>{text.trim().split(/\s+/).filter(Boolean).length} Wörter</span>
        <span style={{ color: meetsMin ? t.success : t.textFaint }}>
          {meetsMin ? '✓ Mindestlänge erreicht' : `Noch ${prompt.minWords - text.trim().split(/\s+/).filter(Boolean).length} Wörter`}
        </span>
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!meetsMin || !text.trim()}
          style={{
            width: '100%',
            padding: '16px 24px',
            marginTop: 12,
            background: meetsMin ? t.accent : t.border,
            color: t.onAccent,
            border: 'none',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: FONTS.display,
            letterSpacing: '0.05em',
            cursor: meetsMin ? 'pointer' : 'not-allowed',
            opacity: meetsMin ? 1 : 0.5,
            boxShadow: meetsMin ? '0 4px 0 ' + t.accentHover : 'none',
            transition: 'all 0.15s',
          }}
        >
          ✒️ Schreiben abschicken
        </button>
      ) : (
        <div style={{
          marginTop: 16,
          background: t.cardBg, border: '1px solid ' + t.accent,
          borderRadius: 12, padding: 24,
        }}>
          <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Analyse · Instant Assessment
          </div>
          {analysis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <Metric label="Wörter" value={analysis.words} t={t} />
              <Metric label="Sätze" value={analysis.sentences} t={t} />
              <Metric label="Wörter/Satz" value={analysis.avgWordsPerSentence} t={t} />
              <Metric label="Geschätzt" value={analysis.estLevel} t={t} highlight />
            </div>
          )}
          <div style={{ marginTop: 16, fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
            💡 Tipp: Lies deinen Text laut. Wenn ein Satz schwer fällt, ist die Satzstruktur möglicherweise zu komplex. Versuche, ihn in zwei kürzere Sätze aufzuteilen.
          </div>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: t.cardBg,
              color: t.text,
              border: '1px solid ' + t.border,
              borderRadius: 6,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Nochmal bearbeiten
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: FONTS.display, fontSize: '1.4rem', color: t.text, margin: '0 0 12px' }}>
            Deine Texte · History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.slice(0, 5).map((h, i) => (
              <details key={i} style={{
                background: t.cardBg, border: '1px solid ' + t.border,
                borderRadius: 8, padding: 12,
              }}>
                <summary style={{ cursor: 'pointer', fontFamily: FONTS.reading, color: t.text }}>
                  <span style={{ fontSize: '0.75rem', color: t.textMuted, marginRight: 8 }}>{h.date}</span>
                  {h.prompt.slice(0, 60)}…
                </summary>
                <div style={{ marginTop: 12, fontSize: '0.9rem', fontFamily: FONTS.reading, color: t.textMuted, whiteSpace: 'pre-wrap' }}>
                  {h.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, t, highlight }: { label: string; value: any; t: any; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? t.accentSoft : t.bg,
      border: '1px solid ' + (highlight ? t.accent : t.border),
      borderRadius: 8,
      padding: 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: highlight ? '1.5rem' : '1.2rem', fontWeight: 700, color: highlight ? t.accent : t.text }}>{value}</div>
    </div>
  );
}
