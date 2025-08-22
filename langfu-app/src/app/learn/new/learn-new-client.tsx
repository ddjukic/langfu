'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';

interface LearnNewClientProps {
  levels: string[];
  topicsByLevel: Record<string, string[]>;
}

export default function LearnNewClient({ levels, topicsByLevel }: LearnNewClientProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const handleStartLearning = () => {
    if (selectedLevel && selectedTopic) {
      const finalTopic =
        selectedTopic === 'Custom Vocabulary' && customTopic.trim()
          ? customTopic.trim()
          : selectedTopic;

      // Don't proceed if custom vocabulary selected but no custom topic provided
      if (selectedTopic === 'Custom Vocabulary' && !customTopic.trim()) {
        return;
      }

      router.push(`/learn/session?level=${selectedLevel}&topic=${encodeURIComponent(finalTopic)}`);
    }
  };

  // Build breadcrumbs based on current selection state
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Learning', href: '/dashboard' }];
    if (selectedLevel) {
      crumbs.push({ label: `Level ${selectedLevel}`, href: '#' });
    }
    if (selectedTopic) {
      crumbs.push({ label: selectedTopic, href: '#' });
    }
    if (!selectedLevel) {
      crumbs.push({ label: 'Select Level', href: '#' });
    } else if (!selectedTopic) {
      crumbs.push({ label: 'Select Topic', href: '#' });
    }
    return crumbs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 transition-colors duration-200">
      <NavigationHeader
        title="Learn New Words"
        subtitle={
          selectedLevel
            ? `Level ${selectedLevel}${selectedTopic ? ` - ${selectedTopic}` : ''}`
            : 'Choose your level and topic'
        }
        breadcrumbs={getBreadcrumbs()}
        rightActions={
          <div className="flex items-center gap-1 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
        }
      />
      <div className="max-w-2xl mx-auto p-4">
        {/* Level Selection */}
        {!selectedLevel ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Select Your Level
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className="py-6 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl font-bold text-xl hover:from-purple-500 hover:to-pink-500 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ) : !selectedTopic ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
            <button
              onClick={() => setSelectedLevel('')}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Level {selectedLevel}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a topic</p>

            <div className="space-y-3">
              {topicsByLevel[selectedLevel]?.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full py-4 bg-white dark:bg-gray-700 border-2 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : selectedTopic === 'Custom Vocabulary' && !customTopic.trim() ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
            <button
              onClick={() => setSelectedTopic('')}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Custom Vocabulary
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              What topic would you like to learn about?
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., German A2 bicycles, Shopping for groceries, Job interview vocabulary..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={() => customTopic.trim() && setCustomTopic(customTopic.trim())}
                disabled={!customTopic.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
            <button
              onClick={() => setSelectedTopic('')}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Ready to Learn!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Level {selectedLevel} -{' '}
              {selectedTopic === 'Custom Vocabulary' && customTopic.trim()
                ? customTopic
                : selectedTopic}
            </p>

            <button
              onClick={handleStartLearning}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all"
            >
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
