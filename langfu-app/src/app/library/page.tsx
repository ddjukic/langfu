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

  const histories = await prisma.wordHistory.findMany({
    where: { userId: user.id },
    include: { word: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
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
  const historiesData = histories.map((h) => ({
    id: h.id,
    word: {
      id: h.word.id,
      l1: h.word.l1,
      l2: h.word.l2,
      level: h.word.level,
      topic: h.word.topic,
      language: h.word.language,
    },
    mastery: h.masteryLevel,
    createdAt: h.createdAt.toISOString(),
  }));

  const storiesData = stories.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return <LibraryClient histories={historiesData} stories={storiesData} />;
}
