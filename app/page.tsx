'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Heart, Zap, Trophy, Settings, User, Lock, Star, Volume2, BookOpen, MessageCircle, Headphones, Mic, BarChart2 } from 'lucide-react';

interface DaProps {
  currentDay: number;
  totalDays: number;
  streakDays: number;
  hearts: number;
  xp: number;
  leagueXp: number;
  vocabCount: number;
  vocabReviewed: number;
  conversationsCompleted: number;
  minutesListened: number;
  gems: number;
  streakFreezes: number;
  lastLessonDate: string;
}

export default function Home() {
  const [data, setData] = useState<DaProps>({
    currentDay: 1,
    totalDays: 730,
    streakDays: 0,
    hearts: 5,
    xp: 0,
    leagueXp: 0,
    vocabCount: 0,
    vocabReviewed: 0,
    conversationsCompleted: 0,
    minutesListened: 0,
    gems: 500,
    streakFreezes: 2,
    lastLessonDate: '',
  });

  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'stats' | 'stories'>('learn');

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    if (stored) {
      try {
        setData({ ...data, ...JSON.parse(stored) });
      } catch (e) {}
    }
  }, []);

  const units = [
    { id: 1, title: 'Hallo & Tschüss', subtitle: 'Greetings', status: 'active', color: 'frog', xp: 15, lessons: [
      { id: 1, title: 'Greetings', emoji: '👋', status: 'active' },
      { id: 2, title: 'Wie geht\'s', emoji: '😊', status: 'locked' },
      { id: 3, title: 'Goodbyes', emoji: '👋', status: 'locked' },
      { id: 4, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ]},
    { id: 2, title: 'Zahlen 1-100', subtitle: 'Numbers', status: 'locked', color: 'eagle', xp: 20, lessons: [] },
    { id: 3, title: 'Pronomen', subtitle: 'Pronouns', status: 'locked', color: 'flame', xp: 25, lessons: [] },
    { id: 4, title: 'Sein & Haben', subtitle: 'To be & to have', status: 'locked', color: 'epic', xp: 30, lessons: [] },
    { id: 5, title: 'Alltag', subtitle: 'Daily life', status: 'locked', color: 'frog', xp: 25, lessons: [] },
  ];

  const dailyQuests = [
    { id: 1, title: 'Earn 30 XP', icon: '⚡', progress: Math.min(data.xp, 30), target: 30, color: 'gold' },
    { id: 2, title: 'Complete 1 lesson', icon: '📚', progress: data.todayCompleted ? 1 : 0, target: 1, color: 'frog' },
    { id: 3, title: 'Review 10 words', icon: '🎯', progress: Math.min(data.vocabReviewed, 10), target: 10, color: 'eagle' },
  ];

  const allQuestsDone = dailyQuests.every(q => q.progress >= q.target);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="w-7 h-7 text-flame fill-flame" />
            <span className="font-bold text-xl">{data.streakDays}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-6 h-6 text-gold fill-gold" />
            <span className="font-bold text-lg">{data.xp}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-6 h-6 text-heart" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="font-bold text-lg">{data.hearts}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/shop" className="flex items-center gap-1">
            <span className="text-blue-400 font-bold">💎</span>
            <span className="font-bold text-sm">{data.gems}</span>
          </Link>
          <Link href="/profile" className="w-9 h-9 rounded-full bg-frog text-white flex items-center justify-center font-bold">
            J
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'learn' && (
        <div>
          {/* Daily Quests Banner */}
          <div className="mx-4 mt-4 bg-gradient-to-r from-gold to-flame rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">Daily Quests</div>
              <Link href="/quests" className="text-xs underline">See all</Link>
            </div>
            <div className="space-y-2">
              {dailyQuests.map((q) => (
                <div key={q.id} className="flex items-center gap-3">
                  <div className="text-xl">{q.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{q.title}</div>
                    <div className="bg-white/30 rounded-full h-1.5 mt-1">
                      <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold">{q.progress}/{q.target}</div>
                </div>
              ))}
            </div>
            {allQuestsDone && (
              <div className="mt-3 text-center text-sm font-bold">🎁 All quests complete! +50 XP</div>
            )}
          </div>

          {/* League Banner */}
          <Link href="/league" className="mx-4 mt-3 block bg-gradient-to-r from-eagle to-blue-500 rounded-2xl p-3 text-white border-2 border-b-4 border-blue-700 flex items-center justify-between">
            <div>
              <div className="font-bold">🥈 Silver League</div>
              <div className="text-xs">3 days remaining · Rank 7</div>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">VIEW</div>
          </Link>

          {/* Path Header */}
          <div className="px-4 mt-6 mb-3">
            <div className="font-bold text-2xl">SECTION 1, UNIT 1</div>
            <div className="text-sm text-gray-500">Hallo & Tschüss</div>
          </div>

          {/* Learning Path */}
          <div className="relative px-4 pb-8">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2" />
            {units.map((unit, idx) => (
              <div key={unit.id} className="relative">
                {unit.lessons.map((lesson, lessonIdx) => {
                  const position = idx * 4 + lessonIdx;
                  const offset = lessonIdx % 2 === 0 ? '-translate-x-12' : 'translate-x-12';
                  const isActive = lesson.status === 'active';
                  return (
                    <div key={lesson.id} className={`relative my-8 flex ${lessonIdx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <Link
                        href={isActive ? `/lesson/${data.currentDay}` : '#'}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl duo-card ${
                          isActive ? `bg-${unit.color} text-white border-${unit.color} animate-pulse-slow` : 'bg-gray-100 text-gray-400'
                        } ${offset}`}
                      >
                        {lesson.isBoss ? (
                          <Star className="w-12 h-12 fill-yellow-400 text-yellow-600" />
                        ) : isActive ? (
                          <span>{lesson.emoji}</span>
                        ) : (
                          <Lock className="w-8 h-8" />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="p-4">
          <h2 className="font-bold text-2xl mb-4">Practice</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/woerter" className="duo-card p-4 bg-frog text-white">
              <BookOpen className="w-10 h-10 mb-2" />
              <div className="font-bold">Vocabulary</div>
              <div className="text-xs">SRS Trainer</div>
            </Link>
            <Link href="/sprechen" className="duo-card p-4 bg-eagle text-white">
              <MessageCircle className="w-10 h-10 mb-2" />
              <div className="font-bold">Speak</div>
              <div className="text-xs">AI Chat</div>
            </Link>
            <Link href="/hoeren" className="duo-card p-4 bg-flame text-white">
              <Headphones className="w-10 h-10 mb-2" />
              <div className="font-bold">Listen</div>
              <div className="text-xs">Dictation</div>
            </Link>
            <Link href="/translate" className="duo-card p-4 bg-epic text-white">
              <Volume2 className="w-10 h-10 mb-2" />
              <div className="font-bold">Translate</div>
              <div className="text-xs">Quick Bar</div>
            </Link>
          </div>

          {/* Big Practice Button */}
          <Link href="/practice-session" className="mt-6 duo-card p-6 bg-gradient-to-r from-frog to-green-500 text-white block text-center">
            <Zap className="w-12 h-12 mx-auto mb-2" />
            <div className="font-bold text-lg">+10 XP Daily Practice</div>
            <div className="text-sm opacity-90">Mixed review</div>
          </Link>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="p-4">
          <h2 className="font-bold text-2xl mb-4">Stats</h2>
          <Link href="/fortschritt" className="duo-card p-6 bg-gradient-to-br from-gold to-flame text-white block">
            <BarChart2 className="w-12 h-12 mb-3" />
            <div className="font-bold text-xl">Your Progress</div>
            <div className="text-sm opacity-90 mt-1">Streak: {data.streakDays} · XP: {data.xp} · Day {data.currentDay}/730</div>
          </Link>

          {/* Achievements */}
          <div className="mt-6">
            <div className="font-bold text-lg mb-3">🏆 Achievements</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { emoji: '🔥', label: '7-day streak', unlocked: data.streakDays >= 7 },
                { emoji: '📚', label: '100 words', unlocked: data.vocabCount >= 100 },
                { emoji: '⭐', label: 'First boss', unlocked: false },
                { emoji: '🎤', label: 'First chat', unlocked: data.conversationsCompleted >= 1 },
                { emoji: '💎', label: '1000 XP', unlocked: data.xp >= 1000 },
                { emoji: '🇩🇪', label: 'A1 complete', unlocked: data.currentDay >= 90 },
                { emoji: '🏆', label: 'Top 3', unlocked: false },
                { emoji: '✨', label: 'Perfect week', unlocked: false },
              ].map((a, i) => (
                <div key={i} className={`duo-card p-2 text-center ${a.unlocked ? 'bg-gold' : 'bg-gray-100 opacity-50'}`}>
                  <div className="text-3xl">{a.emoji}</div>
                  <div className="text-xs mt-1 font-medium">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div className="mt-6 duo-card p-6">
            <div className="font-bold mb-3">Activity</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 * 12 }).map((_, i) => {
                const intensity = Math.random();
                const bg = intensity > 0.7 ? 'bg-frog' : intensity > 0.4 ? 'bg-green-200' : intensity > 0.1 ? 'bg-green-50' : 'bg-gray-100';
                return <div key={i} className={`w-full h-3 rounded-sm ${bg}`} />;
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="p-4">
          <h2 className="font-bold text-2xl mb-4">Stories</h2>
          <div className="space-y-3">
            {[
              { title: 'Der Kaffee', level: 'A1', emoji: '☕', status: 'active' },
              { title: 'Im Büro', level: 'A1', emoji: '🏢', status: 'locked' },
              { title: 'Eine Reise', level: 'A2', emoji: '✈️', status: 'locked' },
              { title: 'Das Meeting', level: 'B1', emoji: '🤝', status: 'locked' },
            ].map((s, i) => (
              <div key={i} className={`duo-card p-4 flex items-center gap-3 ${s.status === 'active' ? 'bg-eagle text-white' : 'bg-gray-50'}`}>
                <div className="text-4xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold">{s.title}</div>
                  <div className="text-xs opacity-80">Level {s.level}</div>
                </div>
                {s.status === 'locked' && <Lock className="w-5 h-5" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-gray-200 flex justify-around py-2 z-10">
        {[
          { id: 'learn', label: 'Learn', icon: BookOpen, color: 'frog' },
          { id: 'practice', label: 'Practice', icon: Zap, color: 'flame' },
          { id: 'stats', label: 'Stats', icon: BarChart2, color: 'eagle' },
          { id: 'stories', label: 'Stories', icon: Star, color: 'gold' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex flex-col items-center px-3 py-1 ${activeTab === t.id ? `text-${t.color} font-bold` : 'text-gray-400'}`}
          >
            <t.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
