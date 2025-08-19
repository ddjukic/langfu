'use client';

import { useState } from 'react';
import { ArrowLeft, Globe, Calendar, Hash, Languages, Trash2, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ExtractedWord {
  id: string;
  l2: string;
  l1: string;
  level?: string | null;
  pos?: string | null;
  gender?: string | null;
  context?: string | null;
}

interface WebExtraction {
  id: string;
  url: string;
  title?: string | null;
  language: string;
  wordCount: number;
  level?: string | null;
  extractedAt: string;
  extractedWords: ExtractedWord[];
}

interface Props {
  extractions: WebExtraction[];
  currentLanguage: string;
}

export default function ExtractedVocabularyClient({ extractions, currentLanguage }: Props) {
  const router = useRouter();
  const [showWords, setShowWords] = useState<string | null>(null);

  const handlePractice = (extraction: WebExtraction) => {
    // Store words in localStorage and navigate to practice
    localStorage.setItem('extractedWords', JSON.stringify(extraction.extractedWords));
    localStorage.setItem('extractionTitle', extraction.title || 'Extracted Vocabulary');
    router.push('/learn/session?mode=extracted');
  };

  const handleDelete = async (extractionId: string) => {
    if (!confirm('Are you sure you want to delete this extraction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/extraction/${extractionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete extraction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="w-6 h-6" />
              My Extracted Vocabulary
            </h1>
          </div>
          <Link
            href="/extract"
            className="px-4 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40 transition-colors font-medium"
          >
            Extract New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Extractions</p>
                <p className="text-2xl font-bold">{extractions.length}</p>
              </div>
              <Globe className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Words</p>
                <p className="text-2xl font-bold">
                  {extractions.reduce((sum, e) => sum + e.wordCount, 0)}
                </p>
              </div>
              <Hash className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Language</p>
                <p className="text-2xl font-bold">
                  {currentLanguage === 'GERMAN' ? '🇩🇪 German' : '🇪🇸 Spanish'}
                </p>
              </div>
              <Languages className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Extractions List */}
        {extractions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Extracted Vocabulary Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Extract vocabulary from web pages to build your custom word lists
            </p>
            <Link
              href="/extract"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              <Globe className="w-5 h-5" />
              Extract from Web
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {extractions.map((extraction) => (
              <div key={extraction.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {extraction.title || 'Untitled Extraction'}
                      </h3>
                      <a
                        href={extraction.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline truncate block max-w-xl"
                      >
                        {extraction.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {extraction.level || 'Mixed'}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {extraction.wordCount} words
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(extraction.extractedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Languages className="w-4 h-4" />
                      {extraction.language === 'GERMAN' ? 'German' : 'Spanish'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePractice(extraction)}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Practice
                    </button>
                    <button
                      onClick={() =>
                        setShowWords(showWords === extraction.id ? null : extraction.id)
                      }
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      {showWords === extraction.id ? 'Hide' : 'Show'} Words
                    </button>
                    <button
                      onClick={() => handleDelete(extraction.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete extraction"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Words Preview */}
                  {showWords === extraction.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {extraction.extractedWords.map((word, index) => (
                          <div key={word.id || index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">{word.l2}</span>
                              {word.level && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  {word.level}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{word.l1}</p>
                            {word.pos && <p className="text-xs text-gray-400 mt-1">{word.pos}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
