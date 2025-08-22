'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  BookOpen,
  Trophy,
  Target,
  LogOut,
  Upload,
  Settings,
  Globe,
  Archive,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { SimpleThemeToggle } from '@/components/theme-toggle';

interface DashboardClientProps {
  user: any;
  progress: any;
  wordsDueForReview: number;
  recentWords: any[];
}

export default function DashboardClient({
  user,
  progress,
  wordsDueForReview,
  recentWords,
}: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSmartStart = () => {
    // For now, always redirect to new learning since review is not implemented
    router.push('/learn/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-6 mb-6 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user.name || user.email.split('@')[0]}!
              </h1>
              <p className="text-white/80 mt-1">
                Learning {user.currentLanguage === 'GERMAN' ? 'German 🇩🇪' : 'Spanish 🇪🇸'}
              </p>
            </div>
            <div className="flex gap-2">
              <SimpleThemeToggle />
              <Link
                href="/settings"
                className="p-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="p-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg dark:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {progress?.currentStreak || 0}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Day Streak</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Best: {progress?.longestStreak || 0} days
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg dark:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {progress?.wordsLearned || 0}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Words Learned</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Level: {progress?.currentLevel || 'A1'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg dark:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500 dark:text-green-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {wordsDueForReview}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Due for Review</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Daily Goal: {user.dailyGoal} words
            </p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Start Learning</h2>

          <div className="space-y-4">
            <button
              onClick={handleSmartStart}
              className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl font-bold text-xl hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <ChevronRight className="w-6 h-6" />
              Smart Start
              {wordsDueForReview > 0 && (
                <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {wordsDueForReview} reviews
                </span>
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/learn/swipe"
                className="py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Swipe Mode
              </Link>

              <Link
                href="/learn/new"
                className="py-4 px-6 bg-blue-500 dark:bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-center"
              >
                Learn New Words
              </Link>

              <Link
                href="/learn/topic"
                className="py-4 px-6 bg-indigo-500 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors text-center"
              >
                Topic Mode
              </Link>

              <Link
                href="/learn/practice"
                className="py-4 px-6 bg-green-500 dark:bg-green-600 text-white rounded-xl font-semibold hover:bg-green-600 dark:hover:bg-green-700 transition-colors text-center"
              >
                Practice Mode
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/progress"
                className="py-4 px-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Trophy className="w-5 h-5" />
                Progress Dashboard
              </Link>

              <Link
                href="/library"
                className="py-4 px-6 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-center"
              >
                Word Library
              </Link>

              <Link
                href="/vocabulary/load"
                className="py-4 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Load Vocabulary
              </Link>

              <Link
                href="/extract"
                className="py-4 px-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Extract from Web
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/vocabulary/extracted"
                className="py-4 px-6 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Archive className="w-5 h-5" />
                My Extractions
              </Link>
            </div>
          </div>

          {/* Recent Words */}
          {recentWords.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Recently Learned
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {recentWords.slice(0, 5).map((history) => (
                  <div
                    key={history.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center transition-colors duration-200"
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {history.word.l2}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {history.word.l1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
