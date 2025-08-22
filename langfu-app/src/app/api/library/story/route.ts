import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

function summarizeTenWords(text: string): string {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 10).join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, topic, keywords, content, language, level, prompt, words } = await req.json();

    if (!title || !content || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wordCount = typeof content === 'string' ? content.trim().split(/\s+/).length : 0;
    const summary = summarizeTenWords(content);

    // Process keywords into proper KeywordItem objects with translations
    let processedKeywords = [];
    const keywordList = words || keywords || [];

    if (keywordList.length > 0) {
      // If we have plain strings (keywords), convert to objects
      const keywordStrings =
        Array.isArray(keywordList) && typeof keywordList[0] === 'string'
          ? keywordList
          : keywordList.map((item: any) => item.l2 || item);

      // Look up translations from existing Words table
      const wordTranslations = await prisma.word.findMany({
        where: {
          language: language as any,
          l2: { in: keywordStrings },
        },
        select: { l2: true, l1: true, pos: true },
      });

      // Create map for quick lookup
      const translationMap = new Map(wordTranslations.map((w) => [w.l2.toLowerCase(), w]));

      // Transform to KeywordItem objects with translations
      processedKeywords = keywordStrings.map((keyword: string) => {
        const existing = translationMap.get(keyword.toLowerCase());
        return {
          l2: keyword,
          l1: existing?.l1 || `[Translation for ${keyword} needed]`,
          pos: existing?.pos || undefined,
        };
      });
    }

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        title,
        topic,
        keywords: processedKeywords, // Store the full objects, not just strings
        content,
        language,
        level,
        wordCount,
        prompt: prompt ?? null,
        words: processedKeywords, // Keep same data for backwards compatibility
        summary,
      },
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error('[Create Story API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
