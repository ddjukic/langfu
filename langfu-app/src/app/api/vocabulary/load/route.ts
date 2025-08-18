import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { vocabulary } = await request.json();
    
    if (!vocabulary || typeof vocabulary !== 'object') {
      return NextResponse.json(
        { error: 'Invalid vocabulary format' },
        { status: 400 }
      );
    }

    let totalWords = 0;
    const errors: string[] = [];

    // Process each level
    for (const [level, topics] of Object.entries(vocabulary)) {
      if (typeof topics !== 'object') continue;
      
      // Process each topic
      for (const [topic, words] of Object.entries(topics as any)) {
        if (!Array.isArray(words)) continue;
        
        // Process each word
        for (const wordData of words) {
          try {
            // Determine language based on field names
            const isGerman = 'de' in wordData;
            const isSpanish = 'es' in wordData;
            
            if (!isGerman && !isSpanish) {
              errors.push(`Word missing language field (de/es): ${JSON.stringify(wordData)}`);
              continue;
            }
            
            const language = isGerman ? Language.GERMAN : Language.SPANISH;
            const l2 = isGerman ? wordData.de : wordData.es;
            const l1 = wordData.en;
            
            if (!l2 || !l1) {
              errors.push(`Word missing required fields: ${JSON.stringify(wordData)}`);
              continue;
            }
            
            // Check if word already exists
            const existingWord = await prisma.word.findFirst({
              where: {
                language,
                l2,
                level,
                topic,
              },
            });
            
            if (existingWord) {
              continue; // Skip duplicates
            }
            
            // Create new word
            await prisma.word.create({
              data: {
                language,
                level,
                topic,
                l2,
                l1,
                pos: wordData.pos || null,
                gender: wordData.gender || null,
                difficulty: getLevelDifficulty(level),
                frequency: Math.floor(Math.random() * 1000) + 100,
              },
            });
            
            totalWords++;
          } catch (wordError) {
            errors.push(`Failed to add word: ${JSON.stringify(wordData)}`);
          }
        }
      }
    }
    
    // Also save as a vocabulary set
    await prisma.vocabularySet.create({
      data: {
        name: `Imported Vocabulary - ${new Date().toLocaleDateString()}`,
        description: `Imported ${totalWords} words`,
        language: user.currentLanguage,
        isPublic: false,
        data: vocabulary,
      },
    });
    
    return NextResponse.json({
      success: true,
      totalWords,
      errors: errors.slice(0, 10), // Return first 10 errors if any
    });
  } catch (error) {
    console.error('Load vocabulary error:', error);
    return NextResponse.json(
      { error: 'Failed to load vocabulary' },
      { status: 500 }
    );
  }
}

function getLevelDifficulty(level: string): number {
  const difficulties: Record<string, number> = {
    'A1': 1,
    'A2': 2,
    'B1': 3,
    'B2': 4,
    'C1': 5,
    'C2': 6,
  };
  return difficulties[level] || 1;
}