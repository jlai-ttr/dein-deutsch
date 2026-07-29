'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FortschrittPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {}
    }
    const vocab = localStorage.getItem('dein-vocab');
    if (vocab) {
      try {
        const cards = JSON.parse(vocab);
        if (data) {
          setData({ ...data, vocabCount: cards.length });
        }
      } catch (e) {}
    }
  }, []);

  if (!data) {
    return <div className="max-w-md mx-auto p-6"><div className="text-gray-500">Lädt...</div></div>;
  }

  const daysRemaining = Math.max(0, 730 - (data.currentDay || 1));
  const percent = ((data.currentDay || 1) / 730) * 100;
  const level = (data.currentDay || 1) <= 90 ? 'A1' : (data.currentDay || 1) <= 180 ? 'A2' : (data.currentDay || 1) <= 365 ? 'B1' : (data.currentDay || 1) <= 545 ? 'B1.5' : 'B2';

  const milestones = [
    { day: 90, label: 'A1', desc: 'Basic phrases' },
    { day: 180, label: 'A2', desc: 'Everyday conversation' },
    { day: 365, label: 'B1', desc: 'Independent user' },
    { day: 545, label: 'B1.5', desc: 'Business German' },
    { day: 730, label: 'B2', desc: 'Upper intermediate' },
  ];

  return (
    <div className="max-w-md mx-auto p-6">
      <Link href="/" className="text-sm text-gray-500 mb-4 inline-block">← Zurück</Link>

      <h1 className="text-3xl font-display font-bold mb-2">Fortschritt</h1>
      <div className="text-sm text-gray-600 mb-6">Dein Weg zu B2</div>

      <div className="dein-card bg-dein-black text-white mb-4">
        <div className="text-5xl font-display font-bold text-dein-gold mb-1">{data.streakDays || 0}</div>
        <div className="text-sm text-gray-300">Tage Streak 🔥</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="dein-card">
          <div className="text-2xl font-bold">{data.currentDay || 1}</div>
          <div className="text-xs text-gray-500">Aktueller Tag</div>
        </div>
        <div className="dein-card">
          <div className="text-2xl font-bold">{daysRemaining}</div>
          <div className="text-xs text-gray-500">Tage zum B2</div>
        </div>
        <div className="dein-card">
          <div className="text-2xl font-bold">{data.vocabCount || 0}</div>
          <div className="text-xs text-gray-500">Vokabeln</div>
        </div>
        <div className="dein-card">
          <div className="text-2xl font-bold">{data.conversationsCompleted || 0}</div>
          <div className="text-xs text-gray-500">Konversationen</div>
        </div>
      </div>

      <div className="dein-card mb-4">
        <div className="text-sm font-medium mb-3">Level {level} — {percent.toFixed(1)}%</div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div className="bg-dein-gold h-3 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.day} className={`flex items-center justify-between text-sm p-2 rounded ${data.currentDay >= m.day ? 'bg-green-50 text-green-900' : 'bg-gray-50'}`}>
              <div>
                <div className="font-medium">{m.label}</div>
                <div className="text-xs text-gray-500">{m.desc}</div>
              </div>
              <div className="text-xs">Tag {m.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center mt-6">
        Master House v0.1 • Built by Dialga 🐉
      </div>
    </div>
  );
}
