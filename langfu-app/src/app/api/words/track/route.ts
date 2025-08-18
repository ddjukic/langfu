import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { wordId, correct } = await request.json();

    // Get or create word history
    const wordHistory = await prisma.wordHistory.upsert({
      where: {
        userId_wordId: {
          userId: user.id,
          wordId,
        },
      },
      update: {
        reviewCount: { increment: 1 },
        correctCount: correct ? { increment: 1 } : undefined,
        lastReview: new Date(),
        nextReview: calculateNextReview(correct),
        masteryLevel: { increment: correct ? 1 : 0 },
      },
      create: {
        userId: user.id,
        wordId,
        reviewCount: 1,
        correctCount: correct ? 1 : 0,
        lastReview: new Date(),
        nextReview: calculateNextReview(correct),
        masteryLevel: correct ? 1 : 0,
      },
    });

    return NextResponse.json({ wordHistory });
  } catch (error) {
    console.error('Track word error:', error);
    return NextResponse.json(
      { error: 'Failed to track word' },
      { status: 500 }
    );
  }
}

function calculateNextReview(correct: boolean): Date {
  if (!correct) {
    return addDays(new Date(), 1);
  }
  
  // Simple spaced repetition intervals
  // You can make this more sophisticated based on mastery level
  return addDays(new Date(), 3);
}