import { prisma } from './src/lib/prisma';

async function checkVocabSets() {
  try {
    console.log('=== Checking Fahrräder VocabularySet ===');

    const fahrradSet = await prisma.vocabularySet.findFirst({
      where: {
        name: 'Fahrräder',
      },
    });

    if (fahrradSet) {
      console.log('Found Fahrräder set:');
      console.log(`- ID: ${fahrradSet.id}`);
      console.log(`- Name: ${fahrradSet.name}`);
      console.log(`- Language: ${fahrradSet.language}`);
      console.log(`- Description: ${fahrradSet.description}`);
      console.log(`- Data:`);
      console.log(JSON.stringify(fahrradSet.data, null, 2));
    } else {
      console.log('Fahrräder set not found');
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVocabSets();
