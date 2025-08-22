const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('=== AUTHENTICATION TEST ===\n');

    // Check for the test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'd.dejan.djukic@gmail.com' },
      select: { id: true, email: true, password: true, createdAt: true },
    });

    if (testUser) {
      console.log('✅ Test user found:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Created: ${testUser.createdAt}`);
      console.log(`   Has password: ${testUser.password ? 'Yes' : 'No'}`);

      // Check if user has stories
      const userStories = await prisma.story.findMany({
        where: { userId: testUser.id },
        select: { id: true, title: true, language: true },
      });

      console.log(`   Stories: ${userStories.length}`);
      userStories.forEach((story) => {
        console.log(`     - ${story.title} (${story.language})`);
      });
    } else {
      console.log('❌ Test user not found');
      console.log('   Looking for: d.dejan.djukic@gmail.com');

      // List all users
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true },
      });
      console.log(`   Total users in database: ${allUsers.length}`);
      allUsers.forEach((user) => {
        console.log(`     - ${user.email}`);
      });
    }
  } catch (error) {
    console.error('Auth test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
