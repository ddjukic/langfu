'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from '@/components/swipe-card';
import NavigationHeader from '@/components/navigation-header';
import Link from 'next/link';
import { Trophy, Target, RefreshCw, Home, Info, X, Sparkles, ChevronLeft } from 'lucide-react';

interface SwipeLearningClientProps {
  words: any[];
  user: any;
  progress: any;
  mode: string;
  level?: string;
  topic?: string;
}

interface SwipeResult {
  wordId: string;
  action: 'know' | 'practice' | 'details';
  timestamp: Date;
}

export default function SwipeLearningClient({
  words: initialWords,
  user: _user,
  progress: _progress,
  mode: _mode,
}: SwipeLearningClientProps) {
  const router = useRouter();
  const [words, _setWords] = useState(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SwipeResult[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    known: 0,
    needPractice: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  // Check if first time user
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('swipeTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Track progress
  const trackWord = useCallback(async (wordId: string, correct: boolean) => {
    try {
      await fetch('/api/words/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId, correct }),
      });
    } catch (error) {
      console.error('Failed to track word:', error);
    }
  }, []);

  const handleSwipeRight = useCallback(
    async (word: any) => {
      // User knows this word
      setResults((prev) => [...prev, { wordId: word.id, action: 'know', timestamp: new Date() }]);
      setSessionStats((prev) => ({
        ...prev,
        known: prev.known + 1,
        total: prev.total + 1,
      }));
      await trackWord(word.id, true);
      setCurrentIndex((prev) => prev + 1);
      setCanUndo(true);

      // Check if session complete
      if (currentIndex >= words.length - 1) {
        setIsComplete(true);
      }
    },
    [currentIndex, words.length, trackWord]
  );

  const handleSwipeLeft = useCallback(
    async (word: any) => {
      // User needs practice
      setResults((prev) => [
        ...prev,
        { wordId: word.id, action: 'practice', timestamp: new Date() },
      ]);
      setSessionStats((prev) => ({
        ...prev,
        needPractice: prev.needPractice + 1,
        total: prev.total + 1,
      }));
      await trackWord(word.id, false);
      setCurrentIndex((prev) => prev + 1);
      setCanUndo(true);

      // Check if session complete
      if (currentIndex >= words.length - 1) {
        setIsComplete(true);
      }
    },
    [currentIndex, words.length, trackWord]
  );

  const handleSwipeUp = useCallback((word: any) => {
    // Show details - handled within the card component
    setResults((prev) => [...prev, { wordId: word.id, action: 'details', timestamp: new Date() }]);
  }, []);

  const handleUndo = useCallback(() => {
    if (results.length > 0 && currentIndex > 0) {
      const lastResult = results[results.length - 1];

      // Update stats
      if (lastResult && lastResult.action === 'know') {
        setSessionStats((prev) => ({
          ...prev,
          known: prev.known - 1,
          total: prev.total - 1,
        }));
      } else if (lastResult && lastResult.action === 'practice') {
        setSessionStats((prev) => ({
          ...prev,
          needPractice: prev.needPractice - 1,
          total: prev.total - 1,
        }));
      }

      // Remove last result
      setResults((prev) => prev.slice(0, -1));
      setCurrentIndex((prev) => prev - 1);
      setIsComplete(false);

      // Disable undo if back at the start
      if (currentIndex <= 1) {
        setCanUndo(false);
      }
    }
  }, [results, currentIndex]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('swipeTutorialSeen', 'true');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setResults([]);
    setSessionStats({ known: 0, needPractice: 0, total: 0 });
    setIsComplete(false);
    setCanUndo(false);
    router.refresh();
  };

  // Calculate progress
  const progressPercentage = (currentIndex / words.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 transition-colors duration-200">
      <NavigationHeader
        title="Swipe Learning"
        subtitle={`${words.length} words to review`}
        breadcrumbs={[{ label: 'Learning', href: '/dashboard' }, { label: 'Swipe Mode' }]}
        rightActions={
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200 touch-manipulation"
            aria-label="Show tutorial"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        }
      />
      <div className="max-w-lg mx-auto p-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>
              {currentIndex} / {words.length}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Trophy className="w-6 h-6 text-green-300" />
              <span className="text-2xl font-bold text-white">{sessionStats.known}</span>
            </div>
            <p className="text-white/80 text-sm mt-1">I know these</p>
          </div>

          <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Target className="w-6 h-6 text-amber-300" />
              <span className="text-2xl font-bold text-white">{sessionStats.needPractice}</span>
            </div>
            <p className="text-white/80 text-sm mt-1">Need practice</p>
          </div>
        </div>

        {/* Card Stack */}
        <div className="relative h-[500px] mb-20">
          {!isComplete ? (
            <>
              {words.slice(currentIndex, currentIndex + 3).map((word, index) => (
                <SwipeCard
                  key={word.id}
                  word={word}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onSwipeUp={handleSwipeUp}
                  isActive={index === 0}
                  index={index}
                  canUndo={canUndo && index === 0}
                  onUndo={handleUndo}
                />
              ))}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Session Complete!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You reviewed {sessionStats.total} words
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Words known:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {sessionStats.known}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Need practice:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {sessionStats.needPractice}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Practice More
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={handleCloseTutorial}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    How to Use Swipe Learning
                  </h3>
                  <button
                    onClick={handleCloseTutorial}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ChevronLeft className="w-4 h-4 text-green-600 dark:text-green-400 rotate-180" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Swipe Right</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">I know this word</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <ChevronLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Swipe Left</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        I need more practice
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-90" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Swipe Up</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show example sentences
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCloseTutorial}
                  className="w-full mt-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                >
                  Got it!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
