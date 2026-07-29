'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeutePage() {
  const [day, setDay] = useState(1);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    let dayNum = 1;
    if (stored) {
      try {
        const p = JSON.parse(stored);
        dayNum = p.currentDay || 1;
        setDay(dayNum);
        setCompleted(p.todayCompleted || false);
      } catch (e) {}
    }
    loadLesson(dayNum);
  }, []);

  async function loadLesson(dayNum: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson/${dayNum}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        setContent('Lesson not loaded yet. Day ' + dayNum + ' coming soon.');
      }
    } catch (e) {
      setContent('Could not load lesson. Check your connection.');
    }
    setLoading(false);
  }

  async function markComplete() {
    const stored = localStorage.getItem('dein-progress');
    const p = stored ? JSON.parse(stored) : { currentDay: 1, streakDays: 0, vocabCount: 0, vocabReviewed: 0, conversationsCompleted: 0, minutesListened: 0 };
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('dein-last-completed');
    const newStreak = lastCompleted === today ? p.streakDays : (p.streakDays || 0) + 1;
    p.currentDay = Math.min(day + 1, 730);
    p.streakDays = newStreak;
    p.todayCompleted = true;
    localStorage.setItem('dein-progress', JSON.stringify(p));
    localStorage.setItem('dein-last-completed', today);
    setCompleted(true);
    setDay(p.currentDay);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Link href="/" className="text-sm text-gray-500 mb-4 inline-block">← Zurück</Link>

      <div className="mb-4">
        <div className="text-xs text-gray-500">DEIN DEUTSCH</div>
        <h1 className="text-3xl font-display font-bold">Tag {day}</h1>
        <div className="text-sm text-gray-600 mt-1">Heute lernen wir...</div>
      </div>

      {loading ? (
        <div className="dein-card text-center py-12">
          <div className="text-gray-400">Lädt...</div>
        </div>
      ) : (
        <div className="dein-card">
          <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
            {content}
          </pre>
        </div>
      )}

      {!completed ? (
        <button onClick={markComplete} className="dein-button-gold w-full mt-6">
          ✓ Tag {day} abgeschlossen
        </button>
      ) : (
        <div className="dein-card mt-6 bg-green-50 border-green-200 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-medium text-green-900">Heute erledigt!</div>
          <div className="text-xs text-green-700 mt-1">Streak: 🔥 maintained</div>
          <Link href="/" className="text-sm text-green-800 underline mt-3 inline-block">
            Zurück zum Haus
          </Link>
        </div>
      )}
    </div>
  );
}
