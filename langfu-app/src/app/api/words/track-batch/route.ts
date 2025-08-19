import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { words, correct } = await request.json();

    // Filter out extracted words (they have IDs like 'extracted-0')
    const validWords = words.filter(
      (word: any) => word.id && !word.id.toString().startsWith('extracted-') && !word.isExtracted
    );

    if (validWords.length === 0) {
      // No valid words to track (all are extracted)
      return NextResponse.json({
        message: 'No trackable words',
        tracked: 0,
      });
    }

    // Track all valid words in a single transaction
    const wordHistories = await prisma.$transaction(
      validWords.map((word: any) =>
        prisma.wordHistory.upsert({
          where: {
            userId_wordId: {
              userId: user.id,
              wordId: word.id,
            },
          },
          update: {
            reviewCount: { increment: 1 },
            ...(correct ? { correctCount: { increment: 1 } } : {}),
            lastReview: new Date(),
            nextReview: calculateNextReview(correct),
            masteryLevel: { increment: correct ? 1 : 0 },
          },
          create: {
            userId: user.id,
            wordId: word.id,
            reviewCount: 1,
            correctCount: correct ? 1 : 0,
            lastReview: new Date(),
            nextReview: calculateNextReview(correct),
            masteryLevel: correct ? 1 : 0,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Words tracked successfully',
      tracked: wordHistories.length,
    });
  } catch (error) {
    console.error('Track words batch error:', error);
    return NextResponse.json({ error: 'Failed to track words' }, { status: 500 });
  }
}

function calculateNextReview(correct: boolean): Date {
  if (!correct) {
    return addDays(new Date(), 1);
  }

  // Simple spaced repetition intervals
  return addDays(new Date(), 3);
}
