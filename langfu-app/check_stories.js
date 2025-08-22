const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStories() {
  try {
    const stories = await prisma.story.findMany({
      select: { id: true, title: true, language: true, keywords: true, words: true, content: true },
    });

    console.log('=== STORY DATABASE ANALYSIS ===');
    console.log('Total stories found:', stories.length);

    stories.forEach((story, i) => {
      console.log('\n--- Story', i + 1, '---');
      console.log('ID:', story.id);
      console.log('Title:', story.title);
      console.log('Language:', story.language);
      console.log('Keywords type:', typeof story.keywords, story.keywords ? 'exists' : 'null');
      console.log('Words type:', typeof story.words, story.words ? 'exists' : 'null');
      console.log('Content preview:', story.content?.substring(0, 150) + '...');

      // Check if we can parse keywords/words
      if (story.keywords && typeof story.keywords === 'string') {
        try {
          const parsed = JSON.parse(story.keywords);
          console.log(
            'Keywords parsed successfully, length:',
            Array.isArray(parsed) ? parsed.length : 'not array'
          );
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('First keyword sample:', JSON.stringify(parsed[0]));
          }
        } catch (e) {
          console.log('Keywords parse error:', e.message);
        }
      } else if (story.keywords) {
        console.log('Keywords is object, type:', typeof story.keywords);
        console.log('Keywords value:', JSON.stringify(story.keywords));
      }

      if (story.words && typeof story.words === 'string') {
        try {
          const parsed = JSON.parse(story.words);
          console.log(
            'Words parsed successfully, length:',
            Array.isArray(parsed) ? parsed.length : 'not array'
          );
        } catch (e) {
          console.log('Words parse error:', e.message);
        }
      } else if (story.words) {
        console.log('Words is object, type:', typeof story.words);
        console.log('Words value:', JSON.stringify(story.words));
      }
    });
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStories();
