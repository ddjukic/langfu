import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LearningSession from './learning-session';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ level?: string; topic?: string; mode?: string }>;
}

export default async function LearnSessionPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect('/login');
  }

  const { level, topic, mode } = params;

  // Log for debugging
  console.log('Learn Session Page - SearchParams:', params);
  console.log('Mode:', mode);

  // Handle extracted vocabulary mode - words will be loaded from client-side localStorage
  if (mode === 'extracted') {
    console.log('Extracted mode detected, rendering LearningSession');
    return (
      <LearningSession
        user={user}
        words={[]} // Will be populated from localStorage on client side
        level="CUSTOM"
        topic="Extracted Vocabulary"
        mode="extracted"
      />
    );
  }

  if (!level || !topic) {
    console.log('No level or topic, redirecting to /learn/new');
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

  // If no words found, redirect back to topic selection
  if (words.length === 0) {
    redirect('/learn/new');
  }

  return <LearningSession user={user} words={words} level={level} topic={topic} />;
}
