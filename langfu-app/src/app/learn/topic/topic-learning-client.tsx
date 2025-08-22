'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

interface TopicLearningClientProps {
  user: any;
}

interface KeywordItem {
  l2: string;
  l1: string;
  pos?: string;
  synonyms?: string[];
  examples: Array<{ sentence: string; translation: string }>;
}

export default function TopicLearningClient({ user }: TopicLearningClientProps) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [topicLevel, setTopicLevel] = useState(user?.progress?.currentLevel || 'B1');
  const [numKeywords, setNumKeywords] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setError(null);
    setLoading(true);
    setStory('');
    setKeywords([]);
    try {
      const res = await fetch('/api/ai/topic-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          level: topicLevel,
          language: user.currentLanguage,
          numKeywords,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setStory(data.story);
      setKeywords(data.keywords || []);
    } catch (e) {
      setError('Failed to generate package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeWords = async () => {
    try {
      // Persist to library
      await fetch('/api/library/add-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Topic: ${topic}`,
          level: topicLevel,
          language: user.currentLanguage,
          words: keywords,
        }),
      });

      // Prepare a custom session using extracted mode pipeline
      const extractedWords = keywords.map((k, index) => ({
        id: `topic-${index}`,
        l2: k.l2,
        l1: k.l1,
        pos: k.pos,
        level: topicLevel,
        context: k.examples?.[0]?.sentence,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('extractedWords', JSON.stringify(extractedWords));
        localStorage.setItem('extractionTitle', `Topic: ${topic}`);
      }
      router.push('/learn/session?mode=extracted');
    } catch (e) {
      setError('Failed to start practice.');
    }
  };

  const renderHoverableStory = () => {
    if (!story) return null;
    const keywordMap = new Map<string, KeywordItem>();
    keywords.forEach((k) => keywordMap.set(k.l2.toLowerCase(), k));

    const tokens = story.split(/(\s+)/);
    return (
      <p className="leading-7 text-gray-800 dark:text-gray-200">
        {tokens.map((tok, i) => {
          if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
          const base = tok.replace(/[.,!?;:()"'«»„“”]/g, '');
          const key = base.toLowerCase();
          const data = keywordMap.get(key);
          if (!data) return <span key={i}>{tok}</span>;
          return (
            <span
              key={i}
              className="relative group cursor-help text-purple-700 dark:text-purple-300 underline-offset-2 hover:underline"
            >
              {tok}
              <span className="invisible group-hover:visible absolute z-10 left-0 top-full mt-1 w-64 p-3 rounded-lg shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
                <span className="block font-semibold">
                  {data.l2} — {data.l1}
                </span>
                {data.pos && <span className="text-xs text-gray-500">{data.pos}</span>}
                {data.synonyms && data.synonyms.length > 0 && (
                  <span className="block text-xs mt-1">
                    <span className="font-medium">Synonyms:</span> {data.synonyms.join(', ')}
                  </span>
                )}
              </span>
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-white hover:text-white/80">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Topic Mode
          </h1>
          <div className="w-6" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-6 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Generate Topic-Based Story
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Describe a topic and get a story with key vocabulary, translations, and example
            sentences tailored to your level.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Talking to an unemployment representative at first appointment"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level
              </label>
              <select
                value={topicLevel}
                onChange={(e) => setTopicLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keywords
              </label>
              <input
                type="number"
                min={5}
                max={20}
                value={numKeywords}
                onChange={(e) => setNumKeywords(Math.max(5, Math.min(20, Number(e.target.value))))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-1">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}

          {story && (
            <div className="mt-6 space-y-6">
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Story</h4>
                {renderHoverableStory()}
              </div>
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Keywords</h4>
                <div className="space-y-4">
                  {keywords.map((kw, idx) => (
                    <div
                      key={`${kw.l2}-${idx}`}
                      className="border-b last:border-b-0 border-gray-200 dark:border-gray-800 pb-4"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {kw.l2}{' '}
                          <span className="text-gray-500 dark:text-gray-400">— {kw.l1}</span>
                        </p>
                        {kw.pos && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            {kw.pos}
                          </span>
                        )}
                        {kw.synonyms && kw.synonyms.length > 0 && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Synonyms: {kw.synonyms.join(', ')}
                          </p>
                        )}
                      </div>
                      {kw.examples && kw.examples.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {kw.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="text-sm">
                              <p className="text-gray-900 dark:text-gray-100">{ex.sentence}</p>
                              {ex.translation && (
                                <p className="text-gray-500 dark:text-gray-400 italic">
                                  {ex.translation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {keywords.length > 0 && (
                  <button
                    onClick={handlePracticeWords}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                  >
                    <Sparkles className="w-4 h-4" /> Practice Words
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
