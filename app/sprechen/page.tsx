'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Mic, Volume2 } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'partner';
  text: string;
  translation?: string;
  correction?: string;
}

const scenarios = [
  { id: 'hotel', title: 'Hotel Check-in', emoji: '🏨', partner: 'Hotel receptionist', level: 'A1' },
  { id: 'restaurant', title: 'Restaurant Order', emoji: '🍽️', partner: 'Waiter', level: 'A1' },
  { id: 'business', title: 'Business Meeting', emoji: '🤝', partner: 'German colleague', level: 'B1' },
  { id: 'supplier', title: 'Supplier Call', emoji: '📞', partner: 'Lieferant', level: 'B1' },
  { id: 'shop', title: 'Shopping', emoji: '🛍️', partner: 'Shop assistant', level: 'A1' },
  { id: 'doctor', title: 'Doctor Visit', emoji: '⚕️', partner: 'Doctor', level: 'A2' },
];

const starterMessages: Record<string, string[]> = {
  hotel: ['Guten Abend! Haben Sie eine Reservierung?', 'Willkommen im Hotel Berlin. Wie kann ich Ihnen helfen?'],
  restaurant: ['Guten Abend! Einen Tisch für zwei? Was darf es sein?'],
  business: ['Guten Tag. Schön, Sie kennenzulernen. Wie läuft das Projekt?'],
  supplier: ['Guten Tag, hier ist die Lieferfirma Schmidt. Was kann ich für Sie tun?'],
  shop: ['Hallo! Kann ich Ihnen helfen? Suchen Sie etwas Bestimmtes?'],
  doctor: ['Guten Tag. Was sind Ihre Beschwerden?'],
};

const simpleAIResponses = [
  { match: ['hallo', 'hi', 'guten'], response: 'Hallo! Wie geht es Ihnen heute?', translation: 'Hello! How are you today?' },
  { match: ['danke', 'dank', 'thank'], response: 'Bitte schön! Gerne.', translation: 'You\'re welcome! Gladly.' },
  { match: ['ja', 'yes', 'jawohl'], response: 'Sehr gut. Möchten Sie noch etwas?', translation: 'Very good. Would you like anything else?' },
  { match: ['nein', 'no', 'nicht'], response: 'Verstehe. Sonst noch etwas?', translation: 'I understand. Anything else?' },
  { match: ['preis', 'cost', 'kostet'], response: 'Der Preis ist 25 Euro. Passt das für Sie?', translation: 'The price is 25 Euro. Is that okay for you?' },
  { match: ['zeit', 'time', 'wann'], response: 'Wir haben um 10 Uhr geöffnet.', translation: 'We open at 10 o\'clock.' },
  { match: ['wo', 'where', 'wohin'], response: 'Es ist in der Berliner Straße 15.', translation: 'It\'s at Berlin Street 15.' },
  { match: ['name', 'heiße'], response: 'Freut mich! Mein Name ist Hans.', translation: 'Nice to meet you! My name is Hans.' },
];

export default function SprechenPage() {
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function startScenario(scenario: typeof scenarios[0]) {
    setSelectedScenario(scenario);
    const starters = starterMessages[scenario.id] || starterMessages.hotel;
    setMessages(
      starters.map((text, i) => ({
        id: i,
        role: 'partner',
        text,
        translation: 'Translation: ' + text,
      }))
    );
  }

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: input,
    };

    // Find AI response
    const lower = input.toLowerCase();
    let response = 'Verstehe. Möchten Sie noch etwas wissen?';
    let translation = 'I understand. Would you like to know anything else?';
    let correction = null;

    for (const r of simpleAIResponses) {
      if (r.match.some(m => lower.includes(m))) {
        response = r.response;
        translation = r.translation;
        break;
      }
    }

    // Simple grammar correction
    if (lower.startsWith('ich bin') && !lower.includes('.')) {
      correction = '✓ Good sentence! Remember the period at the end.';
    } else if (lower.includes(' ')) {
      correction = '✓ Nice try! Practice makes perfect.';
    }

    setMessages([...messages, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const partnerMsg: Message = {
        id: Date.now() + 1,
        role: 'partner',
        text: response,
        translation,
        correction: correction || undefined,
      };
      setMessages(m => [...m, partnerMsg]);
      setIsTyping(false);
    }, 1200);
  }

  if (!selectedScenario) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-6">
        <Link href="/" className="text-gray-500 mb-4 inline-block">← Back</Link>
        <h1 className="text-3xl font-extrabold mb-2">Sprechen</h1>
        <p className="text-gray-500 mb-6">Choose a scenario to practice conversation</p>

        <div className="grid grid-cols-2 gap-3">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="duo-card p-4 text-left hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="font-bold">{s.title}</div>
              <div className="text-xs text-gray-500">{s.partner}</div>
              <div className="text-xs text-frog font-bold mt-1">Level {s.level}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedScenario(null)} className="text-gray-500">←</button>
          <div className="text-3xl">{selectedScenario.emoji}</div>
          <div>
            <div className="font-bold">{selectedScenario.partner}</div>
            <div className="text-xs text-frog">● Online</div>
          </div>
        </div>
        <button className="text-gray-400">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${m.role === 'user' ? 'bg-eagle text-white' : 'bg-white border-2 border-gray-200'}`}>
              <div className="font-medium">{m.text}</div>
              {m.translation && (
                <div className={`text-xs mt-1 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'} italic`}>
                  {m.translation}
                </div>
              )}
              {m.correction && (
                <div className="text-xs mt-1 text-gold font-bold">
                  {m.correction}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick reply chips */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto">
        <div className="flex gap-2">
          {['Hallo!', 'Ja, bitte', 'Nein, danke', 'Wie bitte?', 'Entschuldigung'].map((c) => (
            <button
              key={c}
              onClick={() => setInput(c)}
              className="duo-card px-3 py-2 text-xs whitespace-nowrap bg-cream"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-gray-200 flex items-center gap-2">
        <button className="text-gray-400">
          <Mic className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Tippe auf Deutsch..."
          className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2 outline-none focus:border-eagle"
        />
        <button onClick={sendMessage} className="bg-eagle text-white rounded-full p-2">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
