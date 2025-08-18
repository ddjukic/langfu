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

    const { wordId, sentence } = await request.json();

    const userSentence = await prisma.userSentence.create({
      data: {
        userId: user.id,
        wordId,
        sentence,
        isCorrect: true, // Can be updated based on validation
      },
    });

    return NextResponse.json({ userSentence });
  } catch (error) {
    console.error('Save sentence error:', error);
    return NextResponse.json(
      { error: 'Failed to save sentence' },
      { status: 500 }
    );
  }
}