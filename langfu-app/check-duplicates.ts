import { prisma } from './src/lib/prisma';

async function checkDuplicates() {
  console.log('=== Investigating Word Duplicates ===\n');

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

  console.log(`Total words in database: ${allWords.length}\n`);

  // Group by unique combination
  const wordMap = new Map<string, typeof allWords>();

  allWords.forEach((word) => {
    const key = `${word.l2}|${word.language}|${word.level}|${word.topic}`;
    if (!wordMap.has(key)) {
      wordMap.set(key, []);
    }
    wordMap.get(key)!.push(word);
  });

  // Find duplicates
  const duplicates: string[] = [];
  let totalDuplicates = 0;

  console.log('=== Duplicate Analysis ===\n');

  wordMap.forEach((words, key) => {
    if (words.length > 1) {
      const [l2, language, level, topic] = key.split('|');
      console.log(`❌ Duplicate: "${l2}" (${language}, ${level}, ${topic || 'no topic'})`);
      console.log(`   Found ${words.length} copies:`);
      words.forEach((w) => {
        console.log(`   - ID: ${w.id}, Created: ${w.createdAt.toISOString()}`);
      });
      console.log();
      totalDuplicates += words.length - 1;

      // Keep track of IDs to delete (keep the oldest one)
      const sortedByDate = words.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      for (let i = 1; i < sortedByDate.length; i++) {
        const word = sortedByDate[i];
        if (word) {
          duplicates.push(word.id);
        }
      }
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`- Total words in DB: ${allWords.length}`);
  console.log(`- Unique words: ${wordMap.size}`);
  console.log(`- Duplicate entries: ${totalDuplicates}`);
  console.log(
    `- Duplicate groups: ${duplicates.length > 0 ? wordMap.size - (allWords.length - totalDuplicates) : 0}`
  );

  // Check by topic
  console.log('\n=== Words by Topic ===\n');
  const byTopic = await prisma.word.groupBy({
    by: ['topic', 'language'],
    _count: true,
    orderBy: { _count: { topic: 'desc' } },
  });

  byTopic.forEach((item) => {
    if (item.topic) {
      console.log(`• ${item.topic} (${item.language}): ${item._count} words`);
    }
  });

  // Get distinct words per topic
  console.log('\n=== Actual Unique Words by Topic ===\n');
  for (const item of byTopic.slice(0, 5)) {
    if (item.topic) {
      const uniqueWords = await prisma.word.findMany({
        where: { topic: item.topic, language: item.language },
        distinct: ['l2'],
        select: { l2: true, l1: true },
      });
      console.log(`\n${item.topic} (${item.language}) - ${uniqueWords.length} unique words:`);
      uniqueWords.slice(0, 5).forEach((w) => {
        console.log(`  • ${w.l2} - ${w.l1}`);
      });
      if (uniqueWords.length > 5) {
        console.log(`  ... and ${uniqueWords.length - 5} more`);
      }
    }
  }

  // Offer to clean duplicates
  if (duplicates.length > 0) {
    console.log('\n=== Cleanup Plan ===');
    console.log(`Would delete ${duplicates.length} duplicate entries`);
    console.log('To clean up, uncomment the deletion code below');

    // Uncomment to actually delete duplicates:
    // console.log('\nDeleting duplicates...');
    // const result = await prisma.word.deleteMany({
    //   where: { id: { in: duplicates } }
    // });
    // console.log(`✅ Deleted ${result.count} duplicate entries`);
  }

  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
