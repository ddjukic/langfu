'use client';

import { useState } from 'react';
import { ChevronRight, SkipForward, Check, X } from 'lucide-react';

interface SentenceCreationProps {
  words: any[];
  language: 'GERMAN' | 'SPANISH';
  onComplete: () => void;
  onSkip: () => void;
}

export default function SentenceCreation({ words, language, onComplete, onSkip }: SentenceCreationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sentence, setSentence] = useState('');
  const [feedback, setFeedback] = useState<{ valid: boolean; message: string } | null>(null);
  const [validating, setValidating] = useState(false);
  const [userSentences, setUserSentences] = useState<Record<string, string>>({});

  const currentWord = words[currentWordIndex];

  const handleValidate = async () => {
    if (!sentence.trim()) {
      setFeedback({ valid: false, message: 'Please write a sentence.' });
      return;
    }

    // Basic validation - check if word is included
    const wordIncluded = sentence.toLowerCase().includes(currentWord.l2.toLowerCase());
    
    if (!wordIncluded) {
      setFeedback({ 
        valid: false, 
        message: `Your sentence must include the word "${currentWord.l2}".` 
      });
      return;
    }

    setValidating(true);

    // Try AI validation
    try {
      const response = await fetch('/api/ai/validate-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          word: currentWord.l2,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback({
          valid: data.valid,
          message: data.feedback || (data.valid ? 'Great sentence!' : 'Try to improve your sentence.'),
        });
      } else {
        // Fallback to basic validation
        setFeedback({ 
          valid: true, 
          message: 'Good! Your sentence includes the target word.' 
        });
      }
    } catch (error) {
      // Fallback to basic validation
      setFeedback({ 
        valid: true, 
        message: 'Good! Your sentence includes the target word.' 
      });
    }

    setValidating(false);

    // Save the sentence
    if (wordIncluded) {
      setUserSentences({
        ...userSentences,
        [currentWord.id]: sentence,
      });

      // Save to database
      await fetch('/api/sentences/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          sentence,
        }),
      });
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setSentence('');
      setFeedback(null);
    } else {
      onComplete();
    }
  };

  const handleSkipWord = () => {
    handleNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Sentences</h2>
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
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">
              {currentWord.l2}
            </h3>
            <p className="text-xl text-gray-600">{currentWord.l1}</p>
            {currentWord.pos && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {currentWord.pos}
              </span>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Write an original sentence using the word <strong>{currentWord.l2}</strong>.
              Try to show you understand its meaning!
            </p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={`Write a sentence with "${currentWord.l2}"...`}
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-lg"
              disabled={validating}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              feedback.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {feedback.valid ? (
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <p>{feedback.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handleSkipWord}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip Word
            </button>
            
            <div className="flex gap-4">
              {!feedback && (
                <button
                  onClick={handleValidate}
                  disabled={!sentence.trim() || validating}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? 'Checking...' : 'Check Sentence'}
                </button>
              )}
              
              {feedback && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  {currentWordIndex < words.length - 1 ? 'Next Word' : 'Complete'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}