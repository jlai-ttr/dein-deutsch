'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

type Case = 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
type Gender = 'maskulin' | 'feminin' | 'neutral' | 'plural';

const ARTICLES: Record<Gender, Record<Case, string>> = {
  maskulin: { Nominativ: 'der', Akkusativ: 'den', Dativ: 'dem', Genitiv: 'des' },
  feminin:  { Nominativ: 'die', Akkusativ: 'die', Dativ: 'der', Genitiv: 'der' },
  neutral:  { Nominativ: 'das', Akkusativ: 'das', Dativ: 'dem', Genitiv: 'des' },
  plural:   { Nominativ: 'die', Akkusativ: 'die', Dativ: 'den', Genitiv: 'der' },
};

const ENDINGS: Record<Gender, Record<Case, string>> = {
  // Noun declension endings for "der/die/das + adjective + noun"
  maskulin: { Nominativ: '-e', Akkusativ: '-en', Dativ: '-en', Genitiv: '-en' },
  feminin:  { Nominativ: '-e', Akkusativ: '-e', Dativ: '-en', Genitiv: '-en' },
  neutral:  { Nominativ: '-e', Akkusativ: '-e', Dativ: '-en', Genitiv: '-en' },
  plural:   { Nominativ: '-en', Akkusativ: '-en', Dativ: '-en', Genitiv: '-en' },
};

const PRONOUNS: Record<Case, string[]> = {
  Nominativ: ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'Sie'],
  Akkusativ: ['mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'sie', 'Sie'],
  Dativ:     ['mir', 'dir', 'ihm', 'ihr', 'ihm', 'uns', 'euch', 'ihnen', 'Ihnen'],
  Genitiv:   ['meiner', 'deiner', 'seiner', 'ihrer', 'seiner', 'unser', 'euer', 'ihrer', 'Ihrer'],
};

// Strong verbs — common ones used for conjugation practice
const VERBS: Record<string, { meaning: string; sein: boolean; present: Record<string, string>; perfekt: string }> = {
  gehen:    { meaning: 'to go',          sein: true,  present: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' }, perfekt: 'gegangen' },
  sein:     { meaning: 'to be',          sein: true,  present: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' }, perfekt: 'gewesen' },
  haben:    { meaning: 'to have',        sein: false, present: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' }, perfekt: 'gehabt' },
  werden:   { meaning: 'to become',      sein: true,  present: { ich: 'werde', du: 'wirst', er: 'wird', wir: 'werden', ihr: 'werdet', sie: 'werden' }, perfekt: 'geworden' },
  machen:   { meaning: 'to do/make',     sein: false, present: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' }, perfekt: 'gemacht' },
  kommen:   { meaning: 'to come',        sein: true,  present: { ich: 'komme', du: 'kommst', er: 'kommt', wir: 'kommen', ihr: 'kommt', sie: 'kommen' }, perfekt: 'gekommen' },
  sehen:    { meaning: 'to see',         sein: false, present: { ich: 'sehe', du: 'siehst', er: 'sieht', wir: 'sehen', ihr: 'seht', sie: 'sehen' }, perfekt: 'gesehen' },
  essen:    { meaning: 'to eat',         sein: false, present: { ich: 'esse', du: 'isst', er: 'isst', wir: 'essen', ihr: 'esst', sie: 'essen' }, perfekt: 'gegessen' },
  trinken:  { meaning: 'to drink',       sein: false, present: { ich: 'trinke', du: 'trinkst', er: 'trinkt', wir: 'trinken', ihr: 'trinkt', sie: 'trinken' }, perfekt: 'getrunken' },
  schlafen: { meaning: 'to sleep',       sein: false, present: { ich: 'schlafe', du: 'schläfst', er: 'schläft', wir: 'schlafen', ihr: 'schlaft', sie: 'schlafen' }, perfekt: 'geschlafen' },
};

type Section = 'faelle' | 'verben' | 'word-order';

export default function GrammatikPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [section, setSection] = useState<Section>('faelle');
  const [selectedVerb, setSelectedVerb] = useState<keyof typeof VERBS>('gehen');
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
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Grammatik · Grammar Reference
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Die deutschen Fälle und Verben
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Quick reference. Save this page and return when confused.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {(['faelle', 'verben', 'word-order'] as Section[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                padding: '8px 14px',
                background: section === s ? t.accent : 'transparent',
                color: section === s ? t.onAccent : t.text,
                border: '1px solid ' + (section === s ? t.accent : t.border),
                borderRadius: 6,
                fontSize: '0.85rem',
                fontWeight: section === s ? 700 : 400,
                cursor: 'pointer',
                fontFamily: FONTS.body,
              }}
            >
              {s === 'faelle' ? 'Fälle · Cases' : s === 'verben' ? 'Verben · Verbs' : 'Wortstellung · Word Order'}
            </button>
          ))}
        </div>
      </div>

      {/* Fälle section */}
      {section === 'faelle' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 16 }}>
            German has <strong style={{ color: t.text }}>four grammatical cases</strong>. The case tells you the function of a noun in the sentence — subject, direct object, indirect object, or possession.
          </p>

          {/* Articles table */}
          <div style={{
            background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
            overflow: 'hidden', marginBottom: 24, boxShadow: t.shadow,
          }}>
            <div style={{
              background: t.bg, padding: '12px 20px',
              borderBottom: '1px solid ' + t.border,
              fontFamily: FONTS.display, fontSize: '1.1rem', fontWeight: 600, color: t.text,
            }}>
              📐 Bestimmte Artikel · Definite Articles
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.reading }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: '0.75rem', color: t.textMuted, textTransform: 'uppercase' }}></th>
                  {(Object.keys(ARTICLES.maskulin) as Case[]).map(c => (
                    <th key={c} style={{ padding: 12, textAlign: 'center', fontSize: '0.85rem', color: t.text }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ARTICLES) as Gender[]).map(g => (
                  <tr key={g} style={{ borderTop: '1px solid ' + t.border }}>
                    <td style={{ padding: 12, fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic' }}>{g}</td>
                    {(Object.keys(ARTICLES[g]) as Case[]).map(c => (
                      <td key={c} style={{ padding: 12, textAlign: 'center', fontFamily: FONTS.display, fontSize: '1.15rem', color: t.accent, fontWeight: 700 }}>
                        {ARTICLES[g][c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pronouns table */}
          <div style={{
            background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
            overflow: 'hidden', marginBottom: 24, boxShadow: t.shadow,
          }}>
            <div style={{
              background: t.bg, padding: '12px 20px',
              borderBottom: '1px solid ' + t.border,
              fontFamily: FONTS.display, fontSize: '1.1rem', fontWeight: 600, color: t.text,
            }}>
              🪞 Personalpronomen · Personal Pronouns
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.reading }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: '0.75rem', color: t.textMuted, textTransform: 'uppercase' }}></th>
                  {(Object.keys(PRONOUNS) as Case[]).map(c => (
                    <th key={c} style={{ padding: 12, textAlign: 'center', fontSize: '0.85rem', color: t.text }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'].map((label, i) => {
                  const indices = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [2, 3, 2, 2],
                    [5, 5, 5, 5],
                    [6, 6, 6, 6],
                    [7, 7, 7, 7],
                  ][i];
                  return (
                    <tr key={i} style={{ borderTop: '1px solid ' + t.border }}>
                      <td style={{ padding: 12, fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic' }}>{label}</td>
                      {(['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'] as Case[]).map(c => (
                        <td key={c} style={{ padding: 12, textAlign: 'center', fontFamily: FONTS.display, fontSize: '1.05rem', color: t.text }}>
                          {PRONOUNS[c][indices[i]]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Usage tips */}
          <div style={{
            background: t.accentSoft, border: '1px solid ' + t.accent,
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.1rem', fontWeight: 600, color: t.accent, marginBottom: 12 }}>
              💡 Wann benutze ich welchen Fall?
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: t.text, fontFamily: FONTS.reading, lineHeight: 1.8 }}>
              <li><strong style={{ color: t.accent }}>Nominativ</strong> — Subject (who does it?) → <em>Der Mann</em> liest ein Buch.</li>
              <li><strong style={{ color: t.accent }}>Akkusativ</strong> — Direct object (what?) → Ich sehe <em>den Mann</em>.</li>
              <li><strong style={{ color: t.accent }}>Dativ</strong> — Indirect object (to whom?) → Ich helfe <em>dem Mann</em>.</li>
              <li><strong style={{ color: t.accent }}>Genitiv</strong> — Possession (whose?) → Das Auto <em>des Mannes</em> ist rot.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Verben section */}
      {section === 'verben' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 16 }}>
            Pick a verb to see the full present tense conjugation + Perfekt (past tense) formation.
          </p>

          {/* Verb selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {(Object.keys(VERBS) as (keyof typeof VERBS)[]).map(k => (
              <button
                key={k}
                onClick={() => setSelectedVerb(k)}
                style={{
                  padding: '6px 12px',
                  background: selectedVerb === k ? t.accent : t.cardBg,
                  color: selectedVerb === k ? t.onAccent : t.text,
                  border: '1px solid ' + (selectedVerb === k ? t.accent : t.border),
                  borderRadius: 5,
                  fontSize: '0.85rem',
                  fontWeight: selectedVerb === k ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: FONTS.reading,
                  fontStyle: 'italic',
                }}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Verb table */}
          {(() => {
            const v = VERBS[selectedVerb];
            return (
              <div style={{
                background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
                overflow: 'hidden', marginBottom: 24, boxShadow: t.shadow,
              }}>
                <div style={{
                  background: t.bg, padding: '16px 20px',
                  borderBottom: '1px solid ' + t.border,
                }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: '1.5rem', fontWeight: 600, color: t.accent }}>{selectedVerb}</div>
                  <div style={{ fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic', marginTop: 2 }}>
                    {v.meaning} · {v.sein ? 'Auxiliary: sein' : 'Auxiliary: haben'} · Perfekt: ge{v.perfekt}
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.reading }}>
                  <tbody>
                    {(['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] as const).map((label, i) => {
                      const keys = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'] as const;
                      return (
                        <tr key={i} style={{ borderTop: '1px solid ' + t.border }}>
                          <td style={{ padding: 14, fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', width: 100 }}>{label}</td>
                          <td style={{ padding: 14, fontFamily: FONTS.display, fontSize: '1.15rem', color: t.text }}>
                            {v.present[keys[i]]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Beispiel */}
          <div style={{
            background: t.accentSoft, border: '1px solid ' + t.accent,
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.1rem', fontWeight: 600, color: t.accent, marginBottom: 8 }}>
              📝 Beispiele · Examples
            </div>
            {(() => {
              const v = VERBS[selectedVerb];
              return (
                <div style={{ fontFamily: FONTS.reading, color: t.text, lineHeight: 1.8 }}>
                  <div><strong style={{ color: t.accent }}>Präsens:</strong> Ich {v.present.ich} jeden Tag.</div>
                  <div><strong style={{ color: t.accent }}>Perfekt:</strong> Ich {v.sein ? 'bin' : 'habe'} ge{v.perfekt}.</div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Word Order section */}
      {section === 'word-order' && (
        <div>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
            German has one iron rule and one flexible rule.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RuleCard title="🔒 V2 — Verb comes second" t={t} examples={[
              { de: 'Ich gehe heute ins Kino.', en: '"I am going to the cinema today." — verb 2nd (gehe)' },
              { de: 'Heute gehe ich ins Kino.', en: '"Today I am going to the cinema." — verb still 2nd (gehe)' },
              { de: 'Ins Kino gehe ich heute.', en: '"To the cinema I am going today." — verb still 2nd (gehe)' },
            ]}>
              The <strong>conjugated verb</strong> is always the second element in a main clause, even if other elements wrap around it.
            </RuleCard>

            <RuleCard title="🔚 Verb-final in subordinate clauses" t={t} examples={[
              { de: 'Ich weiß, dass du heute kommst.', en: '"I know that you are coming today." — verb at the END (kommst)' },
              { de: 'Er sagt, dass er morgen arbeitet.', en: '"He says that he works tomorrow." — verb at END (arbeitet)' },
              { de: 'Ich bleibe zu Hause, weil ich krank bin.', en: '"I stay home because I am sick." — verb at END (bin)' },
            ]}>
              After <em>dass, weil, wenn, obwohl, weil, da, ob</em> etc., the verb goes to the <strong>end</strong>.
            </RuleCard>

            <RuleCard title="🔀 TeKaMoLo — Time · Cause · Manner · Place" t={t} examples={[
              { de: 'Ich fahre morgen (T) mit dem Bus (M) nach Berlin (P).', en: '"I travel tomorrow (T) by bus (M) to Berlin (P)."' },
              { de: 'Sie geht heute (T) mit ihrer Freundin (M) ins Café (P).', en: '"She goes today (T) with her friend (M) to the café (P)."' },
            ]}>
              The standard <strong>neutral sentence order</strong> is Time → Manner → Place. You can rearrange, but this is the default.
            </RuleCard>
          </div>
        </div>
      )}
    </div>
  );
}

function RuleCard({ title, examples, t, children }: { title: string; examples: Array<{ de: string; en: string }>; t: any; children: React.ReactNode }) {
  return (
    <div style={{
      background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
      padding: 24, boxShadow: t.shadow,
    }}>
      <h3 style={{
        fontFamily: FONTS.display, fontSize: '1.3rem', fontWeight: 600, color: t.accent,
        margin: '0 0 12px',
      }}>
        {title}
      </h3>
      <p style={{ fontFamily: FONTS.reading, color: t.textMuted, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>
        {children}
      </p>
      {examples.map((ex, i) => (
        <div key={i} style={{
          padding: 12, background: t.bg, borderRadius: 6,
          marginBottom: 8, fontFamily: FONTS.reading, fontSize: '0.95rem',
          border: '1px solid ' + t.border,
        }}>
          <div style={{ color: t.text, marginBottom: 4 }}>{ex.de}</div>
          <div style={{ color: t.textMuted, fontStyle: 'italic', fontSize: '0.85rem' }}>{ex.en}</div>
        </div>
      ))}
    </div>
  );
}
