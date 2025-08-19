'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';

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

    // Check if word has pre-generated examples
    if (currentWord.examples && currentWord.examples.length > 0) {
      setExamples(currentWord.examples.map((e: any) => e.sentence));
      setTranslations(currentWord.examples.map((e: any) => e.translation || ''));
      setLoading(false);
      return;
    }

    // Generate examples using AI (with fallback)
    try {
      const response = await fetch('/api/ai/examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentWord.l2,
          translation: currentWord.l1,
          language,
          pos: currentWord.pos,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExamples(data.examples);
        setTranslations(data.translations);
      } else {
        // Fallback examples
        setExamples(getFallbackExamples());
        setTranslations(getFallbackTranslations());
      }
    } catch (error) {
      // Fallback examples
      setExamples(getFallbackExamples());
      setTranslations(getFallbackTranslations());
    }

    setLoading(false);
  };

  const getFallbackExamples = () => {
    const word = currentWord.l2;
    if (language === 'GERMAN') {
      return [
        `Das ist ein Beispiel mit ${word}.`,
        `Ich verwende ${word} in diesem Satz.`,
        `Kannst du ${word} verstehen?`,
        `${word} ist wichtig zu lernen.`,
        `Wir üben ${word} zusammen.`,
      ];
    } else {
      return [
        `Este es un ejemplo con ${word}.`,
        `Yo uso ${word} en esta oración.`,
        `¿Puedes entender ${word}?`,
        `${word} es importante aprender.`,
        `Practicamos ${word} juntos.`,
      ];
    }
  };

  const getFallbackTranslations = () => {
    const trans = currentWord.l1;
    return [
      `This is an example with ${trans}.`,
      `I use ${trans} in this sentence.`,
      `Can you understand ${trans}?`,
      `${trans} is important to learn.`,
      `We practice ${trans} together.`,
    ];
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
          <span
            key={`word-${index}`}
            className="bg-purple-600 text-white px-1 rounded font-semibold"
          >
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Example Sentences</h2>
              <p className="text-white/80 mt-1">
                Word {currentWordIndex + 1} of {words.length}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip All
            </button>
          </div>
        </div>

        {/* Current Word */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">{currentWord.l2}</h3>
            <p className="text-xl text-gray-600">{currentWord.l1}</p>
            {currentWord.pos && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {currentWord.pos}
              </span>
            )}
          </div>

          {/* Examples */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="text-gray-500 mt-2">Generating examples...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowTranslation(showTranslation === index ? null : index)}
                >
                  <p className="text-lg">
                    {index + 1}. {highlightWord(example)}
                  </p>
                  {showTranslation === index && translations[index] && (
                    <p className="text-sm text-gray-600 mt-2 italic">{translations[index]}</p>
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
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="ml-auto px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
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
