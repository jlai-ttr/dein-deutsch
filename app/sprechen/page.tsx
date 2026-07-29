'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';

// Phrases organized by scenario + level
const SCENARIOS = [
  {
    id: 'greetings',
    title: 'Begrüßung',
    en: 'Greetings',
    icon: '👋',
    phrases: [
      { de: 'Guten Morgen!', en: 'Good morning!', pronunciation: 'GOO-ten MOR-gen' },
      { de: 'Guten Tag!', en: 'Hello / Good day!', pronunciation: 'GOO-ten TAHK' },
      { de: 'Guten Abend!', en: 'Good evening!', pronunciation: 'GOO-ten AH-bent' },
      { de: 'Gute Nacht!', en: 'Good night!', pronunciation: 'GOO-teh NAKHT' },
      { de: 'Auf Wiedersehen!', en: 'Goodbye (formal)!', pronunciation: 'OWF VEE-der-zayn' },
      { de: 'Tschüss!', en: 'Bye (informal)!', pronunciation: 'CHOOSS' },
      { de: 'Wie geht es Ihnen?', en: 'How are you (formal)?', pronunciation: 'VEE gayt es EE-nen' },
      { de: 'Mir geht es gut.', en: 'I am doing well.', pronunciation: 'MEER gayt es GOOT' },
      { de: 'Freut mich!', en: 'Pleased to meet you!', pronunciation: 'FROYOT mikh' },
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    en: 'At the restaurant',
    icon: '🍽️',
    phrases: [
      { de: 'Einen Tisch für zwei, bitte.', en: 'A table for two, please.', pronunciation: 'EY-nen TISH foor TSVAY, BITT-eh' },
      { de: 'Die Speisekarte, bitte.', en: 'The menu, please.', pronunciation: 'dee SHPEY-zeh-kar-teh, BITT-eh' },
      { de: 'Was empfehlen Sie?', en: 'What do you recommend?', pronunciation: 'vas emp-FAY-len zee' },
      { de: 'Ich möchte bestellen.', en: 'I would like to order.', pronunciation: 'ikh MERKH-teh beh-SHTEL-len' },
      { de: 'Einmal die Currywurst, bitte.', en: 'One currywurst, please.', pronunciation: 'EYN-mahl dee KOOR-ee-voorst, BITT-eh' },
      { de: 'Noch ein Bier, bitte.', en: 'Another beer, please.', pronunciation: 'nokh eyn BEER, BITT-eh' },
      { de: 'Die Rechnung, bitte.', en: 'The bill, please.', pronunciation: 'dee REKH-noong, BITT-eh' },
      { de: 'Zahlen, bitte.', en: 'Pay, please.', pronunciation: 'TSAH-len, BITT-eh' },
    ],
  },
  {
    id: 'directions',
    title: 'Wegbeschreibung',
    en: 'Directions',
    icon: '🗺️',
    phrases: [
      { de: 'Wo ist der Bahnhof?', en: 'Where is the train station?', pronunciation: 'vo ist dair BAHN-hof' },
      { de: 'Wie komme ich zum Museum?', en: 'How do I get to the museum?', pronunciation: 'vee KOM-eh ikh tsoom moo-ZAY-oom' },
      { de: 'Geradeaus, bitte.', en: 'Straight ahead, please.', pronunciation: 'geh-RAH-deh-owss, BITT-eh' },
      { de: 'Links abbiegen.', en: 'Turn left.', pronunciation: 'links AHP-bee-gen' },
      { de: 'Rechts abbiegen.', en: 'Turn right.', pronunciation: 'rekhts AHP-bee-gen' },
      { de: 'Die erste Straße links.', en: 'The first street on the left.', pronunciation: 'dee AYR-steh SHTRAH-seh links' },
      { de: 'Ist es weit von hier?', en: 'Is it far from here?', pronunciation: 'ist es VAIT fon heer' },
      { de: 'Zu Fuß etwa zehn Minuten.', en: 'On foot about ten minutes.', pronunciation: 'tsoo FOOS AYTH-vah TSVAYN mee-NOO-ten' },
    ],
  },
  {
    id: 'shopping',
    title: 'Einkaufen',
    en: 'Shopping',
    icon: '🛍️',
    phrases: [
      { de: 'Was kostet das?', en: 'How much does that cost?', pronunciation: 'vas KOS-tet das' },
      { de: 'Haben Sie das in Größe M?', en: 'Do you have this in size M?', pronunciation: 'HAH-ben zee das in GROY-seh em' },
      { de: 'Kann ich es anprobieren?', en: 'Can I try it on?', pronunciation: 'kan ikh es ahn-pro-BEE-ren' },
      { de: 'Wo ist die Umkleidekabine?', en: 'Where is the fitting room?', pronunciation: 'vo ist dee OOM-klay-deh-ka-BEE-neh' },
      { de: 'Nehmen Sie Kreditkarten?', en: 'Do you take credit cards?', pronunciation: 'NAY-men zee KREH-dit-kar-ten' },
      { de: 'Kann ich bar bezahlen?', en: 'Can I pay cash?', pronunciation: 'kan ikh bar beh-TSAH-len' },
      { de: 'Ich suche ein Geschenk.', en: 'I am looking for a gift.', pronunciation: 'ikh ZOO-kheh eyn ge-SHEnk' },
      { de: 'Die Tüte, bitte.', en: 'The bag, please.', pronunciation: 'dee TOO-teh, BITT-eh' },
    ],
  },
  {
    id: 'work',
    title: 'Im Büro',
    en: 'At work',
    icon: '💼',
    phrases: [
      { de: 'Guten Morgen, alle zusammen!', en: 'Good morning, everyone!', pronunciation: 'GOO-ten MOR-gen, AHL-eh tsoo-za-MEN' },
      { de: 'Haben Sie einen Moment?', en: 'Do you have a moment?', pronunciation: 'HAH-ben zee EYE-nen mo-MENT' },
      { de: 'Können wir das besprechen?', en: 'Can we discuss this?', pronunciation: 'KER-nen veer das beh-SHPREKH-en' },
      { de: 'Ich schicke Ihnen eine E-Mail.', en: 'I will send you an email.', pronunciation: 'ikh SHIK-eh EE-nen EYE-neh EE-mayl' },
      { de: 'Wann ist das Meeting?', en: 'When is the meeting?', pronunciation: 'van ist das MEE-ting' },
      { de: 'Ich melde mich später.', en: 'I will get back to you later.', pronunciation: 'ikh MEL-deh mikh SHPAY-ter' },
      { de: 'Vielen Dank für Ihre Hilfe.', en: 'Thanks much for your help.', pronunciation: 'FEE-len dangk foor EE-reh HIL-feh' },
      { de: 'Auf Wiederhören.', en: 'Goodbye (on phone).', pronunciation: 'owf VEE-der-HEAR-en' },
    ],
  },
];

export default function SprechenPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.8);
  const [mounted, setMounted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
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
      const updateVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        // Prefer German voice
        const de = v.find(x => x.lang.startsWith('de'));
        if (de) setSelectedVoice(de.name);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  function speak(de: string) {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(de);
    utterance.lang = 'de-DE';
    utterance.rate = rate;
    utterance.pitch = 1;
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (supportsTTS) window.speechSynthesis.cancel();
    setPlaying(false);
  }

  if (!mounted) return null;
  const t = getTheme(theme);

  const phrase = scenario.phrases[phraseIdx];

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
          Sprechen · Speaking Practice
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Hör zu. Sprich nach.
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Listen to native pronunciation. Repeat after each phrase. Start slow (0.6×), build to natural speed (1.0×).
        </p>
      </div>

      {!supportsTTS && (
        <div style={{
          background: t.warning, color: 'white', padding: 16,
          borderRadius: 10, marginBottom: 16, fontSize: '0.9rem',
        }}>
          ⚠️ Your browser doesn't support text-to-speech. Use Chrome or Edge for the best experience.
        </div>
      )}

      {/* Scenario selector */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Scenario
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setScenario(s); setPhraseIdx(0); stopSpeaking(); }}
              style={{
                padding: '8px 12px',
                background: s.id === scenario.id ? t.accent : t.bg,
                color: s.id === scenario.id ? t.onAccent : t.text,
                border: '1px solid ' + (s.id === scenario.id ? t.accent : t.border),
                borderRadius: 6,
                fontSize: '0.85rem',
                fontWeight: s.id === scenario.id ? 700 : 400,
                cursor: 'pointer',
                fontFamily: FONTS.body,
              }}
            >
              <span style={{ marginRight: 6 }}>{s.icon}</span>{s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Controls: speed + voice */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 8,
          padding: 12, flex: 1, minWidth: 240,
        }}>
          <label style={{ fontSize: '0.75rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
            Geschwindigkeit: {rate.toFixed(1)}×
          </label>
          <input
            type="range"
            min="0.5"
            max="1.2"
            step="0.1"
            value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        {voices.length > 0 && (
          <div style={{
            background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 8,
            padding: 12, flex: 1, minWidth: 200,
          }}>
            <label style={{ fontSize: '0.75rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
              Stimme
            </label>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              style={{
                width: '100%', background: t.bg, color: t.text,
                border: '1px solid ' + t.border, borderRadius: 4,
                padding: '4px 8px', fontSize: '0.8rem',
              }}
            >
              {voices.filter(v => v.lang.startsWith('de') || v.lang.startsWith('en')).map(v => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active phrase */}
      <div style={{
        background: t.accentSoft, border: '1px solid ' + t.accent,
        borderRadius: 12, padding: 32, marginBottom: 16, textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.7rem', color: t.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          {scenario.title} · {phraseIdx + 1} / {scenario.phrases.length}
        </div>
        <div style={{
          fontFamily: FONTS.display, fontSize: '2.4rem', fontWeight: 700,
          color: t.text, marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          {phrase.de}
        </div>
        <div style={{
          fontFamily: FONTS.reading, fontSize: '1.1rem', color: t.textMuted,
          fontStyle: 'italic', marginBottom: 6,
        }}>
          {phrase.en}
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: '0.85rem', color: t.textFaint,
          padding: 8, background: t.bg, borderRadius: 6, display: 'inline-block',
          letterSpacing: '0.05em',
        }}>
          {phrase.pronunciation}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => speak(phrase.de)}
            disabled={!supportsTTS}
            style={{
              padding: '12px 28px',
              background: t.accent,
              color: t.onAccent,
              border: 'none',
              borderRadius: 10,
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: FONTS.display,
              cursor: supportsTTS ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 0 ' + t.accentHover,
            }}
          >
            {playing ? '▶️ Playing…' : '🔊 Anhören'}
          </button>
          {playing && (
            <button
              onClick={stopSpeaking}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                color: t.text,
                border: '1px solid ' + t.border,
                borderRadius: 10,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              ⏹ Stop
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => { setPhraseIdx(Math.max(0, phraseIdx - 1)); stopSpeaking(); }}
          disabled={phraseIdx === 0}
          style={{
            flex: 1, padding: '12px',
            background: t.cardBg, color: phraseIdx === 0 ? t.textFaint : t.text,
            border: '1px solid ' + t.border, borderRadius: 8,
            fontSize: '0.9rem', cursor: phraseIdx === 0 ? 'not-allowed' : 'pointer',
            fontFamily: FONTS.body,
          }}
        >
          ← Vorherige
        </button>
        <button
          onClick={() => { setPhraseIdx(Math.min(scenario.phrases.length - 1, phraseIdx + 1)); stopSpeaking(); }}
          disabled={phraseIdx === scenario.phrases.length - 1}
          style={{
            flex: 1, padding: '12px',
            background: t.cardBg, color: phraseIdx === scenario.phrases.length - 1 ? t.textFaint : t.text,
            border: '1px solid ' + t.border, borderRadius: 8,
            fontSize: '0.9rem', cursor: phraseIdx === scenario.phrases.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: FONTS.body,
          }}
        >
          Nächste →
        </button>
      </div>

      {/* All phrases list */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '1.3rem', color: t.text, margin: '0 0 12px' }}>
          Alle Phrasen · All Phrases ({scenario.phrases.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scenario.phrases.map((p, i) => (
            <button
              key={i}
              onClick={() => { setPhraseIdx(i); stopSpeaking(); }}
              style={{
                textAlign: 'left', padding: 12,
                background: i === phraseIdx ? t.accentSoft : t.cardBg,
                border: '1px solid ' + (i === phraseIdx ? t.accent : t.border),
                borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 4,
                background: i === phraseIdx ? t.accent : t.bg,
                color: i === phraseIdx ? t.onAccent : t.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.reading, color: t.text, fontSize: '0.95rem' }}>{p.de}</div>
                <div style={{ fontSize: '0.8rem', color: t.textMuted, fontStyle: 'italic' }}>{p.en}</div>
              </div>
              <span style={{ color: t.textFaint }}>🔊</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
