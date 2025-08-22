import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    // Check if test user exists
    const user = await prisma.user.findUnique({
      where: { email: 'd.dejan.djukic@gmail.com' },
    });

    if (user) {
      console.log('✅ Test user found:', user.email);
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Language:', user.currentLanguage);
    } else {
      console.log('❌ Test user NOT found');
    }

    // Check progress records
    const progress = await prisma.progress.findMany({
      where: { userId: user?.id },
    });
    console.log('✅ Progress records:', progress.length);

    // Check German words
    const germanWords = await prisma.word.count({
      where: { language: 'GERMAN' },
    });
    console.log('✅ German words:', germanWords);

    // Check Spanish words
    const spanishWords = await prisma.word.count({
      where: { language: 'SPANISH' },
    });
    console.log('✅ Spanish words:', spanishWords);

    // Check vocabulary sets
    const vocabSets = await prisma.vocabularySet.count();
    console.log('✅ Vocabulary sets:', vocabSets);

    // Sample some words
    const sampleWords = await prisma.word.findMany({
      take: 5,
      include: {
        examples: true,
      },
    });
    console.log('\n📚 Sample words:');
    sampleWords.forEach((word) => {
      console.log(`  - ${word.l2} (${word.l1}) - Level: ${word.level}, Topic: ${word.topic}`);
    });
  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
