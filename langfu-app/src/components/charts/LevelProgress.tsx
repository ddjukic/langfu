'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';

interface LevelProgressProps {
  currentLevel: string;
  wordsInLevel: number;
  totalWordsInLevel: number;
  levels: Array<{
    name: string;
    required: number;
    completed: boolean;
    current: boolean;
  }>;
  predictedDate?: string;
}

export function LevelProgress({
  currentLevel,
  wordsInLevel,
  totalWordsInLevel,
  levels,
  predictedDate,
}: LevelProgressProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const progressPercentage = (wordsInLevel / totalWordsInLevel) * 100;

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: 'from-green-400 to-green-500',
      A2: 'from-blue-400 to-blue-500',
      B1: 'from-purple-400 to-purple-500',
      B2: 'from-pink-400 to-pink-500',
      C1: 'from-orange-400 to-orange-500',
      C2: 'from-red-400 to-red-500',
    };
    return colors[level] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="w-full space-y-6">
      {/* Current Level Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Level: {currentLevel}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {wordsInLevel} / {totalWordsInLevel} words mastered
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${getLevelColor(currentLevel)}`}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="absolute right-0 -top-6 text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {/* Prediction */}
        {predictedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-700 dark:text-purple-300">
              At your current pace, you'll reach the next level by {predictedDate}
            </p>
          </motion.div>
        )}
      </div>

      {/* Level Roadmap */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Level Roadmap</h3>

        <div className="space-y-3">
          {levels.map((level, index) => (
            <motion.div
              key={level.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all
                ${
                  level.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : level.current
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-600'
                      : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    level.completed
                      ? 'bg-green-100 dark:bg-green-900/50'
                      : level.current
                        ? 'bg-purple-100 dark:bg-purple-900/50'
                        : 'bg-gray-100 dark:bg-gray-600/50'
                  }
                `}
                >
                  {level.completed ? (
                    <Star className="w-5 h-5 text-green-600 dark:text-green-400 fill-current" />
                  ) : level.current ? (
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Star className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                <div>
                  <p
                    className={`
                    font-medium
                    ${
                      level.completed
                        ? 'text-green-700 dark:text-green-300'
                        : level.current
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                  >
                    Level {level.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {level.required} words required
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {level.completed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-medium text-green-600 dark:text-green-400"
                  >
                    Completed
                  </motion.span>
                )}
                {level.current && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm font-medium text-purple-600 dark:text-purple-400"
                  >
                    In Progress
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl text-white"
        >
          <p className="text-2xl font-bold">{wordsInLevel}</p>
          <p className="text-sm opacity-90">Words in {currentLevel}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white"
        >
          <p className="text-2xl font-bold">{totalWordsInLevel - wordsInLevel}</p>
          <p className="text-sm opacity-90">Words to Next Level</p>
        </motion.div>
      </div>
    </div>
  );
}
