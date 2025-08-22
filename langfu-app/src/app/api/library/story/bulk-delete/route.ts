import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/library/story/bulk-delete
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyIds } = await request.json();

    if (!Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json({ error: 'Invalid story IDs' }, { status: 400 });
    }

    // Verify ownership of all stories
    const stories = await prisma.story.findMany({
      where: {
        id: { in: storyIds },
        userId: user.id,
      },
      select: { id: true },
    });

    if (stories.length !== storyIds.length) {
      return NextResponse.json(
        { error: 'Some stories not found or unauthorized' },
        { status: 403 }
      );
    }

    // Delete all stories
    await prisma.story.deleteMany({
      where: {
        id: { in: storyIds },
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, deleted: storyIds.length });
  } catch (error) {
    console.error('Error bulk deleting stories:', error);
    return NextResponse.json({ error: 'Failed to delete stories' }, { status: 500 });
  }
}
