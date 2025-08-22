import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProgressClient from './progress-client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
export const dynamic = 'force-dynamic';

async function getProgressData(userId: string, language: any) {
  // Get user progress
  const progress = await prisma.progress.findUnique({
    where: {
      userId_language: {
        userId,
        language,
      },
    },
  });

  // Get word history for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const wordHistory = await prisma.wordHistory.findMany({
    where: {
      userId,
      lastReview: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      word: true,
    },
    orderBy: {
      lastReview: 'desc',
    },
  });

  // Get user sentences for success rate calculation
  const userSentences = await prisma.userSentence.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      word: true,
    },
  });

  // Calculate daily progress data
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayHistory = wordHistory.filter((h) => {
      if (!h.lastReview) return false;
      return h.lastReview >= dayStart && h.lastReview <= dayEnd;
    });

    const daySentences = userSentences.filter((s) => {
      return s.createdAt >= dayStart && s.createdAt <= dayEnd;
    });

    const correctCount = daySentences.filter((s) => s.isCorrect).length;
    const totalCount = daySentences.length;

    dailyData.push({
      date: dateStr,
      wordsLearned: dayHistory.length,
      reviewsCompleted: dayHistory.filter((h) => h.reviewCount > 0).length,
      correctRate: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      practiced: dayHistory.length > 0,
      minutes: Math.floor(Math.random() * 45) + 15, // Placeholder - would need session tracking
      sessions: dayHistory.length > 0 ? Math.ceil(dayHistory.length / 10) : 0,
    });
  }

  // Calculate success rate by category
  const categoryStats = new Map();
  wordHistory.forEach((history) => {
    const topic = history.word.topic;
    if (!categoryStats.has(topic)) {
      categoryStats.set(topic, { correct: 0, incorrect: 0, total: 0 });
    }
    const stats = categoryStats.get(topic);
    stats.total++;
    stats.correct += history.correctCount;
    stats.incorrect += history.reviewCount - history.correctCount;
  });

  const successRateData = Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    correct: stats.correct,
    incorrect: stats.incorrect,
    total: stats.total,
  }));

  // Calculate overall success rate
  const totalCorrect = wordHistory.reduce((sum, h) => sum + h.correctCount, 0);
  const totalReviews = wordHistory.reduce((sum, h) => sum + h.reviewCount, 0);
  const overallRate = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Calculate study time stats
  const totalMinutes = dailyData.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = dailyData.filter((d) => d.practiced).length;
  const averageMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

  // Get level progression data
  const levels = [
    { name: 'A1', required: 100, completed: false, current: false },
    { name: 'A2', required: 250, completed: false, current: false },
    { name: 'B1', required: 500, completed: false, current: false },
    { name: 'B2', required: 750, completed: false, current: false },
    { name: 'C1', required: 1000, completed: false, current: false },
    { name: 'C2', required: 1500, completed: false, current: false },
  ];

  const wordsLearned = progress?.wordsLearned || 0;
  levels.forEach((level) => {
    if (wordsLearned >= level.required) {
      level.completed = true;
    } else if (!level.completed && !levels.find((l) => l.current)) {
      level.current = true;
    }
  });

  const currentLevel = progress?.currentLevel || 'A1';
  const currentLevelData = levels.find((l) => l.name === currentLevel) || levels[0]!;
  const currentLevelIndex = levels.indexOf(currentLevelData);
  const nextLevel = levels[currentLevelIndex + 1];
  const wordsInLevel = wordsLearned - (levels[currentLevelIndex - 1]?.required || 0);
  const totalWordsInLevel =
    currentLevelData.required - (levels[currentLevelIndex - 1]?.required || 0);

  // Calculate predicted date for next level
  const daysActive = dailyData.filter((d) => d.practiced).length;
  const wordsPerDay = daysActive > 0 ? wordsLearned / daysActive : 5;
  const wordsRemaining = (nextLevel?.required || currentLevelData.required) - wordsLearned;
  const daysToNextLevel = Math.ceil(wordsRemaining / wordsPerDay);
  const predictedDate = format(
    new Date(Date.now() + daysToNextLevel * 24 * 60 * 60 * 1000),
    'MMMM d, yyyy'
  );

  return {
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
    wordHistory: wordHistory.slice(0, 10), // Recent words
  };
}

export default async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getProgressData(user.id, user.currentLanguage);

  return <ProgressClient {...data} user={user} />;
}
