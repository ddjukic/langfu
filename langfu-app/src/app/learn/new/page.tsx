import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LearnNewClient from './learn-new-client';
export const dynamic = 'force-dynamic';

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

  // Group existing words by level
  const levelTopics = words.reduce(
    (acc, word) => {
      if (!acc[word.level]) {
        acc[word.level] = new Set();
      }
      acc[word.level]!.add(word.topic);
      return acc;
    },
    {} as Record<string, Set<string>>
  );

  // Get all available levels and topics from existing words
  const levels = [...new Set(words.map((word) => word.level))].sort();
  const topicsByLevel = Object.fromEntries(
    levels.map((level) => [level, levelTopics[level] ? Array.from(levelTopics[level]).sort() : []])
  );

  return <LearnNewClient levels={levels} topicsByLevel={topicsByLevel} />;
}
