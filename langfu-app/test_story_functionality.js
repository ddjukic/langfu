const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStoryFunctionality() {
  try {
    console.log('=== STORY FUNCTIONALITY TEST REPORT ===\n');

    // Test the specific story IDs mentioned
    const targetStories = [
      'cmelonq6a000ldffkhxvz30r6', // Spanish story
      'cmeloo62u000ndffku0hijo9e', // German story
    ];

    for (const storyId of targetStories) {
      console.log(`Testing Story ID: ${storyId}`);

      const story = await prisma.story.findUnique({
        where: { id: storyId },
        select: {
          id: true,
          title: true,
          language: true,
          content: true,
          keywords: true,
          words: true,
          wordCount: true,
        },
      });

      if (!story) {
        console.log(`❌ Story not found: ${storyId}\n`);
        continue;
      }

      console.log(`✅ Story found: "${story.title}" (${story.language})`);
      console.log(`Word count: ${story.wordCount}`);

      // Test vocabulary data
      let vocabulary = [];
      if (story.keywords && typeof story.keywords === 'object') {
        vocabulary = story.keywords;
      } else if (story.words && typeof story.words === 'object') {
        vocabulary = story.words;
      }

      console.log(`Vocabulary entries: ${vocabulary.length}`);

      if (vocabulary.length > 0) {
        console.log('Sample vocabulary entries:');
        vocabulary.slice(0, 5).forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.l2} → ${item.l1}`);
        });

        // Check if translations are placeholders
        const hasPlaceholders = vocabulary.some(
          (item) => item.l1 && item.l1.includes('[Translation for') && item.l1.includes('needed]')
        );

        if (hasPlaceholders) {
          console.log('❌ CRITICAL ISSUE: Vocabulary contains placeholder translations');
          console.log(
            '   Users will see "[Translation for X needed]" instead of actual translations'
          );
        } else {
          console.log('✅ Vocabulary has actual translations');
        }

        // Test if vocabulary words exist in content
        const contentWords = story.content.toLowerCase();
        let wordsFound = 0;
        let wordsNotFound = [];

        vocabulary.slice(0, 10).forEach((item) => {
          const wordRegex = new RegExp(
            '\\b' + item.l2.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'
          );
          if (wordRegex.test(contentWords)) {
            wordsFound++;
          } else {
            wordsNotFound.push(item.l2);
          }
        });

        console.log(`Words found in content: ${wordsFound}/${Math.min(10, vocabulary.length)}`);
        if (wordsNotFound.length > 0) {
          console.log('Words not found:', wordsNotFound.slice(0, 3).join(', '));
        }

        // Test highlighting simulation
        if (wordsFound > 0) {
          console.log('✅ Word highlighting should work');
        } else {
          console.log('❌ Word highlighting may not work - vocabulary words not found in content');
        }
      } else {
        console.log('❌ No vocabulary data found');
      }

      console.log(''); // Empty line
    }

    // Test library page data
    console.log('=== LIBRARY PAGE TEST ===');
    const allStories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        language: true,
        topic: true,
        wordCount: true,
        summary: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Total stories in library: ${allStories.length}`);

    const spanishStories = allStories.filter((s) => s.language === 'SPANISH');
    const germanStories = allStories.filter((s) => s.language === 'GERMAN');

    console.log(`Spanish stories: ${spanishStories.length}`);
    console.log(`German stories: ${germanStories.length}`);

    // Test search functionality for "Uruguay"
    const uruguayStories = allStories.filter(
      (s) =>
        s.title.toLowerCase().includes('uruguay') ||
        (s.summary && s.summary.toLowerCase().includes('uruguay')) ||
        (s.topic && s.topic.toLowerCase().includes('uruguay'))
    );

    console.log(`Stories containing "Uruguay": ${uruguayStories.length}`);
    uruguayStories.forEach((s) => {
      console.log(`  - ${s.title} (${s.language})`);
    });
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStoryFunctionality();
