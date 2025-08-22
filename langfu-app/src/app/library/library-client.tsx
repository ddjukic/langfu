'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Book, Library, Plus, Search, Filter, X, Edit2, Trash2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavigationHeader from '@/components/navigation-header';
import { SearchHighlight } from '@/components/search-highlight';
import { Language } from '@prisma/client';
import {
  useLibraryStore,
  useFilteredLibraryData,
  useLibraryUIState,
  useStoryOperations,
  selectSearchFilters,
} from '@/lib/store/library-store';

interface Word {
  id: string;
  l1: string;
  l2: string;
  level: string;
  topic: string;
  language: Language;
}

interface WordHistory {
  id: string;
  word: Word;
  mastery: number;
  createdAt: string;
}

interface Story {
  id: string;
  title: string;
  topic: string | null;
  language: Language;
  wordCount: number;
  summary: string | null;
  level: string | null;
  createdAt: string;
}

interface LibraryClientProps {
  histories: WordHistory[];
  stories: Story[];
}

export default function LibraryClient({ histories, stories: initialStories }: LibraryClientProps) {
  const router = useRouter();

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zustand store hooks
  const { activeTab } = useFilteredLibraryData();
  const {
    selectedStories,
    showBulkActions,
    deleteConfirmId,
    showFilters,
    errorMessage,
    operationStates,
    bulkDeleteLoading,
  } = useLibraryUIState();
  const { deleteStory, duplicateStory, bulkDeleteStories } = useStoryOperations();

  // Search state
  const searchFilters = useLibraryStore(selectSearchFilters);

  // Store actions
  const setStories = useLibraryStore((state) => state.setStories);
  const setWordHistories = useLibraryStore((state) => state.setWordHistories);
  const setActiveTab = useLibraryStore((state) => state.setActiveTab);
  const toggleStorySelection = useLibraryStore((state) => state.toggleStorySelection);
  const selectAllStories = useLibraryStore((state) => state.selectAllStories);
  const setShowBulkActions = useLibraryStore((state) => state.setShowBulkActions);
  const setDeleteConfirmId = useLibraryStore((state) => state.setDeleteConfirmId);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);
  const setShowFilters = useLibraryStore((state) => state.setShowFilters);
  const setFilterLevel = useLibraryStore((state) => state.setFilterLevel);
  const setFilterLanguage = useLibraryStore((state) => state.setFilterLanguage);
  const setSortBy = useLibraryStore((state) => state.setSortBy);
  const setErrorMessage = useLibraryStore((state) => state.setErrorMessage);

  // Initialize store with server data
  useEffect(() => {
    setStories(initialStories);
    setWordHistories(histories);
  }, [initialStories, histories, setStories, setWordHistories]);

  // Real-time search filtering
  const filteredData = useMemo(() => {
    const query = searchFilters.query.toLowerCase().trim();

    if (!query) {
      return {
        words: histories,
        stories: initialStories,
      };
    }

    // Filter words
    const filteredWords = histories.filter((history) => {
      const word = history.word;
      return (
        word.l2.toLowerCase().includes(query) ||
        word.l1.toLowerCase().includes(query) ||
        (word.topic && word.topic.toLowerCase().includes(query))
      );
    });

    // Filter stories
    const filteredStories = initialStories.filter((story) => {
      return (
        story.title.toLowerCase().includes(query) ||
        (story.topic && story.topic.toLowerCase().includes(query)) ||
        (story.summary && story.summary.toLowerCase().includes(query))
      );
    });

    return {
      words: filteredWords,
      stories: filteredStories,
    };
  }, [searchFilters.query, histories, initialStories]);

  // Apply additional filters (level, language)
  const displayData = useMemo(() => {
    const { level, language } = searchFilters;

    // Filter words
    let displayWords = filteredData.words;
    if (level !== 'all') {
      displayWords = displayWords.filter((h) => h.word.level === level);
    }
    if (language !== 'all') {
      displayWords = displayWords.filter((h) => h.word.language === language);
    }

    // Filter stories
    let displayStories = filteredData.stories;
    if (level !== 'all') {
      displayStories = displayStories.filter((s) => s.level === level);
    }
    if (language !== 'all') {
      displayStories = displayStories.filter((s) => s.language === language);
    }

    // Apply sorting
    const sortedStories = [...displayStories].sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'level':
          return (a.level || '').localeCompare(b.level || '');
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return {
      words: displayWords,
      stories: sortedStories,
    };
  }, [filteredData, searchFilters]);

  // Handle swipe gestures for tab switching
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
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe && activeTab === 'words') {
        setActiveTab('stories');
      }
      if (isRightSwipe && activeTab === 'stories') {
        setActiveTab('words');
      }

      // Reset
      touchStartX.current = null;
      touchEndX.current = null;
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
    return undefined;
  }, [activeTab, setActiveTab]);

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  const handleDuplicateStory = async (storyId: string) => {
    try {
      await duplicateStory(storyId);
      router.refresh();
    } catch (error) {
      console.error('Failed to duplicate story:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStories.size === 0) return;

    try {
      await bulkDeleteStories(Array.from(selectedStories));
      router.refresh();
    } catch (error) {
      console.error('Failed to bulk delete stories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 transition-colors duration-200">
      {/* Navigation Header */}
      <NavigationHeader
        title="The Library"
        subtitle="Your vocabulary and stories"
        showBackButton={true}
        variant="glass"
        breadcrumbs={[{ label: 'Library' }]}
        rightActions={
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 touch-manipulation"
              aria-label="Search and filter"
            >
              {showFilters ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Search className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 touch-manipulation"
              aria-label="Filter"
            >
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>
        }
      />

      {/* Error Message Display */}
      {errorMessage && (
        <div className="px-4 py-3 bg-red-500/20 backdrop-blur-lg border-b border-red-500/30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-white text-sm font-medium">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white/80 hover:text-white"
              aria-label="Dismiss error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      {showFilters && (
        <div className="px-4 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-lg border-b border-white/10 dark:border-white/5">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                value={searchFilters.query}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Search is already real-time, but we can blur the input on Enter
                    e.currentTarget.blur();
                  }
                }}
                placeholder={`Search ${activeTab === 'words' ? 'words and translations' : 'stories and topics'}...`}
                className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 backdrop-blur rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {searchFilters.query && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Options */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={searchFilters.level}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 bg-white/20 dark:bg-black/20 backdrop-blur rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>

              <select
                value={searchFilters.language}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-3 py-2 bg-white/20 dark:bg-black/20 backdrop-blur rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all">All Languages</option>
                <option value="GERMAN">German 🇩🇪</option>
                <option value="SPANISH">Spanish 🇪🇸</option>
              </select>

              <select
                value={searchFilters.sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'level')}
                className="px-3 py-2 bg-white/20 dark:bg-black/20 backdrop-blur rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="level">Sort by Level</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Tab Navigation */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('words')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'words'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Library className="w-5 h-5" />
              <span>Words</span>
              {displayData.words.length > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'words'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {displayData.words.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'stories'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Book className="w-5 h-5" />
              <span>Stories</span>
              {displayData.stories.length > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'stories'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {displayData.stories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl overflow-hidden"
        >
          {/* Bulk Actions Bar */}
          {showBulkActions && activeTab === 'stories' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAllStories}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {selectedStories.size === displayData.stories.length ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                    )}
                    <span>Select All</span>
                  </button>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {selectedStories.size} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    disabled={selectedStories.size === 0 || bulkDeleteLoading}
                  >
                    {bulkDeleteLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {bulkDeleteLoading ? 'Deleting...' : 'Delete Selected'}
                  </button>
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Words Tab Content */}
            {activeTab === 'words' && (
              <>
                {displayData.words.length === 0 ? (
                  <div className="text-center py-12">
                    <Library className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {searchFilters.query
                        ? 'No words found matching your search'
                        : 'No words in your library yet'}
                    </p>
                    {!searchFilters.query && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Try{' '}
                        <Link
                          className="text-purple-600 dark:text-purple-400 underline"
                          href="/learn/topic"
                        >
                          Topic Mode
                        </Link>{' '}
                        or{' '}
                        <Link
                          className="text-purple-600 dark:text-purple-400 underline"
                          href="/learn/new"
                        >
                          Learn New
                        </Link>{' '}
                        to add words
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayData.words.map((h) => (
                      <div
                        key={h.id}
                        className="group relative p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900/40 dark:to-gray-900/60 border border-purple-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                      >
                        {/* Mastery Indicator */}
                        <div className="absolute top-2 right-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < h.mastery
                                    ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          <SearchHighlight text={h.word.l2} searchQuery={searchFilters.query} />
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          <SearchHighlight text={h.word.l1} searchQuery={searchFilters.query} />
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                            {h.word.level}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            <SearchHighlight
                              text={h.word.topic || ''}
                              searchQuery={searchFilters.query}
                            />
                          </span>
                          <span className="ml-auto">
                            {h.word.language === 'GERMAN' ? '🇩🇪' : '🇪🇸'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Stories Tab Content */}
            {activeTab === 'stories' && (
              <>
                {/* Action Bar */}
                {displayData.stories.length > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg font-medium transition-colors"
                    >
                      {showBulkActions ? 'Cancel Selection' : 'Select Multiple'}
                    </button>
                  </div>
                )}

                {displayData.stories.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {searchFilters.query
                        ? 'No stories found matching your search'
                        : 'No stories in your library yet'}
                    </p>
                    {!searchFilters.query && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Create stories through AI assistance or import from your collection
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {displayData.stories.map((story) => (
                      <div
                        key={story.id}
                        className={`group relative rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900/40 dark:to-gray-900/60 border transition-all duration-200 ${
                          selectedStories.has(story.id)
                            ? 'border-purple-400 dark:border-purple-500 ring-2 ring-purple-400/50'
                            : 'border-purple-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.01]'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        {showBulkActions && (
                          <div className="absolute top-4 left-4 z-10">
                            <button
                              onClick={() => toggleStorySelection(story.id)}
                              className="w-6 h-6 rounded-md border-2 border-purple-400 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors"
                            >
                              {selectedStories.has(story.id) && (
                                <Check className="w-4 h-4 text-purple-600" />
                              )}
                            </button>
                          </div>
                        )}

                        <Link
                          href={`/library/story/${story.id}`}
                          className={`block p-5 ${showBulkActions ? 'pl-14' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                                <SearchHighlight
                                  text={story.title}
                                  searchQuery={searchFilters.query}
                                />
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  <SearchHighlight
                                    text={story.topic || 'General'}
                                    searchQuery={searchFilters.query}
                                  />
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-sm">
                                  {story.language === 'GERMAN' ? '🇩🇪 German' : '🇪🇸 Spanish'}
                                </span>
                                {story.level && (
                                  <>
                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                      {story.level}
                                    </span>
                                  </>
                                )}
                              </div>
                              {story.summary && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                  <SearchHighlight
                                    text={story.summary}
                                    searchQuery={searchFilters.query}
                                  />
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>{story.wordCount} words</span>
                                <span>•</span>
                                <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Story Actions */}
                            {!showBulkActions && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/library/story/${story.id}/edit`);
                                  }}
                                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                                  aria-label="Edit story"
                                  disabled={operationStates[story.id] === 'editing'}
                                >
                                  <Edit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDuplicateStory(story.id);
                                  }}
                                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 relative"
                                  aria-label="Duplicate story"
                                  disabled={operationStates[story.id] === 'duplicating'}
                                >
                                  {operationStates[story.id] === 'duplicating' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 dark:border-purple-400"></div>
                                  ) : (
                                    <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteConfirmId(story.id);
                                  }}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                  aria-label="Delete story"
                                  disabled={operationStates[story.id] === 'deleting'}
                                >
                                  {operationStates[story.id] === 'deleting' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Delete Confirmation */}
                        {deleteConfirmId === story.id && (
                          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-xl flex items-center justify-center p-6 z-20">
                            <div className="text-center">
                              <p className="text-gray-900 dark:text-white font-medium mb-4">
                                Delete "{story.title}"?
                              </p>
                              <div className="flex gap-3 justify-center">
                                <button
                                  onClick={() => handleDeleteStory(story.id)}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                  disabled={operationStates[story.id] === 'deleting'}
                                >
                                  {operationStates[story.id] === 'deleting' && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  )}
                                  {operationStates[story.id] === 'deleting'
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                                  disabled={operationStates[story.id] === 'deleting'}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {activeTab === 'stories' && (
        <button
          onClick={() => router.push('/learn/topic')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-30"
          aria-label="Create new story"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
