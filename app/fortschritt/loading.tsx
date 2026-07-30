'use client';

// app/fortschritt/loading.tsx — Skeleton for /fortschritt (progress + charts).
// Shows placeholder stats + a chart area.

import { getTheme, FONTS } from '../lib/theme';

export default function Loading() {
  const t = getTheme('light');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 200, height: 32, borderRadius: 6, background: t.bg, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 320, height: 16, borderRadius: 4, background: t.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>

      {/* Stats grid skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            background: t.cardBg,
            border: '1px solid ' + t.border,
            borderRadius: 10,
            padding: 16,
          }}>
            <div style={{ width: 80, height: 12, borderRadius: 3, background: t.bg, marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: 60, height: 28, borderRadius: 4, background: t.border, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div style={{
        background: t.cardBg,
        border: '1px solid ' + t.border,
        borderRadius: 12,
        padding: 24,
        height: 280,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: 12,
      }}>
        {[60, 80, 45, 90, 70, 100, 85, 95, 75, 110, 90, 105].map((h, i) => (
          <div key={i} style={{
            width: '6%',
            height: h + '%',
            background: t.bg,
            borderRadius: '4px 4px 0 0',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: (i * 0.08) + 's',
          }} />
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
