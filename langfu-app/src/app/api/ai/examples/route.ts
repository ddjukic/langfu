import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { word, translation, language, pos } = await request.json();

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key') {
      // Return fallback examples
      return NextResponse.json({
        examples: getFallbackExamples(word, language),
        translations: getFallbackTranslations(translation),
      });
    }

    const prompt = `Generate 5 example sentences in ${language === 'GERMAN' ? 'German' : 'Spanish'} using the word "${word}" (${translation}). 
    The word is a ${pos || 'word'}. Make the sentences varied in difficulty but appropriate for language learners.
    Format your response as a JSON array with objects containing "sentence" and "translation" fields.`;

    try {
      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
      });

      const parsed = JSON.parse(text);
      const examples = parsed.map((item: any) => item.sentence);
      const translations = parsed.map((item: any) => item.translation);

      return NextResponse.json({ examples, translations });
    } catch (aiError) {
      // Fallback if AI fails
      return NextResponse.json({
        examples: getFallbackExamples(word, language),
        translations: getFallbackTranslations(translation),
      });
    }
  } catch (error) {
    console.error('Generate examples error:', error);
    return NextResponse.json(
      { error: 'Failed to generate examples' },
      { status: 500 }
    );
  }
}

function getFallbackExamples(word: string, language: string) {
  if (language === 'GERMAN') {
    return [
      `Ich verwende ${word} jeden Tag.`,
      `${word} ist sehr wichtig.`,
      `Kannst du ${word} verstehen?`,
      `Wir lernen ${word} zusammen.`,
      `Das ${word} ist interessant.`,
    ];
  } else {
    return [
      `Yo uso ${word} cada día.`,
      `${word} es muy importante.`,
      `¿Puedes entender ${word}?`,
      `Aprendemos ${word} juntos.`,
      `El ${word} es interesante.`,
    ];
  }
}

function getFallbackTranslations(translation: string) {
  return [
    `I use ${translation} every day.`,
    `${translation} is very important.`,
    `Can you understand ${translation}?`,
    `We learn ${translation} together.`,
    `The ${translation} is interesting.`,
  ];
}