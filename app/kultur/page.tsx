'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

const TIMELINE = [
  { year: '~3000 BCE', event: 'Erste germanische Stämme', en: 'First Germanic tribes appear in Northern Europe.' },
  { year: '55 BCE', event: 'Cäsar erobert Gallien', en: 'Caesar conquers Gaul — encounters Germanic peoples across the Rhine.' },
  { year: '800 CE', event: 'Karl der Große', en: 'Charlemagne crowned Holy Roman Emperor. Old High German begins to standardize.' },
  { year: '1517', event: 'Luthers Thesen', en: 'Martin Luther nails 95 theses — German Bible translation (Luther-Bibel) standardizes the language.' },
  { year: '1740–1815', event: 'Aufklärung & Klassik', en: 'Enlightenment era. Goethe, Schiller, Lessing define German letters.' },
  { year: '1871', event: 'Deutsches Reich', en: 'Otto von Bismarck unifies Germany. Standard High German becomes national language.' },
  { year: '1945–1990', event: 'Teilung', en: 'Germany divided into East (DDR) and West (BRD). Wall falls 1989.' },
  { year: '1990', event: 'Wiedervereinigung', en: 'Reunification. Berlin becomes capital again.' },
  { year: '2000s', event: 'EU & Migration', en: 'Germany becomes top EU economy. "Wir schaffen das" — Merkel, 2015.' },
];

const IDIOMS = [
  {
    de: 'Ich verstehe nur Bahnhof.',
    literal: 'I understand only train station.',
    en: 'I don\'t understand anything at all.',
    story: 'Comes from WWI soldiers who claimed to only know the word "Bahnhof" so they could get sent home.',
    example: '"Was hast du gesagt? Ich verstehe nur Bahnhof." — "What did you say? I don\'t understand a thing."',
  },
  {
    de: 'Tomaten auf den Augen haben.',
    literal: 'To have tomatoes on your eyes.',
    en: 'To be oblivious to what\'s right in front of you.',
    story: 'A whimsical way to call someone unobservant. "Where did you put the keys?" "Tomatoes on your eyes?"',
    example: '"Hast du meine Brille gesehen?" — "Hast du Tomaten auf den Augen? Sie liegt auf deiner Nase."',
  },
  {
    de: 'Da steppt der Bär.',
    literal: 'There the bear dances.',
    en: 'The party is hopping / there\'s real action.',
    story: 'From Bavarian folk festivals where dancing bears were entertainment. Now means a lively party.',
    example: '"Auf der Hochzeit steppt der Bär!" — "At the wedding, things are really hopping!"',
  },
  {
    de: 'Das ist nicht mein Bier.',
    literal: 'That\'s not my beer.',
    en: 'That\'s not my problem / concern.',
    story: 'Another drinking-based idiom. Not my drink, not my problem.',
    example: '"Soll ich ihr helfen?" — "Nein, das ist nicht mein Bier."',
  },
  {
    de: 'Ich habe einen Kater.',
    literal: 'I have a tomcat.',
    en: 'I have a hangover.',
    story: 'Kater originally meant the male cat. After drinking all night, you\'re "tomcat-tired."',
    example: '"Wie geht\'s dir?" — "Ich habe einen Kater. Gestern Abend war zu viel Wein."',
  },
  {
    de: 'Die Daumen drücken.',
    literal: 'Press the thumbs.',
    en: 'To wish someone good luck.',
    story: 'Ancient Germanic charm — the thumb was a symbol of strength and luck. "I\'ll press my thumbs for you."',
    example: '"Ich drücke dir die Daumen für deine Prüfung!" — "Good luck on your exam!"',
  },
  {
    de: 'Es ist nicht alles Gold, was glänzt.',
    literal: 'Not everything that glitters is gold.',
    en: 'Appearances deceive.',
    story: 'Old German proverb (12th century), also known in English.',
    example: '"Das Angebot klingt gut, aber…" — "Ja, es ist nicht alles Gold, was glänzt."',
  },
  {
    de: 'Jetzt mal Butter bei die Fische.',
    literal: 'Now butter with the fish.',
    en: 'Get to the point. (Northern German)',
    story: 'Maritime origin: butter on fish made it easier to swallow — i.e., make the truth easier to accept.',
    example: '"Jetzt mal Butter bei die Fische — hast du die Arbeit gemacht oder nicht?"',
  },
];

const DIALECTS = [
  {
    region: 'Bayerisch',
    regionEn: 'Bavarian',
    example: 'Servus!',
    standard: 'Hallo! Tschüss!',
    note: 'Southern Germany & Austria. "Servus" is the universal greeting (informal). Drop "st" endings: "i hoas" (ich heiße). Soft accent, melodic.',
    color: '#7FA85B',
  },
  {
    region: 'Schwäbisch',
    regionEn: 'Swabian',
    example: '\'s goht scho!',
    standard: 'Es geht schon / Es klappt.',
    note: 'Southwest (Baden-Württemberg). Known for being thrifty and hardworking. Famous dish: Maultaschen (similar to ravioli).',
    color: '#A8C088',
  },
  {
    region: 'Berlinerisch',
    regionEn: 'Berlin dialect',
    example: 'Ick bin een Berliner.',
    standard: 'Ich bin ein Berliner.',
    note: 'Berlin. Drop "ch" sounds — "ick" instead of "ich". Famous for dry humor ("Berliner Schnauze"). Survived division: East Berlin developed its own variants.',
    color: '#6B8E4E',
  },
  {
    region: 'Kölsch',
    regionEn: 'Cologne dialect',
    example: 'Et kütt wie et kütt.',
    standard: 'Es kommt, wie es kommt.',
    note: 'Cologne area. Cheerful, singsong quality. Famous for Carnival (Karneval). "Et kütt wie et kütt" = "It comes as it comes" (Cologne philosophy of life).',
    color: '#5C9C42',
  },
  {
    region: 'Sächsisch',
    regionEn: 'Saxon',
    example: 'Nu ja, des weeß ick ooch nich.',
    standard: 'Nun ja, das weiß ich auch nicht.',
    note: 'Eastern Germany (Saxony). Distinctive "soft" vowels. Some speakers worry it sounds harsh, but most Saxons are proud of it.',
    color: '#4A7C2E',
  },
  {
    region: 'Plattdeutsch',
    regionEn: 'Low German',
    example: 'Moin!',
    standard: 'Hallo! Guten Tag!',
    note: 'Northern Germany (and Netherlands). Closely related to Dutch and English! "Moin" = the universal northern greeting. UNESCO recognized as endangered.',
    color: '#1F3A0E',
  },
];

type Tab = 'timeline' | 'idioms' | 'dialects';

export default function KulturPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tab, setTab] = useState<Tab>('timeline');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

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
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Kultur · Culture & Society
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Land und Leute
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Language is culture. To read German, you need German stories.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          {(['timeline', 'idioms', 'dialects'] as Tab[]).map(tk => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              style={{
                padding: '8px 14px',
                background: tab === tk ? t.accent : 'transparent',
                color: tab === tk ? t.onAccent : t.text,
                border: '1px solid ' + (tab === tk ? t.accent : t.border),
                borderRadius: 6,
                fontSize: '0.85rem',
                fontWeight: tab === tk ? 700 : 400,
                cursor: 'pointer',
                fontFamily: FONTS.body,
              }}
            >
              {tk === 'timeline' ? 'Geschichte · History' : tk === 'idioms' ? 'Redewendungen · Idioms' : 'Dialekte · Dialects'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {tab === 'timeline' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
            From bronze-age tribes to modern EU leader — 9 milestones.
          </p>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: t.border }} />

            {TIMELINE.map((evt, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, marginBottom: 20,
                position: 'relative',
              }}>
                {/* Dot */}
                <div style={{
                  width: 60, flexShrink: 0, position: 'relative',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: t.accent, border: '4px solid ' + t.cardBg,
                    position: 'relative', zIndex: 1, marginTop: 6,
                  }} />
                  <div style={{
                    fontFamily: FONTS.display, fontSize: '0.85rem', fontWeight: 600,
                    color: t.accent, marginTop: 6,
                  }}>
                    {evt.year}
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  background: t.cardBg, border: '1px solid ' + t.border,
                  borderRadius: 10, padding: 16, flex: 1, boxShadow: t.shadow,
                }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: '1.1rem', color: t.text, fontWeight: 600, marginBottom: 4 }}>
                    {evt.event}
                  </div>
                  <div style={{ fontFamily: FONTS.reading, fontSize: '0.9rem', color: t.textMuted, fontStyle: 'italic', lineHeight: 1.6 }}>
                    {evt.en}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idioms */}
      {tab === 'idioms' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
            German idioms are vivid. Tomatoes on the eyes, dancing bears — German is not afraid of weird metaphors.
          </p>

          {IDIOMS.map((idiom, i) => (
            <div key={i} style={{
              background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
              padding: 20, marginBottom: 12, boxShadow: t.shadow,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: '1.25rem', fontWeight: 600, color: t.accent }}>
                  {idiom.de}
                </div>
                <div style={{ fontSize: '0.8rem', color: t.textFaint, fontFamily: FONTS.mono }}>
                  {idiom.literal}
                </div>
              </div>

              <div style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.text, marginBottom: 8 }}>
                → <strong>{idiom.en}</strong>
              </div>

              <div style={{ fontFamily: FONTS.reading, fontSize: '0.9rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>
                Origin: {idiom.story}
              </div>

              <div style={{
                background: t.bg, border: '1px dashed ' + t.border,
                borderRadius: 6, padding: 10, marginTop: 8,
                fontFamily: FONTS.reading, fontSize: '0.9rem', color: t.text,
              }}>
                💬 {idiom.example}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialects */}
      {tab === 'dialects' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
            Standard German (Hochdeutsch) is one of many. Each region has its own — sometimes unintelligible to other Germans.
          </p>

          {DIALECTS.map((d, i) => (
            <div key={i} style={{
              background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
              padding: 20, marginBottom: 12, boxShadow: t.shadow,
              borderLeft: '4px solid ' + d.color,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 8 }}>
                <div>
                  <span style={{ fontFamily: FONTS.display, fontSize: '1.3rem', fontWeight: 600, color: t.text }}>{d.region}</span>
                  <span style={{ color: t.textMuted, fontSize: '0.85rem', marginLeft: 8, fontFamily: FONTS.reading, fontStyle: 'italic' }}>{d.regionEn}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  background: t.accentSoft, border: '1px solid ' + t.accent,
                  padding: '8px 12px', borderRadius: 6, flex: 1, minWidth: 200,
                }}>
                  <div style={{ fontSize: '0.7rem', color: t.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>In dialect</div>
                  <div style={{ fontFamily: FONTS.reading, color: t.text, fontSize: '1rem', fontStyle: 'italic' }}>{d.example}</div>
                </div>
                <div style={{
                  background: t.bg, border: '1px solid ' + t.border,
                  padding: '8px 12px', borderRadius: 6, flex: 1, minWidth: 200,
                }}>
                  <div style={{ fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>In standard</div>
                  <div style={{ fontFamily: FONTS.reading, color: t.text, fontSize: '1rem' }}>{d.standard}</div>
                </div>
              </div>

              <div style={{ fontFamily: FONTS.reading, fontSize: '0.9rem', color: t.textMuted, lineHeight: 1.6 }}>
                {d.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
