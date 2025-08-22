'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { Clock, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyTimeChartProps {
  data: Array<{
    date: string;
    minutes: number;
    sessions: number;
  }>;
  period: 'daily' | 'weekly' | 'monthly';
  totalMinutes: number;
  averageMinutes: number;
}

export function StudyTimeChart({
  data,
  period,
  totalMinutes,
  averageMinutes,
}: StudyTimeChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (period === 'daily') return format(date, 'EEE');
    if (period === 'weekly') return format(date, 'MMM d');
    return format(date, 'MMM');
  };

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
      hours: Number((item.minutes / 60).toFixed(1)),
    }));
  }, [data]);

  const getBarColor = (value: number) => {
    if (value < 30) return isDark ? '#6b7280' : '#e5e7eb';
    if (value < 60) return isDark ? '#8b5cf6' : '#c084fc';
    return isDark ? '#7c3aed' : '#9333ea';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(new Date(label), 'PPP')}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Study Time: {data.minutes} minutes
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sessions: {data.sessions}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg per session: {Math.round(data.minutes / data.sessions)} min
          </p>
        </div>
      );
    }
    return null;
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatHours(totalMinutes)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Time</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatHours(averageMinutes)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Daily Average</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {data.reduce((acc, d) => acc + d.sessions, 0)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Sessions</p>
        </motion.div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#374151' : '#e5e7eb'}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Minutes',
                angle: -90,
                position: 'insideLeft',
                style: { fill: isDark ? '#9ca3af' : '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.minutes)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Study Pattern Analysis */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
          Study Pattern Insights
        </h4>
        <div className="space-y-2">
          <p className="text-xs text-purple-700 dark:text-purple-400">
            • Your most productive day:{' '}
            {data.reduce((a, b) => (a.minutes > b.minutes ? a : b)).date}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400">
            • Average session duration:{' '}
            {Math.round(totalMinutes / data.reduce((acc, d) => acc + d.sessions, 0))} minutes
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400">
            • Consistency score:{' '}
            {Math.round((data.filter((d) => d.minutes > 0).length / data.length) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
