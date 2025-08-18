import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to save content to test folder
async function saveExtractedContent(url: string, content: any) {
  const testDir = path.join(process.cwd(), 'test', 'extracted');
  await fs.mkdir(testDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const domain = new URL(url).hostname.replace(/[^a-z0-9]/gi, '_');
  const filename = `${domain}_${timestamp}.json`;
  
  await fs.writeFile(
    path.join(testDir, filename),
    JSON.stringify({
      url,
      extractedAt: new Date().toISOString(),
      rawHtml: content.html,
      textContent: content.text,
      extractedWords: content.words,
      openAIResponse: content.openAIResponse
    }, null, 2)
  );
  
  return filename;
}

// Helper function to detect language from text
function detectLanguage(text: string): Language | null {
  // Common German words and patterns
  const germanPatterns = /\b(der|die|das|und|ist|ich|ein|eine|haben|werden|nicht|mit|auf|für|aber|nach|bei|über|unter|zwischen)\b/gi;
  // Common Spanish words and patterns  
  const spanishPatterns = /\b(el|la|los|las|y|es|un|una|que|de|en|por|para|con|pero|como|más|muy|todo|esta)\b/gi;
  
  const germanMatches = (text.match(germanPatterns) || []).length;
  const spanishMatches = (text.match(spanishPatterns) || []).length;
  
  if (germanMatches > spanishMatches && germanMatches > 5) return Language.GERMAN;
  if (spanishMatches > germanMatches && spanishMatches > 5) return Language.SPANISH;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch webpage' }, { status: 400 });
    }

    const html = await response.text();
    
    // Extract text content from HTML (simple extraction)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    // Detect language
    const detectedLanguage = detectLanguage(textContent);
    if (!detectedLanguage) {
      return NextResponse.json({ 
        error: 'Could not detect German or Spanish language in the content' 
      }, { status: 400 });
    }
    
    // Use OpenAI to extract vocabulary
    let openAIResponse;
    let extractedWords = [];
    
    try {
      // Prepare the text (take first 3000 characters to avoid token limits)
      const textForAnalysis = textContent.substring(0, 3000);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using gpt-3.5-turbo as gpt-5-nano doesn't exist
        messages: [
          {
            role: "system",
            content: `You are a language learning assistant. Extract the 30 most important vocabulary words from the following ${detectedLanguage === Language.GERMAN ? 'German' : 'Spanish'} text. For each word, provide:
1. The word in its base form
2. English translation
3. Part of speech (noun, verb, adjective, etc.)
4. Gender (for nouns in German/Spanish)
5. CEFR level (A1, A2, B1, B2, C1, or C2)
6. A short example sentence from the text or a typical usage

Return the response as a JSON array with objects containing these fields: word, translation, pos, gender, level, example`
          },
          {
            role: "user",
            content: textForAnalysis
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      openAIResponse = completion.choices[0].message.content;
      
      // Parse the OpenAI response
      try {
        // Remove markdown code blocks if present
        const cleanResponse = openAIResponse?.replace(/```json\n?/g, '').replace(/```\n?/g, '') || '[]';
        const parsedWords = JSON.parse(cleanResponse);
        extractedWords = parsedWords.map((w: any, index: number) => ({
          l2: w.word || '',
          l1: w.translation || '',
          pos: w.pos || null,
          gender: w.gender || null,
          level: w.level || 'B1',
          frequency: 30 - index,
          difficulty: Math.ceil((index + 1) / 10),
          context: w.example || textContent.substring(
            Math.max(0, textContent.indexOf(w.word) - 50),
            Math.min(textContent.length, textContent.indexOf(w.word) + 100)
          )
        }));
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        // Fallback to basic extraction if OpenAI response can't be parsed
        extractedWords = extractBasicWords(textContent, detectedLanguage);
      }
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      // Fallback to basic extraction if OpenAI fails
      extractedWords = extractBasicWords(textContent, detectedLanguage);
    }
    
    // Save content to test folder
    const savedFile = await saveExtractedContent(url, {
      html,
      text: textContent,
      words: extractedWords,
      openAIResponse
    });
    
    console.log(`Content saved to test/extracted/${savedFile}`);
    
    // Create web extraction record
    const extraction = await prisma.webExtraction.create({
      data: {
        userId: user.id,
        url,
        title,
        content: textContent.substring(0, 10000), // Store first 10k chars
        language: detectedLanguage,
        wordCount: extractedWords.length,
        level: extractedWords[0]?.level || 'B1',
        customTopic: 'Web Extract',
        extractedWords: {
          create: extractedWords
        }
      },
      include: {
        extractedWords: true
      }
    });
    
    return NextResponse.json({ 
      extraction: {
        id: extraction.id,
        title: extraction.title,
        url: extraction.url,
        language: extraction.language,
        wordCount: extraction.wordCount,
        level: extraction.level,
        extractedAt: extraction.extractedAt,
        words: extraction.extractedWords
      }
    });
    
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract vocabulary' },
      { status: 500 }
    );
  }
}

// Fallback function for basic word extraction
function extractBasicWords(text: string, language: Language) {
  // Remove common stop words based on language
  const germanStopWords = new Set(['der', 'die', 'das', 'und', 'ist', 'ich', 'ein', 'eine', 'haben', 'werden', 'nicht', 'mit', 'auf', 'für', 'aber', 'nach', 'bei', 'über', 'unter', 'zwischen']);
  const spanishStopWords = new Set(['el', 'la', 'los', 'las', 'y', 'es', 'un', 'una', 'que', 'de', 'en', 'por', 'para', 'con', 'pero', 'como', 'más', 'muy', 'todo', 'esta']);
  
  const stopWords = language === Language.GERMAN ? germanStopWords : spanishStopWords;
  
  // Split into words and filter
  const words = text
    .split(/[\s.,;:!?()[\]{}'"–—\-\n\r\t]+/)
    .filter(word => word.length > 2)
    .map(word => word.toLowerCase());
  
  // Count word frequency
  const wordFrequency = new Map<string, number>();
  words.forEach(word => {
    if (!stopWords.has(word) && word.match(/^[a-zäöüáéíóúñß]+$/i)) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }
  });
  
  // Sort by frequency and take top 30
  return Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word], index) => ({
      l2: word,
      l1: `[Translation of ${word}]`,
      frequency: 30 - index,
      difficulty: Math.ceil((index + 1) / 10),
      level: 'B1',
      context: text.substring(
        Math.max(0, text.indexOf(word) - 50),
        Math.min(text.length, text.indexOf(word) + 100)
      )
    }));
}