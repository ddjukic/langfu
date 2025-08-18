'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Info } from 'lucide-react';
import Link from 'next/link';

export default function LoadVocabularyPage() {
  const router = useRouter();
  const [vocabJson, setVocabJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLoad = async () => {
    setError('');
    setSuccess(false);
    
    try {
      const parsed = JSON.parse(vocabJson);
      
      // Validate structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      
      setLoading(true);
      
      const response = await fetch('/api/vocabulary/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabulary: parsed }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load vocabulary');
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = `{
  "A1": {
    "Topic Name": [
      { "de": "german word", "en": "english translation", "pos": "verb", "gender": "m/f/n" },
      { "es": "spanish word", "en": "english translation", "pos": "noun" }
    ]
  },
  "A2": { ... },
  "B1": { ... },
  "B2": { ... },
  "C1": { ... },
  "C2": { ... }
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center">
          <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Load Vocabulary</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Import Vocabulary JSON</h2>
            <p className="text-gray-600">
              Paste your vocabulary data in JSON format below to add new words to your learning library.
            </p>
          </div>

          {/* JSON Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vocabulary JSON
            </label>
            <textarea
              value={vocabJson}
              onChange={(e) => setVocabJson(e.target.value)}
              placeholder="Paste your vocabulary JSON here..."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none font-mono text-sm"
              disabled={loading}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Vocabulary loaded successfully! Redirecting...
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleLoad}
              disabled={!vocabJson.trim() || loading}
              className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? 'Loading...' : 'Load Vocabulary'}
            </button>
            
            <button
              onClick={() => setVocabJson('')}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {/* JSON Schema Documentation */}
          <details className="bg-gray-50 rounded-lg p-6">
            <summary className="cursor-pointer font-semibold text-gray-700 flex items-center gap-2">
              <Info className="w-5 h-5" />
              JSON Schema Documentation
            </summary>
            
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Structure:</h4>
                <pre className="p-4 bg-white rounded border text-xs overflow-auto">
                  {sampleJson}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Field Descriptions:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Levels:</strong> A1, A2, B1, B2, C1, C2 (CEFR standard)</li>
                  <li>• <strong>Topics:</strong> Any string name for categorization</li>
                  <li>• <strong>de/es:</strong> Target language word (German or Spanish)</li>
                  <li>• <strong>en:</strong> English translation</li>
                  <li>• <strong>pos:</strong> Part of speech (noun, verb, adjective, etc.)</li>
                  <li>• <strong>gender:</strong> For German nouns: m (masculine), f (feminine), n (neuter)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The system will automatically detect whether words are German (de) or Spanish (es) based on the field names used.
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}