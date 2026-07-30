'use client';

// app/loading.tsx — Root-level loading state (Next.js Suspense fallback).
// Shown automatically while route segments load. Heavy pages can override
// with their own app/<route>/loading.tsx skeleton.

import { getTheme, FONTS } from './lib/theme';

export default function Loading() {
  // No theme switch needed — uses CSS variables from layout
  // (loading state shouldn't trigger hydration mismatch on theme)
  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          border: '3px solid var(--border, #D9CFB8)',
          borderTopColor: 'var(--accent, #2D5016)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          fontFamily: FONTS.display,
          fontSize: '0.95rem',
          color: 'var(--text-muted, #5C5347)',
          marginTop: 16,
          letterSpacing: '0.02em',
        }}>
          Laden…
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
