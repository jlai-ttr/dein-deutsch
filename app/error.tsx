'use client';

// app/error.tsx — Page-level error boundary (Next.js App Router).
// Catches runtime errors on any route. Re-renders on reset().
// Theme matches the rest of the app via localStorage.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTheme, FONTS } from './lib/theme';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('dein-deutsch-theme') : null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    // Log to console for debugging — Vercel picks these up
    console.error('[dein-deutsch] page error:', error);
  }, [error]);

  if (!mounted) return null;
  const t = getTheme(theme);

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: t.shadowStrong,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: '4rem',
          lineHeight: 1,
          color: t.accent,
          marginBottom: 12,
        }}>
          ⚠
        </div>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: '1.75rem',
          fontWeight: 700,
          color: t.text,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Etwas ist schiefgelaufen
        </h1>
        <p style={{
          fontFamily: FONTS.reading,
          fontSize: '1.05rem',
          color: t.textMuted,
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}>
          Something went wrong on this page. Your progress is saved — try again or head home.
        </p>

        {error.digest && (
          <p style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: t.textMuted,
            margin: '0 0 24px',
            padding: '8px 12px',
            background: t.bg,
            border: '1px solid ' + t.border,
            borderRadius: 6,
            wordBreak: 'break-all',
          }}>
            ref: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: t.accent,
              color: '#FBF7E9',
              border: 'none',
              borderRadius: 8,
              fontFamily: FONTS.display,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: t.shadow,
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: t.text,
              border: '1px solid ' + t.border,
              borderRadius: 8,
              fontFamily: FONTS.display,
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Back to Haus
          </Link>
        </div>
      </div>
    </div>
  );
}
