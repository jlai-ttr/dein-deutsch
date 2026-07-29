'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Heart, Zap, Star, Lock, BarChart2, BookOpen, MessageCircle, Headphones, Volume2, Settings, Trophy, Crown } from 'lucide-react';

interface DataProps {
  currentDay: number;
  totalDays: number;
  streakDays: number;
  hearts: number;
  xp: number;
  vocabCount: number;
  conversationsCompleted: number;
  minutesListened: number;
  gems: number;
  streakFreezes: number;
  todayCompleted?: boolean;
}

interface LessonNode {
  id: number;
  title: string;
  emoji: string;
  status: 'completed' | 'active' | 'locked';
  isBoss?: boolean;
}

interface Unit {
  id: number;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  ringColor: string;
  xp: number;
  lessons: LessonNode[];
}

const units: Unit[] = [
  {
    id: 1,
    title: 'Hallo & Tschüss',
    subtitle: 'Greetings',
    bgColor: 'bg-[#58cc02]',
    textColor: 'text-white',
    ringColor: 'ring-[#58cc02]',
    xp: 15,
    lessons: [
      { id: 1, title: 'Greetings', emoji: '👋', status: 'active' },
      { id: 2, title: 'Wie geht\'s', emoji: '😊', status: 'locked' },
      { id: 3, title: 'Goodbyes', emoji: '👋', status: 'locked' },
      { id: 4, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ],
  },
  {
    id: 2,
    title: 'Zahlen 1-100',
    subtitle: 'Numbers',
    bgColor: 'bg-[#1cb0f6]',
    textColor: 'text-white',
    ringColor: 'ring-[#1cb0f6]',
    xp: 20,
    lessons: [
      { id: 5, title: 'Numbers 1-12', emoji: '1️⃣', status: 'locked' },
      { id: 6, title: 'Numbers 13-99', emoji: '🔢', status: 'locked' },
      { id: 7, title: 'Money', emoji: '💶', status: 'locked' },
      { id: 8, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ],
  },
  {
    id: 3,
    title: 'Pronomen',
    subtitle: 'Pronouns',
    bgColor: 'bg-[#ff9600]',
    textColor: 'text-white',
    ringColor: 'ring-[#ff9600]',
    xp: 25,
    lessons: [
      { id: 9, title: 'ich, du, Sie', emoji: '👤', status: 'locked' },
      { id: 10, title: 'er, sie, es', emoji: '👥', status: 'locked' },
      { id: 11, title: 'wir, ihr', emoji: '👨‍👩‍👧', status: 'locked' },
      { id: 12, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ],
  },
  {
    id: 4,
    title: 'Sein & Haben',
    subtitle: 'To be & to have',
    bgColor: 'bg-[#ce82ff]',
    textColor: 'text-white',
    ringColor: 'ring-[#ce82ff]',
    xp: 30,
    lessons: [
      { id: 13, title: 'sein (to be)', emoji: '🫀', status: 'locked' },
      { id: 14, title: 'haben (to have)', emoji: '🤲', status: 'locked' },
      { id: 15, title: 'Practice', emoji: '✍️', status: 'locked' },
      { id: 16, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ],
  },
  {
    id: 5,
    title: 'Alltag',
    subtitle: 'Daily life',
    bgColor: 'bg-[#58cc02]',
    textColor: 'text-white',
    ringColor: 'ring-[#58cc02]',
    xp: 25,
    lessons: [
      { id: 17, title: 'Routine', emoji: '☀️', status: 'locked' },
      { id: 18, title: 'Food', emoji: '🍞', status: 'locked' },
      { id: 19, title: 'Family', emoji: '👨‍👩‍👧‍👦', status: 'locked' },
      { id: 20, title: 'Boss Battle', emoji: '⭐', status: 'locked', isBoss: true },
    ],
  },
];

export default function Home() {
  const [data, setData] = useState<DataProps>({
    currentDay: 1,
    totalDays: 730,
    streakDays: 0,
    hearts: 5,
    xp: 0,
    vocabCount: 0,
    conversationsCompleted: 0,
    minutesListened: 0,
    gems: 500,
    streakFreezes: 2,
  });
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'stats' | 'profile'>('learn');

  useEffect(() => {
    const stored = localStorage.getItem('dein-progress');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  const dailyQuests = [
    { id: 1, title: 'Earn 30 XP', icon: '⚡', progress: Math.min(data.xp, 30), target: 30, color: 'bg-[#ffc800]', textColor: 'text-white' },
    { id: 2, title: 'Complete 1 lesson', icon: '📚', progress: data.todayCompleted ? 1 : 0, target: 1, color: 'bg-[#58cc02]', textColor: 'text-white' },
    { id: 3, title: 'Review 10 words', icon: '🎯', progress: Math.min(data.vocabCount, 10), target: 10, color: 'bg-[#1cb0f6]', textColor: 'text-white' },
  ];

  const allQuestsDone = dailyQuests.every(q => q.progress >= q.target);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame className="w-7 h-7 text-[#ff9600] fill-[#ff9600]" />
              <span className="font-extrabold text-xl text-[#3c3c3c]">{data.streakDays}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-6 h-6 text-[#ffc800] fill-[#ffc800]" />
              <span className="font-extrabold text-lg text-[#3c3c3c]">{data.xp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-6 h-6 text-[#ff4b4b] fill-[#ff4b4b]" />
              <span className="font-extrabold text-lg text-[#3c3c3c]">{data.hearts}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-1">
              <span className="text-2xl">💎</span>
              <span className="font-extrabold text-sm text-[#1cb0f6]">{data.gems}</span>
            </Link>
            <Link href="/profile" className="w-9 h-9 rounded-full bg-[#58cc02] text-white flex items-center justify-center font-extrabold border-2 border-[#58a700]">
              J
            </Link>
          </div>
        </div>
      </div>

      {/* LEARN TAB */}
      {activeTab === 'learn' && (
        <div>
          {/* Daily Quests Banner */}
          <div className="mx-4 mt-4 bg-gradient-to-br from-[#ffc800] to-[#ff9600] rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-extrabold text-lg">Daily Quests</div>
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">+50 XP</div>
            </div>
            <div className="space-y-2">
              {dailyQuests.map((q) => (
                <div key={q.id} className="flex items-center gap-3">
                  <div className="text-2xl">{q.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{q.title}</div>
                    <div className="bg-white/30 rounded-full h-2 mt-1 overflow-hidden">
                      <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold">{q.progress}/{q.target}</div>
                </div>
              ))}
            </div>
            {allQuestsDone && (
              <div className="mt-3 text-center text-sm font-bold bg-white/20 rounded-lg py-2">🎁 Claim 50 XP!</div>
            )}
          </div>

          {/* League Banner */}
          <Link href="/league" className="mx-4 mt-3 block bg-gradient-to-r from-[#1cb0f6] to-[#1899d6] rounded-2xl p-4 text-white border-2 border-b-4 border-[#0e7da9] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🥈</div>
                <div>
                  <div className="font-extrabold">Silver League</div>
                  <div className="text-xs opacity-90">3 days left · Rank 7</div>
                </div>
              </div>
              <div className="bg-white text-[#1cb0f6] px-3 py-1 rounded-full text-xs font-extrabold">VIEW</div>
            </div>
          </Link>

          {/* Section Header */}
          <div className="px-4 mt-6 mb-4">
            <div className="text-xs font-extrabold text-[#afafaf] uppercase tracking-wider">Section 1, Unit 1</div>
            <h1 className="text-2xl font-extrabold text-[#3c3c3c]">Hallo & Tschüss</h1>
            <div className="text-sm text-gray-500 mt-1">Start your German journey</div>
          </div>

          {/* Learning Path */}
          <div className="relative px-4 pb-8">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2" />
            {units.map((unit, uIdx) => (
              <div key={unit.id} className="relative">
                {/* Unit Header */}
                <div className="flex justify-center my-8 relative z-10">
                  <div className={`${unit.bgColor} ${unit.textColor} px-4 py-1.5 rounded-full font-extrabold text-sm border-2 border-b-4 border-black/10 shadow-sm`}>
                    UNIT {unit.id} · {unit.title}
                  </div>
                </div>

                {unit.lessons.map((lesson, lIdx) => {
                  const isLeft = lIdx % 2 === 0;
                  const isActive = lesson.status === 'active';
                  return (
                    <div key={lesson.id} className={`relative my-12 flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                      <Link
                        href={isActive ? `/lesson/${data.currentDay}` : '#'}
                        className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center text-4xl transition-all ${
                          isActive
                            ? `${unit.bgColor} ${unit.textColor} shadow-[0_6px_0_0_rgba(0,0,0,0.15)] border-2 border-b-4 border-black/20 ring-4 ring-white animate-pulse`
                            : 'bg-gray-200 text-gray-400 border-2 border-b-4 border-gray-300'
                        }`}
                        style={{ transform: isLeft ? 'translateX(-24px)' : 'translateX(24px)' }}
                      >
                        {lesson.isBoss ? (
                          <Crown className="w-12 h-12 fill-yellow-300 text-yellow-600" />
                        ) : isActive ? (
                          <span className="text-4xl">{lesson.emoji}</span>
                        ) : (
                          <Lock className="w-10 h-10" />
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

      {/* PRACTICE TAB */}
      {activeTab === 'practice' && (
        <div className="p-4">
          <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-1">Practice</h2>
          <p className="text-sm text-gray-500 mb-4">Strengthen your skills</p>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/woerter" className="bg-[#58cc02] text-white rounded-2xl p-4 border-2 border-b-4 border-[#58a700] hover:brightness-105 transition">
              <BookOpen className="w-10 h-10 mb-2" />
              <div className="font-extrabold">Vocabulary</div>
              <div className="text-xs opacity-90">SRS Trainer</div>
            </Link>
            <Link href="/sprechen" className="bg-[#1cb0f6] text-white rounded-2xl p-4 border-2 border-b-4 border-[#1899d6] hover:brightness-105 transition">
              <MessageCircle className="w-10 h-10 mb-2" />
              <div className="font-extrabold">Speak</div>
              <div className="text-xs opacity-90">AI Chat</div>
            </Link>
            <Link href="/hoeren" className="bg-[#ff9600] text-white rounded-2xl p-4 border-2 border-b-4 border-[#cc7700] hover:brightness-105 transition">
              <Headphones className="w-10 h-10 mb-2" />
              <div className="font-extrabold">Listen</div>
              <div className="text-xs opacity-90">Dictation</div>
            </Link>
            <Link href="/translate" className="bg-[#ce82ff] text-white rounded-2xl p-4 border-2 border-b-4 border-[#a566cc] hover:brightness-105 transition">
              <Volume2 className="w-10 h-10 mb-2" />
              <div className="font-extrabold">Translate</div>
              <div className="text-xs opacity-90">Quick Bar</div>
            </Link>
          </div>

          <Link href="/practice-session" className="mt-6 block bg-gradient-to-r from-[#58cc02] to-[#46a002] text-white rounded-2xl p-6 border-2 border-b-4 border-[#58a700] text-center">
            <Zap className="w-12 h-12 mx-auto mb-2 fill-white" />
            <div className="font-extrabold text-lg">+10 XP Daily Practice</div>
            <div className="text-sm opacity-90">Mixed review</div>
          </Link>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="p-4">
          <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-1">Stats</h2>
          <p className="text-sm text-gray-500 mb-4">Your progress at a glance</p>

          <Link href="/fortschritt" className="block bg-gradient-to-br from-[#ffc800] to-[#ff9600] rounded-2xl p-6 text-white border-2 border-b-4 border-[#cc7700]">
            <BarChart2 className="w-12 h-12 mb-3" />
            <div className="font-extrabold text-xl">Your Progress</div>
            <div className="text-sm opacity-90 mt-1">Streak: {data.streakDays} · XP: {data.xp} · Day {data.currentDay}/730</div>
          </Link>

          <div className="mt-6">
            <div className="font-extrabold text-lg text-[#3c3c3c] mb-3">🏆 Achievements</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { emoji: '🔥', label: '7 streak', unlocked: data.streakDays >= 7 },
                { emoji: '📚', label: '100 words', unlocked: data.vocabCount >= 100 },
                { emoji: '⭐', label: 'First boss', unlocked: data.currentDay >= 4 },
                { emoji: '🎤', label: 'First chat', unlocked: data.conversationsCompleted >= 1 },
                { emoji: '💎', label: '1000 XP', unlocked: data.xp >= 1000 },
                { emoji: '🇩🇪', label: 'A1 done', unlocked: data.currentDay >= 90 },
                { emoji: '🏆', label: 'Top 3', unlocked: false },
                { emoji: '✨', label: 'Perfect week', unlocked: false },
              ].map((a, i) => (
                <div key={i} className={`rounded-2xl p-2 text-center border-2 border-b-4 ${a.unlocked ? 'bg-[#ffc800] text-white border-[#cc9900]' : 'bg-gray-100 text-gray-400 border-gray-300'}`}>
                  <div className="text-3xl mb-1">{a.emoji}</div>
                  <div className="text-xs font-extrabold leading-tight">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl p-4 border-2 border-b-4 border-gray-200">
            <div className="font-extrabold text-[#3c3c3c] mb-3">Activity</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 84 }).map((_, i) => {
                const intensity = Math.random();
                const bg = intensity > 0.7 ? 'bg-[#58cc02]' : intensity > 0.4 ? 'bg-[#a8e063]' : intensity > 0.1 ? 'bg-[#ddf5c5]' : 'bg-gray-100';
                return <div key={i} className={`w-full h-3 rounded-sm ${bg}`} />;
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-[#58cc02] text-white flex items-center justify-center text-4xl font-extrabold border-4 border-[#ffc800]">
              J
            </div>
            <h1 className="text-2xl font-extrabold text-[#3c3c3c]">Jasper Lai</h1>
            <div className="text-gray-500 text-sm">@jasperlai · joined July 2026</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#ffc800] text-white rounded-2xl p-3 text-center border-2 border-b-4 border-[#cc9900]">
              <div className="text-2xl font-extrabold">{data.streakDays}</div>
              <div className="text-xs font-bold">🔥 Streak</div>
            </div>
            <div className="bg-[#1cb0f6] text-white rounded-2xl p-3 text-center border-2 border-b-4 border-[#1899d6]">
              <div className="text-2xl font-extrabold">{data.xp}</div>
              <div className="text-xs font-bold">⚡ XP</div>
            </div>
            <div className="bg-[#58cc02] text-white rounded-2xl p-3 text-center border-2 border-b-4 border-[#58a700]">
              <div className="text-2xl font-extrabold">{data.currentDay}</div>
              <div className="text-xs font-bold">📅 Day</div>
            </div>
          </div>

          <Link href="/fortschritt" className="block bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 text-center">
            <div className="font-extrabold text-[#3c3c3c]">View Full Progress →</div>
          </Link>
        </div>
      )}

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-gray-200 flex justify-around py-2 z-20">
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center px-3 py-1 ${activeTab === 'learn' ? 'text-[#58cc02]' : 'text-[#afafaf]'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs mt-1 font-bold">Learn</span>
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center px-3 py-1 ${activeTab === 'practice' ? 'text-[#1cb0f6]' : 'text-[#afafaf]'}`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-xs mt-1 font-bold">Practice</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center px-3 py-1 ${activeTab === 'stats' ? 'text-[#ff9600]' : 'text-[#afafaf]'}`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs mt-1 font-bold">Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center px-3 py-1 ${activeTab === 'profile' ? 'text-[#ce82ff]' : 'text-[#afafaf]'}`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs mt-1 font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
}
