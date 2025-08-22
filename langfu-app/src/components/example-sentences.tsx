'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, SkipForward, ArrowLeft } from 'lucide-react';
import { designSystem } from '@/lib/design-system';

interface ExampleSentencesProps {
  words: any[];
  language: 'GERMAN' | 'SPANISH';
  onComplete: () => void;
  onSkip: () => void;
}

export default function ExampleSentences({
  words,
  language,
  onComplete,
  onSkip,
}: ExampleSentencesProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [examples, setExamples] = useState<string[]>([]);
  const [translations, setTranslations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState<number | null>(null);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    loadExamples();
  }, [currentWordIndex]);

  const loadExamples = async () => {
    setLoading(true);
    setShowTranslation(null);

    // Use pre-generated examples from MCP server (should always be available for story words)
    if (currentWord.examples && currentWord.examples.length > 0) {
      setExamples(currentWord.examples.map((e: any) => e.sentence));
      setTranslations(currentWord.examples.map((e: any) => e.translation || ''));
      setLoading(false);
      return;
    }

    // If no examples available, show error instead of generating generic ones
    setExamples(['No examples available for this word.']);
    setTranslations(['']);
    setLoading(false);
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete();
    }
  };

  const highlightWord = (sentence: string) => {
    const word = currentWord.l2;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return sentence.split(regex).reduce((acc: any[], part, index, array) => {
      if (index < array.length - 1) {
        acc.push(
          <span key={`part-${index}`}>{part}</span>,
          <span key={`word-${index}`} className={designSystem.interactive.highlightedWord}>
            {word}
          </span>
        );
      } else {
        acc.push(<span key={`part-${index}`}>{part}</span>);
      }
      return acc;
    }, []);
  };

  return (
    <div className={designSystem.layout.container}>
      <div className={designSystem.layout.maxWidth}>
        {/* Header */}
        <div className={`${designSystem.cards.glassHeader} mb-6`}>
          <div className={designSystem.utils.flexBetween}>
            <div>
              <h2 className={designSystem.typography.h2}>Example Sentences</h2>
              <p className={designSystem.typography.subtitle}>
                Word {currentWordIndex + 1} of {words.length}
              </p>
            </div>
            <button onClick={onSkip} className={designSystem.buttons.glassWithIcon}>
              <SkipForward className="w-4 h-4" />
              Skip All
            </button>
          </div>
        </div>

        {/* Current Word */}
        <div className={designSystem.cards.solidWithPadding}>
          <div className="text-center mb-6">
            <h3 className={designSystem.typography.wordDisplay}>{currentWord.l2}</h3>
            <p className={designSystem.typography.translation}>{currentWord.l1}</p>
            {currentWord.pos && (
              <span className={designSystem.interactive.tag}>{currentWord.pos}</span>
            )}
          </div>

          {/* Examples */}
          {loading ? (
            <div className="text-center py-8">
              <div className={designSystem.animations.spin}></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Generating examples...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className={designSystem.interactive.exampleCard}
                  onClick={() => setShowTranslation(showTranslation === index ? null : index)}
                >
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    {index + 1}. {highlightWord(example)}
                  </p>
                  {showTranslation === index && translations[index] && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      {translations[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {currentWordIndex > 0 && (
              <button
                onClick={() => setCurrentWordIndex(currentWordIndex - 1)}
                className={designSystem.buttons.secondary}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className={`ml-auto ${designSystem.buttons.primaryWithIcon}`}
            >
              {currentWordIndex < words.length - 1 ? 'Next Word' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
