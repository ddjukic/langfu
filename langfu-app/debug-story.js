const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    const story = await prisma.story.findUnique({
      where: { id: 'cmelonq6a000ldffkhxvz30r6' },
      select: {
        id: true,
        title: true,
        language: true,
        keywords: true,
        words: true,
        content: true,
      },
    });

    if (!story) {
      console.log('❌ Story not found');
      return;
    }

    console.log('✅ Story found:');
    console.log('Title:', story.title);
    console.log('Language:', story.language);
    console.log('Content length:', story.content?.length || 0);
    console.log('Keywords type:', typeof story.keywords);
    console.log('Keywords:', story.keywords);
    console.log('Words type:', typeof story.words);
    console.log('Words:', story.words);

    // Try to parse keywords
    if (story.keywords) {
      if (typeof story.keywords === 'string') {
        try {
          const parsedKeywords = JSON.parse(story.keywords);
          console.log('Parsed keywords:', parsedKeywords);
          console.log('Keywords count:', parsedKeywords.length);
        } catch (e) {
          console.log('❌ Failed to parse keywords:', e.message);
        }
      }
    }

    // Try to parse words
    if (story.words) {
      if (typeof story.words === 'string') {
        try {
          const parsedWords = JSON.parse(story.words);
          console.log('Parsed words:', parsedWords);
          console.log('Words count:', parsedWords.length);
        } catch (e) {
          console.log('❌ Failed to parse words:', e.message);
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
