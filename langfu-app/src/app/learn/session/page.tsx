import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LearningSession from './learning-session';

interface PageProps {
  searchParams: Promise<{ level?: string; topic?: string }>;
}

export default async function LearnSessionPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect('/login');
  }

  const { level, topic } = params;

  if (!level || !topic) {
    redirect('/learn/new');
  }

  // Get words for this level and topic
  const words = await prisma.word.findMany({
    where: {
      language: user.currentLanguage,
      level,
      topic,
    },
    include: {
      examples: true,
    },
  });

  if (words.length === 0) {
    redirect('/learn/new');
  }

  return (
    <LearningSession
      user={user}
      words={words}
      level={level}
      topic={topic}
    />
  );
}