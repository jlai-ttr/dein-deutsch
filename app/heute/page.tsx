'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';

export default function HeutePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [day, setDay] = useState(1);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    const stored = localStorage.getItem('dein-deutsch-progress');
    let dayNum = 1;
    if (stored) {
      try {
        const p = JSON.parse(stored);
        dayNum = p.currentDay || 1;
        setDay(dayNum);
        setCompleted(p.todayCompleted || false);
      } catch (e) {}
    }
    loadLesson(dayNum);
  }, []);

  async function loadLesson(dayNum: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson/${dayNum}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        setContent(`# Tag ${dayNum}\n\nDas Lesson wird gerade vorbereitet. Heute lernen wir die nächsten deutschen Wörter und Sätze.\n\nKomm morgen wieder für die nächste Lektion!`);
      }
    } catch (e) {
      setContent('Verbindung fehlgeschlagen. Bitte versuche es erneut.');
    }
    setLoading(false);
  }

  async function markComplete() {
    const stored = localStorage.getItem('dein-deutsch-progress');
    const p = stored ? JSON.parse(stored) : { currentDay: 1, streakDays: 0, vocabCount: 0, xp: 0 };
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('dein-deutsch-last-completed');
    const newStreak = lastCompleted === today ? p.streakDays : (p.streakDays || 0) + 1;
    p.currentDay = Math.min(day + 1, 540);
    p.streakDays = newStreak;
    p.todayCompleted = true;
    p.xp = (p.xp || 0) + 15;
    p.vocabCount = (p.vocabCount || 0) + 10;
    localStorage.setItem('dein-deutsch-progress', JSON.stringify(p));
    localStorage.setItem('dein-deutsch-last-completed', today);
    setCompleted(true);
    setDay(p.currentDay);
  }

  function nextDay() {
    const newDay = day + 1;
    setDay(newDay);
    setCompleted(false);
    loadLesson(newDay);
  }

  function prevDay() {
    if (day > 1) {
      const newDay = day - 1;
      setDay(newDay);
      setCompleted(false);
      loadLesson(newDay);
    }
  }

  if (!mounted) return null;
  const t = getTheme(theme);

  const currentLevel = CEFR_LEVELS.find(l => day >= 1 && (day <= l.days || (l.code === 'C2' && day <= 540)));
  const levelName = currentLevel ? `${currentLevel.code} · ${currentLevel.name}` : 'A1';

  // Parse simple markdown-ish content
  const sections = content.split('\n\n').filter(Boolean);
  const title = sections[0] || `# Tag ${day}`;
  const body = sections.slice(1).join('\n\n');

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header card */}
      <div style={{
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
        boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Heute · Daily Lesson</div>
            <h1 style={{ fontFamily: FONTS.display, fontSize: '2.4rem', fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
              Tag {day}
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONTS.display, fontSize: '0.95rem', color: t.accent, fontWeight: 600 }}>{levelName}</div>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, fontFamily: FONTS.reading, marginTop: 2 }}>CEFR level</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prevDay} disabled={day <= 1} style={{
            padding: '6px 12px', background: 'transparent', color: day <= 1 ? t.textFaint : t.text,
            border: '1px solid ' + t.border, borderRadius: 6, fontSize: '0.8rem',
            cursor: day <= 1 ? 'not-allowed' : 'pointer', fontFamily: FONTS.body,
          }}>← Vorheriger</button>
          <button onClick={nextDay} style={{
            padding: '6px 12px', background: 'transparent', color: t.text,
            border: '1px solid ' + t.border, borderRadius: 6, fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: FONTS.body,
          }}>Nächster →</button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{
          background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
          padding: 48, textAlign: 'center', color: t.textMuted, boxShadow: t.shadow,
        }}>
          <div style={{ fontFamily: FONTS.reading, fontStyle: 'italic' }}>Lädt die Lektion…</div>
        </div>
      ) : (
        <article style={{
          background: t.cardBg,
          border: '1px solid ' + t.border,
          borderRadius: 12,
          padding: '32px 36px',
          boxShadow: t.shadow,
          marginBottom: 20,
        }}>
          <h2 style={{
            fontFamily: FONTS.display, fontSize: '1.8rem', fontWeight: 600,
            color: t.accent, margin: '0 0 24px', paddingBottom: 12,
            borderBottom: '1px solid ' + t.border,
          }}>
            {title.replace(/^#\s*/, '')}
          </h2>
          <div className="duo-reading" style={{ whiteSpace: 'pre-wrap' }}>
            {body || 'Diese Lektion wird gerade vorbereitet.'}
          </div>
        </article>
      )}

      {/* Action */}
      {!completed ? (
        <button
          onClick={markComplete}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: t.accent,
            color: t.onAccent,
            border: 'none',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: FONTS.display,
            letterSpacing: '0.05em',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 0 ' + t.accentHover,
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          ✓ Tag {day} abgeschlossen · +15 XP
        </button>
      ) : (
        <div style={{
          background: t.accentSoft,
          border: '1px solid ' + t.accent,
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌿</div>
          <div style={{ fontFamily: FONTS.display, fontSize: '1.3rem', fontWeight: 600, color: t.text, marginBottom: 4 }}>
            Wunderbar!
          </div>
          <div style={{ fontSize: '0.9rem', color: t.textMuted, marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
            Heute erledigt. Streak bleibt bestehen.
          </div>
          <button
            onClick={nextDay}
            style={{
              padding: '10px 20px',
              background: t.accent,
              color: t.onAccent,
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONTS.body,
            }}
          >
            Tag {day + 1} beginnen →
          </button>
        </div>
      )}
    </div>
  );
}
