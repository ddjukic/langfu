'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MatchingGame from '@/components/matching-game';
import ExampleSentences from '@/components/example-sentences';
import SentenceCreation from '@/components/sentence-creation';

interface LearningSessionProps {
  user: any;
  words: any[];
  level?: string;
  topic?: string;
  mode?: string;
}

type SessionMode = 'matching' | 'examples' | 'creation' | 'complete';

export default function LearningSession({
  user,
  words: initialWords,
  mode: sessionType,
}: LearningSessionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SessionMode>('matching');
  const [sessionWords, setSessionWords] = useState<any[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [words, setWords] = useState<any[]>(initialWords);
  const [_extractionTitle, setExtractionTitle] = useState<string>('');
  const [extractedLanguage, setExtractedLanguage] = useState<string>('');
  const hasLoadedExtracted = useRef(false);

  // Load extracted words from localStorage if in extracted mode
  useEffect(() => {
    if (
      sessionType === 'extracted' &&
      typeof window !== 'undefined' &&
      !hasLoadedExtracted.current
    ) {
      console.log('Learning Session - Loading extracted mode');
      const extractedWords = localStorage.getItem('extractedWords');
      const title = localStorage.getItem('extractionTitle');
      const language = localStorage.getItem('extractionLanguage');

      console.log('Extracted words from localStorage:', extractedWords ? 'Found' : 'Not found');
      console.log('Title from localStorage:', title);

      if (extractedWords) {
        try {
          const parsed = JSON.parse(extractedWords);
          console.log('Successfully parsed extracted words:', parsed.length, 'words');

          // Transform extracted words to match the expected format
          const transformedWords = parsed.map((word: any, index: number) => ({
            id: word.id || `extracted-${index}`,
            l2: word.l2,
            l1: word.l1,
            level: word.level || 'B1',
            topic: 'Extracted',
            pos: word.pos,
            gender: word.gender,
            examples: word.context ? [{ sentence: word.context }] : [],
            isExtracted: true, // Mark as extracted for tracking
          }));

          console.log('Setting transformed words:', transformedWords.length);
          setWords(transformedWords);

          // Set title if available
          if (title) {
            setExtractionTitle(title);
          }

          // Set extracted language if available
          if (language) {
            setExtractedLanguage(language);
          }

          // Mark as loaded and clear localStorage after successfully loading and setting state
          hasLoadedExtracted.current = true;
          console.log('Clearing localStorage after successful load');
          localStorage.removeItem('extractedWords');
          localStorage.removeItem('extractionTitle');
          localStorage.removeItem('extractionLanguage');
        } catch (error) {
          console.error('Failed to parse extracted words:', error);
          console.log('Redirecting to /extract due to parse error');
          router.push('/extract');
        }
      } else {
        // No extracted words found, redirect back
        console.log('No extracted words found in localStorage, redirecting to /extract');
        router.push('/extract');
      }
    }
  }, [sessionType, router]);

  const handleMatchingComplete = async (
    score: number,
    _correctMatches: number,
    _totalAttempts: number
  ) => {
    setSessionScore(score);

    // Track word history for matched words
    const matchedWords = words.slice(0, 15); // Max 15 words from 3 rounds
    setSessionWords(matchedWords);

    // Update word history in database with batch request
    await fetch('/api/words/track-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        words: matchedWords,
        correct: true,
      }),
    });

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
        language={extractedLanguage || user.currentLanguage}
        onComplete={handleMatchingComplete}
        onQuit={handleQuit}
      />
    );
  }

  if (mode === 'examples') {
    return (
      <ExampleSentences
        words={sessionWords}
        language={extractedLanguage || user.currentLanguage}
        onComplete={handleExamplesComplete}
        onSkip={handleExamplesComplete}
      />
    );
  }

  if (mode === 'creation') {
    return (
      <SentenceCreation
        words={sessionWords}
        language={extractedLanguage || user.currentLanguage}
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
          <p className="text-gray-600 mb-6">You learned {sessionWords.length} new words</p>

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
