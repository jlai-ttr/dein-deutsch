'use client';

import Link from 'next/link';

export default function UebenPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <Link href="/" className="text-sm text-gray-500 mb-4 inline-block">← Zurück</Link>
      <h1 className="text-3xl font-display font-bold mb-2">Üben</h1>
      <div className="dein-card text-center py-12">
        <div className="text-4xl mb-3">🔄</div>
        <div className="font-medium">SRS-Übungsmodi</div>
        <div className="text-xs text-gray-500 mt-2">Kommt in Phase 1.3</div>
        <div className="text-xs text-gray-400 mt-1">Quizzes, multiple choice, fill-in-the-blank</div>
      </div>
    </div>
  );
}
