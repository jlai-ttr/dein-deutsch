'use client';

import Link from 'next/link';

const leagues = [
  { rank: 1, name: 'Anna_Schmidt', xp: 1420, country: '🇩🇪', trend: 'same' },
  { rank: 2, name: 'Hans_Müller', xp: 1280, country: '🇦🇹', trend: 'up' },
  { rank: 3, name: 'Klara_K', xp: 1190, country: '🇩🇪', trend: 'up' },
  { rank: 4, name: 'Markus_B', xp: 980, country: '🇨🇭', trend: 'down' },
  { rank: 5, name: 'Lena_P', xp: 920, country: '🇩🇪', trend: 'up' },
  { rank: 6, name: 'Stefan_R', xp: 850, country: '🇦🇹', trend: 'down' },
  { rank: 7, name: 'Jasper_Lai', xp: 720, country: '🇲🇾', trend: 'up', isYou: true },
  { rank: 8, name: 'Petra_H', xp: 680, country: '🇩🇪', trend: 'down' },
  { rank: 9, name: 'Thomas_K', xp: 540, country: '🇦🇹', trend: 'same' },
  { rank: 10, name: 'Maria_S', xp: 520, country: '🇩🇪', trend: 'down' },
];

export default function LeaguePage() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      <Link href="/" className="text-gray-500 mb-4 inline-block">← Back</Link>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🥈</div>
        <h1 className="text-2xl font-extrabold">Silver League</h1>
        <p className="text-sm text-gray-500">Top 7 advance to Gold · 3 days left</p>
      </div>

      <div className="space-y-2">
        {leagues.map((l) => (
          <div
            key={l.rank}
            className={`duo-card p-3 flex items-center gap-3 ${l.isYou ? 'bg-gradient-to-r from-gold to-flame text-white border-2 border-yellow-500' : ''}`}
          >
            <div className="font-extrabold text-lg w-8 text-center">{l.rank}</div>
            <div className="text-2xl">{l.country}</div>
            <div className="flex-1">
              <div className="font-bold">{l.name}</div>
              <div className="text-xs opacity-80">{l.xp} XP</div>
            </div>
            <div className="text-xl">
              {l.trend === 'up' ? '↗️' : l.trend === 'down' ? '↘️' : '▬'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
