#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStories() {
  try {
    console.log('🔍 Verifying created football stories...\n');

    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { id: 'cmelob56o000ddffk23ckn4t3' }, // German story
          { id: 'cmelob5bk000fdffkoj0hqap3' }, // Spanish story
        ],
      },
      select: {
        id: true,
        title: true,
        language: true,
        level: true,
        keywords: true,
        wordCount: true,
        content: true,
      },
    });

    stories.forEach((story, index) => {
      console.log(`=== Story ${index + 1}: ${story.title} ===`);
      console.log(`ID: ${story.id}`);
      console.log(`Language: ${story.language}`);
      console.log(`Level: ${story.level}`);
      console.log(`Word Count: ${story.wordCount}`);
      console.log(`Keywords Count: ${story.keywords.length}`);

      console.log('\nFirst 5 keywords:');
      story.keywords.slice(0, 5).forEach((keyword, i) => {
        console.log(
          `  ${i + 1}. ${keyword.l2} → ${keyword.l1} ${keyword.pos ? `(${keyword.pos})` : ''}`
        );
      });

      console.log(`\nContent preview: ${story.content.substring(0, 150)}...`);
      console.log('\n' + '='.repeat(80) + '\n');
    });

    // Test some specific keywords to ensure they have translations
    console.log('🔍 Testing specific keyword translations...');

    const germanStory = stories.find((s) => s.language === 'GERMAN');
    const spanishStory = stories.find((s) => s.language === 'SPANISH');

    if (germanStory) {
      const stadionKeyword = germanStory.keywords.find((k) => k.l2 === 'Stadion');
      const torKeyword = germanStory.keywords.find((k) => k.l2 === 'Tor');
      console.log(`German - Stadion: ${stadionKeyword ? stadionKeyword.l1 : 'not found'}`);
      console.log(`German - Tor: ${torKeyword ? torKeyword.l1 : 'not found'}`);
    }

    if (spanishStory) {
      const estadioKeyword = spanishStory.keywords.find((k) => k.l2 === 'estadio');
      const golKeyword = spanishStory.keywords.find((k) => k.l2 === 'gol');
      console.log(`Spanish - estadio: ${estadioKeyword ? estadioKeyword.l1 : 'not found'}`);
      console.log(`Spanish - gol: ${golKeyword ? golKeyword.l1 : 'not found'}`);
    }
  } catch (error) {
    console.error('❌ Error verifying stories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyStories();
