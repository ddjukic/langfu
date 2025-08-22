#!/usr/bin/env node

// Script to fix placeholder translations in football stories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Spanish football vocabulary translations
const spanishTranslations: { [key: string]: string } = {
  estadio: 'stadium',
  jugadores: 'players',
  equipo: 'team',
  gol: 'goal',
  pelota: 'ball',
  hinchada: 'fans',
  gritar: 'to shout',
  tiempo: 'time',
  ataque: 'attack',
  defensa: 'defense',
  arquero: 'goalkeeper',
  delantero: 'forward',
  centrocampista: 'midfielder',
  córner: 'corner kick',
  falta: 'foul',
  árbitro: 'referee',
  tarjeta: 'card',
  empate: 'tie',
  victoria: 'victory',
  derrota: 'defeat',
  partido: 'match',
  campo: 'field',
  portería: 'goal post',
  tiro: 'shot',
  pase: 'pass',
};

// German football vocabulary translations
const germanTranslations: { [key: string]: string } = {
  Stadion: 'stadium',
  Spieler: 'players',
  Mannschaft: 'team',
  Tor: 'goal',
  Ball: 'ball',
  Fans: 'fans',
  schreien: 'to shout',
  Zeit: 'time',
  Angriff: 'attack',
  Verteidigung: 'defense',
  Torwart: 'goalkeeper',
  Stürmer: 'forward',
  Ecke: 'corner kick',
  Foul: 'foul',
  Schiedsrichter: 'referee',
  Karte: 'card',
  Unentschieden: 'tie',
  Sieg: 'victory',
  Niederlage: 'defeat',
  Spiel: 'match',
  Spielfeld: 'field',
};

// Story IDs from the issue description
const SPANISH_STORY_ID = 'cmelonq6a000ldffkhxvz30r6';
const GERMAN_STORY_ID = 'cmeloo62u000ndffku0hijo9e';

function replaceTranslations(keywords: any[], translations: { [key: string]: string }): any[] {
  return keywords.map((keyword) => {
    const l2Word = keyword.l2;
    const currentTranslation = keyword.l1;

    // Check if current translation is a placeholder
    if (
      currentTranslation &&
      currentTranslation.includes('[Translation for') &&
      currentTranslation.includes('needed]')
    ) {
      // Find the proper translation
      const properTranslation = translations[l2Word];
      if (properTranslation) {
        console.log(`  ✅ Fixed: ${l2Word} -> ${properTranslation} (was: ${currentTranslation})`);
        return {
          ...keyword,
          l1: properTranslation,
        };
      } else {
        console.log(`  ⚠️  No translation found for: ${l2Word}`);
      }
    }

    return keyword;
  });
}

async function fixStoryTranslations() {
  console.log('🔧 Starting translation fix for football stories...\n');

  try {
    // Fix Spanish story
    console.log(`📖 Processing Spanish story (ID: ${SPANISH_STORY_ID})...`);
    const spanishStory = await prisma.story.findUnique({
      where: { id: SPANISH_STORY_ID },
      select: { id: true, title: true, keywords: true, words: true },
    });

    if (spanishStory) {
      console.log(`   Title: ${spanishStory.title}`);

      // Process keywords field
      let keywordsFixed = false;
      let wordsFixed = false;

      if (spanishStory.keywords) {
        const keywords =
          typeof spanishStory.keywords === 'string'
            ? JSON.parse(spanishStory.keywords)
            : spanishStory.keywords;

        const fixedKeywords = replaceTranslations(keywords, spanishTranslations);

        await prisma.story.update({
          where: { id: SPANISH_STORY_ID },
          data: { keywords: fixedKeywords },
        });

        keywordsFixed = true;
        console.log(`   ✅ Updated keywords field (${keywords.length} words)`);
      }

      // Process words field if it exists
      if (spanishStory.words) {
        const words =
          typeof spanishStory.words === 'string'
            ? JSON.parse(spanishStory.words)
            : spanishStory.words;

        const fixedWords = replaceTranslations(words, spanishTranslations);

        await prisma.story.update({
          where: { id: SPANISH_STORY_ID },
          data: { words: fixedWords },
        });

        wordsFixed = true;
        console.log(`   ✅ Updated words field (${words.length} words)`);
      }

      if (!keywordsFixed && !wordsFixed) {
        console.log(`   ⚠️  No vocabulary fields found to update`);
      }
    } else {
      console.log(`   ❌ Spanish story not found with ID: ${SPANISH_STORY_ID}`);
    }

    console.log('');

    // Fix German story
    console.log(`📖 Processing German story (ID: ${GERMAN_STORY_ID})...`);
    const germanStory = await prisma.story.findUnique({
      where: { id: GERMAN_STORY_ID },
      select: { id: true, title: true, keywords: true, words: true },
    });

    if (germanStory) {
      console.log(`   Title: ${germanStory.title}`);

      // Process keywords field
      let keywordsFixed = false;
      let wordsFixed = false;

      if (germanStory.keywords) {
        const keywords =
          typeof germanStory.keywords === 'string'
            ? JSON.parse(germanStory.keywords)
            : germanStory.keywords;

        const fixedKeywords = replaceTranslations(keywords, germanTranslations);

        await prisma.story.update({
          where: { id: GERMAN_STORY_ID },
          data: { keywords: fixedKeywords },
        });

        keywordsFixed = true;
        console.log(`   ✅ Updated keywords field (${keywords.length} words)`);
      }

      // Process words field if it exists
      if (germanStory.words) {
        const words =
          typeof germanStory.words === 'string' ? JSON.parse(germanStory.words) : germanStory.words;

        const fixedWords = replaceTranslations(words, germanTranslations);

        await prisma.story.update({
          where: { id: GERMAN_STORY_ID },
          data: { words: fixedWords },
        });

        wordsFixed = true;
        console.log(`   ✅ Updated words field (${words.length} words)`);
      }

      if (!keywordsFixed && !wordsFixed) {
        console.log(`   ⚠️  No vocabulary fields found to update`);
      }
    } else {
      console.log(`   ❌ German story not found with ID: ${GERMAN_STORY_ID}`);
    }

    console.log('\n🎉 Translation fix completed successfully!');
  } catch (error) {
    console.error('❌ Error during translation fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixStoryTranslations().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { fixStoryTranslations };
