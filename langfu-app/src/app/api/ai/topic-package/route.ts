import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface TopicPackageRequestBody {
  topic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  language: 'GERMAN' | 'SPANISH';
  numKeywords?: number;
}

export async function POST(request: NextRequest) {
  try {
    const {
      topic,
      level,
      language,
      numKeywords = 10,
    } = (await request.json()) as TopicPackageRequestBody;

    if (!topic || !level || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, level, language' },
        { status: 400 }
      );
    }

    // If no API key or running in test mode, return a simple fallback
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key') {
      return NextResponse.json(getFallbackPackage(topic, level, language, numKeywords));
    }

    const targetLanguage = language === 'GERMAN' ? 'German' : 'Spanish';

    const prompt =
      `You are a language tutor creating study material for a learner at CEFR level ${level} learning ${targetLanguage}.

Create a vivid short story about the topic: "${topic}" in ${targetLanguage}. Length target: 800-1200 characters. The story must be suitable for level ${level} but rich enough for learning.

Then select ${numKeywords} important vocabulary items from the story that are most educational for a learner at this level. For each keyword, provide:
- the word/phrase in ${targetLanguage}
- a concise English translation
- part of speech (pos)
- 2 example sentences in ${targetLanguage} with English translations
- 3-6 synonyms in ${targetLanguage}

Output strictly as minified JSON with the following schema and nothing else:
{
  "story": "string (${targetLanguage})",
  "keywords": [
    {
      "l2": "string (${targetLanguage})",
      "l1": "string (English)",
      "pos": "noun|verb|adj|adv|phrase|...",
      "synonyms": ["string", "string", "string"],
      "examples": [
        { "sentence": "string (${targetLanguage})", "translation": "English" },
        { "sentence": "string (${targetLanguage})", "translation": "English" }
      ]
    }
  ]
}`.trim();

    try {
      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
      });

      const parsed = JSON.parse(text);

      // Basic shape validation
      if (!parsed || typeof parsed.story !== 'string' || !Array.isArray(parsed.keywords)) {
        return NextResponse.json(getFallbackPackage(topic, level, language, numKeywords));
      }

      // Normalize keyword items
      const keywords = parsed.keywords
        .slice(0, numKeywords)
        .map((k: any) => ({
          l2: typeof k.l2 === 'string' ? k.l2 : '',
          l1: typeof k.l1 === 'string' ? k.l1 : '',
          pos: typeof k.pos === 'string' ? k.pos : undefined,
          synonyms: Array.isArray(k.synonyms)
            ? k.synonyms.filter((s: any) => typeof s === 'string').slice(0, 6)
            : [],
          examples: Array.isArray(k.examples)
            ? k.examples.map((e: any) => ({
                sentence: typeof e?.sentence === 'string' ? e.sentence : '',
                translation: typeof e?.translation === 'string' ? e.translation : '',
              }))
            : [],
        }))
        .filter((k: any) => k.l2 && k.l1);

      return NextResponse.json({ story: parsed.story, keywords });
    } catch (aiError) {
      return NextResponse.json(getFallbackPackage(topic, level, language, numKeywords));
    }
  } catch (error) {
    console.error('Topic package error:', error);
    return NextResponse.json({ error: 'Failed to generate topic package' }, { status: 500 });
  }
}

function getFallbackPackage(
  topic: string,
  level: TopicPackageRequestBody['level'],
  language: TopicPackageRequestBody['language'],
  numKeywords: number
) {
  const targetLanguage = language === 'GERMAN' ? 'German' : 'Spanish';
  const story =
    language === 'GERMAN'
      ? `Dies ist eine kurze ${level}-Geschichte über ${topic}. Sie verwendet einfache Sätze und häufige Wörter, damit Lernende den Text leicht verstehen können. Die Geschichte hilft dabei, wichtige Vokabeln im Kontext zu lernen.`
      : `Esta es una breve historia de nivel ${level} sobre ${topic}. Usa oraciones simples y palabras comunes para que los estudiantes puedan entender el texto fácilmente. La historia ayuda a aprender vocabulario importante en contexto.`;

  const sampleKeywords = (
    language === 'GERMAN'
      ? [
          { l2: 'Geschichte', l1: 'story', pos: 'noun' },
          { l2: 'lernen', l1: 'to learn', pos: 'verb' },
          { l2: 'einfach', l1: 'simple', pos: 'adjective' },
          { l2: 'Wortschatz', l1: 'vocabulary', pos: 'noun' },
          { l2: 'Thema', l1: 'topic', pos: 'noun' },
        ]
      : [
          { l2: 'historia', l1: 'story', pos: 'noun' },
          { l2: 'aprender', l1: 'to learn', pos: 'verb' },
          { l2: 'simple', l1: 'simple', pos: 'adjective' },
          { l2: 'vocabulario', l1: 'vocabulary', pos: 'noun' },
          { l2: 'tema', l1: 'topic', pos: 'noun' },
        ]
  ).slice(0, numKeywords);

  const examples = (word: string, translation: string) =>
    language === 'GERMAN'
      ? [
          {
            sentence: `Dies ist eine ${word} für ${topic}.`,
            translation: `This is a ${translation} for ${topic}.`,
          },
          {
            sentence: `Mit einer ${word} lerne ich schneller.`,
            translation: `With a ${translation} I learn faster.`,
          },
        ]
      : [
          {
            sentence: `Esta es una ${word} sobre ${topic}.`,
            translation: `This is a ${translation} about ${topic}.`,
          },
          {
            sentence: `Con una ${word} aprendo más rápido.`,
            translation: `With a ${translation} I learn faster.`,
          },
        ];

  const keywords = sampleKeywords.map((k) => ({ ...k, examples: examples(k.l2, k.l1) }));

  return { story, keywords };
}
