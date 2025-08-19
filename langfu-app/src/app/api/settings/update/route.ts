import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, currentLanguage, dailyGoal } = await request.json();

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        currentLanguage,
        dailyGoal,
      },
    });

    // Ensure progress exists for the selected language
    await prisma.progress.upsert({
      where: {
        userId_language: {
          userId: user.id,
          language: currentLanguage,
        },
      },
      update: {},
      create: {
        userId: user.id,
        language: currentLanguage,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
