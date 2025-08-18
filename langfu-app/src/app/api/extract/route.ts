import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import OpenAI from 'openai';
import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || 'YOUR_API_KEY_HERE'
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
      markdown: content.markdown,
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

    // Use Firecrawl to scrape the webpage and get clean content
    let markdown = '';
    let title = 'Untitled';
    
    try {
      console.log('Scraping URL with Firecrawl:', url);
      const scrapeResponse = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000 // Wait for dynamic content to load
      });
      
      if (scrapeResponse && scrapeResponse.markdown) {
        markdown = scrapeResponse.markdown;
        // Extract title from the markdown (usually the first heading)
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1].trim() : scrapeResponse.metadata?.title || 'Untitled';
      } else {
        console.error('Firecrawl returned no content');
        return NextResponse.json({ error: 'Failed to extract content from webpage' }, { status: 400 });
      }
    } catch (firecrawlError) {
      console.error('Firecrawl error:', firecrawlError);
      return NextResponse.json({ error: 'Failed to scrape webpage with Firecrawl' }, { status: 500 });
    }
    
    // Detect language
    const detectedLanguage = detectLanguage(markdown);
    if (!detectedLanguage) {
      return NextResponse.json({ 
        error: 'Could not detect German or Spanish language in the content' 
      }, { status: 400 });
    }
    
    // Use OpenAI to extract vocabulary
    let openAIResponse;
    let extractedWords = [];
    
    try {
      // Prepare the markdown text (take first 3000 characters to avoid token limits)
      const textForAnalysis = markdown.substring(0, 3000);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are a language learning assistant specializing in ${detectedLanguage === Language.GERMAN ? 'German' : 'Spanish'} vocabulary extraction.

Extract the 30 most important vocabulary words for language learners from the provided text.

Rules:
- Focus on content words (nouns, verbs, adjectives, adverbs)
- Ignore proper names, URLs, technical jargon, and non-language content
- Use base/infinitive forms (e.g., infinitives for verbs, singular for nouns)
- Provide accurate English translations
- Assign appropriate CEFR levels based on word complexity

Return a JSON object with this exact structure:
{
  "words": [
    {
      "word": "word in base form",
      "translation": "English translation",
      "pos": "noun|verb|adjective|adverb|preposition|conjunction",
      "gender": "m|f|n (for nouns) or null",
      "level": "A1|A2|B1|B2|C1|C2",
      "example": "short example sentence"
    }
  ]
}`
          },
          {
            role: "user", 
            content: `Extract vocabulary from this ${detectedLanguage === Language.GERMAN ? 'German' : 'Spanish'} text:\n\n${textForAnalysis}`
          }
        ],
        max_completion_tokens: 2000
      });
      
      openAIResponse = completion.choices[0]?.message?.content || '';
      console.log('OpenAI Full Response:', JSON.stringify(completion, null, 2));
      console.log('OpenAI Response Content:', openAIResponse);
      
      // Parse the structured output response
      try {
        const parsedResponse = JSON.parse(openAIResponse || '{"words":[]}');
        const parsedWords = parsedResponse.words || [];
        extractedWords = parsedWords.map((w: any, index: number) => ({
          l2: w.word || '',
          l1: w.translation || '',
          pos: w.pos || null,
          gender: w.gender || null,
          level: w.level || 'B1',
          frequency: 30 - index,
          difficulty: Math.ceil((index + 1) / 10),
          context: w.example || markdown.substring(
            Math.max(0, markdown.indexOf(w.word) - 50),
            Math.min(markdown.length, markdown.indexOf(w.word) + 100)
          )
        }));
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        // Fallback to basic extraction if OpenAI response can't be parsed
        extractedWords = extractBasicWords(markdown, detectedLanguage);
      }
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      // Fallback to basic extraction if OpenAI fails
      extractedWords = extractBasicWords(markdown, detectedLanguage);
    }
    
    // Save content to test folder
    const savedFile = await saveExtractedContent(url, {
      markdown,
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
        content: markdown.substring(0, 10000), // Store first 10k chars of markdown
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