import { prisma } from './src/lib/prisma';

async function debugWordCreation() {
  try {
    console.log('=== Searching for Fahrräder words ===');

    // Look for any words with bicycle topic
    const bicycleWords = await prisma.word.findMany({
      where: {
        OR: [
          { topic: 'Fahrräder - Verbessert' },
          { topic: 'Fahrräder' },
          { topic: { contains: 'Fahrr' } },
          { l2: { contains: 'Fahrrad' } },
        ],
      },
      include: {
        examples: true,
      },
    });

    console.log(`Found ${bicycleWords.length} bicycle-related words:`);
    bicycleWords.forEach((word) => {
      console.log(
        `- ${word.l2} (${word.l1}) - ${word.level} ${word.topic} [${word.examples.length} examples]`
      );
    });

    // Check database tables
    console.log('\n=== Database table status ===');

    const wordCount = await prisma.word.count();
    const exampleCount = await prisma.example.count();
    const vocabSetCount = await prisma.vocabularySet.count();

    console.log(`Total words: ${wordCount}`);
    console.log(`Total examples: ${exampleCount}`);
    console.log(`Total vocab sets: ${vocabSetCount}`);

    // Check latest VocabularySet
    console.log('\n=== Latest VocabularySet entries ===');
    const latestSets = await prisma.vocabularySet.findMany({
      orderBy: { id: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        language: true,
        data: true,
      },
    });

    latestSets.forEach((set) => {
      console.log(`${set.name} (${set.language}):`);
      const data = set.data as any[];
      console.log(`  - ${data.length} words in data`);
      if (data.length > 0) {
        console.log(`  - First word: ${data[0].l2} -> ${data[0].l1}`);
        console.log(
          `  - Has examples: ${data[0].examples ? 'Yes (' + data[0].examples.length + ')' : 'No'}`
        );
      }
    });
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWordCreation();
