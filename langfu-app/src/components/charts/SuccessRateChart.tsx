'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';

interface SuccessRateChartProps {
  data: Array<{
    category: string;
    correct: number;
    incorrect: number;
    total: number;
  }>;
  overallRate: number;
}

export function SuccessRateChart({ data, overallRate }: SuccessRateChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const pieData = useMemo(() => {
    return data.map((item) => ({
      name: item.category,
      value: item.total,
      rate: Math.round((item.correct / item.total) * 100),
    }));
  }, [data]);

  const radialData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.category,
      value: Math.round((item.correct / item.total) * 100),
      fill: COLORS[index % COLORS.length],
    }));
  }, [data]);

  const COLORS = [
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total: {data.value} words</p>
          <p className="text-sm font-medium" style={{ color: data.payload.fill || data.fill }}>
            Success Rate: {data.payload.rate || data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎯';
    if (score >= 70) return '💪';
    if (score >= 50) return '📈';
    return '💡';
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Success Rate */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Overall Success Rate</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-4xl font-bold">{overallRate}%</span>
              <span className="text-2xl">{getScoreEmoji(overallRate)}</span>
            </div>
          </div>
          <div className="relative w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[{ value: overallRate, fill: '#ffffff' }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} fill="#ffffff" fillOpacity={0.8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Word Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, rate }) => `${name}: ${rate}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Success by Category
          </h3>
          <div className="space-y-3">
            {data.map((item, index) => {
              const rate = Math.round((item.correct / item.total) * 100);
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.correct}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.incorrect}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(rate)}`}>{rate}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Performance Tips
            </h4>
            <ul className="space-y-1">
              {overallRate < 70 && (
                <li className="text-xs text-blue-700 dark:text-blue-400">
                  • Focus on categories with lower success rates for targeted practice
                </li>
              )}
              <li className="text-xs text-blue-700 dark:text-blue-400">
                • Review incorrect answers to identify patterns
              </li>
              <li className="text-xs text-blue-700 dark:text-blue-400">
                • Practice with spaced repetition for better retention
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
