import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // This is a debug endpoint - should be removed in production
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        currentLanguage: true,
        createdAt: true,
      },
    });

    const count = await prisma.user.count();

    return NextResponse.json({
      count,
      users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Debug] Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
