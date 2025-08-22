#!/usr/bin/env node

const http = require('http');

// Function to make HTTP request
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3040,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Parse error', data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Initialize MCP connection
async function initializeMcp() {
  const initData = {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    },
    id: 1,
  };

  return await makeRequest(initData);
}

// Create German football story
async function createGermanStory() {
  const germanKeywords = [
    'Stadion',
    'Mannschaft',
    'Spieler',
    'Tor',
    'Ball',
    'Fans',
    'jubeln',
    'Halbzeit',
    'Angriff',
    'Abwehr',
    'Schiedsrichter',
    'Elfmeter',
    'Ecke',
    'Abseits',
    'Karte',
    'Trainer',
    'Wechsel',
    'Verlängerung',
    'Sieg',
    'Niederlage',
    'Unentschieden',
    'Torwart',
    'Stürmer',
    'Mittelfeld',
    'Verteidiger',
    'Kapitän',
    'Foul',
    'Freistoß',
    'Derby',
    'Rivalität',
    'Pokal',
    'Meisterschaft',
    'Liga',
  ];

  const germanContent = `Das große Derby zwischen Uruguay und Argentinien

Das Estadio Centenario in Montevideo ist heute Abend das Zentrum des südamerikanischen Fußballs. Die Mannschaft aus Uruguay empfängt die argentinischen Nachbarn zu einem historischen Derby. 

Die Fans beider Teams haben das Stadion bereits Stunden vor dem Anpfiff gefüllt. Die uruguayischen Anhänger jubeln lautstark für ihre Mannschaft, während die argentinischen Supporters ihre Fahnen schwenken.

Der Schiedsrichter pfeift das Spiel an. In der ersten Halbzeit entwickelt sich ein intensives Duell zwischen beiden Teams. Der uruguayische Torwart macht mehrere spektakuläre Paraden, während der argentinische Kapitän das Spiel im Mittelfeld dirigiert.

Nach 25 Minuten fällt das erste Tor! Ein uruguayischer Stürmer nutzt einen Fehler der argentinischen Abwehr und schießt den Ball ins Netz. Die Fans rasten aus vor Freude.

Doch die Argentinier geben nicht auf. Kurz vor der Halbzeit erhält ihr bester Spieler einen Elfmeter nach einem Foul im Strafraum. Er verwandelt sicher - Unentschieden zur Pause.

In der zweiten Halbzeit wird das Spiel noch intensiver. Der Trainer wechselt zwei Spieler aus, um frische Kräfte zu bringen. Die Verteidiger kämpfen um jeden Ball, während die Angriffe immer gefährlicher werden.

Ein Freistoß in der 78. Minute bringt die Entscheidung. Der argentinische Spieler zielt perfekt und erzielt das Siegtor. Die Pokal-Qualifikation für Argentina ist damit einen Schritt näher gerückt.

Nach 90 Minuten plus Verlängerung endet dieses Derby mit einem knappen 2:1-Sieg für Argentinien. Ein wahres Fußballfest in der Liga der Besten!`;

  const createStoryData = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'create_story',
      arguments: {
        userEmail: 'd.dejan.djukic@gmail.com',
        title: 'Das große Derby: Uruguay gegen Argentinien',
        topic: 'Fußballspiel Uruguay gegen Argentinien',
        keywords: germanKeywords,
        content: germanContent,
        language: 'GERMAN',
        level: 'B1',
      },
    },
    id: 2,
  };

  return await makeRequest(createStoryData);
}

// Create Spanish football story
async function createSpanishStory() {
  const spanishKeywords = [
    'estadio',
    'jugadores',
    'equipo',
    'gol',
    'pelota',
    'hinchada',
    'gritar',
    'tiempo',
    'ataque',
    'defensa',
    'árbitro',
    'penal',
    'córner',
    'offside',
    'tarjeta',
    'técnico',
    'cambio',
    'alargue',
    'victoria',
    'derrota',
    'empate',
    'arquero',
    'delantero',
    'mediocampo',
    'defensor',
    'capitán',
    'falta',
    'tiro libre',
    'clásico',
    'rivalidad',
    'copa',
    'campeonato',
    'liga',
  ];

  const spanishContent = `El Clásico del Río de la Plata: Argentina vs Uruguay

El mítico Estadio Monumental de Buenos Aires se viste de gala esta noche para recibir el clásico más esperado del fútbol sudamericano. Los jugadores de Argentina se enfrentan al histórico rival uruguayo en un partido que promete emociones fuertes.

La hinchada argentina llena las tribunas con sus cánticos tradicionales, mientras que los valientes seguidores uruguayos hacen escuchar su voz desde la tribuna visitante. El ambiente es electrizante.

El árbitro da inicio al encuentro y desde los primeros minutos se nota la intensidad del clásico. El equipo argentino domina la pelota en el mediocampo, pero la defensa uruguaya se mantiene firme y organizada.

A los 15 minutos, un córner para Argentina genera peligro. El capitán albiceleste cabecea fuerte, pero el arquero uruguayo realiza una atajada extraordinaria que mantiene el arco en cero.

El tiempo transcurre y en los 35 minutos llega la jugada del partido. Un delantero uruguayo aprovecha un error en la salida del arquero argentino y define con clase: ¡Gol de Uruguay! La hinchada celeste explota de alegría.

Tras el descanso, el técnico argentino decide hacer dos cambios tácticos. Los nuevos jugadores aportan velocidad al ataque y presionan constantemente la defensa rival.

En el minuto 72, tras una falta cerca del área, Argentina consigue el empate. El tiro libre es ejecutado magistralmente y la pelota se cuela en el ángulo superior. El estadio tiembla con los gritos de los hinchas.

El alargue trae más emociones. Una tarjeta amarilla, varios córners y finalmente, en el minuto 89, el gol de la victoria para Argentina. El clásico termina 2-1 en un partido memorable para la copa regional.

¡Qué partido tan increíble en esta liga de campeones sudamericana!`;

  const createStoryData = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'create_story',
      arguments: {
        userEmail: 'd.dejan.djukic@gmail.com',
        title: 'El Clásico del Río de la Plata: Argentina vs Uruguay',
        topic: 'Partido de fútbol Uruguay contra Argentina',
        keywords: spanishKeywords,
        content: spanishContent,
        language: 'SPANISH',
        level: 'B1',
      },
    },
    id: 3,
  };

  return await makeRequest(createStoryData);
}

// Get existing stories to check for cleanup
async function getStories() {
  const getStoriesData = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get_stories',
      arguments: {
        userEmail: 'd.dejan.djukic@gmail.com',
      },
    },
    id: 4,
  };

  return await makeRequest(getStoriesData);
}

// Delete story by ID
async function deleteStory(storyId) {
  const deleteData = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'delete_story',
      arguments: {
        userEmail: 'd.dejan.djukic@gmail.com',
        storyId: storyId,
      },
    },
    id: 5,
  };

  return await makeRequest(deleteData);
}

async function main() {
  try {
    console.log('🏈 Starting Football Story Creation...\n');

    // Initialize MCP
    console.log('1. Initializing MCP connection...');
    const initResult = await initializeMcp();
    console.log('Init result:', JSON.stringify(initResult, null, 2));

    // Check existing stories (if get_stories tool exists)
    console.log('\n2. Checking existing stories...');
    try {
      const existingStories = await getStories();
      console.log('Existing stories:', JSON.stringify(existingStories, null, 2));

      // If there are football stories, delete them
      if (existingStories.result && existingStories.result.content) {
        const storiesText = existingStories.result.content[0].text;
        // Try to parse and find football stories to delete
        // This is a simplified approach - in a real scenario you'd parse properly
        console.log('Found existing stories, proceeding to create new ones...');
      }
    } catch (error) {
      console.log('Could not get existing stories (tool might not exist):', error.message);
    }

    // Create German story
    console.log('\n3. Creating German football story...');
    const germanResult = await createGermanStory();
    console.log('German story result:', JSON.stringify(germanResult, null, 2));

    if (germanResult.result) {
      const germanStoryId = germanResult.result.content[0].text;
      console.log(`✅ German story created with ID: ${germanStoryId}`);
    } else {
      console.log('❌ Failed to create German story');
    }

    // Create Spanish story
    console.log('\n4. Creating Spanish football story...');
    const spanishResult = await createSpanishStory();
    console.log('Spanish story result:', JSON.stringify(spanishResult, null, 2));

    if (spanishResult.result) {
      const spanishStoryId = spanishResult.result.content[0].text;
      console.log(`✅ Spanish story created with ID: ${spanishStoryId}`);
    } else {
      console.log('❌ Failed to create Spanish story');
    }

    console.log('\n🎉 Story creation process completed!');
  } catch (error) {
    console.error('Error during story creation:', error);
  }
}

main();
