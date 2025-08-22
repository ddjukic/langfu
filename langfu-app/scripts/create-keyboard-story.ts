import { prisma } from '../src/lib/prisma';

async function createKeyboardStory() {
  const userEmail = 'd.dejan.djukic@gmail.com';

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const title = 'Die Suche nach der perfekten Tastatur';
  const topic = 'Technologie und Einkaufen';
  const level = 'A2-B1';
  const language = 'GERMAN';

  // The keywords with translations
  const keywords = [
    { l2: 'Tastatur', l1: 'keyboard', pos: 'noun' },
    { l2: 'Computer', l1: 'computer', pos: 'noun' },
    { l2: 'Geschäft', l1: 'shop/store', pos: 'noun' },
    { l2: 'kaufen', l1: 'to buy', pos: 'verb' },
    { l2: 'teuer', l1: 'expensive', pos: 'adjective' },
    { l2: 'billig', l1: 'cheap', pos: 'adjective' },
    { l2: 'Qualität', l1: 'quality', pos: 'noun' },
    { l2: 'mechanisch', l1: 'mechanical', pos: 'adjective' },
    { l2: 'Schalter', l1: 'switch', pos: 'noun' },
    { l2: 'Beleuchtung', l1: 'lighting/backlight', pos: 'noun' },
    { l2: 'ergonomisch', l1: 'ergonomic', pos: 'adjective' },
    { l2: 'tippen', l1: 'to type', pos: 'verb' },
    { l2: 'Arbeit', l1: 'work', pos: 'noun' },
    { l2: 'Gaming', l1: 'gaming', pos: 'noun' },
    { l2: 'Preis', l1: 'price', pos: 'noun' },
    { l2: 'vergleichen', l1: 'to compare', pos: 'verb' },
    { l2: 'online', l1: 'online', pos: 'adverb' },
    { l2: 'bestellen', l1: 'to order', pos: 'verb' },
    { l2: 'Lieferung', l1: 'delivery', pos: 'noun' },
    { l2: 'zurückgeben', l1: 'to return', pos: 'verb' },
  ];

  const content = `Es war Samstag morgen, und ich brauchte dringend eine neue **Tastatur** für meinen **Computer**. Meine alte Tastatur war kaputt gegangen, nachdem ich versehentlich Kaffee darüber verschüttet hatte. Ich beschloss, zum Elektronik-**Geschäft** in der Stadt zu fahren, um eine neue zu **kaufen**.

Im Geschäft angekommen, war ich überwältigt von der Auswahl. Es gab **billige** Tastaturen für nur 15 Euro und **teure** Gaming-Tastaturen für über 200 Euro. Die Verkäuferin erklärte mir, dass die **Qualität** einen großen Unterschied macht, besonders wenn man viel tippt.

"Diese **mechanische** Tastatur hier ist sehr beliebt", sagte sie und zeigte mir ein schwarzes Modell. "Die **Schalter** sind von Cherry MX, und sie hat eine RGB-**Beleuchtung**, die Sie individuell einstellen können." Die Tastatur fühlte sich beim Tippen fantastisch an, aber der Preis war ziemlich hoch.

Dann zeigte sie mir eine **ergonomische** Alternative. "Diese ist perfekt, wenn Sie viel **tippen** müssen, sei es für die **Arbeit** oder zum Schreiben. Die geteilte Form reduziert die Belastung der Handgelenke." Ich war beeindruckt, aber ich wollte auch etwas, das fürs **Gaming** geeignet war.

Nach einer halben Stunde hatte ich drei Favoriten. Der **Preis** variierte stark zwischen ihnen. Ich beschloss, die Modelle zu **vergleichen**, indem ich auf meinem Handy **online** nach Bewertungen suchte. Interessanterweise fand ich eines der Modelle online für 30 Euro weniger.

"Kann ich diese Tastatur hier **bestellen** und nach Hause liefern lassen?", fragte ich die Verkäuferin. Sie nickte und erklärte mir, dass die **Lieferung** normalerweise zwei bis drei Tage dauert. "Und falls Ihnen die Tastatur nicht gefällt, können Sie sie innerhalb von 14 Tagen **zurückgeben**", fügte sie hinzu.

Am Ende entschied ich mich für die mechanische Tastatur mit den blauen Schaltern. Sie war zwar nicht die billigste Option, aber die Qualität überzeugte mich. Die Beleuchtung war ein nettes Extra für späte Arbeitsstunden, und die Schalter fühlten sich beim Tippen sehr befriedigend an. Ich bestellte sie online mit Lieferung nach Hause und freute mich schon darauf, meine neue Tastatur zu testen.

Drei Tage später kam das Paket an. Die Tastatur war noch besser als erwartet. Das Tippen machte plötzlich richtig Spaß, sowohl bei der Arbeit als auch beim Gaming. Die ergonomische Form half tatsächlich, und die mechanischen Schalter waren eine echte Verbesserung. Ich war froh, dass ich mir die Zeit genommen hatte, verschiedene Modelle zu vergleichen und nicht einfach die billigste Option gewählt hatte. Manchmal lohnt es sich wirklich, in Qualität zu investieren!`;

  const wordCount = content.trim().split(/\s+/).length;
  const summary = content.replace(/\s+/g, ' ').trim().split(' ').slice(0, 10).join(' ');

  // Create the story
  const story = await prisma.story.create({
    data: {
      userId: user.id,
      title,
      topic,
      keywords: keywords as any,
      words: keywords as any,
      content,
      language: language as any,
      level,
      wordCount,
      summary,
      prompt:
        'Eine Geschichte über die Suche nach der perfekten Tastatur, mit vielen Technologie- und Einkaufsvokabeln',
    },
  });

  console.log(`✅ Story created successfully!`);
  console.log(`   ID: ${story.id}`);
  console.log(`   Title: ${story.title}`);
  console.log(`   Word Count: ${story.wordCount}`);
  console.log(`   Keywords: ${keywords.length}`);
  console.log(`   Language: ${story.language}`);
  console.log(`   Level: ${story.level}`);

  return story;
}

createKeyboardStory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating story:', error);
    process.exit(1);
  });
