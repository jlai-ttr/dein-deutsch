'use client';

// app/not-found.tsx — 404 page.
// Triggered for any unmatched route OR explicit notFound() calls.
// Reuses theme tokens for consistency with error.tsx and the rest of the app.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTheme, FONTS, MODULES } from './lib/theme';

export default function NotFound() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('dein-deutsch-theme') : null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!mounted) return null;
  const t = getTheme(theme);

  // Suggest a few popular routes in case the user mistyped
  const suggestions = MODULES.slice(0, 4);

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: '6rem',
          fontWeight: 700,
          color: t.accent,
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.04em',
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: '2rem',
          fontWeight: 700,
          color: t.text,
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          Diese Seite gibt es nicht
        </h1>
        <p style={{
          fontFamily: FONTS.reading,
          fontSize: '1.05rem',
          color: t.textMuted,
          margin: '0 0 32px',
          lineHeight: 1.5,
        }}>
          This page doesn&rsquo;t exist. Maybe one of these?
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}>
          {suggestions.map((m) => (
            <Link
              key={m.id}
              href={`/${m.id}`}
              style={{
                padding: '16px 20px',
                background: t.cardBg,
                border: '1px solid ' + t.border,
                borderRadius: 10,
                textDecoration: 'none',
                color: t.text,
                fontFamily: FONTS.display,
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                boxShadow: t.shadow,
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{m.icon}</div>
              <div>{m.label}</div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 2 }}>{m.en}</div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            color: t.accent,
            fontFamily: FONTS.display,
            fontSize: '0.95rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Back to Haus
        </Link>
      </div>
    </div>
  );
}
