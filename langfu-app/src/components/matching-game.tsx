'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowLeft } from 'lucide-react';

interface Word {
  id: string;
  l2: string;
  l1: string;
  pos?: string;
  gender?: string;
}

interface MatchingGameProps {
  words: Word[];
  language: 'GERMAN' | 'SPANISH';
  onComplete: (score: number, correctMatches: number, totalAttempts: number) => void;
  onQuit: () => void;
}

export default function MatchingGame({ words, language, onComplete, onQuit }: MatchingGameProps) {
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);

  const startRound = () => {
    // Deduplicate words before selecting to avoid duplicate pairs
    const deduplicateWords = (words: Word[]) => {
      const seen = new Set();
      return words.filter((word) => {
        const key = `${word.l2.toLowerCase()}-${word.l1.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Deduplicate and then select 5 random words
    const deduplicated = deduplicateWords(words);
    const shuffled = [...deduplicated].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));
    setCurrentWords(selected);

    // Create card objects - organized with l2 (foreign) on left, l1 (English) on right
    const l2Cards: any[] = [];
    const l1Cards: any[] = [];

    selected.forEach((word, index) => {
      l2Cards.push({
        id: `l2-${index}`,
        text: word.l2,
        language: 'l2',
        pairId: index,
        wordId: word.id,
      });
      l1Cards.push({
        id: `l1-${index}`,
        text: word.l1,
        language: 'l1',
        pairId: index,
        wordId: word.id,
      });
    });

    // Shuffle each column separately
    const shuffledL2 = l2Cards.sort(() => Math.random() - 0.5);
    const shuffledL1 = l1Cards.sort(() => Math.random() - 0.5);

    // Combine into organized layout (will be displayed in 2 columns)
    setCards([...shuffledL2, ...shuffledL1]);
    setMatchedPairs([]);
    setSelectedCard(null);
    setWrongAttempts([]);
  };

  useEffect(() => {
    startRound();
  }, [words]);

  const handleCardClick = (card: any) => {
    // If card is already matched, ignore
    if (matchedPairs.includes(card.pairId)) return;

    // If no card selected yet, select this one
    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    // If same card clicked again, deselect
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // If clicking a card of the same language type, switch selection
    if (selectedCard.language === card.language) {
      setSelectedCard(card);
      return;
    }

    // Check if it's a match (cards are from different languages)
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
          if (round < 3) {
            // Continue to next round
            setRound(round + 1);
            startRound();
          } else {
            // Game complete
            onComplete(score + 10, correctMatches + 1, totalAttempts + 1);
          }
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

  const getLanguageLabel = () => {
    if (language === 'GERMAN') return 'DE';
    if (language === 'SPANISH') return 'ES';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center justify-between">
          <button onClick={onQuit} className="text-white hover:text-white/80">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Matching Game</h1>
            <p className="text-white/80 text-sm">
              Round {round}/3 • Score: {score}
            </p>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>

        {/* Game instruction */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Tap the matching pairs</h2>
          <p className="text-white/80">
            Match {language === 'GERMAN' ? 'German' : 'Spanish'} words with their English
            translations
          </p>
        </div>

        {/* Cards grid */}
        {cards.length === 0 ? (
          <div className="text-white text-center">
            <p>Loading cards...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8">
            {/* Left column - Foreign words */}
            <div className="space-y-3">
              <div className="text-center text-white font-semibold mb-3 bg-white/20 dark:bg-black/20 rounded-lg py-2 transition-colors duration-200">
                {language === 'GERMAN' ? 'German' : 'Spanish'}
              </div>
              {cards.slice(0, currentWords.length).map((card) => {
                const isMatched = matchedPairs.includes(card.pairId);
                const isSelected = selectedCard?.id === card.id;
                const isWrong = wrongAttempts.includes(card.id);

                return (
                  <button
                    key={card.id}
                    onClick={() => !isMatched && handleCardClick(card)}
                    className={`
                      w-full relative py-6 px-4 rounded-2xl font-medium text-lg transition-all transform shadow-lg
                      ${isMatched ? 'opacity-0 pointer-events-none scale-95' : ''}
                      ${isSelected ? 'bg-purple-200 dark:bg-purple-700 border-4 border-purple-600 dark:border-purple-400 scale-105 text-purple-900 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:scale-105'}
                      ${isWrong ? 'animate-pulse bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600' : ''}
                      ${!isMatched && !isSelected && !isWrong ? 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl dark:hover:shadow-2xl' : ''}
                    `}
                    style={{
                      transition: isMatched ? 'all 0.5s ease-out' : 'all 0.2s ease',
                      boxShadow: isMatched
                        ? '0 0 20px rgba(34, 197, 94, 0.5)'
                        : isWrong
                          ? '0 0 15px rgba(239, 68, 68, 0.5)'
                          : '',
                    }}
                  >
                    <span className="block">{card.text}</span>
                    <span className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500 font-normal">
                      {getLanguageLabel()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right column - English translations */}
            <div className="space-y-3">
              <div className="text-center text-white font-semibold mb-3 bg-white/20 dark:bg-black/20 rounded-lg py-2 transition-colors duration-200">
                English
              </div>
              {cards.slice(currentWords.length).map((card) => {
                const isMatched = matchedPairs.includes(card.pairId);
                const isSelected = selectedCard?.id === card.id;
                const isWrong = wrongAttempts.includes(card.id);

                return (
                  <button
                    key={card.id}
                    onClick={() => !isMatched && handleCardClick(card)}
                    className={`
                      w-full relative py-6 px-4 rounded-2xl font-medium text-lg transition-all transform shadow-lg
                      ${isMatched ? 'opacity-0 pointer-events-none scale-95' : ''}
                      ${isSelected ? 'bg-purple-200 dark:bg-purple-700 border-4 border-purple-600 dark:border-purple-400 scale-105 text-purple-900 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:scale-105'}
                      ${isWrong ? 'animate-pulse bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600' : ''}
                      ${!isMatched && !isSelected && !isWrong ? 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl dark:hover:shadow-2xl' : ''}
                    `}
                    style={{
                      transition: isMatched ? 'all 0.5s ease-out' : 'all 0.2s ease',
                      boxShadow: isMatched
                        ? '0 0 20px rgba(34, 197, 94, 0.5)'
                        : isWrong
                          ? '0 0 15px rgba(239, 68, 68, 0.5)'
                          : '',
                    }}
                  >
                    <span className="block">{card.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
