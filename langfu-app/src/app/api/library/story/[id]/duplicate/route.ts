import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

// POST /api/library/story/[id]/duplicate
export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the original story
    const originalStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!originalStory || originalStory.userId !== user.id) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Create a duplicate
    const duplicatedStory = await prisma.story.create({
      data: {
        userId: user.id,
        title: `${originalStory.title} (Copy)`,
        topic: originalStory.topic,
        keywords: originalStory.keywords as any,
        words: originalStory.words as any,
        prompt: originalStory.prompt,
        summary: originalStory.summary,
        content: originalStory.content,
        language: originalStory.language,
        level: originalStory.level,
        wordCount: originalStory.wordCount,
      },
    });

    return NextResponse.json(duplicatedStory);
  } catch (error) {
    console.error('Error duplicating story:', error);
    return NextResponse.json({ error: 'Failed to duplicate story' }, { status: 500 });
  }
}
