'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Settings, Edit, Share2 } from 'lucide-react';

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  const achievements = [
    { id: 1, emoji: '🔥', name: 'Wortmaster', desc: '7-day streak', unlocked: data.streakDays >= 7 },
    { id: 2, emoji: '📚', name: 'Vokabular', desc: '100 words learned', unlocked: (data.vocabCount || 0) >= 100 },
    { id: 3, emoji: '🥇', name: 'Top 3', desc: 'Top 3 in league', unlocked: false },
    { id: 4, emoji: '🎤', name: 'Sprecher', desc: 'First conversation', unlocked: (data.conversationsCompleted || 0) >= 1 },
    { id: 5, emoji: '⭐', name: 'Boss-Bezwinger', desc: 'Beat first boss', unlocked: data.currentDay >= 4 },
    { id: 6, emoji: '💎', name: 'Diamant', desc: '1000 XP', unlocked: (data.xp || 0) >= 1000 },
    { id: 7, emoji: '🇩🇪', name: 'A1 Diplom', desc: 'Complete A1', unlocked: data.currentDay >= 90 },
    { id: 8, emoji: '🚀', name: 'Schnelllerner', desc: '10 in one day', unlocked: false },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-500">← Back</Link>
        <Link href="/settings" className="text-gray-500">
          <Settings className="w-6 h-6" />
        </Link>
      </div>

      {/* Avatar */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-frog text-white flex items-center justify-center text-4xl font-extrabold border-4 border-yellow-400">
          J
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-extrabold">Jasper Lai</h1>
          <Edit className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-gray-500">@jasperlai · joined July 2026</div>
        <button className="duo-btn duo-btn-green mt-3 px-4 py-2 text-sm">
          <Share2 className="w-4 h-4 inline mr-1" /> SHARE PROFILE
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="duo-card p-3 text-center bg-gold">
          <div className="text-2xl font-extrabold">{data.streakDays || 0}</div>
          <div className="text-xs">🔥 Streak</div>
        </div>
        <div className="duo-card p-3 text-center bg-eagle text-white">
          <div className="text-2xl font-extrabold">{data.xp || 0}</div>
          <div className="text-xs">⚡ Total XP</div>
        </div>
        <div className="duo-card p-3 text-center bg-frog text-white">
          <div className="text-2xl font-extrabold">Day {data.currentDay || 1}</div>
          <div className="text-xs">📅 Day</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h2 className="font-bold text-xl mb-3">🏆 Achievements</h2>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className={`duo-card p-3 text-center ${a.unlocked ? 'bg-gradient-to-br from-gold to-flame text-white' : 'bg-gray-100 opacity-50'}`}>
              <div className="text-3xl mb-1">{a.emoji}</div>
              <div className="text-xs font-bold">{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Stats */}
      <div className="duo-card p-6 mb-6">
        <h2 className="font-bold text-xl mb-3">📊 This Week</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>XP earned</span>
            <span className="font-bold text-frog">+{data.xp || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Words learned</span>
            <span className="font-bold text-eagle">{data.vocabCount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Lessons completed</span>
            <span className="font-bold text-flame">{Math.max(0, (data.currentDay || 1) - 1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Time spent</span>
            <span className="font-bold text-epic">~{Math.round(((data.currentDay || 1) * 17))} min</span>
          </div>
        </div>
      </div>

      {/* Following / Followers */}
      <div className="duo-card p-6">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-2xl font-extrabold">12</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold">28</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
