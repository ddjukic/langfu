#!/usr/bin/env node

// Script to verify all stories have proper translations (no placeholders)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllTranslations() {
  console.log('🔍 Checking all stories for placeholder translations...\n');

  try {
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

    let totalStories = 0;
    let storiesWithPlaceholders = 0;
    let totalPlaceholders = 0;

    for (const story of stories) {
      totalStories++;
      console.log(`📖 ${story.title} (${story.language})`);
      console.log(`   ID: ${story.id}`);

      let allWords: any[] = [];

      // Check keywords field
      if (story.keywords) {
        try {
          const keywords =
            typeof story.keywords === 'string' ? JSON.parse(story.keywords) : story.keywords;
          allWords = [...allWords, ...keywords];
        } catch (e) {
          console.log('   ⚠️  Error parsing keywords:', e instanceof Error ? e.message : String(e));
        }
      }

      // Check words field
      if (story.words) {
        try {
          const words = typeof story.words === 'string' ? JSON.parse(story.words) : story.words;
          // Avoid duplicates by checking if we already have words
          if (allWords.length === 0) {
            allWords = [...allWords, ...words];
          }
        } catch (e) {
          console.log('   ⚠️  Error parsing words:', e instanceof Error ? e.message : String(e));
        }
      }

      if (allWords.length === 0) {
        console.log('   ℹ️  No vocabulary found');
        console.log('');
        continue;
      }

      // Check for placeholders
      const placeholders = allWords.filter(
        (word) => word.l1 && word.l1.includes('[Translation') && word.l1.includes('needed]')
      );

      if (placeholders.length > 0) {
        storiesWithPlaceholders++;
        totalPlaceholders += placeholders.length;
        console.log(`   ❌ Found ${placeholders.length} placeholder translations:`);
        placeholders.forEach((p) => {
          console.log(`      ${p.l2} -> ${p.l1}`);
        });
      } else {
        console.log(`   ✅ All ${allWords.length} translations are proper English words`);
        // Show a few samples
        if (allWords.length > 0) {
          console.log(
            `   Sample: ${allWords
              .slice(0, 3)
              .map((w) => `${w.l2} -> ${w.l1}`)
              .join(', ')}`
          );
        }
      }

      console.log('');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total stories: ${totalStories}`);
    console.log(`   Stories with placeholders: ${storiesWithPlaceholders}`);
    console.log(`   Total placeholder translations: ${totalPlaceholders}`);

    if (storiesWithPlaceholders === 0) {
      console.log('\n🎉 All stories have proper English translations!');
    } else {
      console.log(`\n⚠️  ${storiesWithPlaceholders} stories still need translation fixes.`);
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
if (require.main === module) {
  verifyAllTranslations().catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { verifyAllTranslations };
