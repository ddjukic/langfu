import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SwipeLearningClient from './swipe-learning-client';
export const dynamic = 'force-dynamic';

export default async function SwipeLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; topic?: string; mode?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const { level, topic, mode = 'new' } = params;

  let words;

  if (mode === 'review') {
    // Get words due for review
    const wordHistories = await prisma.wordHistory.findMany({
      where: {
        userId: user.id,
        nextReview: {
          lte: new Date(),
        },
      },
      include: {
        word: {
          include: {
            examples: true,
          },
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: 20,
    });

    words = wordHistories.map((wh) => wh.word);
  } else {
    // Get new words to learn
    const learnedWordIds = await prisma.wordHistory.findMany({
      where: { userId: user.id },
      select: { wordId: true },
    });

    const learnedIds = learnedWordIds.map((w) => w.wordId);

    words = await prisma.word.findMany({
      where: {
        language: user.currentLanguage,
        ...(level && { level }),
        ...(topic && { topic }),
        ...(learnedIds.length > 0 && {
          id: {
            notIn: learnedIds,
          },
        }),
      },
      include: {
        examples: true,
      },
      take: 20,
      orderBy: [{ frequency: 'desc' }, { difficulty: 'asc' }],
    });
  }

  // Get user's progress for stats
  const progress = await prisma.progress.findFirst({
    where: {
      userId: user.id,
      language: user.currentLanguage,
    },
  });

  return (
    <SwipeLearningClient
      words={words}
      user={user}
      progress={progress}
      mode={mode}
      level={level || 'A1'}
      topic={topic || 'all'}
    />
  );
}
