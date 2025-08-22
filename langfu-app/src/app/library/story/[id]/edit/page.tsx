import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import StoryEditClient from './story-edit-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Params {
  id: string;
}

export default async function StoryEditPage({ params }: { params: Promise<Params> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      topic: true,
      language: true,
      level: true,
      wordCount: true,
      content: true,
      summary: true,
      prompt: true,
      keywords: true,
      words: true,
      createdAt: true,
    },
  });

  if (!story || story.userId !== user.id) {
    notFound();
  }

  // Pass the story data to the edit client component
  return <StoryEditClient story={story} />;
}
