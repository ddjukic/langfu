import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('langfu-auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get full user data including currentLanguage
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all'; // 'words', 'stories', or 'all'

    if (!query.trim()) {
      return NextResponse.json({ words: [], stories: [] });
    }

    const searchResults: { words?: any[]; stories?: any[] } = {};

    // Search words if requested
    if (type === 'all' || type === 'words') {
      const words = await prisma.word.findMany({
        where: {
          language: user.currentLanguage,
          OR: [
            { l1: { contains: query, mode: 'insensitive' } },
            { l2: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
            { pos: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ frequency: 'desc' }, { l2: 'asc' }],
        take: 20,
      });
      searchResults.words = words;
    }

    // Search stories if requested
    if (type === 'all' || type === 'stories') {
      const stories = await prisma.story.findMany({
        where: {
          userId: user.id,
          language: user.currentLanguage,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      searchResults.stories = stories;
    }

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
