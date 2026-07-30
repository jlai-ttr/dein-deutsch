'use client';

// app/heute/loading.tsx — Skeleton for /heute (daily lesson).
// Mirrors the Wort des Tages card + lesson body layout.

import { getTheme, FONTS } from '../lib/theme';

export default function Loading() {
  const t = getTheme('light');

  return (
    <div className="animate-fade-in">
      {/* Hero / Wort des Tages skeleton */}
      <div style={{
        background: 'linear-gradient(135deg, ' + t.accentSoft + ' 0%, ' + t.cardBg + ' 100%)',
        border: '1px solid ' + t.border,
        borderRadius: 16,
        padding: '32px 28px',
        marginBottom: 28,
      }}>
        <div style={{ width: 140, height: 14, borderRadius: 3, background: t.border, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 280, height: 36, borderRadius: 6, background: t.border, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 200, height: 18, borderRadius: 4, background: t.border, marginBottom: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '100%', height: 1, background: t.border, marginBottom: 16 }} />
        <div style={{ width: '90%', height: 14, borderRadius: 3, background: t.border, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '70%', height: 14, borderRadius: 3, background: t.border, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>

      {/* Lesson body skeleton */}
      <div style={{
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        padding: 28,
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ width: 160, height: 22, borderRadius: 4, background: t.border, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '100%', height: 12, borderRadius: 3, background: t.bg, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '90%', height: 12, borderRadius: 3, background: t.bg, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '60%', height: 12, borderRadius: 3, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
