'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen, Trophy, Target, LogOut, Upload, Settings, Globe } from 'lucide-react';
import Link from 'next/link';

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
  recentWords 
}: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSmartStart = () => {
    if (wordsDueForReview > 0) {
      router.push('/learn/review');
    } else {
      router.push('/learn/new');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
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
              <Link
                href="/settings"
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{progress?.currentStreak || 0}</span>
            </div>
            <p className="text-gray-600">Day Streak</p>
            <p className="text-sm text-gray-400 mt-1">
              Best: {progress?.longestStreak || 0} days
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{progress?.wordsLearned || 0}</span>
            </div>
            <p className="text-gray-600">Words Learned</p>
            <p className="text-sm text-gray-400 mt-1">
              Level: {progress?.currentLevel || 'A1'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{wordsDueForReview}</span>
            </div>
            <p className="text-gray-600">Due for Review</p>
            <p className="text-sm text-gray-400 mt-1">
              Daily Goal: {user.dailyGoal} words
            </p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Start Learning</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleSmartStart}
              className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <ChevronRight className="w-6 h-6" />
              Smart Start
              {wordsDueForReview > 0 && (
                <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {wordsDueForReview} reviews
                </span>
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/learn/new"
                className="py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors text-center"
              >
                Learn New Words
              </Link>
              
              <Link
                href="/learn/practice"
                className="py-4 px-6 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-center"
              >
                Practice Mode
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/library"
                className="py-4 px-6 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors text-center"
              >
                Word Library
              </Link>
              
              <Link
                href="/vocabulary/load"
                className="py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Load Vocabulary
              </Link>
              
              <Link
                href="/extract"
                className="py-4 px-6 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Extract from Web
              </Link>
            </div>
          </div>

          {/* Recent Words */}
          {recentWords.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recently Learned</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {recentWords.slice(0, 5).map((history) => (
                  <div
                    key={history.id}
                    className="p-3 bg-gray-50 rounded-lg text-center"
                  >
                    <p className="font-medium text-sm">{history.word.l2}</p>
                    <p className="text-xs text-gray-500 mt-1">{history.word.l1}</p>
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