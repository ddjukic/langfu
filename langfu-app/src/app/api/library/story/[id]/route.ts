import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

// DELETE /api/library/story/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const story = await prisma.story.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!story || story.userId !== user.id) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Delete the story
    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}

// PATCH /api/library/story/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const story = await prisma.story.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!story || story.userId !== user.id) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        title: body.title,
        topic: body.topic,
        summary: body.summary,
        content: body.content,
        level: body.level,
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}
