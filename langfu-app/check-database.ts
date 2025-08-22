import { prisma } from './src/lib/prisma';

async function checkDatabase() {
  try {
    console.log('=== Checking Words table ===');

    // Get distinct topics for German language
    const germanTopics = await prisma.word.findMany({
      where: {
        language: 'GERMAN',
      },
      select: {
        topic: true,
        level: true,
      },
      distinct: ['topic', 'level'],
    });

    console.log('German topics by level:');
    const topicsByLevel = germanTopics.reduce((acc: any, word) => {
      if (!acc[word.level]) acc[word.level] = new Set();
      acc[word.level].add(word.topic);
      return acc;
    }, {});

    Object.entries(topicsByLevel).forEach(([level, topics]) => {
      console.log(`${level}: ${Array.from(topics as Set<string>).join(', ')}`);
    });

    // Check for specific bicycle-related words
    console.log('\n=== Looking for bicycle-related words ===');
    const bicycleWords = await prisma.word.findMany({
      where: {
        OR: [
          { topic: { contains: 'Fahrr', mode: 'insensitive' } },
          { topic: { contains: 'bicycle', mode: 'insensitive' } },
          { l2: { contains: 'Fahrrad', mode: 'insensitive' } },
          { l2: { contains: 'Rad', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        l2: true,
        l1: true,
        topic: true,
        level: true,
        language: true,
      },
    });

    if (bicycleWords.length > 0) {
      console.log('Found bicycle-related words:');
      bicycleWords.forEach((word) => {
        console.log(`- ${word.l2} (${word.l1}) - ${word.level} ${word.topic}`);
      });
    } else {
      console.log('No bicycle-related words found');
    }

    // Check VocabularySet table
    console.log('\n=== Checking VocabularySet table ===');
    const vocabSets = await prisma.vocabularySet.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        isPublic: true,
      },
    });

    console.log('Vocabulary sets:');
    vocabSets.forEach((set) => {
      console.log(`- ${set.name} (${set.language}) - ${set.description}`);
    });

    // Check for bicycle sets
    const bicycleSets = await prisma.vocabularySet.findMany({
      where: {
        OR: [
          { name: { contains: 'Fahrr', mode: 'insensitive' } },
          { name: { contains: 'bicycle', mode: 'insensitive' } },
        ],
      },
    });

    if (bicycleSets.length > 0) {
      console.log('\nFound bicycle vocabulary sets:');
      bicycleSets.forEach((set) => {
        console.log(`- ${set.name}: ${set.description}`);
      });
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
