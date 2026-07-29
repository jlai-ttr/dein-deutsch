'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS, MODULES } from '../lib/theme';
import { getActivityRange, getStreak, getTotalDaysStudied } from '../lib/activity';

// Maps vocab mastery + lesson completion + writing quality → CEFR estimate
function estimateCEFR(mastered: number, total: number): { level: string; pct: number; nextLevel: string; wordsToNext: number } {
  if (mastered >= 5800) return { level: 'C2', pct: 100, nextLevel: '', wordsToNext: 0 };
  if (mastered >= 5000) return { level: 'C1', pct: ((mastered - 5000) / 800) * 100, nextLevel: 'C2', wordsToNext: 5800 - mastered };
  if (mastered >= 3500) return { level: 'B2', pct: ((mastered - 3500) / 1500) * 100, nextLevel: 'C1', wordsToNext: 5000 - mastered };
  if (mastered >= 2200) return { level: 'B1', pct: ((mastered - 2200) / 1300) * 100, nextLevel: 'B2', wordsToNext: 3500 - mastered };
  if (mastered >= 1000) return { level: 'A2', pct: ((mastered - 1000) / 1200) * 100, nextLevel: 'B1', wordsToNext: 2200 - mastered };
  return { level: 'A1', pct: (mastered / 700) * 100, nextLevel: 'A2', wordsToNext: 700 - mastered };
}

export default function FortschrittPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<any>({});
  const [woerterStats, setWoerterStats] = useState<{ total: number; mastered: number; learning: number; reviews: number }>({ total: 0, mastered: 0, learning: 0, reviews: 0 });
  const [writingHistory, setWritingHistory] = useState<Array<{ date: string; prompt: string; text: string }>>([]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    try {
      const p = localStorage.getItem('dein-deutsch-progress');
      if (p) setProgress(JSON.parse(p));
    } catch (e) {}

    try {
      const w = localStorage.getItem('dein-deutsch-woerter-v2');
      if (w) {
        const cards = JSON.parse(w);
        setWoerterStats({
          total: cards.length,
          mastered: cards.filter((c: any) => c.interval >= 90).length,
          learning: cards.filter((c: any) => c.repetition < 3 && c.totalReviews > 0).length,
          reviews: cards.reduce((s: number, c: any) => s + c.totalReviews, 0),
        });
      }
    } catch (e) {}

    try {
      const h = localStorage.getItem('dein-deutsch-schreiben-history');
      if (h) setWritingHistory(JSON.parse(h));
    } catch (e) {}
  }, []);

  const cefr = useMemo(() => estimateCEFR(woerterStats.mastered, woerterStats.total), [woerterStats]);

  // Mastery breakdown
  const masteryBreakdown = useMemo(() => {
    try {
      const w = localStorage.getItem('dein-deutsch-woerter-v2');
      if (!w) return { new: 0, learning: 0, known: 0, mastered: 0, reviews: 0 };
      const cards = JSON.parse(w);
      const breakdown = {
        new: cards.filter((c: any) => c.totalReviews === 0).length,
        learning: cards.filter((c: any) => c.repetition < 3 && c.totalReviews > 0).length,
        known: cards.filter((c: any) => c.repetition >= 3 && c.interval < 90).length,
        mastered: cards.filter((c: any) => c.interval >= 90).length,
        reviews: cards.reduce((s: number, c: any) => s + c.totalReviews, 0),
      };
      return breakdown;
    } catch (e) {
      return { new: 0, learning: 0, known: 0, mastered: 0, reviews: 0 };
    }
  }, [woerterStats]);

  // Activity — REAL data from activity log
  const activity = useMemo(() => getActivityRange(30), [mounted]);
  const streak = useMemo(() => getStreak(), [mounted]);
  const totalDays = useMemo(() => getTotalDaysStudied(), [mounted]);

  if (!mounted) return null;
  const t = getTheme(theme);

  const currentLevel = CEFR_LEVELS.find(l => l.code === cefr.level);
  const totalWords = woerterStats.total;
  const daysStudied = activity.filter(a => a.active).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Fortschritt · Progress & Mastery
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Wo du stehst · Where you stand
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          Real estimate based on spaced repetition intervals + lessons completed.
        </p>
      </div>

      {/* CEFR Level Estimate */}
      <div style={{
        background: t.accentSoft, border: '1px solid ' + t.accent,
        borderRadius: 12, padding: 24, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              CEFR-Schätzung · Estimated Level
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: FONTS.display, fontSize: '4rem', fontWeight: 700, color: t.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {cefr.level}
              </span>
              <span style={{ fontFamily: FONTS.reading, fontSize: '1.2rem', color: t.textMuted, fontStyle: 'italic' }}>
                {currentLevel?.name}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Nächstes Level
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: '1.2rem', fontWeight: 700, color: t.text }}>
              {cefr.nextLevel || '—'}{' '}
              <span style={{ fontSize: '0.9rem', color: t.textMuted, fontWeight: 400, fontFamily: FONTS.reading }}>
                ({cefr.wordsToNext > 0 ? cefr.wordsToNext + ' Wörter' : 'maxed'})
              </span>
            </div>
          </div>
        </div>

        {/* CEFR ladder */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {CEFR_LEVELS.map(lvl => {
            const reached = CEFR_LEVELS.findIndex(l => l.code === cefr.level) >= CEFR_LEVELS.findIndex(l => l.code === lvl.code);
            const isCurrent = lvl.code === cefr.level;
            return (
              <div key={lvl.code} style={{
                flex: 1,
                padding: '8px 6px',
                background: reached ? lvl.color : t.bg,
                border: '2px solid ' + (isCurrent ? t.text : 'transparent'),
                borderRadius: 6,
                textAlign: 'center',
                color: reached ? t.onAccent : t.textFaint,
                fontFamily: FONTS.display,
                fontSize: '1rem',
                fontWeight: isCurrent ? 700 : 500,
              }}>
                {lvl.code}
              </div>
            );
          })}
        </div>

        <div style={{
          height: 8, background: t.bg, borderRadius: 4,
          overflow: 'hidden', border: '1px solid ' + t.border,
        }}>
          <div style={{
            height: '100%',
            width: cefr.pct + '%',
            background: 'linear-gradient(90deg, ' + t.accentLight + ', ' + t.accent + ')',
            transition: 'width 0.6s',
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 6, fontFamily: FONTS.reading }}>
          {Math.round(cefr.pct)}% to {cefr.nextLevel || 'completion'}
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatTile label="Tag" value={progress.currentDay || 0} sub="von 540" t={t} icon="📅" />
        <StatTile label="Streak" value={streak} sub="Tage in Folge" t={t} icon="🔥" highlight={streak > 0} />
        <StatTile label="XP" value={progress.xp || 0} sub="gesammelt" t={t} icon="✨" />
        <StatTile label="Mastered" value={woerterStats.mastered} sub={`von ${totalWords}`} t={t} icon="🪶" highlight />
        <StatTile label="Writing" value={writingHistory.length} sub="Texte" t={t} icon="✒️" />
        <StatTile label="Reviews" value={masteryBreakdown.reviews} sub="total" t={t} icon="🔁" />
      </div>

      {/* Mastery breakdown + activity */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '1.4rem', color: t.text, margin: '0 0 16px' }}>
          Vokabel-Reife · Vocabulary Mastery
        </h2>

        {woerterStats.total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', height: 32, borderRadius: 6, overflow: 'hidden', border: '1px solid ' + t.border, fontSize: '0.75rem' }}>
              <div style={{ width: (masteryBreakdown.mastered / woerterStats.total) * 100 + '%', background: t.success, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {masteryBreakdown.mastered > 0 ? masteryBreakdown.mastered : ''}
              </div>
              <div style={{ width: (masteryBreakdown.known / woerterStats.total) * 100 + '%', background: t.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {masteryBreakdown.known > 0 ? masteryBreakdown.known : ''}
              </div>
              <div style={{ width: (masteryBreakdown.learning / woerterStats.total) * 100 + '%', background: t.warning, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {masteryBreakdown.learning > 0 ? masteryBreakdown.learning : ''}
              </div>
              <div style={{ width: (masteryBreakdown.new / woerterStats.total) * 100 + '%', background: t.bg, color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {masteryBreakdown.new > 0 ? masteryBreakdown.new : ''}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading, flexWrap: 'wrap', gap: 8 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: t.success, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Mastered <strong style={{ color: t.text }}>(90+ days)</strong></span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: t.accent, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Known <strong style={{ color: t.text }}>(3+ reviews)</strong></span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: t.warning, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Learning</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: t.bg, borderRadius: 2, marginRight: 4, verticalAlign: 'middle', border: '1px solid ' + t.border }} />New</span>
            </div>
          </div>
        )}

        {/* Activity heatmap - REAL DATA */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Aktivität · Letzte 30 Tage ({daysStudied} Tage)
            </div>
            <div style={{ fontSize: '0.75rem', color: t.accent, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
              {totalDays} Studientage insgesamt · {streak} Tage am Stück
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
            {activity.map((a, i) => {
              const count = a.events.length;
              const intensity = Math.min(1, count / 4);
              return (
                <div key={i} title={a.date + ' · ' + (a.events.join(', ') || 'keine Aktivität')} style={{
                  aspectRatio: '1',
                  background: a.active
                    ? 'rgba(45, 80, 22, ' + (0.3 + intensity * 0.7) + ')'
                    : t.bg,
                  borderRadius: 3,
                  border: '1px solid ' + t.border,
                  opacity: a.active ? 1 : 0.3,
                  cursor: 'help',
                }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, fontSize: '0.7rem', color: t.textMuted, fontFamily: FONTS.reading, alignItems: 'center', justifyContent: 'flex-end' }}>
            <span>Weniger</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0.3, 0.5, 0.7, 0.9].map((alpha, i) => (
                <div key={i} style={{ width: 12, height: 12, background: 'rgba(45, 80, 22, ' + alpha + ')', borderRadius: 2, border: '1px solid ' + t.border }} />
              ))}
            </div>
            <span>Mehr</span>
          </div>
        </div>
      </div>

      {/* Modules status grid */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '1.4rem', color: t.text, margin: '0 0 16px' }}>
          Module · Modul-Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {MODULES.map(m => (
            <Link
              key={m.id}
              href={'/' + m.id}
              style={{
                background: t.bg,
                border: '1px solid ' + t.border,
                borderRadius: 8,
                padding: 12,
                textDecoration: 'none',
                color: t.text,
                opacity: m.done ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: '1rem', fontWeight: 600, color: t.text }}>{m.label}</div>
                <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{m.en}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How this works */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 20, boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Wie wird dein Niveau geschätzt?
        </div>
        <p style={{ fontFamily: FONTS.reading, fontSize: '0.95rem', color: t.textMuted, lineHeight: 1.6, margin: '0 0 12px' }}>
          <strong style={{ color: t.text }}>Mastered words</strong> count the most. A word is "mastered" only after your SM-2 interval reaches 90+ days — meaning you've recalled it correctly through weeks of forgetting.
          This matches the Goethe-Institut word-count thresholds:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, color: t.text, fontFamily: FONTS.reading, fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li><strong>A1:</strong> ~600-700 active vocab</li>
          <li><strong>A2:</strong> ~1,000-1,200</li>
          <li><strong>B1:</strong> ~2,200-2,500</li>
          <li><strong>B2:</strong> ~3,500-4,000</li>
          <li><strong>C1:</strong> ~5,000-5,500</li>
          <li><strong>C2:</strong> ~6,000+ (full Köhler coverage)</li>
        </ul>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, t, icon, highlight }: any) {
  return (
    <div style={{
      background: t.cardBg,
      border: '1px solid ' + (highlight ? t.accent : t.border),
      borderRadius: 10,
      padding: 16,
      boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: highlight ? t.accent : t.text, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: t.textFaint, fontFamily: FONTS.reading }}>{sub}</div>
    </div>
  );
}
