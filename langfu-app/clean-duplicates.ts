import { prisma } from './src/lib/prisma';

async function cleanDuplicates() {
  console.log('=== Cleaning Word Duplicates ===\n');

  // Get all words with their IDs
  const allWords = await prisma.word.findMany({
    select: {
      id: true,
      l2: true,
      l1: true,
      language: true,
      level: true,
      topic: true,
      createdAt: true,
    },
    orderBy: [{ l2: 'asc' }, { createdAt: 'asc' }],
  });

  console.log(`Total words before cleanup: ${allWords.length}`);

  // Group by unique combination
  const wordMap = new Map<string, typeof allWords>();

  allWords.forEach((word) => {
    const key = `${word.l2}|${word.language}|${word.level}|${word.topic}`;
    if (!wordMap.has(key)) {
      wordMap.set(key, []);
    }
    wordMap.get(key)!.push(word);
  });

  // Find duplicates to delete (keep the oldest one)
  const duplicatesToDelete: string[] = [];

  wordMap.forEach((words) => {
    if (words.length > 1) {
      // Sort by creation date and keep the oldest
      const sortedByDate = words.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      // Mark all except the first one for deletion
      for (let i = 1; i < sortedByDate.length; i++) {
        const word = sortedByDate[i];
        if (word) {
          duplicatesToDelete.push(word.id);
        }
      }
    }
  });

  console.log(`Found ${duplicatesToDelete.length} duplicate entries to delete`);
  console.log(`Will keep ${wordMap.size} unique words\n`);

  if (duplicatesToDelete.length > 0) {
    console.log('Deleting duplicates...');
    const result = await prisma.word.deleteMany({
      where: { id: { in: duplicatesToDelete } },
    });
    console.log(`✅ Deleted ${result.count} duplicate entries\n`);
  }

  // Verify the cleanup
  const remainingWords = await prisma.word.count();
  console.log(`Total words after cleanup: ${remainingWords}`);

  // Show updated statistics
  console.log('\n=== Updated Statistics ===\n');

  const byTopic = await prisma.word.groupBy({
    by: ['topic', 'language'],
    _count: true,
    orderBy: { _count: { topic: 'desc' } },
    take: 10,
  });

  console.log('Top 10 topics:');
  byTopic.forEach((item) => {
    if (item.topic) {
      console.log(`• ${item.topic} (${item.language}): ${item._count} words`);
    }
  });

  await prisma.$disconnect();
}

cleanDuplicates().catch(console.error);
