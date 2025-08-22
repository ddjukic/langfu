const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugWordMatching() {
  try {
    console.log('=== WORD MATCHING DEBUG ===\n');

    const story = await prisma.story.findUnique({
      where: { id: 'cmelonq6a000ldffkhxvz30r6' }, // Spanish story
      select: { title: true, content: true, keywords: true },
    });

    if (!story) {
      console.log('Story not found');
      return;
    }

    console.log(`Story: ${story.title}`);
    console.log(`Content preview: ${story.content.substring(0, 200)}...`);
    console.log(`Content length: ${story.content.length}`);

    const vocabulary = story.keywords;
    console.log(`Vocabulary entries: ${vocabulary.length}`);

    console.log('\nFirst 10 vocabulary words:');
    vocabulary.slice(0, 10).forEach((word, i) => {
      console.log(`${i + 1}. "${word.l2}" → "${word.l1}"`);
    });

    console.log('\nContent words (first 50 unique words):');
    const contentWords = story.content.toLowerCase().match(/\\b[a-záéíóúüñ]+\\b/gi) || [];
    const uniqueWords = [...new Set(contentWords)].slice(0, 50);
    console.log(uniqueWords.join(', '));

    console.log('\nWord matching analysis:');
    vocabulary.slice(0, 10).forEach((word, i) => {
      const searchWord = word.l2.toLowerCase();
      const contentLower = story.content.toLowerCase();

      // Simple includes check
      const simpleMatch = contentLower.includes(searchWord);

      // Word boundary check
      const wordBoundaryRegex = new RegExp(
        '\\\\b' + searchWord.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\b',
        'i'
      );
      const boundaryMatch = wordBoundaryRegex.test(story.content);

      console.log(`${i + 1}. "${word.l2}"`);
      console.log(`   Simple includes: ${simpleMatch}`);
      console.log(`   Word boundary: ${boundaryMatch}`);

      if (simpleMatch) {
        // Find where it appears
        const index = contentLower.indexOf(searchWord);
        const context = story.content.substring(
          Math.max(0, index - 20),
          index + searchWord.length + 20
        );
        console.log(`   Context: "...${context}..."`);
      }
      console.log();
    });
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWordMatching();
