import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import OpenAI from 'openai';
import FirecrawlApp from '@mendable/firecrawl-js';

// Log immediately to see if route is reached
console.log('Extract route loaded, env check:', {
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasFirecrawl: !!process.env.FIRECRAWL_API_KEY,
  nodeEnv: process.env.NODE_ENV
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || 'YOUR_API_KEY_HERE'
});

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
  console.log('Extract API called at:', new Date().toISOString());
  
  try {
    // Log environment variable status
    console.log('API Environment Check:', {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasFirecrawl: !!process.env.FIRECRAWL_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      openAIKeyStart: process.env.OPENAI_API_KEY?.substring(0, 10),
      firecrawlKeyStart: process.env.FIRECRAWL_API_KEY?.substring(0, 10)
    });

    const user = await getCurrentUser();
    console.log('User authentication check:', { authenticated: !!user, userId: user?.id });
    
    if (!user) {
      console.error('Extract API: No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', { url: body.url, wordCount: body.wordCount });
    
    const { url, wordCount = 15 } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check for required API keys
    if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY === 'YOUR_API_KEY_HERE') {
      console.error('Extract API: Missing or invalid FIRECRAWL_API_KEY');
      return NextResponse.json({ 
        error: 'Service configuration error: Firecrawl API key not configured' 
      }, { status: 500 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key') {
      console.error('Extract API: Missing or invalid OPENAI_API_KEY');
      return NextResponse.json({ 
        error: 'Service configuration error: OpenAI API key not configured' 
      }, { status: 500 });
    }
    
    // Validate wordCount
    const validatedWordCount = Math.min(30, Math.max(5, Math.round(wordCount / 5) * 5));
    console.log('Validated word count:', validatedWordCount);

    // Use Firecrawl to scrape the webpage and get clean content
    let markdown = '';
    let title = 'Untitled';
    
    try {
      console.log('Starting Firecrawl scrape for URL:', url);
      const scrapeResponse = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000 // Wait for dynamic content to load
      });
      
      console.log('Firecrawl response received:', {
        hasResponse: !!scrapeResponse,
        hasMarkdown: !!(scrapeResponse && 'markdown' in scrapeResponse),
        responseKeys: scrapeResponse ? Object.keys(scrapeResponse) : []
      });
      
      if (scrapeResponse && 'markdown' in scrapeResponse && scrapeResponse.markdown) {
        markdown = scrapeResponse.markdown;
        // Extract title from the markdown (usually the first heading)
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1].trim() : 
              ('metadata' in scrapeResponse && scrapeResponse.metadata?.title) || 'Untitled';
      } else {
        console.error('Firecrawl returned no content');
        return NextResponse.json({ error: 'Failed to extract content from webpage' }, { status: 400 });
      }
    } catch (firecrawlError) {
      console.error('Firecrawl error:', firecrawlError);
      return NextResponse.json({ 
        error: 'Failed to scrape webpage with Firecrawl',
        details: firecrawlError instanceof Error ? firecrawlError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Detect language
    const detectedLanguage = detectLanguage(markdown);
    console.log('Language detection:', { 
      detected: detectedLanguage,
      textSample: markdown.substring(0, 200)
    });
    
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
      console.log('Sending to OpenAI, text length:', textForAnalysis.length);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a language learning assistant specializing in ${detectedLanguage === Language.GERMAN ? 'German' : 'Spanish'} vocabulary extraction.

Extract the ${validatedWordCount} most important vocabulary words for language learners from the provided text.

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
        max_tokens: 2000,
        temperature: 0.7
      });
      
      openAIResponse = completion.choices[0]?.message?.content || '';
      console.log('OpenAI response received, length:', openAIResponse.length);
      
      // Parse the structured output response
      try {
        // Clean up the response if needed
        const jsonMatch = openAIResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : openAIResponse;
        const parsed = JSON.parse(jsonString);
        
        if (parsed.words && Array.isArray(parsed.words)) {
          extractedWords = parsed.words.map((word: any, index: number) => ({
            l2: word.word || word.l2 || '',
            l1: word.translation || word.l1 || '',
            frequency: validatedWordCount - index,
            level: word.level || 'B1',
            context: word.example || '',
            pos: word.pos || 'noun',
            gender: word.gender || null
          }));
          console.log('Successfully parsed words:', extractedWords.length);
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw OpenAI response:', openAIResponse);
        // Fall back to basic extraction
        extractedWords = extractBasicWords(markdown, detectedLanguage, validatedWordCount);
      }
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      // Fall back to basic extraction
      extractedWords = extractBasicWords(markdown, detectedLanguage, validatedWordCount);
    }
    
    // Estimate content level based on extracted words
    const levels = extractedWords.map((w: any) => w.level || 'B1');
    const levelCounts: Record<string, number> = {};
    levels.forEach((level: string) => {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    const estimatedLevel = Object.entries(levelCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'B1';
    
    console.log('Creating extraction record in database');
    
    // Save extraction to database
    const extraction = await prisma.webExtraction.create({
      data: {
        userId: user.id,
        url,
        title,
        content: markdown.substring(0, 10000), // Store first 10k chars
        language: detectedLanguage,
        wordCount: extractedWords.length,
        level: estimatedLevel,
        extractedWords: {
          create: extractedWords.map((word: any) => ({
            l2: word.l2 || word.word || '',
            l1: word.l1 || word.translation || '',
            pos: word.pos,
            gender: word.gender,
            frequency: word.frequency || 1,
            context: word.context || word.example,
            level: word.level
          }))
        }
      },
      include: {
        extractedWords: true
      }
    });
    
    console.log('Extraction completed successfully:', {
      id: extraction.id,
      wordCount: extractedWords.length,
      level: estimatedLevel
    });
    
    return NextResponse.json({
      extraction: {
        id: extraction.id,
        title: extraction.title || 'Untitled',
        url: extraction.url,
        language: extraction.language,
        wordCount: extraction.wordCount,
        level: extraction.level || 'B1',
        extractedAt: extraction.extractedAt,
        words: extraction.extractedWords.map((word) => ({
          id: word.id,
          l2: word.l2,
          l1: word.l1,
          frequency: word.frequency,
          level: word.level,
          context: word.context
        }))
      }
    });
    
  } catch (error) {
    console.error('Extraction error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: JSON.stringify(error, null, 2)
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to extract vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}

// Fallback function for basic word extraction
function extractBasicWords(text: string, language: Language, wordCount: number = 15) {
  console.log('Using fallback basic word extraction');
  
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
  
  // Sort by frequency and take top N words based on wordCount
  return Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, wordCount)
    .map(([word], index) => ({
      l2: word,
      l1: `[Translation of ${word}]`,
      frequency: wordCount - index,
      level: 'B1'
    }));
}