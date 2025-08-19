import { PrismaClient, Language } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// German vocabulary data from initial_design.md
const germanVocabulary = {
  A1: {
    'Daily Routines': [
      { de: 'aufstehen', en: 'to get up', pos: 'verb' },
      { de: 'frühstücken', en: 'to have breakfast', pos: 'verb' },
      { de: 'schlafen', en: 'to sleep', pos: 'verb' },
      { de: 'essen', en: 'to eat', pos: 'verb' },
      { de: 'trinken', en: 'to drink', pos: 'verb' },
      { de: 'arbeiten', en: 'to work', pos: 'verb' },
      { de: 'lernen', en: 'to study', pos: 'verb' },
      { de: 'spielen', en: 'to play', pos: 'verb' },
      { de: 'lesen', en: 'to read', pos: 'verb' },
      { de: 'schreiben', en: 'to write', pos: 'verb' },
    ],
    'Numbers & Time': [
      { de: 'eins', en: 'one', pos: 'number' },
      { de: 'zwei', en: 'two', pos: 'number' },
      { de: 'drei', en: 'three', pos: 'number' },
      { de: 'heute', en: 'today', pos: 'adverb' },
      { de: 'morgen', en: 'tomorrow', pos: 'adverb' },
      { de: 'gestern', en: 'yesterday', pos: 'adverb' },
      { de: 'die Woche', en: 'week', pos: 'noun', gender: 'f' },
      { de: 'der Monat', en: 'month', pos: 'noun', gender: 'm' },
      { de: 'das Jahr', en: 'year', pos: 'noun', gender: 'n' },
      { de: 'jetzt', en: 'now', pos: 'adverb' },
    ],
  },
  A2: {
    'Work & Career': [
      { de: 'die Bewerbung', en: 'application', pos: 'noun', gender: 'f' },
      { de: 'der Lebenslauf', en: 'CV/resume', pos: 'noun', gender: 'm' },
      { de: 'das Gehalt', en: 'salary', pos: 'noun', gender: 'n' },
      { de: 'die Pause', en: 'break', pos: 'noun', gender: 'f' },
      { de: 'die Besprechung', en: 'meeting', pos: 'noun', gender: 'f' },
      { de: 'die Aufgabe', en: 'task', pos: 'noun', gender: 'f' },
      { de: 'der Kollege', en: 'colleague', pos: 'noun', gender: 'm' },
      { de: 'die Stelle', en: 'position', pos: 'noun', gender: 'f' },
      { de: 'kündigen', en: 'to quit', pos: 'verb' },
      { de: 'der Chef', en: 'boss', pos: 'noun', gender: 'm' },
    ],
    Travel: [
      { de: 'die Reise', en: 'journey', pos: 'noun', gender: 'f' },
      { de: 'der Koffer', en: 'suitcase', pos: 'noun', gender: 'm' },
      { de: 'der Pass', en: 'passport', pos: 'noun', gender: 'm' },
      { de: 'die Unterkunft', en: 'accommodation', pos: 'noun', gender: 'f' },
      { de: 'buchen', en: 'to book', pos: 'verb' },
      { de: 'ankommen', en: 'to arrive', pos: 'verb' },
      { de: 'abfahren', en: 'to depart', pos: 'verb' },
      { de: 'umsteigen', en: 'to transfer', pos: 'verb' },
      { de: 'das Gepäck', en: 'luggage', pos: 'noun', gender: 'n' },
      { de: 'die Fahrkarte', en: 'ticket', pos: 'noun', gender: 'f' },
    ],
  },
  B1: {
    Environment: [
      { de: 'die Umwelt', en: 'environment', pos: 'noun', gender: 'f' },
      { de: 'der Klimawandel', en: 'climate change', pos: 'noun', gender: 'm' },
      { de: 'nachhaltig', en: 'sustainable', pos: 'adjective' },
      { de: 'recyceln', en: 'to recycle', pos: 'verb' },
      { de: 'die Verschmutzung', en: 'pollution', pos: 'noun', gender: 'f' },
      { de: 'erneuerbar', en: 'renewable', pos: 'adjective' },
      { de: 'der Müll', en: 'waste', pos: 'noun', gender: 'm' },
      { de: 'schützen', en: 'to protect', pos: 'verb' },
      { de: 'verbrauchen', en: 'to consume', pos: 'verb' },
      { de: 'sparen', en: 'to save', pos: 'verb' },
    ],
    Technology: [
      { de: 'herunterladen', en: 'to download', pos: 'verb' },
      { de: 'hochladen', en: 'to upload', pos: 'verb' },
      { de: 'speichern', en: 'to save', pos: 'verb' },
      { de: 'löschen', en: 'to delete', pos: 'verb' },
      { de: 'die Datei', en: 'file', pos: 'noun', gender: 'f' },
      { de: 'das Passwort', en: 'password', pos: 'noun', gender: 'n' },
      { de: 'die Anwendung', en: 'application', pos: 'noun', gender: 'f' },
      { de: 'aktualisieren', en: 'to update', pos: 'verb' },
      { de: 'die Verbindung', en: 'connection', pos: 'noun', gender: 'f' },
      { de: 'der Bildschirm', en: 'screen', pos: 'noun', gender: 'm' },
    ],
  },
  B2: {
    Business: [
      { de: 'die Verhandlung', en: 'negotiation', pos: 'noun', gender: 'f' },
      { de: 'der Vertrag', en: 'contract', pos: 'noun', gender: 'm' },
      { de: 'die Investition', en: 'investment', pos: 'noun', gender: 'f' },
      { de: 'der Gewinn', en: 'profit', pos: 'noun', gender: 'm' },
      { de: 'der Verlust', en: 'loss', pos: 'noun', gender: 'm' },
      { de: 'die Konkurrenz', en: 'competition', pos: 'noun', gender: 'f' },
      { de: 'die Strategie', en: 'strategy', pos: 'noun', gender: 'f' },
      { de: 'erweitern', en: 'to expand', pos: 'verb' },
      { de: 'fusionieren', en: 'to merge', pos: 'verb' },
      { de: 'der Umsatz', en: 'turnover', pos: 'noun', gender: 'm' },
    ],
    Politics: [
      { de: 'die Wahl', en: 'election', pos: 'noun', gender: 'f' },
      { de: 'die Partei', en: 'party', pos: 'noun', gender: 'f' },
      { de: 'die Regierung', en: 'government', pos: 'noun', gender: 'f' },
      { de: 'das Gesetz', en: 'law', pos: 'noun', gender: 'n' },
      { de: 'die Opposition', en: 'opposition', pos: 'noun', gender: 'f' },
      { de: 'die Demokratie', en: 'democracy', pos: 'noun', gender: 'f' },
      { de: 'abstimmen', en: 'to vote', pos: 'verb' },
      { de: 'die Mehrheit', en: 'majority', pos: 'noun', gender: 'f' },
      { de: 'der Bürger', en: 'citizen', pos: 'noun', gender: 'm' },
      { de: 'die Verfassung', en: 'constitution', pos: 'noun', gender: 'f' },
    ],
  },
  C1: {
    Academic: [
      { de: 'die Hypothese', en: 'hypothesis', pos: 'noun', gender: 'f' },
      { de: 'empirisch', en: 'empirical', pos: 'adjective' },
      { de: 'die Methodik', en: 'methodology', pos: 'noun', gender: 'f' },
      { de: 'analysieren', en: 'to analyze', pos: 'verb' },
      { de: 'die Schlussfolgerung', en: 'conclusion', pos: 'noun', gender: 'f' },
      { de: 'die Quelle', en: 'source', pos: 'noun', gender: 'f' },
      { de: 'zitieren', en: 'to cite', pos: 'verb' },
      { de: 'die Forschung', en: 'research', pos: 'noun', gender: 'f' },
      { de: 'belegen', en: 'to prove', pos: 'verb' },
      { de: 'widerlegen', en: 'to refute', pos: 'verb' },
    ],
    'Abstract Concepts': [
      { de: 'die Gerechtigkeit', en: 'justice', pos: 'noun', gender: 'f' },
      { de: 'die Freiheit', en: 'freedom', pos: 'noun', gender: 'f' },
      { de: 'die Verantwortung', en: 'responsibility', pos: 'noun', gender: 'f' },
      { de: 'die Ethik', en: 'ethics', pos: 'noun', gender: 'f' },
      { de: 'das Bewusstsein', en: 'consciousness', pos: 'noun', gender: 'n' },
      { de: 'die Identität', en: 'identity', pos: 'noun', gender: 'f' },
      { de: 'die Wahrnehmung', en: 'perception', pos: 'noun', gender: 'f' },
      { de: 'die Erkenntnis', en: 'insight', pos: 'noun', gender: 'f' },
      { de: 'die Weisheit', en: 'wisdom', pos: 'noun', gender: 'f' },
      { de: 'das Schicksal', en: 'fate', pos: 'noun', gender: 'n' },
    ],
  },
  C2: {
    Idioms: [
      { de: 'ins Fettnäpfchen treten', en: "to put one's foot in it", pos: 'idiom' },
      { de: 'die Katze im Sack kaufen', en: 'to buy a pig in a poke', pos: 'idiom' },
      { de: 'jemandem auf den Zahn fühlen', en: 'to sound someone out', pos: 'idiom' },
      { de: 'die Flinte ins Korn werfen', en: 'to throw in the towel', pos: 'idiom' },
      { de: 'auf Wolke sieben schweben', en: 'to be on cloud nine', pos: 'idiom' },
      { de: 'ins kalte Wasser springen', en: 'to jump in at the deep end', pos: 'idiom' },
      { de: 'den Nagel auf den Kopf treffen', en: 'to hit the nail on the head', pos: 'idiom' },
      { de: 'um den heißen Brei herumreden', en: 'to beat around the bush', pos: 'idiom' },
      { de: 'das Handtuch werfen', en: 'to throw in the towel', pos: 'idiom' },
      { de: 'die Daumen drücken', en: "to keep one's fingers crossed", pos: 'idiom' },
    ],
    Literature: [
      { de: 'die Metapher', en: 'metaphor', pos: 'noun', gender: 'f' },
      { de: 'die Allegorie', en: 'allegory', pos: 'noun', gender: 'f' },
      { de: 'der Protagonist', en: 'protagonist', pos: 'noun', gender: 'm' },
      { de: 'die Ironie', en: 'irony', pos: 'noun', gender: 'f' },
      { de: 'die Satire', en: 'satire', pos: 'noun', gender: 'f' },
      { de: 'das Motiv', en: 'motif', pos: 'noun', gender: 'n' },
      { de: 'die Erzählung', en: 'narrative', pos: 'noun', gender: 'f' },
      { de: 'die Lyrik', en: 'poetry', pos: 'noun', gender: 'f' },
      { de: 'der Epilog', en: 'epilogue', pos: 'noun', gender: 'm' },
      { de: 'die Prosa', en: 'prose', pos: 'noun', gender: 'f' },
    ],
  },
};

// Spanish vocabulary data (sample)
const spanishVocabulary = {
  A1: {
    'Daily Routines': [
      { es: 'levantarse', en: 'to get up', pos: 'verb' },
      { es: 'desayunar', en: 'to have breakfast', pos: 'verb' },
      { es: 'dormir', en: 'to sleep', pos: 'verb' },
      { es: 'comer', en: 'to eat', pos: 'verb' },
      { es: 'beber', en: 'to drink', pos: 'verb' },
      { es: 'trabajar', en: 'to work', pos: 'verb' },
      { es: 'estudiar', en: 'to study', pos: 'verb' },
      { es: 'jugar', en: 'to play', pos: 'verb' },
      { es: 'leer', en: 'to read', pos: 'verb' },
      { es: 'escribir', en: 'to write', pos: 'verb' },
    ],
    'Numbers & Time': [
      { es: 'uno', en: 'one', pos: 'number' },
      { es: 'dos', en: 'two', pos: 'number' },
      { es: 'tres', en: 'three', pos: 'number' },
      { es: 'hoy', en: 'today', pos: 'adverb' },
      { es: 'mañana', en: 'tomorrow', pos: 'adverb' },
      { es: 'ayer', en: 'yesterday', pos: 'adverb' },
      { es: 'la semana', en: 'week', pos: 'noun' },
      { es: 'el mes', en: 'month', pos: 'noun' },
      { es: 'el año', en: 'year', pos: 'noun' },
      { es: 'ahora', en: 'now', pos: 'adverb' },
    ],
  },
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create test user with the provided credentials
  const hashedPassword = await bcrypt.hash('langfu-test', 10);
  const user = await prisma.user.upsert({
    where: { email: 'd.dejan.djukic@gmail.com' },
    update: {},
    create: {
      email: 'd.dejan.djukic@gmail.com',
      password: hashedPassword,
      name: 'Test User',
      currentLanguage: Language.GERMAN,
    },
  });

  console.log('✅ Created test user');

  // Create progress records
  await prisma.progress.upsert({
    where: {
      userId_language: {
        userId: user.id,
        language: Language.GERMAN,
      },
    },
    update: {},
    create: {
      userId: user.id,
      language: Language.GERMAN,
    },
  });

  await prisma.progress.upsert({
    where: {
      userId_language: {
        userId: user.id,
        language: Language.SPANISH,
      },
    },
    update: {},
    create: {
      userId: user.id,
      language: Language.SPANISH,
    },
  });

  console.log('✅ Created progress records');

  // Seed German vocabulary
  for (const [level, topics] of Object.entries(germanVocabulary)) {
    for (const [topic, words] of Object.entries(topics)) {
      for (const wordData of words) {
        await prisma.word.create({
          data: {
            language: Language.GERMAN,
            level,
            topic,
            l2: wordData.de,
            l1: wordData.en,
            pos: wordData.pos,
            gender: (wordData as any).gender || null,
            difficulty:
              level === 'A1'
                ? 1
                : level === 'A2'
                  ? 2
                  : level === 'B1'
                    ? 3
                    : level === 'B2'
                      ? 4
                      : level === 'C1'
                        ? 5
                        : 6,
            frequency: Math.floor(Math.random() * 1000) + 100,
            examples: {
              create: getExampleSentences(wordData.de, wordData.en, Language.GERMAN),
            },
          },
        });
      }
    }
  }

  console.log('✅ Seeded German vocabulary');

  // Seed Spanish vocabulary
  for (const [level, topics] of Object.entries(spanishVocabulary)) {
    for (const [topic, words] of Object.entries(topics)) {
      for (const wordData of words) {
        await prisma.word.create({
          data: {
            language: Language.SPANISH,
            level,
            topic,
            l2: wordData.es,
            l1: wordData.en,
            pos: wordData.pos,
            difficulty: 1,
            frequency: Math.floor(Math.random() * 1000) + 100,
            examples: {
              create: getExampleSentences(wordData.es, wordData.en, Language.SPANISH),
            },
          },
        });
      }
    }
  }

  console.log('✅ Seeded Spanish vocabulary');

  // Create a sample vocabulary set
  await prisma.vocabularySet.create({
    data: {
      name: 'Default German Vocabulary',
      description: 'Complete German vocabulary set from A1 to C2',
      language: Language.GERMAN,
      isPublic: true,
      data: germanVocabulary,
    },
  });

  console.log('✅ Created vocabulary set');
  console.log('🌱 Seed completed successfully!');
}

function getExampleSentences(word: string, translation: string, language: Language) {
  // Pre-generated example sentences for demo purposes
  if (language === Language.GERMAN) {
    if (word === 'aufstehen') {
      return [
        {
          sentence: 'Ich stehe jeden Morgen um 7 Uhr auf.',
          translation: "I get up every morning at 7 o'clock.",
        },
        {
          sentence: 'Wann stehst du am Wochenende auf?',
          translation: 'When do you get up on the weekend?',
        },
      ];
    }
    if (word === 'frühstücken') {
      return [
        {
          sentence: 'Wir frühstücken zusammen in der Küche.',
          translation: 'We have breakfast together in the kitchen.',
        },
        {
          sentence: 'Er frühstückt nie vor der Arbeit.',
          translation: 'He never has breakfast before work.',
        },
      ];
    }
  }

  // Default examples
  return [
    {
      sentence: `Example sentence with ${word}.`,
      translation: `Example sentence with ${translation}.`,
    },
  ];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
