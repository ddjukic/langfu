'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Download,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ExtractedWord {
  id: string;
  l2: string;
  l1: string;
  frequency: number;
  level?: string;
  context?: string;
}

interface Extraction {
  id: string;
  title: string;
  url: string;
  language: string;
  wordCount: number;
  level: string;
  extractedAt: string;
  words: ExtractedWord[];
}

export default function ExtractClient() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [wordCount, setWordCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [showWords, setShowWords] = useState(false);

  const handleExtract = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setExtraction(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, wordCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract vocabulary');
      }

      setExtraction(data.extraction);
      setShowWords(true);

      // Save extracted vocabulary set for tracking
      try {
        await fetch('/api/vocabulary/save-extracted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extractionId: data.extraction.id,
            title: data.extraction.title,
            words: data.extraction.words,
          }),
        });
      } catch (saveError) {
        console.error('Failed to save vocabulary set:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = () => {
    if (extraction) {
      // Store extracted words in localStorage for practice session
      localStorage.setItem('extractedWords', JSON.stringify(extraction.words));
      localStorage.setItem('extractionTitle', extraction.title);
      router.push('/learn/session?mode=extracted');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center">
          <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Web Content Extraction
          </h1>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Extract Vocabulary from Web Page</h2>
            <p className="text-gray-600">
              Enter a URL to extract vocabulary from any German or Spanish webpage
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Web Page URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Words to Extract:{' '}
                <span className="font-bold text-purple-600">{wordCount}</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={loading}
                />
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>5</span>
                  <span>|</span>
                  <span>30</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Adjust the number of vocabulary words to extract from the page
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleExtract}
              disabled={loading || !url}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Extract Vocabulary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {extraction && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Extraction Complete
                </h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {extraction.language === 'GERMAN' ? '🇩🇪 German' : '🇪🇸 Spanish'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{extraction.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Level</p>
                  <p className="font-medium">{extraction.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Words Extracted</p>
                  <p className="font-medium">{extraction.wordCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <a
                    href={extraction.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-sm truncate block"
                  >
                    {extraction.url}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWords(!showWords)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {showWords ? 'Hide' : 'Show'} Words
                </button>
                <button
                  onClick={handlePractice}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Practice These Words
                </button>
              </div>
            </div>

            {/* Words List */}
            {showWords && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Extracted Vocabulary</h4>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extraction.words.map((word) => (
                      <div
                        key={word.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-lg">{word.l2}</span>
                          {word.level && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {word.level}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{word.l1}</p>
                        {word.context && (
                          <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                            "{word.context}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
