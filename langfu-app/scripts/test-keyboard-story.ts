import { prisma } from '../src/lib/prisma';

async function testKeyboardStory() {
  const userEmail = 'd.dejan.djukic@gmail.com';

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  // Find the keyboard story
  const story = await prisma.story.findFirst({
    where: {
      userId: user.id,
      title: 'Die Suche nach der perfekten Tastatur',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!story) {
    console.error('Keyboard story not found');
    process.exit(1);
  }

  console.log('\n✅ Keyboard Shopping Story Found!');
  console.log('='.repeat(60));
  console.log(`📖 Title: ${story.title}`);
  console.log(`🏷️  Topic: ${story.topic || 'N/A'}`);
  console.log(`📊 Level: ${story.level || 'N/A'}`);
  console.log(`🌍 Language: ${story.language}`);
  console.log(`📝 Word Count: ${story.wordCount}`);
  console.log(`🆔 Story ID: ${story.id}`);
  console.log(`📅 Created: ${story.createdAt.toLocaleString()}`);

  // Check keywords
  const keywords = (story.keywords as any[]) || [];
  console.log(`\n🔤 Keywords (${keywords.length} total):`);
  console.log('-'.repeat(60));

  if (Array.isArray(keywords)) {
    keywords.forEach((keyword, index) => {
      if (typeof keyword === 'object' && keyword.l2) {
        console.log(
          `  ${index + 1}. ${keyword.l2} = ${keyword.l1 || '[no translation]'}${keyword.pos ? ` (${keyword.pos})` : ''}`
        );
      } else if (typeof keyword === 'string') {
        console.log(`  ${index + 1}. ${keyword}`);
      }
    });
  }

  // Show summary
  console.log(`\n📄 Summary:`);
  console.log('-'.repeat(60));
  console.log(story.summary);

  // Show first 200 characters of content
  console.log(`\n📖 Content Preview (first 200 chars):`);
  console.log('-'.repeat(60));
  console.log(story.content.substring(0, 200) + '...');

  // Verify story can be accessed via library
  console.log(`\n🔗 Access the story at:`);
  console.log(`   http://localhost:3000/library/story/${story.id}`);

  // Check if words are properly formatted for display
  const hasProperKeywords =
    keywords.length > 0 && keywords.every((k: any) => typeof k === 'object' && k.l2 && k.l1);

  console.log(`\n✨ Story Quality Check:`);
  console.log(`   - Has keywords: ${keywords.length > 0 ? '✅' : '❌'}`);
  console.log(`   - Keywords have translations: ${hasProperKeywords ? '✅' : '⚠️ Some missing'}`);
  console.log(
    `   - Content length: ${story.content.length > 1000 ? '✅' : '❌'} (${story.content.length} chars)`
  );
  console.log(
    `   - Word count reasonable: ${story.wordCount > 200 ? '✅' : '❌'} (${story.wordCount} words)`
  );

  return story;
}

testKeyboardStory()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error testing story:', error);
    process.exit(1);
  });
