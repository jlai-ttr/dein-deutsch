'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';
import { getActivityRange, getStreak, getTotalDaysStudied } from '../lib/activity';

interface ProfileData {
  currentDay: number;
  streakDays: number;
  xp: number;
  vocabCount: number;
}

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  de: string;
  en: string;
  description: string;
  unlocked: boolean;
  threshold?: string;
}

export default function ProfilePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState<ProfileData>({ currentDay: 1, streakDays: 0, xp: 0, vocabCount: 0 });
  const [vocabStats, setVocabStats] = useState({ total: 0, mastered: 0, reviewed: 0 });
  const [writingCount, setWritingCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    try {
      const raw = localStorage.getItem('dein-deutsch-progress');
      if (raw) {
        const p = JSON.parse(raw);
        setProgress({
          currentDay: p.currentDay || 1,
          streakDays: p.streakDays || 0,
          xp: p.xp || 0,
          vocabCount: p.vocabCount || 0,
        });
      }
    } catch (e) {}

    try {
      const w = localStorage.getItem('dein-deutsch-woerter-v2');
      if (w) {
        const cards = JSON.parse(w);
        setVocabStats({
          total: cards.length,
          mastered: cards.filter((c: any) => c.interval >= 90).length,
          reviewed: cards.reduce((s: number, c: any) => s + c.totalReviews, 0),
        });
      }
    } catch (e) {}

    try {
      const h = localStorage.getItem('dein-deutsch-schreiben-history');
      if (h) setWritingCount(JSON.parse(h).length);
    } catch (e) {}
  }, []);

  const streak = useMemo(() => getStreak(), [mounted]);
  const totalDays = useMemo(() => getTotalDaysStudied(), [mounted]);
  const activity = useMemo(() => getActivityRange(7), [mounted]);

  if (!mounted) return null;
  const t = getTheme(theme);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - totalDays);

  // Achievements — based on real progress
  const achievements: Achievement[] = [
    { id: 'first-step', emoji: '🌱', name: 'Erster Schritt', de: 'Erster Schritt', en: 'First Step', description: 'Complete your first day', unlocked: progress.currentDay >= 1 },
    { id: 'streak-3', emoji: '🔥', name: 'Drei in Folge', de: 'Drei in Folge', en: '3-Day Streak', description: '3 consecutive days', unlocked: streak >= 3 },
    { id: 'streak-7', emoji: '🌟', name: 'Eine Woche', de: 'Eine Woche', en: '1 Week', description: '7 consecutive days', unlocked: streak >= 7 },
    { id: 'streak-30', emoji: '⚜️', name: 'Monatsmeister', de: 'Monatsmeister', en: 'Month Master', description: '30 consecutive days', unlocked: streak >= 30 },
    { id: 'words-50', emoji: '🪶', name: 'Wortsammler', de: 'Wortsammler', en: 'Word Collector', description: '50 vocab encountered', unlocked: vocabStats.total >= 50 },
    { id: 'words-500', emoji: '📚', name: 'Lexikon', de: 'Lexikon', en: 'Living Lexicon', description: '500 vocab encountered', unlocked: vocabStats.total >= 500 },
    { id: 'master-10', emoji: '🪨', name: 'Granit', de: 'Granit', en: 'Granite', description: '10 words mastered', unlocked: vocabStats.mastered >= 10 },
    { id: 'master-100', emoji: '💎', name: 'Diamant', de: 'Diamant', en: 'Diamond', description: '100 words mastered', unlocked: vocabStats.mastered >= 100 },
    { id: 'xp-100', emoji: '✨', name: 'Hundert XP', de: 'Hundert XP', en: '100 XP', description: 'Collect 100 XP', unlocked: progress.xp >= 100 },
    { id: 'xp-1000', emoji: '🌟', name: 'Tausend XP', de: 'Tausend XP', en: '1000 XP', description: 'Collect 1000 XP', unlocked: progress.xp >= 1000 },
    { id: 'writer', emoji: '✒️', name: 'Schreiber', de: 'Schreiber', en: 'Writer', description: 'Submit your first text', unlocked: writingCount >= 1 },
    { id: 'novelist', emoji: '📖', name: 'Schriftsteller', de: 'Schriftsteller', en: 'Novelist', description: 'Submit 10 texts', unlocked: writingCount >= 10 },
    { id: 'day-30', emoji: '🗓️', name: 'Einen Monat', de: 'Einen Monat', en: 'One Month', description: 'Reach Day 30', unlocked: progress.currentDay >= 30 },
    { id: 'day-90', emoji: '🎓', name: 'A1 Diplom', de: 'A1 Diplom', en: 'A1 Diploma', description: 'Complete A1 (Day 90)', unlocked: progress.currentDay >= 90 },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, ' + t.accentSoft + ' 0%, ' + t.cardBg + ' 100%)',
        border: '1px solid ' + t.border, borderRadius: 16, padding: '32px 28px',
        marginBottom: 20, boxShadow: t.shadowStrong, textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, margin: '0 auto 16px',
          background: t.accent, color: t.onAccent,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONTS.display, fontSize: '2.5rem', fontWeight: 700,
          boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)',
        }}>
          J
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 4px' }}>
          Jasper Lai
        </h1>
        <div style={{ fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
          @jasperlai · seit {startDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'inline-flex', gap: 8, marginTop: 12 }}>
          <span style={{ padding: '4px 12px', background: t.accent, color: t.onAccent, borderRadius: 4, fontSize: '0.85rem', fontWeight: 700 }}>
            {progress.currentDay >= 1 ? 'A1' : '—'} Lernender
          </span>
          <span style={{ padding: '4px 12px', background: t.cardBg, color: t.text, borderRadius: 4, fontSize: '0.85rem', border: '1px solid ' + t.border }}>
            {totalDays} Studientage
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        <StatBlock icon="🔥" label="Streak" value={streak} sub="Tage am Stück" t={t} highlight />
        <StatBlock icon="📅" label="Heute" value={'Tag ' + progress.currentDay} sub={`von 540`} t={t} />
        <StatBlock icon="✨" label="XP" value={progress.xp} sub="gesammelt" t={t} />
        <StatBlock icon="🪶" label="Mastered" value={vocabStats.mastered} sub={`von ${vocabStats.total}`} t={t} />
        <StatBlock icon="🔁" label="Reviews" value={vocabStats.reviewed} sub="gesamt" t={t} />
        <StatBlock icon="✒️" label="Texte" value={writingCount} sub="geschrieben" t={t} />
      </div>

      {/* This week */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 20, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '1.3rem', color: t.text, margin: '0 0 12px' }}>
          Diese Woche · This Week
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {activity.map((day, i) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('de-DE', { weekday: 'narrow' });
            const dayNum = date.getDate();
            const isToday = i === activity.length - 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, marginBottom: 4 }}>
                  {dayName}
                </div>
                <div style={{
                  aspectRatio: '1',
                  background: day.active
                    ? 'rgba(45, 80, 22, ' + (0.4 + Math.min(1, day.events.length / 4) * 0.6) + ')'
                    : t.bg,
                  borderRadius: 6,
                  border: isToday ? '2px solid ' + t.accent : '1px solid ' + t.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700,
                  color: day.active ? t.onAccent : t.textFaint,
                  fontFamily: FONTS.display,
                }}>
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: FONTS.display, fontSize: '1.3rem', color: t.text, margin: 0 }}>
            Errungenschaften · Achievements
          </h2>
          <div style={{ fontFamily: FONTS.display, fontSize: '1rem', color: t.accent, fontWeight: 700 }}>
            {unlockedCount} / {achievements.length}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {achievements.map(a => (
            <div key={a.id} style={{
              background: a.unlocked ? t.accentSoft : t.bg,
              border: '1px solid ' + (a.unlocked ? t.accent : t.border),
              borderRadius: 8,
              padding: 12,
              opacity: a.unlocked ? 1 : 0.5,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: 6,
                filter: a.unlocked ? 'none' : 'grayscale(1)',
              }}>
                {a.emoji}
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: '0.9rem', fontWeight: 600, color: a.unlocked ? t.accent : t.text, marginBottom: 2 }}>
                {a.de}
              </div>
              <div style={{ fontSize: '0.7rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
                {a.description}
              </div>
              {a.unlocked && (
                <div style={{ fontSize: '0.65rem', color: t.success, fontWeight: 600, marginTop: 4, letterSpacing: '0.05em' }}>
                  ✓ FREIGESCHALTET
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value, sub, t, highlight }: any) {
  return (
    <div style={{
      background: t.cardBg,
      border: '1px solid ' + (highlight ? t.accent : t.border),
      borderRadius: 8,
      padding: 12,
      boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
        <span style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: '1.4rem', fontWeight: 700, color: highlight ? t.accent : t.text, lineHeight: 1, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: t.textFaint, fontFamily: FONTS.reading }}>{sub}</div>
    </div>
  );
}
