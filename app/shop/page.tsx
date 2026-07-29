'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ShopPage() {
  const [data, setData] = useState<any>({ gems: 500, streakFreezes: 2 });

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    if (stored) setData({ ...data, ...JSON.parse(stored) });
  }, []);

  const items = [
    { id: 1, name: 'Streak Freeze', desc: 'Miss a day, keep your streak', emoji: '❄️', price: 200, owned: data.streakFreezes || 0 },
    { id: 2, name: 'Heart Refill', desc: 'Restore all 5 hearts', emoji: '❤️', price: 350, owned: 0 },
    { id: 3, name: 'Double or Nothing', desc: '7 days of 2x XP', emoji: '✖️', price: 500, owned: 0 },
    { id: 4, name: 'Unlock Stories', desc: 'A1 Stories pack', emoji: '📚', price: 1500, owned: 0 },
    { id: 5, name: 'Pronunciation Pro', desc: 'AI pronunciation feedback', emoji: '🎤', price: 2000, owned: 0 },
    { id: 6, name: 'Outfit: Cape', desc: 'Look fabulous', emoji: '🧥', price: 600, owned: 0 },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-500">← Back</Link>
        <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-blue-400">💎</span>
          <span className="font-bold">{data.gems}</span>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold mb-2">Shop</h1>
      <p className="text-gray-500 mb-6">Spend gems on power-ups</p>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="duo-card p-4">
            <div className="text-5xl text-center mb-2">{item.emoji}</div>
            <div className="font-bold text-center">{item.name}</div>
            <div className="text-xs text-gray-500 text-center mb-3">{item.desc}</div>
            <button
              disabled={data.gems < item.price}
              className={`duo-btn w-full py-2 text-sm ${data.gems >= item.price ? 'duo-btn-green' : 'duo-btn-disabled'}`}
            >
              💎 {item.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
