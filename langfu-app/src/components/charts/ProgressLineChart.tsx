'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { useTheme } from 'next-themes';

interface ProgressLineChartProps {
  data: Array<{
    date: string;
    wordsLearned: number;
    reviewsCompleted: number;
    correctRate: number;
  }>;
  period: 'daily' | 'weekly' | 'monthly';
}

export function ProgressLineChart({ data, period }: ProgressLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (period === 'daily') return format(date, 'MMM d');
    if (period === 'weekly') return format(date, 'MMM d');
    return format(date, 'MMM');
  };

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(new Date(label), 'PPP')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'correctRate' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="wordsLearned"
            name="Words Learned"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorWords)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="reviewsCompleted"
            name="Reviews"
            stroke="#06b6d4"
            fillOpacity={1}
            fill="url(#colorReviews)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="correctRate"
            name="Success Rate"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
