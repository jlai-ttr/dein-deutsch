'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Volume2, X } from 'lucide-react';

interface Question {
  type: 'translate' | 'fill' | 'multiple' | 'match';
  prompt: string;
  promptLang?: 'de' | 'en';
  answer: string;
  options?: string[];
  hint?: string;
}

export default function LessonPage() {
  const params = useParams();
  const day = parseInt(String(params.day) || '1');

  const [stage, setStage] = useState<'intro' | 'lesson' | 'complete'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const questions: Question[] = [
    { type: 'translate', prompt: 'How do you say "Hello" in German?', promptLang: 'en', answer: 'Hallo', hint: 'It starts with H' },
    { type: 'multiple', prompt: 'What does "Guten Tag" mean?', promptLang: 'de', answer: 'Good day', options: ['Good day', 'Good night', 'Goodbye', 'Good morning'] },
    { type: 'fill', prompt: 'Complete: "Ich ___ Jasper." (I am Jasper)', answer: 'bin', hint: 'to be - ich form' },
    { type: 'translate', prompt: 'Write "Thank you" in German', promptLang: 'en', answer: 'Danke', hint: 'D-a-n-k-e' },
    { type: 'match', prompt: 'Tap the German for "Goodbye"', answer: 'Tschüss', options: ['Hallo', 'Tschüss', 'Danke', 'Bitte'] },
    { type: 'multiple', prompt: 'Which is formal "you"?', answer: 'Sie', options: ['du', 'Sie', 'ihr', 'er'] },
    { type: 'fill', prompt: '"How are you?" — "___ geht es Ihnen?"', answer: 'Wie', hint: 'starts with W' },
    { type: 'translate', prompt: 'Say "My name is Henry" in German', promptLang: 'en', answer: 'Ich heiße Henry', hint: 'Ich heiße ___' },
  ];

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  function checkAnswer() {
    let correct = false;
    if (q.type === 'multiple' || q.type === 'match') {
      correct = selectedOption === q.answer;
    } else {
      correct = userInput.trim().toLowerCase().includes(q.answer.toLowerCase().split(' ')[0]);
    }
    if (correct) {
      setFeedback('correct');
      setXp(xp + (q.type === 'translate' ? 5 : 3));
      setStreak(streak + 1);
    } else {
      setFeedback('wrong');
      setHearts(hearts - 1);
      setStreak(0);
    }
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setStage('complete');
        saveProgress();
      } else {
        setCurrentQ(currentQ + 1);
        setUserInput('');
        setSelectedOption(null);
        setFeedback(null);
      }
    }, 1500);
  }

  function saveProgress() {
    const stored = localStorage.getItem('dein-progress');
    const p = stored ? JSON.parse(stored) : {};
    p.currentDay = Math.min(day + 1, 730);
    p.xp = (p.xp || 0) + xp;
    p.streakDays = p.streakDays || 1;
    p.todayCompleted = true;
    localStorage.setItem('dein-progress', JSON.stringify(p));
    localStorage.setItem('dein-last-completed', new Date().toDateString());
  }

  if (stage === 'intro') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-500">✕</Link>
          <div className="flex items-center gap-2 font-bold">
            <Heart className="w-5 h-5 text-heart fill-heart" />
            <span>{hearts}</span>
          </div>
        </div>

        <div className="text-7xl mb-4 text-center">👋</div>
        <h1 className="text-3xl font-extrabold text-center mb-2">Hallo & Tschüss</h1>
        <p className="text-center text-gray-500 mb-6">Learn German greetings</p>

        <div className="duo-card p-4 mb-4 border-frog">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-green-700">+15 XP</span>
            <span className="text-xs text-gray-500">8 questions</span>
          </div>
          <div className="text-sm text-gray-600">8 questions · 5 mistakes allowed</div>
        </div>

        <button onClick={() => setStage('lesson')} className="duo-btn duo-btn-green w-full py-4 text-base">
          START +15 XP
        </button>

        <Link href="/" className="block text-center text-gray-500 mt-4 text-sm">Choose another skill</Link>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-3xl font-extrabold text-frog mb-2">Lesson Complete!</h1>
        <div className="text-center mb-8">
          <div className="text-5xl font-extrabold text-gold mb-2">+{xp} XP</div>
          <div className="text-gray-500">Total XP: {xp}</div>
        </div>

        <div className="duo-card p-4 w-full mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">🔥 Streak</span>
            <span className="font-bold text-flame">{streak}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">❤️ Hearts left</span>
            <span className="font-bold text-heart">{hearts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold">📚 Words reviewed</span>
            <span className="font-bold text-eagle">8</span>
          </div>
        </div>

        <Link href="/" className="duo-btn duo-btn-green w-full py-4 text-center">
          CONTINUE
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => setStage('intro')} className="text-gray-500">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div className="bg-frog h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-6 h-6 text-heart fill-heart" />
          <span className="font-bold">{hearts}</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-6">
        {q.type === 'multiple' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-bold">CHOOSE THE WORD</div>
            <button className="duo-card p-4 w-full text-left">
              <div className="text-2xl font-bold">{q.prompt}</div>
              <button className="mt-2">
                <Volume2 className="w-6 h-6 text-eagle" />
              </button>
            </button>
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`duo-card p-4 w-full text-left font-medium ${
                    selectedOption === opt ? 'border-eagle bg-blue-50' : ''
                  } ${feedback === 'correct' && opt === q.answer ? 'border-frog bg-green-50' : ''} ${
                    feedback === 'wrong' && opt === selectedOption ? 'border-heart bg-red-50' : ''
                  }`}
                  disabled={feedback !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.type === 'fill' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-bold">FILL IN THE BLANK</div>
            <div className="duo-card p-6 text-center">
              <div className="text-xl font-bold mb-2">{q.prompt}</div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={feedback !== null}
                className="border-b-2 border-gray-300 focus:border-eagle outline-none text-2xl font-bold text-center px-4 py-2 w-full"
                placeholder="Type here"
                autoFocus
              />
              {q.hint && feedback === null && (
                <div className="text-xs text-gray-400 mt-2">💡 {q.hint}</div>
              )}
            </div>
          </div>
        )}

        {q.type === 'translate' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-bold">TRANSLATE</div>
            <div className="duo-card p-6 text-center">
              <div className="text-2xl font-bold mb-2">{q.promptLang === 'en' ? '🇬🇧' : '🇩🇪'} {q.prompt}</div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={feedback !== null}
                className="border-b-2 border-gray-300 focus:border-eagle outline-none text-2xl font-bold text-center px-4 py-2 w-full"
                placeholder="Type in German"
                autoFocus
              />
            </div>
          </div>
        )}

        {q.type === 'match' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-bold">TAP TO MATCH</div>
            <div className="duo-card p-6 text-center">
              <div className="text-2xl font-bold mb-4">{q.prompt}</div>
              <div className="grid grid-cols-2 gap-2">
                {q.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`duo-card p-3 font-medium ${
                      selectedOption === opt ? 'border-eagle bg-blue-50' : ''
                    } ${feedback === 'correct' && opt === q.answer ? 'border-frog bg-green-50' : ''} ${
                      feedback === 'wrong' && opt === selectedOption ? 'border-heart bg-red-50' : ''
                    }`}
                    disabled={feedback !== null}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Area */}
        {feedback && (
          <div className={`duo-card p-4 mt-6 ${feedback === 'correct' ? 'bg-green-50 border-frog' : 'bg-red-50 border-heart'} animate-slide-up`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{feedback === 'correct' ? '✓' : '✗'}</div>
              <div className="flex-1">
                <div className={`font-bold ${feedback === 'correct' ? 'text-frog' : 'text-heart'}`}>
                  {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                </div>
                {feedback === 'wrong' && (
                  <div className="text-sm">Correct answer: <strong>{q.answer}</strong></div>
                )}
              </div>
              <div className="font-bold text-gold">+{q.type === 'translate' ? 5 : 3} XP</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t">
        {feedback === null ? (
          <button
            onClick={checkAnswer}
            disabled={q.type === 'multiple' || q.type === 'match' ? !selectedOption : !userInput.trim()}
            className={`duo-btn w-full py-4 ${
              (q.type === 'multiple' || q.type === 'match' ? selectedOption : userInput.trim()) ? 'duo-btn-green' : 'duo-btn-disabled'
            }`}
          >
            CHECK
          </button>
        ) : (
          <button onClick={checkAnswer} className="duo-btn duo-btn-green w-full py-4">
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
}
