'use client';

// app/woerter/loading.tsx — Skeleton for /woerter (vocab editor, heaviest page).
// Mirrors the layout: header row + filter row + table area.

import { getTheme, FONTS } from '../lib/theme';

export default function Loading() {
  // Force light skeleton for SSR consistency (matches initial paint, no flash)
  const t = getTheme('light');

  return (
    <div className="animate-fade-in">
      {/* Header row skeleton */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{
            width: 220, height: 32, borderRadius: 6,
            background: t.bg, marginBottom: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: 320, height: 16, borderRadius: 4,
            background: t.bg,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 110, height: 40, borderRadius: 8, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 110, height: 40, borderRadius: 8, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Filter row skeleton */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        {[120, 90, 160, 100].map((w, i) => (
          <div key={i} style={{
            width: w, height: 38, borderRadius: 8,
            background: t.bg,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>

      {/* Table skeleton — 8 rows of fake cells */}
      <div style={{
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr) 80px',
          gap: 1,
          padding: '14px 16px',
          background: t.bg,
          borderBottom: '1px solid ' + t.border,
        }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ width: '70%', height: 12, borderRadius: 3, background: t.border }} />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr) 80px',
            gap: 1,
            padding: '14px 16px',
            borderBottom: r < 7 ? '1px solid ' + t.border : 'none',
          }}>
            {[1,2,3,4,5].map((c) => (
              <div key={c} style={{
                width: ['90%', '70%', '60%', '80%', '50%'][c-1],
                height: 14,
                borderRadius: 3,
                background: t.bg,
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: ((r + c) * 0.1) + 's',
              }} />
            ))}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ width: 28, height: 28, borderRadius: 6, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
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
