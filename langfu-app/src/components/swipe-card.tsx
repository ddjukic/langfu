'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, Volume2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordData {
  id: string;
  l2: string;
  l1: string;
  pos?: string;
  gender?: string;
  level?: string;
  topic?: string;
  examples?: Array<{ sentence: string; translation?: string }>;
}

interface SwipeCardProps {
  word: WordData;
  onSwipeLeft: (word: WordData) => void;
  onSwipeRight: (word: WordData) => void;
  onSwipeUp?: (word: WordData) => void;
  isActive: boolean;
  index: number;
  canUndo?: boolean;
  onUndo?: () => void;
}

export default function SwipeCard({
  word,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isActive,
  index,
  canUndo,
  onUndo,
}: SwipeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  // Haptic feedback helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if haptic is enabled in settings
    const hapticEnabled = localStorage.getItem('hapticEnabled') !== 'false';

    if (hapticEnabled && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 50, 30],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Get swipe distance from settings
    const threshold = Number(localStorage.getItem('swipeDistance')) || 100;

    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      triggerHaptic('medium');

      if (info.offset.x > 0) {
        onSwipeRight(word);
      } else {
        onSwipeLeft(word);
      }
    } else if (info.offset.y < -threshold && onSwipeUp) {
      setExitY(-200);
      triggerHaptic('light');
      onSwipeUp(word);
      setShowDetails(true);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.l2);
      utterance.lang =
        word.level?.startsWith('A') || word.level?.startsWith('B') || word.level?.startsWith('C')
          ? 'de-DE'
          : 'es-ES'; // Assuming German for CEFR levels, adjust as needed
      speechSynthesis.speak(utterance);
      triggerHaptic('light');
    }
  };

  const cardVariants = {
    initial: {
      scale: 0.95,
      y: 30,
      opacity: 0,
    },
    animate: {
      scale: isActive ? 1 : 0.95 - index * 0.02,
      y: isActive ? 0 : -index * 8,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      x: exitX,
      y: exitY,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const dragConstraints = {
    top: -100,
    bottom: 100,
    left: -150,
    right: 150,
  };

  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div
            className={cn(
              'absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing',
              'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
              'p-8 flex flex-col justify-between',
              'select-none touch-none',
              index > 0 && 'pointer-events-none'
            )}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag={isActive}
            dragConstraints={dragConstraints}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileDrag={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            style={{
              zIndex: 10 - index,
            }}
          >
            {/* Swipe Indicators */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(239, 68, 68, 0.3), transparent)',
                opacity: 0,
              }}
              animate={{
                opacity: isActive ? 1 : 0,
              }}
              whileDrag={{
                opacity: 0.5,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(to left, rgba(34, 197, 94, 0.3), transparent)',
                opacity: 0,
              }}
              animate={{
                opacity: isActive ? 1 : 0,
              }}
              whileDrag={{
                opacity: 0.5,
              }}
            />

            {/* Card Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              {/* Language Level Badge */}
              {word.level && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {word.level}
                </span>
              )}

              {/* Main Word */}
              <div className="text-center">
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{word.l2}</h2>
                {word.gender && (
                  <span className="text-lg text-gray-500 dark:text-gray-400">({word.gender})</span>
                )}
              </div>

              {/* Translation */}
              <div className="text-center">
                <p className="text-2xl text-gray-600 dark:text-gray-300">{word.l1}</p>
                {word.pos && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {word.pos}
                  </span>
                )}
              </div>

              {/* Examples (shown on swipe up or tap) */}
              <AnimatePresence>
                {showDetails && word.examples && word.examples.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full"
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Example:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{word.examples[0]?.sentence}</p>
                    {word.examples[0]?.translation && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">
                        {word.examples[0].translation}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowDetails(!showDetails);
                }}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={handleSpeak}
                className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>

              {canUndo && onUndo && index === 0 && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onUndo();
                  }}
                  className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                >
                  <Undo2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </button>
              )}
            </div>

            {/* Swipe Hints */}
            {isActive && index === 0 && (
              <div className="absolute bottom-[-50px] left-0 right-0 flex justify-between px-8 text-sm">
                <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Need practice</span>
                </div>
                <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
                  <span>I know this</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
