import { prisma } from './src/lib/prisma';

async function checkPackages() {
  console.log('=== Checking VocabularySets ===\n');
  
  const sets = await prisma.vocabularySet.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  for (const set of sets) {
    console.log(`📦 ${set.name} (ID: ${set.id})`);
    console.log(`   Language: ${set.language}, Public: ${set.isPublic}`);
    console.log(`   Description: ${set.description || 'None'}`);
    console.log(`   Data: ${JSON.stringify(set.data).substring(0, 100)}...`);
    console.log();
  }
  
  console.log('=== Checking Words ===\n');
  
  const words = await prisma.word.findMany({
    where: {
      topic: {
        in: ['Transportation', 'Food and Drinks', 'Weather Basics']
      }
    },
    include: {
      examples: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  const byTopic = words.reduce((acc, word) => {
    if (!acc[word.topic!]) acc[word.topic!] = [];
    acc[word.topic!].push(word);
    return acc;
  }, {} as Record<string, typeof words>);
  
  for (const [topic, topicWords] of Object.entries(byTopic)) {
    console.log(`📚 Topic: ${topic}`);
    console.log(`   Words: ${topicWords.map(w => w.l2).join(', ')}`);
    console.log(`   Level: ${topicWords[0].level}`);
    console.log(`   Total examples: ${topicWords.reduce((sum, w) => sum + w.examples.length, 0)}`);
    console.log();
  }
  
  // Check a specific word with examples
  const sampleWord = words[0];
  if (sampleWord) {
    console.log('=== Sample Word Details ===\n');
    console.log(`Word: ${sampleWord.l2} (${sampleWord.l1})`);
    console.log(`POS: ${sampleWord.pos || 'Not specified'}`);
    console.log('Examples:');
    sampleWord.examples.forEach(ex => {
      console.log(`  - "${ex.sentence}"`);
      console.log(`    → "${ex.translation}"`);
    });
  }
  
  await prisma.$disconnect();
}

checkPackages().catch(console.error);
