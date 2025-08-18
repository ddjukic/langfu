import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LearnNewClient from './learn-new-client';

export default async function LearnNewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get available levels and topics
  const words = await prisma.word.findMany({
    where: {
      language: user.currentLanguage,
    },
    select: {
      level: true,
      topic: true,
    },
    distinct: ['level', 'topic'],
  });

  // Group by level
  const levelTopics = words.reduce((acc, word) => {
    if (!acc[word.level]) {
      acc[word.level] = new Set();
    }
    acc[word.level].add(word.topic);
    return acc;
  }, {} as Record<string, Set<string>>);

  // Convert sets to arrays
  const levels = Object.keys(levelTopics).sort();
  const topicsByLevel = Object.fromEntries(
    Object.entries(levelTopics).map(([level, topics]) => [
      level,
      Array.from(topics).sort(),
    ])
  );

  return (
    <LearnNewClient
      user={user}
      levels={levels}
      topicsByLevel={topicsByLevel}
    />
  );
}