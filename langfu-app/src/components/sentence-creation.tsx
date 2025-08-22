'use client';

import { useState } from 'react';
import { ChevronRight, SkipForward, Check, X } from 'lucide-react';
import { designSystem } from '@/lib/design-system';

interface SentenceCreationProps {
  words: any[];
  language: 'GERMAN' | 'SPANISH';
  onComplete: () => void;
  onSkip: () => void;
}

export default function SentenceCreation({
  words,
  language,
  onComplete,
  onSkip,
}: SentenceCreationProps) {
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
        message: `Your sentence must include the word "${currentWord.l2}".`,
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
          message:
            data.feedback || (data.valid ? 'Great sentence!' : 'Try to improve your sentence.'),
        });
      } else {
        // Fallback to basic validation
        setFeedback({
          valid: true,
          message: 'Good! Your sentence includes the target word.',
        });
      }
    } catch (error) {
      // Fallback to basic validation
      setFeedback({
        valid: true,
        message: 'Good! Your sentence includes the target word.',
      });
    }

    setValidating(false);

    // Save the sentence
    if (wordIncluded) {
      setUserSentences({
        ...userSentences,
        [currentWord.id]: sentence,
      });

      // Save to database (skip for extracted words since they don't have real DB IDs)
      if (currentWord.id && !currentWord.id.toString().startsWith('story-')) {
        try {
          const response = await fetch('/api/sentences/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordId: currentWord.id,
              sentence,
            }),
          });

          if (!response.ok) {
            console.warn('Failed to save sentence to database:', response.status);
          }
        } catch (error) {
          console.warn('Error saving sentence:', error);
        }
      }
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
    <div className={designSystem.layout.container}>
      <div className={designSystem.layout.maxWidth}>
        {/* Header */}
        <div className={`${designSystem.cards.glassHeader} mb-6`}>
          <div className={designSystem.utils.flexBetween}>
            <div>
              <h2 className={designSystem.typography.h2}>Create Sentences</h2>
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
          <div className="text-center mb-8">
            <h3 className={designSystem.typography.wordDisplay}>{currentWord.l2}</h3>
            <p className={designSystem.typography.translation}>{currentWord.l1}</p>
            {currentWord.pos && (
              <span className={designSystem.interactive.tag}>{currentWord.pos}</span>
            )}
          </div>

          {/* Instructions */}
          <div className={`mb-6 p-4 rounded-lg ${designSystem.feedback.info}`}>
            <p className="mb-3">
              Write an original sentence using the word{' '}
              <strong className="text-purple-700 dark:text-purple-300">{currentWord.l2}</strong>.
              Try to show you understand its meaning!
            </p>

            {/* Context and guidance */}
            <div className="text-sm border-t border-white/20 pt-3 mt-3">
              <p className="mb-2">
                <strong>Word:</strong> {currentWord.l2} = {currentWord.l1}
                {currentWord.pos && (
                  <span className="ml-2 text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">
                    {currentWord.pos}
                  </span>
                )}
              </p>

              {/* Show an example if available */}
              {currentWord.examples && currentWord.examples.length > 0 && (
                <p className="text-xs mb-2">
                  <strong>Example:</strong> "{currentWord.examples[0].sentence}"
                </p>
              )}

              <p className="text-xs italic opacity-75">
                Write in {language === 'GERMAN' ? 'German' : 'Spanish'} and use proper grammar. Be
                creative but clear!
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={`Write a sentence with "${currentWord.l2}"...`}
              className={designSystem.forms.textarea}
              disabled={validating}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                feedback.valid ? designSystem.feedback.success : designSystem.feedback.error
              }`}
            >
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
            <button onClick={handleSkipWord} className={designSystem.buttons.secondary}>
              Skip Word
            </button>

            <div className="flex gap-4">
              {!feedback && (
                <button
                  onClick={handleValidate}
                  disabled={!sentence.trim() || validating}
                  className={`${designSystem.buttons.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {validating ? 'Checking...' : 'Check Sentence'}
                </button>
              )}

              {feedback && (
                <button onClick={handleNext} className={designSystem.buttons.primaryWithIcon}>
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
