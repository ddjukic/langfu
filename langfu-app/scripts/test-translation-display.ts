#!/usr/bin/env node

// Test script to verify translations will display correctly in the UI
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTranslationDisplay() {
  console.log('🧪 Testing translation display for QA verification...\n');

  try {
    // Get the specific football stories mentioned in the original issue
    const targetStories = await prisma.story.findMany({
      where: {
        OR: [
          { id: 'cmelonq6a000ldffkhxvz30r6' }, // Spanish story
          { id: 'cmeloo62u000ndffku0hijo9e' }, // German story
        ],
      },
      select: {
        id: true,
        title: true,
        language: true,
        keywords: true,
        words: true,
      },
    });

    if (targetStories.length === 0) {
      console.log('❌ Target stories not found!');
      return;
    }

    console.log(`Found ${targetStories.length} target stories:\n`);

    for (const story of targetStories) {
      console.log(`📖 ${story.title} (${story.language})`);
      console.log(`   Story ID: ${story.id}`);
      console.log(`   🌐 View at: http://localhost:3000/library/story/${story.id}`);

      // Parse vocabulary data
      let vocabulary: any[] = [];
      if (story.keywords) {
        try {
          vocabulary =
            typeof story.keywords === 'string' ? JSON.parse(story.keywords) : story.keywords;
        } catch (e) {
          console.log('   ❌ Error parsing vocabulary');
          continue;
        }
      }

      if (vocabulary.length === 0) {
        console.log('   ⚠️  No vocabulary found');
        continue;
      }

      console.log(`   📚 Vocabulary: ${vocabulary.length} words`);

      // Test key football vocabulary that should appear in hover tooltips
      const keyWords =
        story.language === 'SPANISH'
          ? ['estadio', 'jugadores', 'equipo', 'gol', 'pelota']
          : ['Stadion', 'Spieler', 'Mannschaft', 'Tor', 'Ball'];

      console.log('   🎯 Key vocabulary for hover tooltips:');

      let allWordsValid = true;
      for (const keyWord of keyWords) {
        const vocabEntry = vocabulary.find((v) => v.l2 === keyWord);
        if (vocabEntry) {
          const translation = vocabEntry.l1;
          if (
            translation &&
            !translation.includes('[Translation') &&
            !translation.includes('needed]')
          ) {
            console.log(`      ✅ ${keyWord} -> ${translation}`);
          } else {
            console.log(`      ❌ ${keyWord} -> ${translation} (STILL A PLACEHOLDER!)`);
            allWordsValid = false;
          }
        } else {
          console.log(`      ⚠️  ${keyWord} not found in vocabulary`);
        }
      }

      if (allWordsValid) {
        console.log('   ✅ All key words have proper English translations');
        console.log('   ✅ QA test should pass - hover tooltips will show proper English');
      } else {
        console.log('   ❌ Some words still have placeholder translations');
        console.log('   ❌ QA test may fail - hover tooltips will show placeholders');
      }

      console.log('');
    }

    console.log('🎯 QA Test Instructions:');
    console.log('1. Navigate to the story URLs above');
    console.log('2. Look for purple highlighted words in the story text');
    console.log('3. Hover over highlighted words to see translation tooltips');
    console.log('4. Verify tooltips show proper English translations (e.g., "stadium", "players")');
    console.log(
      '5. Verify tooltips do NOT show placeholders like "[Translation for estadio needed]"'
    );
    console.log('\n✅ Expected result: All hover tooltips show proper English words');
  } catch (error) {
    console.error('❌ Error during translation test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testTranslationDisplay().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testTranslationDisplay };
