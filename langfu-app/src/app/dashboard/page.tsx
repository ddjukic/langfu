import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's progress
  const progress = await prisma.progress.findFirst({
    where: {
      userId: user.id,
      language: user.currentLanguage,
    },
  });

  // Get words due for review
  const wordsDueForReview = await prisma.wordHistory.count({
    where: {
      userId: user.id,
      nextReview: {
        lte: new Date(),
      },
    },
  });

  // Get recent word history
  const recentWords = await prisma.wordHistory.findMany({
    where: {
      userId: user.id,
    },
    include: {
      word: true,
    },
    orderBy: {
      lastReview: 'desc',
    },
    take: 10,
  });

  return (
    <DashboardClient
      user={user}
      progress={progress}
      wordsDueForReview={wordsDueForReview}
      recentWords={recentWords}
    />
  );
}