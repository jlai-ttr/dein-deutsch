'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FONTS, getTheme } from '../lib/theme';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get('next') || '/';

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dein-deutsch-theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    // If already authenticated, redirect away from login
    fetch('/api/auth/me')
      .then(r => {
        if (r.ok) {
          router.push(nextPath);
        }
      })
      .catch(() => {});
  }, [router, nextPath]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'wrong password' ? 'Falsches Passwort' : 'Anmeldung fehlgeschlagen');
        setSubmitting(false);
        return;
      }
      // Success — redirect
      router.push(nextPath);
    } catch (e) {
      setError('Verbindungsfehler. Bitte erneut versuchen.');
      setSubmitting(false);
    }
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('dein-deutsch-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  if (!mounted) return null;
  const t = getTheme(theme);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, ' + t.bg + ' 0%, ' + t.cardBg + ' 50%, ' + t.accentSoft + ' 100%)',
      color: t.text,
      fontFamily: FONTS.body,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Theme toggle in corner */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: 16, right: 16,
          padding: '6px 12px',
          background: t.cardBg,
          color: t.text,
          border: '1px solid ' + t.border,
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontFamily: FONTS.body,
        }}
        title="Toggle theme (T)"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div style={{
        width: '100%',
        maxWidth: 420,
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 16,
        padding: 40,
        boxShadow: '0 8px 32px rgba(45, 80, 22, 0.15)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: FONTS.display,
            fontSize: '2.4rem',
            fontWeight: 700,
            color: t.accent,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Dein Deutsch
          </div>
          <div style={{
            fontFamily: FONTS.display,
            fontSize: '1rem',
            color: t.textMuted,
            fontStyle: 'italic',
          }}>
            Dein Tempo, dein Haus.
          </div>
        </div>

        {/* Welcome */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontFamily: FONTS.display,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: t.text,
            margin: '0 0 8px',
          }}>
            Willkommen zurück
          </h1>
          <p style={{
            fontFamily: FONTS.reading,
            fontSize: '0.95rem',
            color: t.textMuted,
            fontStyle: 'italic',
            margin: 0,
          }}>
            Bitte gib dein Passwort ein.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              color: t.textMuted,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: t.inputBg,
                color: t.text,
                border: '1px solid ' + (error ? t.error : t.border),
                borderRadius: 8,
                fontSize: '1rem',
                fontFamily: FONTS.body,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => {
                if (!error) e.currentTarget.style.borderColor = t.accent;
              }}
              onBlur={e => {
                if (!error) e.currentTarget.style.borderColor = t.border;
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: 12,
              background: 'rgba(229, 115, 115, 0.1)',
              border: '1px solid ' + t.error,
              borderRadius: 6,
              color: t.error,
              fontSize: '0.85rem',
              marginBottom: 16,
              fontFamily: FONTS.reading,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: password && !submitting ? t.accent : t.border,
              color: t.onAccent,
              border: 'none',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: FONTS.display,
              letterSpacing: '0.05em',
              cursor: password && !submitting ? 'pointer' : 'not-allowed',
              opacity: password && !submitting ? 1 : 0.5,
              boxShadow: password && !submitting ? '0 4px 0 ' + t.accentHover : 'none',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? '⏳ Anmelden...' : '🔓 Anmelden'}
          </button>
        </form>

        {/* Brand tagline */}
        <div style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: '1px solid ' + t.border,
          textAlign: 'center',
          fontSize: '0.75rem',
          color: t.textFaint,
          fontFamily: FONTS.reading,
          fontStyle: 'italic',
        }}>
          🌿 Forest + Parchment + Ink
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
