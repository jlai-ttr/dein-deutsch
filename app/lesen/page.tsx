'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';

// Graded readings — A1 through C2
const READINGS = [
  {
    id: 'a1-1',
    level: 'A1',
    title: 'Im Café',
    enTitle: 'At the Café',
    topic: 'Alltag · Daily Life',
    wordCount: 65,
    text: `Anna geht ins Café. Sie möchte einen Kaffee. Der Kellner kommt.\n\n„Was möchten Sie?", fragt er.\n\n„Einen Kaffee, bitte. Und ein Brötchen."\n\n„Gerne. Möchten Sie auch Kuchen?"\n\n„Nein, danke. Nur den Kaffee."\n\nDer Kaffee kostet drei Euro. Anna bezahlt und trinkt ihren Kaffee. Das Café ist ruhig. Sie liest ein Buch.`,
    vocab: [
      { de: 'gehen', en: 'to go', note: 'sie geht' },
      { de: 'möchten', en: 'to want (polite)', note: 'ich möchte' },
      { de: 'der Kaffee', en: 'coffee', note: 'masculine' },
      { de: 'der Kellner', en: 'waiter', note: 'masculine' },
      { de: 'bezahlen', en: 'to pay', note: 'sie bezahlt' },
      { de: 'ruhig', en: 'quiet', note: 'adjective' },
    ],
  },
  {
    id: 'a2-1',
    level: 'A2',
    title: 'Ein Wochenende in Berlin',
    enTitle: 'A Weekend in Berlin',
    topic: 'Reisen · Travel',
    wordCount: 110,
    text: `Letzten Samstag bin ich nach Berlin gefahren. Ich habe im Hostel übernachtet. Am Sonntag habe ich das Brandenburger Tor besucht.\n\nAm Vormittag bin ich durch den Tiergarten spaziert. Das Wetter war schön — die Sonne hat geschienen und es war warm.\n\nAm Nachmittag habe ich in einem Restaurant gegessen. Ich habe Currywurst mit Pommes bestellt. Es hat sehr gut geschmeckt!\n\nAm Abend bin ich mit der U-Bahn zum Hostel zurückgefahren. Ich war müde, aber glücklich. Berlin ist eine tolle Stadt.`,
    vocab: [
      { de: 'fahren', en: 'to drive/travel', note: 'er ist gefahren (sein)' },
      { de: 'übernachten', en: 'to stay overnight', note: 'hat übernachtet' },
      { de: 'besuchen', en: 'to visit', note: 'hat besucht' },
      { de: 'spazieren', en: 'to stroll', note: 'ist spaziert' },
      { de: 'scheinen', en: 'to shine', note: 'hat geschienen' },
      { de: 'bestellen', en: 'to order', note: 'hat bestellt' },
    ],
  },
  {
    id: 'b1-1',
    level: 'B1',
    title: 'Bewerbungsgespräch',
    enTitle: 'Job Interview',
    topic: 'Beruf · Work',
    wordCount: 180,
    text: `Frau Schmidt sitzt im Wartezimmer einer Personalabteilung. Sie hat sich auf eine Stelle als Marketingmanagerin beworben. Nach zehn Minuten kommt ein Mann und stellt sich als Herr Becker vor.\n\n„Guten Tag, Frau Schmidt. Bitte folgen Sie mir."\n\nIm Besprechungsraum bietet er ihr einen Stuhl an und fragt: „Erzählen Sie mir bitte etwas über Ihre bisherige Berufserfahrung."\n\nFrau Schmidt antwortet ruhig und selbstbewusst. Sie spricht über ihre letzten drei Positionen, ihre Erfolge und ihre Motivation. Herr Becker nickt und macht sich Notizen.\n\nAm Ende der Unterhaltung sagt er: „Wir melden uns innerhalb einer Woche bei Ihnen. Haben Sie noch Fragen?"\n\nFrau Schmidt fragt nach dem Gehalt und den Arbeitszeiten. Dann verabschieden sich beide höflich.`,
    vocab: [
      { de: 'sich bewerben', en: 'to apply', note: 'hat sich beworben (reflexive)' },
      { de: 'die Stelle', en: 'position', note: 'feminine' },
      { de: 'sich vorstellen', en: 'to introduce oneself', note: 'hat sich vorgestellt' },
      { de: 'die Erfahrung', en: 'experience', note: 'feminine' },
      { de: 'selbstbewusst', en: 'self-confident', note: 'adjective' },
      { de: 'die Unterhaltung', en: 'conversation', note: 'feminine' },
    ],
  },
  {
    id: 'b2-1',
    level: 'B2',
    title: 'Die Zukunft der Arbeit',
    enTitle: 'The Future of Work',
    topic: 'Gesellschaft · Society',
    wordCount: 280,
    text: `Die Digitalisierung verändert die Arbeitswelt grundlegend. Während viele Berufe automatisierbar werden, entstehen gleichzeitig neue Tätigkeitsfelder, die wir heute noch gar nicht kennen.\n\nExperten sind sich uneinig, ob diese Entwicklung eher Chancen oder Risiken birgt. Optimisten argumentieren, dass künstliche Intelligenz den Menschen von monotonen Aufgaben befreien wird. Pessimisten befürchten hingegen Massenarbeitslosigkeit und wachsende soziale Ungleichheit.\n\nWas häufig übersehen wird, ist die Rolle der Bildung. Wer bereit ist, sich kontinuierlich weiterzubilden, wird vom Wandel profitieren. Wer jedoch an alten Qualifikationen festhält, läuft Gefahr, den Anschluss zu verlieren. Lebenslanges Lernen ist daher keine Floskel mehr, sondern eine Notwendigkeit.\n\nDie Politik steht vor der Herausforderung, Rahmenbedingungen zu schaffen, die diesen Übergang sozialverträglich gestalten. Dazu gehören Investitionen in Bildung, eine moderne Infrastruktur und möglicherweise neue Modelle der Grundsicherung.`,
    vocab: [
      { de: 'grundlegend', en: 'fundamentally', note: 'adverb' },
      { de: 'uneinig sein', en: 'to be in disagreement', note: 'sind sich uneinig' },
      { de: 'bergen', en: 'to harbor (risk/chance)', note: 'birgt → barg → geborgen' },
      { de: 'befürchten', en: 'to fear', note: 'befürchtet' },
      { de: 'übersehen werden', en: 'to be overlooked (passive)', note: 'wird übersehen' },
      { de: 'der Anschluss', en: 'connection, keeping up', note: 'den Anschluss verlieren' },
      { de: 'die Floskel', en: 'empty phrase', note: 'feminine, pejorative' },
      { de: 'sozialverträglich', en: 'socially acceptable', note: 'compound adj.' },
    ],
  },
];

export default function LesenPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [translated, setTranslated] = useState<Set<string>>(new Set());
  const [showTranslations, setShowTranslations] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    const savedIdx = localStorage.getItem('dein-deutsch-lesen-idx');
    if (savedIdx) setCurrentIdx(parseInt(savedIdx, 10));
  }, []);

  const reading = READINGS[currentIdx] || READINGS[0];

  function toggleTranslation(word: string) {
    const next = new Set(translated);
    if (next.has(word)) next.delete(word);
    else next.add(word);
    setTranslated(next);
  }

  function next() {
    const newIdx = (currentIdx + 1) % READINGS.length;
    setCurrentIdx(newIdx);
    setTranslated(new Set());
    setShowTranslations(false);
    localStorage.setItem('dein-deutsch-lesen-idx', newIdx.toString());
  }

  if (!mounted) return null;
  const t = getTheme(theme);

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
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Lesen · Reading Practice
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
            {reading.title}
          </h1>
          <span style={{
            padding: '4px 10px', background: t.accentSoft, color: t.accent,
            borderRadius: 4, fontSize: '0.8rem', fontWeight: 700,
            border: '1px solid ' + t.accent,
          }}>
            {reading.level}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading }}>
          <span>{reading.enTitle}</span>
          <span>·</span>
          <span style={{ fontStyle: 'italic' }}>{reading.topic}</span>
          <span>·</span>
          <span>{reading.wordCount} Wörter</span>
        </div>
      </div>

      {/* Reading */}
      <article style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: '32px 36px', boxShadow: t.shadowStrong, marginBottom: 20,
      }}>
        <div className="duo-reading" style={{
          color: t.text,
          marginBottom: 24,
        }}>
          {reading.text.split('\n\n').map((p, i) => (
            <p key={i} style={{ marginBottom: 16 }}>{p}</p>
          ))}
        </div>

        {/* Toggle vocab visibility */}
        <div style={{
          borderTop: '1px dashed ' + t.border,
          paddingTop: 20,
        }}>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            style={{
              padding: '8px 16px',
              background: showTranslations ? t.accent : 'transparent',
              color: showTranslations ? t.onAccent : t.accent,
              border: '1px solid ' + t.accent,
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONTS.body,
            }}
          >
            {showTranslations ? '🙈 Übersetzungen verbergen' : '👁 Übersetzungen zeigen'}
          </button>

          {showTranslations && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Wichtige Wörter · Key Vocabulary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                {reading.vocab.map((v, i) => (
                  <div key={i} style={{
                    background: t.bg,
                    border: '1px solid ' + t.border,
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: FONTS.reading, fontSize: '1.05rem', color: t.text, fontWeight: 600 }}>{v.de}</span>
                      <span style={{ color: t.textMuted, fontSize: '0.85rem', fontFamily: FONTS.reading, fontStyle: 'italic' }}>{v.en}</span>
                    </div>
                    {v.note && (
                      <div style={{ fontSize: '0.7rem', color: t.textFaint, marginTop: 4, fontFamily: FONTS.mono }}>
                        {v.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <button
          onClick={() => {
            const newIdx = (currentIdx - 1 + READINGS.length) % READINGS.length;
            setCurrentIdx(newIdx);
            setTranslated(new Set());
            setShowTranslations(false);
            localStorage.setItem('dein-deutsch-lesen-idx', newIdx.toString());
          }}
          style={{
            padding: '10px 20px',
            background: t.cardBg,
            color: t.text,
            border: '1px solid ' + t.border,
            borderRadius: 8,
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: FONTS.body,
          }}
        >
          ← Vorheriger Text
        </button>
        <div style={{ alignSelf: 'center', fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading }}>
          {currentIdx + 1} / {READINGS.length}
        </div>
        <button
          onClick={next}
          style={{
            padding: '10px 20px',
            background: t.accent,
            color: t.onAccent,
            border: 'none',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: FONTS.body,
          }}
        >
          Nächster Text →
        </button>
      </div>
    </div>
  );
}
