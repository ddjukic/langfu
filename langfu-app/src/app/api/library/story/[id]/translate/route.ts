import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: storyId } = await params;

    // Get the story
    const story = await prisma.story.findUnique({
      where: { id: storyId, userId: user.id },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Extract keywords (array of German strings)
    const keywords = Array.isArray(story.keywords) ? (story.keywords as string[]) : [];

    if (keywords.length === 0) {
      return NextResponse.json({ words: [] });
    }

    // Look up translations from existing Words table
    const wordTranslations = await prisma.word.findMany({
      where: {
        language: story.language,
        l2: { in: keywords as string[] },
      },
      include: {
        examples: {
          take: 2,
          select: { sentence: true, translation: true },
        },
      },
    });

    // Create map for quick lookup
    const translationMap = new Map(wordTranslations.map((w) => [w.l2.toLowerCase(), w]));

    // Transform keywords to KeywordItem objects
    const translatedWords = keywords.map((keyword: string) => {
      const existing = translationMap.get(keyword.toLowerCase());
      return {
        l2: keyword,
        l1: existing?.l1 || `[Translation needed]`,
        pos: existing?.pos || undefined,
        examples:
          existing?.examples?.map((ex) => ({
            sentence: ex.sentence,
            translation: ex.translation || undefined,
          })) || undefined,
      };
    });

    // Update the story with the translated words
    await prisma.story.update({
      where: { id: storyId },
      data: { words: translatedWords },
    });

    return NextResponse.json({ words: translatedWords });
  } catch (error) {
    console.error('Story translation error:', error);
    return NextResponse.json({ error: 'Failed to translate story vocabulary' }, { status: 500 });
  }
}
