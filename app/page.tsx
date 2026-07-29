'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { THEMES, CEFR_LEVELS, MODULES, FONTS, getTheme } from './lib/theme';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState({
    currentDay: 1,
    streakDays: 0,
    xp: 0,
    vocabCount: 0,
    minutesStudied: 0,
    level: 'A1',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dein-deutsch-theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    // Load progress from localStorage
    try {
      const p = localStorage.getItem('dein-deutsch-progress');
      if (p) setProgress(JSON.parse(p));
    } catch (e) {}
  }, []);

  if (!mounted) return null;
  const t = getTheme(theme);

  const currentLevel = CEFR_LEVELS.find(l => l.code === progress.level) || CEFR_LEVELS[0];
  const levelProgress = Math.min(100, (progress.vocabCount / currentLevel.wordsTarget) * 100);
  const nextLevel = CEFR_LEVELS[CEFR_LEVELS.indexOf(currentLevel) + 1];

  return (
    <div className="animate-fade-in">
      {/* Hero — Welcome banner */}
      <section style={{
        background: 'linear-gradient(135deg, ' + t.accentSoft + ' 0%, ' + t.cardBg + ' 100%)',
        border: '1px solid ' + t.border,
        borderRadius: 16,
        padding: '32px 28px',
        marginBottom: 28,
        boxShadow: t.shadowStrong,
      }}>
        <div style={{ fontFamily: FONTS.display, fontSize: '0.85rem', fontWeight: 500, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Willkommen zurück
        </div>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: '2.6rem',
          fontWeight: 700,
          color: t.text,
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          Dein Deutsch, dein Tempo.
        </h1>
        <p style={{
          fontFamily: FONTS.reading,
          fontSize: '1.1rem',
          color: t.textMuted,
          margin: '0 0 24px',
          fontStyle: 'italic',
        }}>
          Tag {progress.currentDay} · {progress.streakDays} {progress.streakDays === 1 ? 'Tag' : 'Tage'} in Folge · {currentLevel.code} · {progress.vocabCount} Wörter gelernt
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/heute" style={{
            padding: '12px 24px',
            background: t.accent,
            color: t.onAccent,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            boxShadow: '0 2px 0 ' + t.accentHover,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}>
            📖 Heute lernen →
          </Link>
          <Link href="/woerter" style={{
            padding: '12px 24px',
            background: t.cardBg,
            color: t.text,
            border: '1px solid ' + t.border,
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}>
            🪶 Vokabeln wiederholen
          </Link>
        </div>
      </section>

      {/* Stats row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        <StatCard label="Tag" value={progress.currentDay} sub={`von 540`} icon="📅" t={t} />
        <StatCard label="Streak" value={progress.streakDays} sub={progress.streakDays === 0 ? 'Heute starten!' : 'Tage'} icon="🔥" t={t} accent={progress.streakDays > 0} />
        <StatCard label="XP" value={progress.xp} sub="gesammelt" icon="✨" t={t} />
        <StatCard label="Wörter" value={progress.vocabCount} sub={`Ziel: ${currentLevel.wordsTarget}`} icon="🪶" t={t} />
      </section>

      {/* CEFR Progress Bar */}
      <section style={{
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        padding: 24,
        marginBottom: 28,
        boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.5rem', fontWeight: 600, color: t.text }}>
              {currentLevel.code} · {currentLevel.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: t.textMuted, marginTop: 2 }}>
              {progress.vocabCount} / {currentLevel.wordsTarget} Wörter · Ziel: {currentLevel.days} Tage
            </div>
          </div>
          {nextLevel && (
            <div style={{ fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontFamily: FONTS.reading }}>
              Nächstes Level: <span style={{ color: t.accent, fontWeight: 600 }}>{nextLevel.code}</span>
            </div>
          )}
        </div>

        {/* CEFR ladder */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {CEFR_LEVELS.map(lvl => {
            const reached = CEFR_LEVELS.indexOf(lvl) <= CEFR_LEVELS.indexOf(currentLevel);
            const isCurrent = lvl.code === currentLevel.code;
            return (
              <div key={lvl.code} style={{
                flex: 1,
                height: 36,
                background: reached ? lvl.color : t.bg,
                border: '2px solid ' + (isCurrent ? t.text : 'transparent'),
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: isCurrent ? 700 : 500,
                color: reached ? t.onAccent : t.textFaint,
                transition: 'all 0.2s ease',
                fontFamily: FONTS.display,
              }}>
                {lvl.code}
              </div>
            );
          })}
        </div>

        {/* Progress bar to next level */}
        <div style={{
          height: 8,
          background: t.bg,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid ' + t.border,
        }}>
          <div style={{
            height: '100%',
            width: levelProgress + '%',
            background: 'linear-gradient(90deg, ' + t.accentLight + ', ' + t.accent + ')',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: t.textFaint, marginTop: 6, fontFamily: FONTS.reading }}>
          {Math.round(levelProgress)}% bis {nextLevel ? nextLevel.code : 'C2 abgeschlossen'}
        </div>
      </section>

      {/* Module grid */}
      <section>
        <h2 style={{
          fontFamily: FONTS.display,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: t.text,
          margin: '0 0 16px',
        }}>
          Dein Haus
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {MODULES.map(m => (
            <Link
              key={m.id}
              href={'/' + m.id}
              style={{
                background: t.cardBg,
                border: '1px solid ' + t.border,
                borderRadius: 12,
                padding: 20,
                textDecoration: 'none',
                color: t.text,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: t.shadow,
                opacity: m.done ? 1 : 0.55,
                cursor: m.done ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
                {!m.done && (
                  <span style={{
                    fontSize: '0.65rem',
                    color: t.textFaint,
                    background: t.bg,
                    padding: '2px 6px',
                    borderRadius: 3,
                    border: '1px solid ' + t.border,
                  }}>
                    coming soon
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontFamily: FONTS.display, fontSize: '1.15rem', fontWeight: 600, color: t.text }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
                  {m.en}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick reference — German word of the day */}
      <section style={{
        marginTop: 28,
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        padding: 24,
        boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Wort des Tages
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: '2.4rem', fontWeight: 600, color: t.accent, marginBottom: 4 }}>
          Wanderlust
        </div>
        <div style={{ fontFamily: FONTS.reading, fontSize: '1.05rem', color: t.text, fontStyle: 'italic', marginBottom: 8 }}>
          <em>f.</em> — die Sehnsucht nach fernen Orten
        </div>
        <div style={{ fontSize: '0.85rem', color: t.textMuted }}>
          <span style={{ fontFamily: FONTS.reading, color: t.text }}>Wanderlust</span> treibt Reisende seit Jahrhunderten an, neue Horizonte zu entdecken.
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, icon, t, accent }: { label: string; value: any; sub: string; icon: string; t: any; accent?: boolean }) {
  return (
    <div style={{
      background: t.cardBg,
      border: '1px solid ' + t.border,
      borderRadius: 10,
      padding: 16,
      boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: accent ? t.accent : t.text, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: t.textFaint, fontFamily: FONTS.reading }}>{sub}</div>
    </div>
  );
}
