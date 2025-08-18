import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';

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

// Extract meaningful words from text
function extractKeywords(text: string, language: Language): string[] {
  // Remove HTML tags if any remain
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  
  // Split into words and filter
  const words = cleanText
    .split(/[\s.,;:!?()[\]{}'"–—\-\n\r\t]+/)
    .filter(word => word.length > 2) // Minimum word length
    .map(word => word.toLowerCase());
  
  // Remove common stop words based on language
  const germanStopWords = new Set(['der', 'die', 'das', 'und', 'ist', 'ich', 'ein', 'eine', 'haben', 'werden', 'nicht', 'mit', 'auf', 'für', 'aber', 'nach', 'bei', 'über', 'unter', 'zwischen', 'auch', 'noch', 'wird', 'sich', 'aus', 'von', 'dem', 'den', 'des', 'zur', 'zum', 'als', 'wenn', 'nur', 'schon', 'sehr', 'durch', 'kann', 'war', 'sind', 'hat']);
  const spanishStopWords = new Set(['el', 'la', 'los', 'las', 'y', 'es', 'un', 'una', 'que', 'de', 'en', 'por', 'para', 'con', 'pero', 'como', 'más', 'muy', 'todo', 'esta', 'su', 'al', 'del', 'se', 'ha', 'son', 'está', 'han', 'hay', 'sido', 'ser', 'tiene', 'puede', 'este', 'ese', 'eso']);
  
  const stopWords = language === Language.GERMAN ? germanStopWords : spanishStopWords;
  
  // Count word frequency and filter
  const wordFrequency = new Map<string, number>();
  words.forEach(word => {
    if (!stopWords.has(word) && word.match(/^[a-zäöüáéíóúñß]+$/i)) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }
  });
  
  // Sort by frequency and take top words
  const sortedWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30) // Take top 30 words
    .map(([word]) => word);
  
  return sortedWords;
}

// Estimate CEFR level based on word complexity
function estimateLevel(words: string[]): string {
  const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  if (avgLength < 5) return 'A1';
  if (avgLength < 6) return 'A2';
  if (avgLength < 7) return 'B1';
  if (avgLength < 8) return 'B2';
  if (avgLength < 9) return 'C1';
  return 'C2';
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
    
    // Extract keywords
    const keywords = extractKeywords(textContent, detectedLanguage);
    const estimatedLevel = estimateLevel(keywords);
    
    // Create web extraction record
    const extraction = await prisma.webExtraction.create({
      data: {
        userId: user.id,
        url,
        title,
        content: textContent.substring(0, 10000), // Store first 10k chars
        language: detectedLanguage,
        wordCount: keywords.length,
        level: estimatedLevel,
        customTopic: 'Web Extract',
        extractedWords: {
          create: keywords.map((word, index) => ({
            l2: word,
            l1: `[Translation of ${word}]`, // Placeholder - would use translation API
            frequency: 30 - index, // Higher frequency for words appearing earlier
            difficulty: Math.ceil((index + 1) / 10), // Difficulty based on rank
            level: estimatedLevel,
            context: textContent.substring(
              Math.max(0, textContent.indexOf(word) - 50),
              Math.min(textContent.length, textContent.indexOf(word) + 100)
            )
          }))
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