'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchingGame from '@/components/matching-game';
import ExampleSentences from '@/components/example-sentences';
import SentenceCreation from '@/components/sentence-creation';

interface LearningSessionProps {
  user: any;
  words: any[];
  level: string;
  topic: string;
}

type SessionMode = 'matching' | 'examples' | 'creation' | 'complete';

export default function LearningSession({ user, words, level, topic }: LearningSessionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SessionMode>('matching');
  const [sessionWords, setSessionWords] = useState<any[]>([]);
  const [sessionScore, setSessionScore] = useState(0);

  const handleMatchingComplete = async (score: number, correctMatches: number, totalAttempts: number) => {
    setSessionScore(score);
    
    // Track word history for matched words
    const matchedWords = words.slice(0, 15); // Max 15 words from 3 rounds
    setSessionWords(matchedWords);

    // Update word history in database
    for (const word of matchedWords) {
      await fetch('/api/words/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: word.id,
          correct: true,
        }),
      });
    }

    // Move to example sentences
    setMode('examples');
  };

  const handleExamplesComplete = () => {
    setMode('creation');
  };

  const handleCreationComplete = async () => {
    // Update progress
    await fetch('/api/progress/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wordsLearned: sessionWords.length,
        score: sessionScore,
      }),
    });

    setMode('complete');
  };

  const handleQuit = () => {
    router.push('/dashboard');
  };

  if (mode === 'matching') {
    return (
      <MatchingGame
        words={words}
        language={user.currentLanguage}
        onComplete={handleMatchingComplete}
        onQuit={handleQuit}
      />
    );
  }

  if (mode === 'examples') {
    return (
      <ExampleSentences
        words={sessionWords}
        language={user.currentLanguage}
        onComplete={handleExamplesComplete}
        onSkip={handleExamplesComplete}
      />
    );
  }

  if (mode === 'creation') {
    return (
      <SentenceCreation
        words={sessionWords}
        language={user.currentLanguage}
        onComplete={handleCreationComplete}
        onSkip={handleCreationComplete}
      />
    );
  }

  if (mode === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-6">
            You learned {sessionWords.length} new words
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{sessionScore}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}