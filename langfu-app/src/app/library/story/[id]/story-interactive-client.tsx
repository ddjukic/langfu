'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit2, Zap } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import { useLibraryStore } from '@/lib/store/library-store';
import './story-interactive.module.css';

interface KeywordItem {
  l2: string;
  l1: string;
  pos?: string;
  synonyms?: string[];
  examples: Array<{ sentence: string; translation: string }>;
}

interface StoryInteractiveClientProps {
  story: {
    id: string;
    title: string;
    topic: string | null;
    language: string;
    level?: string | null;
    wordCount: number | null;
    content: string;
    summary: string | null;
    prompt: string | null;
    keywords: any;
    words: any;
  };
}

export default function StoryInteractiveClient({ story }: StoryInteractiveClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Zustand store
  const setCurrentStory = useLibraryStore((state) => state.setCurrentStory);

  // Set current story in store on mount
  useEffect(() => {
    setCurrentStory({
      id: story.id,
      title: story.title,
      topic: story.topic,
      language: story.language as any,
      level: story.level || null,
      wordCount: story.wordCount || 0,
      content: story.content,
      summary: story.summary,
      createdAt: new Date().toISOString(),
    });

    return () => {
      setCurrentStory(null);
    };
  }, [story, setCurrentStory]);

  // Close tooltips when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.keyword')) {
        document.querySelectorAll('.keyword-tooltip.visible-force').forEach((tooltip) => {
          tooltip.classList.remove('visible-force');
        });
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.keyword-tooltip.visible-force').forEach((tooltip) => {
          tooltip.classList.remove('visible-force');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Parse keywords/words from the story
  const getKeywords = (): KeywordItem[] => {
    // First try keywords field
    if (story.keywords) {
      if (typeof story.keywords === 'string') {
        try {
          const parsed = JSON.parse(story.keywords);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Failed to parse keywords string:', e);
        }
      } else if (Array.isArray(story.keywords)) {
        return story.keywords;
      }
    }

    // Then try words field
    if (story.words) {
      if (typeof story.words === 'string') {
        try {
          const parsed = JSON.parse(story.words);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Failed to parse words string:', e);
        }
      } else if (Array.isArray(story.words)) {
        return story.words;
      }
    }

    return [];
  };

  const keywords = getKeywords();

  // Create interactive content with keywords using Topic Mode styling
  const createInteractiveContent = (content: string, keywords: KeywordItem[]) => {
    if (!content || keywords.length === 0) return content;

    const keywordMap = new Map<string, KeywordItem>();
    keywords.forEach((k) => {
      if (k && k.l2 && typeof k.l2 === 'string') {
        keywordMap.set(k.l2.toLowerCase(), k);
      }
    });

    const tokens = content.split(/(\s+)/);
    return tokens.map((tok, i) => {
      if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
      const base = tok.replace(/[.,!?;:()"'«»„""]/g, '');
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
    });
  };

  // No special JavaScript needed - pure CSS tooltips

  // Handle touch gestures for navigation
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX || null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0]?.clientX || null;
    };

    const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;

      const distance = touchStartX.current - touchEndX.current;
      const isRightSwipe = distance < -50;

      if (isRightSwipe) {
        router.push('/library');
      }

      // Reset
      touchStartX.current = null;
      touchEndX.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router]);

  // Handle practice vocabulary button - following Topic Mode pattern exactly
  const handlePracticeVocabulary = () => {
    try {
      // Transform story keywords to proper word format matching Topic Mode
      const extractedWords = keywords.map((k, index) => ({
        id: `story-${index}`,
        l2: k.l2,
        l1: k.l1,
        level: story.level || 'A2', // Default to A2 if no level
        pos: k.pos,
        gender: undefined, // Can be added if available in keywords
        examples: k.examples,
        context: k.examples?.[0]?.sentence, // Use first example as context if available
      }));

      // Store in localStorage following exact Topic Mode pattern
      if (typeof window !== 'undefined') {
        localStorage.setItem('extractedWords', JSON.stringify(extractedWords));
        localStorage.setItem('extractionTitle', `Story: ${story.title}`);
        localStorage.setItem('extractionLanguage', story.language); // Store story language for correct matching game labels
      }

      // Navigate to learning session with extracted mode
      router.push('/learn/session?mode=extracted');
    } catch (e) {
      setError('Failed to start practice session.');
    }
  };

  // Remove this line since we're calling createInteractiveContent directly in JSX

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 transition-colors duration-200">
      {/* Navigation Header */}
      <NavigationHeader
        title={story.title}
        subtitle={`${story.topic || 'General'} • ${story.language === 'GERMAN' ? '🇩🇪 German' : '🇪🇸 Spanish'}${story.level ? ` • ${story.level}` : ''}`}
        showBackButton={true}
        variant="glass"
        breadcrumbs={[{ label: 'Library', href: '/library' }, { label: story.title }]}
        rightActions={
          <button
            onClick={() => router.push(`/library/story/${story.id}/edit`)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 touch-manipulation"
            aria-label="Edit story"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/20 backdrop-blur-lg border-b border-red-500/30">
          <div className="max-w-4xl mx-auto">
            <p className="text-white text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Practice Vocabulary Button - Following Topic Mode Pattern */}
        {keywords.length > 0 && (
          <div className="mb-6 bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-center">
              <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Practice Story Vocabulary
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Practice the {keywords.length} keywords from this story using various learning modes
              </p>
              <button
                onClick={handlePracticeVocabulary}
                className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
              >
                Practice vocabulary
              </button>
            </div>
          </div>
        )}

        {/* Story Summary */}
        {story.summary && (
          <div className="mb-6 p-4 bg-white/10 dark:bg-black/10 backdrop-blur rounded-xl">
            <h3 className="text-white font-bold mb-2">Summary</h3>
            <p className="text-white/90 text-sm leading-relaxed">{story.summary}</p>
          </div>
        )}

        {/* Interactive Story Content - Topic Mode Style */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-6 md:p-8">
          {keywords.length > 0 ? (
            <div className="space-y-6">
              {/* Story Section */}
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Story</h4>
                <div className="leading-7 text-gray-800 dark:text-gray-200">
                  {createInteractiveContent(story.content, keywords)}
                </div>
              </div>

              {/* Keywords Section - Exact Topic Mode Layout */}
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
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
              {story.content}
            </div>
          )}

          {/* Story Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{story.wordCount || 0} words</span>
              {keywords.length > 0 && <span>{keywords.length} keywords</span>}
              {story.prompt && (
                <button
                  onClick={() => {
                    const promptEl = document.getElementById('story-prompt');
                    if (promptEl) {
                      promptEl.classList.toggle('hidden');
                    }
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Show prompt
                </button>
              )}
            </div>

            {/* Prompt Display */}
            {story.prompt && (
              <div
                id="story-prompt"
                className="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Original Prompt</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {story.prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
