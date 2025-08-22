'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Share2,
  Download,
  ChevronLeft,
  Trophy,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Import chart components
import { ProgressLineChart } from '@/components/charts/ProgressLineChart';
import { StreakCalendar } from '@/components/charts/StreakCalendar';
import { LevelProgress } from '@/components/charts/LevelProgress';
import { StudyTimeChart } from '@/components/charts/StudyTimeChart';
import { SuccessRateChart } from '@/components/charts/SuccessRateChart';

interface ProgressClientProps {
  user: any;
  progress: any;
  dailyData: any[];
  successRateData: any[];
  overallRate: number;
  totalMinutes: number;
  averageMinutes: number;
  levels: any[];
  currentLevel: string;
  wordsInLevel: number;
  totalWordsInLevel: number;
  predictedDate: string;
  wordHistory: any[];
}

export default function ProgressClient({
  user,
  progress,
  dailyData,
  successRateData,
  overallRate,
  totalMinutes,
  averageMinutes,
  levels,
  currentLevel,
  wordsInLevel,
  totalWordsInLevel,
  predictedDate,
  wordHistory,
}: ProgressClientProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'overview' | 'streak' | 'levels' | 'time' | 'success'>(
    'overview'
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const { theme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);

  // Filter data based on period
  const getFilteredData = () => {
    if (period === 'daily') return dailyData.slice(-7);
    if (period === 'weekly') return dailyData.slice(-14);
    return dailyData;
  };

  // Export as PDF
  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`langfu-progress-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Export as Image
  const exportAsImage = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `langfu-progress-${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Share on social media
  const shareProgress = () => {
    const text = `I've learned ${progress?.wordsLearned || 0} words in ${
      user.currentLanguage === 'GERMAN' ? 'German' : 'Spanish'
    } with LangFu! 🎉 Current streak: ${progress?.currentStreak || 0} days 🔥`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Check for milestones
  const checkMilestones = () => {
    const milestones = [100, 250, 500, 750, 1000, 1500];
    return milestones.includes(progress?.wordsLearned || 0);
  };

  // Mobile swipe navigation
  const handleSwipe = (direction: 'left' | 'right') => {
    const tabs = ['overview', 'streak', 'levels', 'time', 'success'];
    const currentIndex = tabs.indexOf(activeTab);

    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Progress Dashboard
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </h1>
                <p className="text-white/80 mt-1">
                  Track your {user.currentLanguage === 'GERMAN' ? 'German 🇩🇪' : 'Spanish 🇪🇸'}{' '}
                  learning journey
                </p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportAsPDF}
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all"
                title="Export as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={shareProgress}
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all"
                title="Share Progress"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg inline-flex">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                className={`
                  px-4 py-2 rounded-md font-medium transition-all capitalize
                  ${
                    period === p
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'streak', label: 'Streak', icon: Calendar },
              { id: 'levels', label: 'Levels', icon: Trophy },
              { id: 'time', label: 'Study Time', icon: Clock },
              { id: 'success', label: 'Success Rate', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div
          ref={chartRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-200"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
              onTouchStart={(e) => {
                const touchStartX = e.touches[0]?.clientX || 0;
                const handleTouchEnd = (e: TouchEvent) => {
                  const touchEndX = e.changedTouches[0]?.clientX || 0;
                  const diff = touchStartX - touchEndX;
                  if (Math.abs(diff) > 50) {
                    handleSwipe(diff > 0 ? 'left' : 'right');
                  }
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Learning Progress
                  </h2>
                  <div className="h-[400px]">
                    <ProgressLineChart data={getFilteredData()} period={period} />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {progress?.wordsLearned || 0}
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Total Words</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {progress?.currentStreak || 0}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Day Streak</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {overallRate}%
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">Success Rate</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {currentLevel}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">Current Level</p>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'streak' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Streak Calendar
                  </h2>
                  <StreakCalendar
                    streakData={dailyData}
                    currentStreak={progress?.currentStreak || 0}
                    longestStreak={progress?.longestStreak || 0}
                  />
                </div>
              )}

              {activeTab === 'levels' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Level Progression
                  </h2>
                  <LevelProgress
                    currentLevel={currentLevel}
                    wordsInLevel={wordsInLevel}
                    totalWordsInLevel={totalWordsInLevel}
                    levels={levels}
                    predictedDate={predictedDate}
                  />
                </div>
              )}

              {activeTab === 'time' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Study Time Analysis
                  </h2>
                  <StudyTimeChart
                    data={getFilteredData()}
                    period={period}
                    totalMinutes={totalMinutes}
                    averageMinutes={averageMinutes}
                  />
                </div>
              )}

              {activeTab === 'success' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Success Rate Analysis
                  </h2>
                  <SuccessRateChart data={successRateData} overallRate={overallRate} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Achievements Section */}
        {checkMilestones() && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-bold">Milestone Achieved!</h3>
                <p>Congratulations! You've learned {progress?.wordsLearned} words!</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
