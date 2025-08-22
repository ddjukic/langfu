'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subMonths,
} from 'date-fns';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

interface StreakCalendarProps {
  streakData: Array<{
    date: string;
    practiced: boolean;
    wordsLearned: number;
  }>;
  currentStreak: number;
  longestStreak: number;
}

export function StreakCalendar({ streakData, currentStreak, longestStreak }: StreakCalendarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const monthsToShow = 3;
  const today = new Date();

  const calendarData = useMemo(() => {
    const months = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });

      const monthData = {
        month: format(monthDate, 'MMMM yyyy'),
        weeks: [] as any[],
      };

      // Organize days into weeks
      let currentWeek: any[] = [];

      // Add empty cells for days before the month starts
      const startDay = start.getDay();
      for (let i = 0; i < startDay; i++) {
        currentWeek.push(null);
      }

      days.forEach((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayData = streakData.find((d) => d.date === dayStr);

        currentWeek.push({
          date: day,
          practiced: dayData?.practiced || false,
          wordsLearned: dayData?.wordsLearned || 0,
          isToday: isSameDay(day, today),
        });

        if (currentWeek.length === 7) {
          monthData.weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      // Add remaining days if any
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        monthData.weeks.push(currentWeek);
      }

      months.push(monthData);
    }

    return months;
  }, [streakData, today]);

  const getIntensityClass = (wordsLearned: number) => {
    if (wordsLearned === 0) return isDark ? 'bg-gray-800' : 'bg-gray-100';
    if (wordsLearned <= 5) return isDark ? 'bg-purple-900/30' : 'bg-purple-200';
    if (wordsLearned <= 10) return isDark ? 'bg-purple-800/50' : 'bg-purple-300';
    if (wordsLearned <= 20) return isDark ? 'bg-purple-700/70' : 'bg-purple-400';
    return isDark ? 'bg-purple-600' : 'bg-purple-500';
  };

  return (
    <div className="w-full">
      {/* Streak Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            animate={{ scale: currentStreak > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3, repeat: currentStreak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame
              className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`}
            />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{longestStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
          <div className="flex gap-1">
            {[0, 5, 10, 20, 30].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityClass(level)}`}
                title={`${level}+ words`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {calendarData.map((monthData, monthIndex) => (
          <div key={monthIndex}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {monthData.month}
            </h4>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div
                  key={day}
                  className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="space-y-1">
              {monthData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day: any, dayIndex: number) => (
                    <motion.div
                      key={dayIndex}
                      whileHover={day ? { scale: 1.2 } : {}}
                      className="relative"
                    >
                      {day ? (
                        <div
                          className={`
                            aspect-square rounded-sm cursor-pointer relative
                            ${getIntensityClass(day.wordsLearned)}
                            ${day.isToday ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}
                            transition-all duration-200 hover:ring-2 hover:ring-purple-400
                          `}
                          title={`${format(day.date, 'PPP')}: ${day.wordsLearned} words learned`}
                        >
                          {day.practiced && day.wordsLearned > 20 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Flame className="w-3 h-3 text-orange-400" />
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square" />
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
