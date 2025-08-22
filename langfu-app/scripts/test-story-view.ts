// Test script to verify story interactive functionality
import { prisma } from '../src/lib/prisma';

async function testStoryView() {
  console.log('Testing story interactive view...');

  // Find a story with keywords/words
  const story = await prisma.story.findFirst({
    select: {
      id: true,
      title: true,
      keywords: true,
      words: true,
      language: true,
    },
  });

  if (story) {
    console.log('\n✅ Found story with vocabulary:');
    console.log(`   ID: ${story.id}`);
    console.log(`   Title: ${story.title}`);
    console.log(`   Language: ${story.language}`);

    // Parse keywords/words
    let keywords: any[] = [];
    if (story.keywords) {
      try {
        keywords = typeof story.keywords === 'string' ? JSON.parse(story.keywords) : story.keywords;
      } catch {}
    }
    if (keywords.length === 0 && story.words) {
      try {
        keywords = typeof story.words === 'string' ? JSON.parse(story.words) : story.words;
      } catch {}
    }

    console.log(`   Vocabulary count: ${keywords.length} words`);
    if (keywords.length > 0) {
      console.log(
        `   Sample words: ${keywords
          .slice(0, 3)
          .map((k: any) => k.l2)
          .join(', ')}`
      );
    }

    console.log(`\n📌 Visit: http://localhost:3010/library/story/${story.id}`);
    console.log('   - Keywords should be highlighted in purple');
    console.log('   - Hover over keywords to see translations');
    console.log('   - Click "Practice Words" to start learning session');
  } else {
    console.log('\n⚠️ No stories with vocabulary found in database.');
    console.log('   Create a story using Topic Mode first.');
  }

  await prisma.$disconnect();
}

testStoryView().catch(console.error);
