import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LibraryClient from './library-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Get all words with optional history for this user
  const words = await prisma.word.findMany({
    include: {
      wordHistory: {
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ topic: 'asc' }, { level: 'asc' }, { l2: 'asc' }],
  });

  const stories = await prisma.story.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      topic: true,
      language: true,
      wordCount: true,
      summary: true,
      level: true,
      createdAt: true,
    },
  });

  // Transform data for client component
  // Create a unique ID for each word entry (using word ID since it's unique)
  const historiesData = words.map((word) => {
    const history = word.wordHistory[0];
    return {
      id: word.id, // Use word ID as the unique identifier
      word: {
        id: word.id,
        l1: word.l1,
        l2: word.l2,
        level: word.level,
        topic: word.topic,
        language: word.language,
      },
      mastery: history?.masteryLevel || 0, // Default to 0 if no history
      createdAt: history?.createdAt.toISOString() || new Date().toISOString(),
    };
  });

  const storiesData = stories.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return <LibraryClient histories={historiesData} stories={storiesData} />;
}
