import { prisma } from './src/lib/prisma';

async function checkStory() {
  const story = await prisma.story.findFirst({
    where: { title: 'Test Story - Office Meeting' },
    select: { content: true, keywords: true, words: true },
  });

  console.log('Content:', story?.content);
  console.log('\nKeywords:', JSON.stringify(story?.keywords, null, 2));
  console.log('\nWords:', JSON.stringify(story?.words, null, 2));

  await prisma.$disconnect();
}

checkStory().catch(console.error);
