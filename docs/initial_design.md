import React, { useState, useEffect } from 'react';
import { X, Trophy, Home, ChevronRight, Check, AlertCircle, Upload, Plus } from 'lucide-react';

const GermanMatchingGame = () => {
  // Minimal word database for testing - 2 topics per level, 10 words each
  const defaultWordDatabase = {
    A1: {
      "Daily Routines": [
        { de: "aufstehen", en: "to get up" },
        { de: "frühstücken", en: "to have breakfast" },
        { de: "schlafen", en: "to sleep" },
        { de: "essen", en: "to eat" },
        { de: "trinken", en: "to drink" },
        { de: "arbeiten", en: "to work" },
        { de: "lernen", en: "to study" },
        { de: "spielen", en: "to play" },
        { de: "lesen", en: "to read" },
        { de: "schreiben", en: "to write" }
      ],
      "Numbers & Time": [
        { de: "eins", en: "one" },
        { de: "zwei", en: "two" },
        { de: "drei", en: "three" },
        { de: "heute", en: "today" },
        { de: "morgen", en: "tomorrow" },
        { de: "gestern", en: "yesterday" },
        { de: "die Woche", en: "week" },
        { de: "der Monat", en: "month" },
        { de: "das Jahr", en: "year" },
        { de: "jetzt", en: "now" }
      ]
    },
    A2: {
      "Work & Career": [
        { de: "die Bewerbung", en: "application" },
        { de: "der Lebenslauf", en: "CV/resume" },
        { de: "das Gehalt", en: "salary" },
        { de: "die Pause", en: "break" },
        { de: "die Besprechung", en: "meeting" },
        { de: "die Aufgabe", en: "task" },
        { de: "der Kollege", en: "colleague" },
        { de: "die Stelle", en: "position" },
        { de: "kündigen", en: "to quit" },
        { de: "der Chef", en: "boss" }
      ],
      "Travel": [
        { de: "die Reise", en: "journey" },
        { de: "der Koffer", en: "suitcase" },
        { de: "der Pass", en: "passport" },
        { de: "die Unterkunft", en: "accommodation" },
        { de: "buchen", en: "to book" },
        { de: "ankommen", en: "to arrive" },
        { de: "abfahren", en: "to depart" },
        { de: "umsteigen", en: "to transfer" },
        { de: "das Gepäck", en: "luggage" },
        { de: "die Fahrkarte", en: "ticket" }
      ]
    },
    B1: {
      "Environment": [
        { de: "die Umwelt", en: "environment" },
        { de: "der Klimawandel", en: "climate change" },
        { de: "nachhaltig", en: "sustainable" },
        { de: "recyceln", en: "to recycle" },
        { de: "die Verschmutzung", en: "pollution" },
        { de: "erneuerbar", en: "renewable" },
        { de: "der Müll", en: "waste" },
        { de: "schützen", en: "to protect" },
        { de: "verbrauchen", en: "to consume" },
        { de: "sparen", en: "to save" }
      ],
      "Technology": [
        { de: "herunterladen", en: "to download" },
        { de: "hochladen", en: "to upload" },
        { de: "speichern", en: "to save" },
        { de: "löschen", en: "to delete" },
        { de: "die Datei", en: "file" },
        { de: "das Passwort", en: "password" },
        { de: "die Anwendung", en: "application" },
        { de: "aktualisieren", en: "to update" },
        { de: "die Verbindung", en: "connection" },
        { de: "der Bildschirm", en: "screen" }
      ]
    },
    B2: {
      "Business": [
        { de: "die Verhandlung", en: "negotiation" },
        { de: "der Vertrag", en: "contract" },
        { de: "die Investition", en: "investment" },
        { de: "der Gewinn", en: "profit" },
        { de: "der Verlust", en: "loss" },
        { de: "die Konkurrenz", en: "competition" },
        { de: "die Strategie", en: "strategy" },
        { de: "erweitern", en: "to expand" },
        { de: "fusionieren", en: "to merge" },
        { de: "der Umsatz", en: "turnover" }
      ],
      "Politics": [
        { de: "die Wahl", en: "election" },
        { de: "die Partei", en: "party" },
        { de: "die Regierung", en: "government" },
        { de: "das Gesetz", en: "law" },
        { de: "die Opposition", en: "opposition" },
        { de: "die Demokratie", en: "democracy" },
        { de: "abstimmen", en: "to vote" },
        { de: "die Mehrheit", en: "majority" },
        { de: "der Bürger", en: "citizen" },
        { de: "die Verfassung", en: "constitution" }
      ]
    },
    C1: {
      "Academic": [
        { de: "die Hypothese", en: "hypothesis" },
        { de: "empirisch", en: "empirical" },
        { de: "die Methodik", en: "methodology" },
        { de: "analysieren", en: "to analyze" },
        { de: "die Schlussfolgerung", en: "conclusion" },
        { de: "die Quelle", en: "source" },
        { de: "zitieren", en: "to cite" },
        { de: "die Forschung", en: "research" },
        { de: "belegen", en: "to prove" },
        { de: "widerlegen", en: "to refute" }
      ],
      "Abstract Concepts": [
        { de: "die Gerechtigkeit", en: "justice" },
        { de: "die Freiheit", en: "freedom" },
        { de: "die Verantwortung", en: "responsibility" },
        { de: "die Ethik", en: "ethics" },
        { de: "das Bewusstsein", en: "consciousness" },
        { de: "die Identität", en: "identity" },
        { de: "die Wahrnehmung", en: "perception" },
        { de: "die Erkenntnis", en: "insight" },
        { de: "die Weisheit", en: "wisdom" },
        { de: "das Schicksal", en: "fate" }
      ]
    },
    C2: {
      "Idioms": [
        { de: "ins Fettnäpfchen treten", en: "to put one's foot in it" },
        { de: "die Katze im Sack kaufen", en: "to buy a pig in a poke" },
        { de: "jemandem auf den Zahn fühlen", en: "to sound someone out" },
        { de: "die Flinte ins Korn werfen", en: "to throw in the towel" },
        { de: "auf Wolke sieben schweben", en: "to be on cloud nine" },
        { de: "ins kalte Wasser springen", en: "to jump in at the deep end" },
        { de: "den Nagel auf den Kopf treffen", en: "to hit the nail on the head" },
        { de: "um den heißen Brei herumreden", en: "to beat around the bush" },
        { de: "das Handtuch werfen", en: "to throw in the towel" },
        { de: "die Daumen drücken", en: "to keep one's fingers crossed" }
      ],
      "Literature": [
        { de: "die Metapher", en: "metaphor" },
        { de: "die Allegorie", en: "allegory" },
        { de: "der Protagonist", en: "protagonist" },
        { de: "die Ironie", en: "irony" },
        { de: "die Satire", en: "satire" },
        { de: "das Motiv", en: "motif" },
        { de: "die Erzählung", en: "narrative" },
        { de: "die Lyrik", en: "poetry" },
        { de: "der Epilog", en: "epilogue" },
        { de: "die Prosa", en: "prose" }
      ]
    }
  };

  // State management
  const [wordDatabase, setWordDatabase] = useState(defaultWordDatabase);
  const [screen, setScreen] = useState('menu'); // menu, levelSelect, topicSelect, game, score, custom
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [gameSession, setGameSession] = useState({ level: '', topic: '' }); // Track active game session
  const [currentWords, setCurrentWords] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongAttempts, setWrongAttempts] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [customWords, setCustomWords] = useState('');
  const [showVocabUpload, setShowVocabUpload] = useState(false);
  const [vocabJson, setVocabJson] = useState('');

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Current screen:', screen);
    console.log('Cards count:', cards.length);
    console.log('Current cards:', cards);
  }, [screen, cards]);
  const startGame = () => {
    let words = [];
    
    if (selectedTopic === 'custom') {
      // Parse custom words
      const pairs = customWords.split('\n').filter(line => line.trim());
      words = pairs.map(pair => {
        const [de, en] = pair.split(',').map(s => s.trim().replace(/[()]/g, ''));
        return { de, en };
      });
    } else {
      // Get words from selected topic
      const topicWords = wordDatabase[selectedLevel]?.[selectedTopic] || [];
      
      // Shuffle and select 5 words
      const shuffled = [...topicWords].sort(() => Math.random() - 0.5);
      words = shuffled.slice(0, Math.min(5, shuffled.length));
    }
    
    // Debug log
    console.log('Starting game with words:', words);
    console.log('Level:', selectedLevel, 'Topic:', selectedTopic);
    
    if (words.length === 0) {
      console.error('No words found for this topic!');
      alert('No words found for this topic. Please try another topic or add custom words.');
      setScreen('menu');
      return;
    }
    
    setCurrentWords(words);
    
    // Create card objects
    const gameCards = [];
    words.forEach((word, index) => {
      gameCards.push({
        id: `de-${index}`,
        text: word.de,
        language: 'de',
        pairId: index
      });
      gameCards.push({
        id: `en-${index}`,
        text: word.en,
        language: 'en',
        pairId: index
      });
    });
    
    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    console.log('Created cards:', shuffledCards);
    setCards(shuffledCards);
    setMatchedPairs([]);
    setSelectedCard(null);
    setWrongAttempts([]);
    setScreen('game');
  };

  // Handle card click
  const handleCardClick = (card) => {
    // If card is already matched, ignore
    if (matchedPairs.includes(card.pairId)) return;
    
    // If no card selected yet
    if (!selectedCard) {
      // Must select German word first
      if (card.language === 'de') {
        setSelectedCard(card);
      } else {
        // Show brief error animation
        setWrongAttempts([card.id]);
        setTimeout(() => setWrongAttempts([]), 500);
      }
      return;
    }
    
    // If same card clicked again, deselect
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }
    
    // If second card is also German, switch selection
    if (card.language === 'de') {
      setSelectedCard(card);
      return;
    }
    
    // Check if it's a match
    setTotalAttempts(totalAttempts + 1);
    
    if (selectedCard.pairId === card.pairId) {
      // Correct match!
      setMatchedPairs([...matchedPairs, card.pairId]);
      setScore(score + 10);
      setCorrectMatches(correctMatches + 1);
      setSelectedCard(null);
      
      // Check if round complete
      if (matchedPairs.length + 1 === currentWords.length) {
        setTimeout(() => {
          nextRound();
        }, 1000);
      }
    } else {
      // Wrong match
      setWrongAttempts([selectedCard.id, card.id]);
      setTimeout(() => {
        setWrongAttempts([]);
        setSelectedCard(null);
      }, 600);
    }
  };

  // Next round
  const nextRound = () => {
    setRound(round + 1);
    startGame(selectedLevel, selectedTopic);
  };

  // Quit game
  const quitGame = () => {
    setScreen('score');
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setRound(1);
    setTotalAttempts(0);
    setCorrectMatches(0);
    setMatchedPairs([]);
    setSelectedCard(null);
    setWrongAttempts([]);
    setScreen('menu');
  };

  // Load vocabulary from JSON
  const loadVocabulary = () => {
    try {
      const parsed = JSON.parse(vocabJson);
      setWordDatabase(parsed);
      setShowVocabUpload(false);
      setVocabJson('');
      alert('Vocabulary loaded successfully!');
    } catch (error) {
      alert('Invalid JSON format. Please check the schema documentation.');
    }
  };

  // Render different screens
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-2">Deutsch Match</h1>
          <p className="text-gray-600 text-center mb-8">Master German vocabulary through matching pairs</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setScreen('levelSelect')}
              className="w-full py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Start Learning
            </button>
            
            <button
              onClick={() => setScreen('custom')}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Custom Words
            </button>
            
            <button
              onClick={() => setShowVocabUpload(true)}
              className="w-full py-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Load Vocabulary
            </button>
          </div>
          
          {showVocabUpload && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">Load Vocabulary JSON</h3>
              <textarea
                value={vocabJson}
                onChange={(e) => setVocabJson(e.target.value)}
                placeholder="Paste your vocabulary JSON here..."
                className="w-full h-32 p-2 border rounded-lg text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={loadVocabulary}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Load
                </button>
                <button
                  onClick={() => {
                    setShowVocabUpload(false);
                    setVocabJson('');
                  }}
                  className="flex-1 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  JSON Schema Documentation
                </summary>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
{`{
  "A1": {
    "Topic Name": [
      { "de": "german", "en": "english" },
      ...
    ]
  },
  "A2": { ... },
  "B1": { ... },
  "B2": { ... },
  "C1": { ... },
  "C2": { ... }
}`}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'levelSelect') {
    const levels = Object.keys(wordDatabase);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setScreen('menu')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          
          <h2 className="text-3xl font-bold text-center mb-6">Select Your Level</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setScreen('topicSelect');
                }}
                className="py-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold text-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'topicSelect') {
    const topics = Object.keys(wordDatabase[selectedLevel] || {});
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setScreen('levelSelect')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          
          <h2 className="text-3xl font-bold text-center mb-2">Level {selectedLevel}</h2>
          <p className="text-gray-600 text-center mb-6">Choose a topic</p>
          
          <div className="space-y-3">
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  startGame(selectedLevel, topic);
                }}
                className="w-full py-4 bg-white border-2 border-purple-400 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'custom') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setScreen('menu')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          
          <h2 className="text-3xl font-bold text-center mb-6">Custom Words</h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Enter word pairs in format: (german, english)
            <br />One pair per line
          </p>
          
          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="(Haus, house)
(Katze, cat)
(Hund, dog)
(Baum, tree)
(Wasser, water)"
            className="w-full h-48 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none"
          />
          
          <button
            onClick={() => {
              if (customWords.trim()) {
                setSelectedTopic('custom');
                startGame(null, 'custom');
              }
            }}
            className="w-full mt-4 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between bg-white/20 backdrop-blur rounded-full px-6 py-3">
            <button
              onClick={quitGame}
              className="text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-6 text-white">
              <span className="font-semibold">Round {round}</span>
              <span className="font-semibold">Score: {score}</span>
            </div>
            
            <div className="w-6 h-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Game instruction */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Tap the matching pairs</h2>
          <p className="text-white/80">Select German word first, then its English translation</p>
        </div>

        {/* Cards grid */}
        <div className="max-w-2xl mx-auto">
          {cards.length === 0 ? (
            <div className="text-white text-center">
              <p>Loading cards...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {cards.map(card => {
                const isMatched = matchedPairs.includes(card.pairId);
                const isSelected = selectedCard?.id === card.id;
                const isWrong = wrongAttempts.includes(card.id);
                
                return (
                  <button
                    key={card.id}
                    onClick={() => !isMatched && handleCardClick(card)}
                    className={`
                      relative py-6 px-4 rounded-2xl font-medium text-lg transition-all transform shadow-lg
                      ${isMatched ? 'opacity-0 pointer-events-none scale-95' : ''}
                      ${isSelected ? 'bg-purple-200 border-4 border-purple-600 scale-105 text-purple-900' : 'bg-white text-gray-800 hover:scale-105'}
                      ${isWrong ? 'animate-pulse bg-red-100 border-2 border-red-400' : ''}
                      ${!isMatched && !isSelected && !isWrong ? 'hover:bg-gray-50 hover:shadow-xl' : ''}
                    `}
                    style={{
                      transition: isMatched ? 'all 0.5s ease-out' : 'all 0.2s ease',
                      boxShadow: isMatched ? '0 0 20px rgba(34, 197, 94, 0.5)' : isWrong ? '0 0 15px rgba(239, 68, 68, 0.5)' : '',
                    }}
                  >
                    <span className="block">{card.text}</span>
                    {card.language === 'de' && (
                      <span className="absolute top-2 right-2 text-xs text-gray-400 font-normal">DE</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'score') {
    const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Final Score</span>
              <span className="font-bold text-xl">{score}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Rounds Played</span>
              <span className="font-bold">{round}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Accuracy</span>
              <span className="font-bold">{accuracy}%</span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Correct Matches</span>
              <span className="font-bold">{correctMatches}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Menu
            </button>
            
            <button
              onClick={() => {
                setRound(1);
                setScore(0);
                setTotalAttempts(0);
                setCorrectMatches(0);
                startGame(selectedLevel, selectedTopic);
              }}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GermanMatchingGame;