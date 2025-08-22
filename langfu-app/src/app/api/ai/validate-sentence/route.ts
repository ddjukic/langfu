import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { sentence, word, language } = await request.json();

    // Basic validation
    if (!sentence.toLowerCase().includes(word.toLowerCase())) {
      return NextResponse.json({
        valid: false,
        feedback: `Your sentence must include the word "${word}".`,
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key') {
      // Return basic validation
      return NextResponse.json({
        valid: true,
        feedback: 'Good! Your sentence includes the target word.',
      });
    }

    const prompt = `Evaluate this ${language === 'GERMAN' ? 'German' : 'Spanish'} sentence: "${sentence}"
    The sentence should correctly use the word "${word}".
    
    Respond with a JSON object containing:
    - "valid": boolean (true if grammatically correct and word is used properly)
    - "feedback": string (brief encouraging feedback or correction suggestion)`;

    try {
      const { text } = await generateText({
        model: openai('gpt-5-nano'),
        prompt,
      });

      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch (aiError) {
      // Fallback if AI fails
      return NextResponse.json({
        valid: true,
        feedback: 'Your sentence includes the target word. Keep practicing!',
      });
    }
  } catch (error) {
    console.error('Validate sentence error:', error);
    return NextResponse.json({ error: 'Failed to validate sentence' }, { status: 500 });
  }
}
