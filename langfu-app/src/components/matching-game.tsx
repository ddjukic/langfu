'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Home, ChevronRight, Check, AlertCircle, Upload, Plus } from 'lucide-react';

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

  useEffect(() => {
    startRound();
  }, [words]);

  const startRound = () => {
    // Select 5 random words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white/20 backdrop-blur rounded-full px-6 py-3">
          <button
            onClick={onQuit}
            className="text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6 text-white">
            <span className="font-semibold">Round {round}/3</span>
            <span className="font-semibold">Score: {score}</span>
          </div>

          <div className="w-6 h-6" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Game instruction */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Tap the matching pairs</h2>
        <p className="text-white/80">
          Match {language === 'GERMAN' ? 'German' : 'Spanish'} words with their English translations
        </p>
      </div>

      {/* Cards grid */}
      <div className="max-w-4xl mx-auto">
        {cards.length === 0 ? (
          <div className="text-white text-center">
            <p>Loading cards...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8">
            {/* Left column - Foreign words */}
            <div className="space-y-3">
              <div className="text-center text-white font-semibold mb-3 bg-white/20 rounded-lg py-2">
                {language === 'GERMAN' ? 'German' : 'Spanish'}
              </div>
              {cards.slice(0, currentWords.length).map(card => {
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
                    <span className="absolute top-2 right-2 text-xs text-gray-400 font-normal">
                      {getLanguageLabel()}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Right column - English translations */}
            <div className="space-y-3">
              <div className="text-center text-white font-semibold mb-3 bg-white/20 rounded-lg py-2">
                English
              </div>
              {cards.slice(currentWords.length).map(card => {
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