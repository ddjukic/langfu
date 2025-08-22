import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { topic, level, language, words } = body as {
      topic: string;
      level: string;
      language: 'GERMAN' | 'SPANISH';
      words: Array<{
        l2: string;
        l1: string;
        pos?: string;
        examples?: Array<{ sentence: string; translation?: string }>;
      }>;
    };

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'No words provided' }, { status: 400 });
    }

    const createdWords = [] as any[];

    for (const w of words) {
      const word = await prisma.word
        .upsert({
          where: {
            // Uniqueness heuristic: language + l2 + topic
            // There is no compound unique, so emulate with findFirst then create if needed
            id: undefined as unknown as string,
          },
          update: {},
          create: {
            language,
            level,
            topic,
            l2: w.l2,
            l1: w.l1,
            pos: w.pos,
          },
        })
        .catch(async () => {
          // Fallback: try to find existing and update basic fields
          const existing = await prisma.word.findFirst({ where: { language, l2: w.l2, topic } });
          if (existing) return existing;
          return prisma.word.create({
            data: { language, level, topic, l2: w.l2, l1: w.l1, pos: w.pos },
          });
        });

      // Add examples
      if (w.examples && w.examples.length > 0) {
        for (const ex of w.examples.slice(0, 2)) {
          if (!ex?.sentence) continue;
          await prisma.example
            .create({
              data: {
                wordId: word.id,
                sentence: ex.sentence,
                translation: ex.translation || undefined,
              },
            })
            .catch(() => undefined);
        }
      }

      // Ensure WordHistory exists (acts as library membership)
      await prisma.wordHistory.upsert({
        where: { userId_wordId: { userId: user.id, wordId: word.id } },
        create: { userId: user.id, wordId: word.id },
        update: {},
      });

      createdWords.push(word);
    }

    return NextResponse.json({ ok: true, count: createdWords.length });
  } catch (error) {
    console.error('Add words to library error:', error);
    return NextResponse.json({ error: 'Failed to add words' }, { status: 500 });
  }
}
