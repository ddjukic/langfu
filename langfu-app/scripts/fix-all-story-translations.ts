#!/usr/bin/env node

// Comprehensive script to fix ALL placeholder translations in stories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extended translation dictionaries
const spanishTranslations: { [key: string]: string } = {
  // Football vocabulary
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
  // Additional football terms
  penal: 'penalty',
  offside: 'offside',
  técnico: 'coach',
  cambio: 'substitution',
  alargue: 'extra time',
  mediocampo: 'midfield',
  defensor: 'defender',
  capitán: 'captain',
  'tiro libre': 'free kick',
  clásico: 'derby',
  rivalidad: 'rivalry',
  copa: 'cup',
  campeonato: 'championship',
  liga: 'league',
};

const germanTranslations: { [key: string]: string } = {
  // Football vocabulary
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
  // Additional football terms
  jubeln: 'to celebrate',
  Halbzeit: 'half time',
  Abwehr: 'defense',
  Elfmeter: 'penalty',
  Abseits: 'offside',
  Trainer: 'coach',
  Wechsel: 'substitution',
  Verlängerung: 'extra time',
  Mittelfeld: 'midfield',
  Verteidiger: 'defender',
  Kapitän: 'captain',
  Freistoß: 'free kick',
  Derby: 'derby',
  Rivalität: 'rivalry',
  Pokal: 'cup',
  Meisterschaft: 'championship',
  Liga: 'league',
  // Breakfast vocabulary
  Kaffee: 'coffee',
  Brot: 'bread',
  Butter: 'butter',
  Marmelade: 'jam',
  Familie: 'family',
  Müsli: 'muesli',
  Milch: 'milk',
};

function replaceTranslations(
  keywords: any[],
  translations: { [key: string]: string },
  language: string
): { words: any[]; fixedCount: number } {
  let fixedCount = 0;

  const fixedWords = keywords.map((keyword) => {
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
        fixedCount++;
        return {
          ...keyword,
          l1: properTranslation,
        };
      } else {
        console.log(`  ⚠️  No translation found for: ${l2Word} (${language})`);
      }
    }

    return keyword;
  });

  return { words: fixedWords, fixedCount };
}

async function fixAllStoryTranslations() {
  console.log('🔧 Starting comprehensive translation fix for ALL stories...\n');

  try {
    // Get all stories that might have placeholder translations
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        language: true,
        keywords: true,
        words: true,
      },
    });

    if (stories.length === 0) {
      console.log('ℹ️  No stories found in database.');
      return;
    }

    console.log(`Found ${stories.length} stories to check:\n`);

    let totalFixed = 0;
    let storiesFixed = 0;

    for (const story of stories) {
      console.log(`📖 Processing: ${story.title} (${story.language})`);
      console.log(`   ID: ${story.id}`);

      const translations = story.language === 'SPANISH' ? spanishTranslations : germanTranslations;
      let storyHadFixes = false;

      // Process keywords field
      if (story.keywords) {
        try {
          const keywords =
            typeof story.keywords === 'string' ? JSON.parse(story.keywords) : story.keywords;

          const { words: fixedKeywords, fixedCount: keywordFixes } = replaceTranslations(
            keywords,
            translations,
            story.language
          );

          if (keywordFixes > 0) {
            await prisma.story.update({
              where: { id: story.id },
              data: { keywords: fixedKeywords },
            });

            console.log(`   ✅ Updated keywords field (${keywordFixes} fixes)`);
            totalFixed += keywordFixes;
            storyHadFixes = true;
          }
        } catch (e) {
          console.log(
            `   ❌ Error processing keywords: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }

      // Process words field if it exists and is different from keywords
      if (story.words) {
        try {
          const words = typeof story.words === 'string' ? JSON.parse(story.words) : story.words;

          const { words: fixedWords, fixedCount: wordFixes } = replaceTranslations(
            words,
            translations,
            story.language
          );

          if (wordFixes > 0) {
            await prisma.story.update({
              where: { id: story.id },
              data: { words: fixedWords },
            });

            console.log(`   ✅ Updated words field (${wordFixes} fixes)`);
            totalFixed += wordFixes;
            storyHadFixes = true;
          }
        } catch (e) {
          console.log(
            `   ❌ Error processing words: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }

      if (storyHadFixes) {
        storiesFixed++;
      } else {
        console.log(`   ℹ️  No placeholder translations found or no translations available`);
      }

      console.log('');
    }

    // Summary
    console.log('📊 Fix Summary:');
    console.log(`   Stories processed: ${stories.length}`);
    console.log(`   Stories fixed: ${storiesFixed}`);
    console.log(`   Total translations fixed: ${totalFixed}`);

    if (totalFixed > 0) {
      console.log('\n🎉 Translation fixes completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Run verification script to confirm all fixes');
      console.log('2. Test the application to ensure hover tooltips work correctly');
      console.log('3. Run QA tests to verify the fix');
    } else {
      console.log('\n✅ No placeholder translations found that could be fixed.');
    }
  } catch (error) {
    console.error('❌ Error during translation fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive fix
if (require.main === module) {
  fixAllStoryTranslations().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { fixAllStoryTranslations };
