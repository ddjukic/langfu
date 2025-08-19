'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LearnNewClientProps {
  levels: string[];
  topicsByLevel: Record<string, string[]>;
}

export default function LearnNewClient({ levels, topicsByLevel }: LearnNewClientProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleStartLearning = () => {
    if (selectedLevel && selectedTopic) {
      router.push(
        `/learn/session?level=${selectedLevel}&topic=${encodeURIComponent(selectedTopic)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center">
          <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Learn New Words</h1>
        </div>

        {/* Level Selection */}
        {!selectedLevel ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Select Your Level</h2>
            <div className="grid grid-cols-2 gap-4">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className="py-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold text-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ) : !selectedTopic ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setSelectedLevel('')}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Level {selectedLevel}</h2>
            <p className="text-gray-600 mb-6">Choose a topic</p>

            <div className="space-y-3">
              {topicsByLevel[selectedLevel]?.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full py-4 bg-white border-2 border-purple-400 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setSelectedTopic('')}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Ready to Learn!</h2>
            <p className="text-gray-600 mb-6">
              Level {selectedLevel} - {selectedTopic}
            </p>

            <button
              onClick={handleStartLearning}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
