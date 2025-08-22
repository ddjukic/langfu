import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function summary() {
  try {
    console.log('\n📊 Database Summary\n' + '='.repeat(50));

    // Users
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        currentLanguage: true,
        createdAt: true,
      },
    });

    console.log('\n👤 Users:', userCount);
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Language: ${user.currentLanguage}`);
      console.log(`     Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Vocabulary
    const germanWords = await prisma.word.count({
      where: { language: 'GERMAN' },
    });
    const spanishWords = await prisma.word.count({
      where: { language: 'SPANISH' },
    });

    console.log('\n📚 Vocabulary:');
    console.log(`   German words: ${germanWords}`);
    console.log(`   Spanish words: ${spanishWords}`);
    console.log(`   Total words: ${germanWords + spanishWords}`);

    // Levels distribution
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    console.log('\n📈 German Words by Level:');
    for (const level of levels) {
      const count = await prisma.word.count({
        where: {
          language: 'GERMAN',
          level: level,
        },
      });
      console.log(`   ${level}: ${count} words`);
    }

    // Topics
    const topics = await prisma.word.findMany({
      where: { language: 'GERMAN' },
      select: { topic: true },
      distinct: ['topic'],
    });

    console.log('\n🏷️  Topics:', topics.length);
    topics.forEach((topic) => {
      console.log(`   - ${topic.topic}`);
    });

    // Vocabulary Sets
    const vocabSets = await prisma.vocabularySet.findMany({
      select: {
        name: true,
        language: true,
        isPublic: true,
      },
    });

    console.log('\n📦 Vocabulary Sets:', vocabSets.length);
    vocabSets.forEach((set) => {
      console.log(`   - ${set.name} (${set.language}) ${set.isPublic ? '[Public]' : '[Private]'}`);
    });

    // Progress
    const progress = await prisma.progress.count();
    console.log('\n📊 Progress Records:', progress);

    // Examples
    const examplesCount = await prisma.example.count();
    console.log('\n💬 Example Sentences:', examplesCount);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database is fully populated and ready for testing!');
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: d.dejan.djukic@gmail.com');
    console.log('   Password: langfu-test');
    console.log('\n🚀 Start the app with: pnpm dev');
    console.log('   Then visit: http://localhost:3000');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('Error generating summary:', error);
  } finally {
    await prisma.$disconnect();
  }
}

summary();
