'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

interface Settings {
  dailyGoalMinutes: number;
  ttsRate: number;
  sessionSize: number;
  fontScale: number;
  showTranslations: boolean;
  autoplayAudio: boolean;
  prefersGermanOnly: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 30,
  ttsRate: 0.85,
  sessionSize: 20,
  fontScale: 100,
  showTranslations: true,
  autoplayAudio: false,
  prefersGermanOnly: false,
};

const STORAGE_KEY = 'dein-deutsch-settings';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch (e) {}
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function resetAll() {
    if (confirm('Alle Fortschritt-Daten löschen? This cannot be undone.')) {
      localStorage.removeItem('dein-deutsch-progress');
      localStorage.removeItem('dein-deutsch-woerter-v3');
      localStorage.removeItem('dein-deutsch-schreiben-history');
      localStorage.removeItem('dein-deutsch-activity');
      localStorage.removeItem('dein-deutsch-lesen-idx');
      localStorage.removeItem('dein-deutsch-schreiben-idx');
      localStorage.removeItem('dein-deutsch-last-completed');
      location.reload();
    }
  }

  function exportData() {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dein-deutsch-')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch (e) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dein-deutsch-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (!mounted) return null;
  const t = getTheme(theme);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 24, marginBottom: 20, boxShadow: t.shadow,
      }}>
        <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Settings · Persönliche Einstellungen
        </div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', fontWeight: 700, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Passe dein Lernen an
        </h1>
        <p style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', margin: 0 }}>
          All changes save automatically. {saved && <span style={{ color: t.success, fontWeight: 600 }}>✓ Gespeichert</span>}
        </p>
      </div>

      {/* Daily goal */}
      <Section title="🎯 Tagesziel" t={t}>
        <Row
          label="Wie viele Minuten pro Tag?"
          sub="Wir zeigen dir dein Ziel im Master House"
          t={t}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {[15, 30, 45, 60, 90].map(m => (
              <button
                key={m}
                onClick={() => update('dailyGoalMinutes', m)}
                style={{
                  padding: '8px 14px',
                  background: settings.dailyGoalMinutes === m ? t.accent : t.bg,
                  color: settings.dailyGoalMinutes === m ? t.onAccent : t.text,
                  border: '1px solid ' + (settings.dailyGoalMinutes === m ? t.accent : t.border),
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  fontWeight: settings.dailyGoalMinutes === m ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: FONTS.body,
                }}
              >
                {m}min
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Audio */}
      <Section title="🔊 Audio & Aussprache" t={t}>
        <Row
          label="Vorlesegeschwindigkeit"
          sub="Slower = easier to catch every syllable. 0.85x is a good default for beginners."
          t={t}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 280 }}>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={settings.ttsRate}
              onChange={e => update('ttsRate', parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontFamily: FONTS.mono, fontSize: '0.9rem', color: t.accent, minWidth: 50, textAlign: 'right' }}>
              {settings.ttsRate.toFixed(2)}x
            </span>
          </div>
        </Row>
        <Row label="Auto-play audio on new cards" sub="Hear each card aloud when it appears (Wörter module)" t={t}>
          <Toggle
            value={settings.autoplayAudio}
            onChange={v => update('autoplayAudio', v)}
            t={t}
          />
        </Row>
      </Section>

      {/* Session */}
      <Section title="📚 Lern-Sitzung" t={t}>
        <Row
          label="Vokabeln pro Sitzung"
          sub="Cards per session before a break. Lower = less overwhelming."
          t={t}
        >
          <select
            value={settings.sessionSize}
            onChange={e => update('sessionSize', parseInt(e.target.value))}
            style={{
              padding: '8px 12px', background: t.bg, color: t.text,
              border: '1px solid ' + t.border, borderRadius: 6,
              fontSize: '0.9rem', fontFamily: FONTS.body,
            }}
          >
            <option value={10}>10 Karten</option>
            <option value={20}>20 Karten</option>
            <option value={30}>30 Karten</option>
            <option value={50}>50 Karten (Marathon)</option>
          </select>
        </Row>
      </Section>

      {/* Reading */}
      <Section title="📖 Lesen & Anzeige" t={t}>
        <Row label="Show translations by default" sub="Reading texts start with vocab panel visible. You can toggle per-text." t={t}>
          <Toggle value={settings.showTranslations} onChange={v => update('showTranslations', v)} t={t} />
        </Row>
        <Row label="Force German-only mode" sub="Hide all English translations site-wide. For confident A2+ learners." t={t}>
          <Toggle value={settings.prefersGermanOnly} onChange={v => update('prefersGermanOnly', v)} t={t} />
        </Row>
        <Row label="Schriftgröße" sub="100% is normal. 125% helps reading long texts." t={t}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[85, 100, 115, 130].map(s => (
              <button
                key={s}
                onClick={() => update('fontScale', s)}
                style={{
                  padding: '8px 14px',
                  background: settings.fontScale === s ? t.accent : t.bg,
                  color: settings.fontScale === s ? t.onAccent : t.text,
                  border: '1px solid ' + (settings.fontScale === s ? t.accent : t.border),
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: FONTS.body,
                }}
              >
                {s}%
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Data */}
      <Section title="💾 Daten & Backup" t={t}>
        <Row
          label="Backup herunterladen"
          sub="Saves all your progress as a JSON file. Use it to migrate devices."
          t={t}
        >
          <button
            onClick={exportData}
            style={{
              padding: '10px 20px', background: t.accent, color: t.onAccent,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: FONTS.body, fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 4px 0 ' + t.accentHover,
            }}
          >
            ⬇️ Export JSON
          </button>
        </Row>
        <Row
          label="DANGER: Reset everything"
          sub="Wipes all progress, vocab, writing history. Cannot be undone."
          t={t}
        >
          <button
            onClick={resetAll}
            style={{
              padding: '10px 20px', background: 'transparent',
              color: t.error, border: '1px solid ' + t.error,
              borderRadius: 8, cursor: 'pointer',
              fontFamily: FONTS.body, fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            🗑️ Alles löschen
          </button>
        </Row>
      </Section>

      {/* About */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 20, marginTop: 20, fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic',
      }}>
        <div style={{ fontWeight: 700, fontStyle: 'normal', color: t.text, marginBottom: 4 }}>Über Dein Deutsch</div>
        Version 0.5 · Forest + Parchment + Ink theme · Built by Alakazam for Jasper
        <br />
        Storage: Browser localStorage (no account needed). For backup, use the Export button above.
      </div>
    </div>
  );
}

function Section({ title, children, t }: any) {
  return (
    <div style={{
      background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
      marginBottom: 16, boxShadow: t.shadow, overflow: 'hidden',
    }}>
      <div style={{
        background: t.bg, padding: '12px 20px',
        borderBottom: '1px solid ' + t.border,
        fontFamily: FONTS.display, fontSize: '1.05rem', fontWeight: 600, color: t.text,
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, sub, children, t }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed ' + t.border, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: '1rem', color: t.text, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.8rem', color: t.textMuted, fontFamily: FONTS.reading, fontStyle: 'italic' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, t }: { value: boolean; onChange: (v: boolean) => void; t: any }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: 52, height: 28,
        background: value ? t.accent : t.bg,
        border: '1px solid ' + (value ? t.accent : t.border),
        borderRadius: 14,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: value ? 26 : 2,
        width: 22, height: 22,
        background: value ? t.onAccent : t.textMuted,
        borderRadius: '50%',
        transition: 'all 0.2s',
      }} />
    </button>
  );
}

