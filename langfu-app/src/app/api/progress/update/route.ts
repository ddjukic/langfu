import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { wordsLearned, score } = await request.json();

    // Update progress
    const progress = await prisma.progress.update({
      where: {
        userId_language: {
          userId: user.id,
          language: user.currentLanguage,
        },
      },
      data: {
        wordsLearned: { increment: wordsLearned || 0 },
        totalScore: { increment: score || 0 },
        lastPractice: new Date(),
        currentStreak: { increment: 1 }, // Simple streak logic
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}