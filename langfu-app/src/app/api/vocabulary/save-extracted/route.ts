import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { extractionId, title, words } = body;

    if (!extractionId || !words || !Array.isArray(words)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Create a vocabulary set from the extraction
    const vocabularySet = await prisma.vocabularySet.create({
      data: {
        name: title || 'Extracted Vocabulary',
        description: `Vocabulary extracted from web content on ${new Date().toLocaleDateString()}`,
        language: user.currentLanguage,
        isPublic: false,
        data: {
          extractionId,
          words: words.map((word: any) => ({
            l2: word.l2,
            l1: word.l1,
            level: word.level || 'B1',
            pos: word.pos,
            gender: word.gender,
            context: word.context,
            frequency: word.frequency,
          })),
        },
      },
    });

    // Also create Word entries for spaced repetition tracking
    const createdWords = await Promise.all(
      words.map(async (word: any) => {
        // Check if word already exists
        const existing = await prisma.word.findFirst({
          where: {
            language: user.currentLanguage,
            l2: word.l2,
          },
        });

        if (existing) {
          return existing;
        }

        // Create new word
        return prisma.word.create({
          data: {
            language: user.currentLanguage,
            level: word.level || 'B1',
            topic: 'Custom Vocabulary',
            l2: word.l2,
            l1: word.l1,
            pos: word.pos,
            gender: word.gender,
            frequency: word.frequency || 1,
            ...(word.context
              ? {
                  examples: {
                    create: {
                      sentence: word.context,
                    },
                  },
                }
              : {}),
          },
        });
      })
    );

    // Initialize word history for spaced repetition
    await Promise.all(
      createdWords.map((word) =>
        prisma.wordHistory.upsert({
          where: {
            userId_wordId: {
              userId: user.id,
              wordId: word.id,
            },
          },
          update: {
            reviewCount: { increment: 1 },
          },
          create: {
            userId: user.id,
            wordId: word.id,
            masteryLevel: 0,
            nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      vocabularySetId: vocabularySet.id,
      wordsCreated: createdWords.length,
    });
  } catch (error) {
    console.error('Save extracted vocabulary error:', error);
    return NextResponse.json({ error: 'Failed to save vocabulary set' }, { status: 500 });
  }
}
