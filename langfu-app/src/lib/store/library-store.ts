import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { Language } from '@prisma/client';

// ============= Types =============

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
  content?: string;
  prompt?: string | null;
  keywords?: any;
  words?: any;
  createdAt: string;
  updatedAt?: string;
}

interface KeywordItem {
  l2: string;
  l1: string;
  pos?: string;
  synonyms?: string[];
  examples?: Array<{ sentence: string; translation: string }>;
}

// Search & Filter Types
interface SearchFilters {
  query: string;
  level: string;
  language: string;
  sortBy: 'date' | 'title' | 'level';
}

interface SearchResults {
  words?: Word[];
  stories?: Story[];
}

// UI State Types
interface UIState {
  activeTab: 'words' | 'stories';
  selectedStories: Set<string>;
  showBulkActions: boolean;
  deleteConfirmId: string | null;
  showFilters: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

// Operation States
type OperationType = 'deleting' | 'duplicating' | 'editing' | 'creating' | 'updating';

interface OperationState {
  [storyId: string]: OperationType;
}

// Main Store State
interface LibraryState {
  // ===== Data =====
  stories: Story[];
  wordHistories: WordHistory[];
  currentStory: Story | null;
  translatedWords: KeywordItem[] | null;

  // ===== Search & Filters =====
  searchFilters: SearchFilters;
  searchResults: SearchResults | null;
  isSearching: boolean;

  // ===== UI State =====
  ui: UIState;

  // ===== Loading & Operations =====
  operationStates: OperationState;
  isLoading: boolean;
  bulkDeleteLoading: boolean;
  practiceLoading: boolean;
  translationsLoading: boolean;

  // ===== Actions - Stories =====
  setStories: (stories: Story[]) => void;
  addStory: (story: Story) => void;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => Promise<void>;
  duplicateStory: (id: string) => Promise<void>;
  bulkDeleteStories: (ids: string[]) => Promise<void>;
  setCurrentStory: (story: Story | null) => void;

  // ===== Actions - Word Histories =====
  setWordHistories: (histories: WordHistory[]) => void;
  updateWordHistory: (id: string, updates: Partial<WordHistory>) => void;

  // ===== Actions - Search & Filters =====
  setSearchQuery: (query: string) => void;
  setFilterLevel: (level: string) => void;
  setFilterLanguage: (language: string) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'level') => void;
  performSearch: () => Promise<void>;
  clearSearchResults: () => void;

  // ===== Actions - UI =====
  setActiveTab: (tab: 'words' | 'stories') => void;
  toggleStorySelection: (id: string) => void;
  selectAllStories: () => void;
  clearSelectedStories: () => void;
  setShowBulkActions: (show: boolean) => void;
  setDeleteConfirmId: (id: string | null) => void;
  setShowFilters: (show: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;

  // ===== Actions - Operations =====
  setOperationState: (id: string, operation: OperationType | null) => void;
  clearOperationState: (id: string) => void;

  // ===== Actions - Translations =====
  setTranslatedWords: (words: KeywordItem[] | null) => void;
  loadTranslations: (storyId: string) => Promise<void>;

  // ===== Computed Getters =====
  getFilteredStories: () => Story[];
  getFilteredWords: () => WordHistory[];
  getStoryById: (id: string) => Story | undefined;
  getSelectedStoriesArray: () => string[];

  // ===== Utility Actions =====
  reset: () => void;
  hydrate: () => void;
}

// ============= Initial State =============

const initialUIState: UIState = {
  activeTab: 'words',
  selectedStories: new Set(),
  showBulkActions: false,
  deleteConfirmId: null,
  showFilters: false,
  errorMessage: null,
  successMessage: null,
};

const initialSearchFilters: SearchFilters = {
  query: '',
  level: 'all',
  language: 'all',
  sortBy: 'date',
};

const initialState = {
  stories: [],
  wordHistories: [],
  currentStory: null,
  translatedWords: null,
  searchFilters: initialSearchFilters,
  searchResults: null,
  isSearching: false,
  ui: initialUIState,
  operationStates: {},
  isLoading: false,
  bulkDeleteLoading: false,
  practiceLoading: false,
  translationsLoading: false,
};

// ============= Store Implementation =============

export const useLibraryStore = create<LibraryState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ===== Story Actions =====
      setStories: (stories) => set({ stories }, false, 'setStories'),

      addStory: (story) =>
        set(
          produce((state: LibraryState) => {
            state.stories.unshift(story);
          }),
          false,
          'addStory'
        ),

      updateStory: (id, updates) =>
        set(
          produce((state: LibraryState) => {
            const index = state.stories.findIndex((s) => s.id === id);
            if (index !== -1 && state.stories[index]) {
              Object.assign(state.stories[index], updates);
            }
            if (state.currentStory?.id === id && state.currentStory) {
              Object.assign(state.currentStory, updates);
            }
          }),
          false,
          'updateStory'
        ),

      deleteStory: async (id) => {
        const { stories, setOperationState, clearOperationState, setErrorMessage } = get();
        const storyToDelete = stories.find((s) => s.id === id);

        // Optimistic update
        setOperationState(id, 'deleting');
        set(
          produce((state: LibraryState) => {
            state.stories = state.stories.filter((s) => s.id !== id);
            state.ui.deleteConfirmId = null;
          }),
          false,
          'deleteStory:optimistic'
        );

        try {
          const response = await fetch(`/api/library/story/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete story');
          }
        } catch (error) {
          // Rollback on error
          if (storyToDelete) {
            set(
              produce((state: LibraryState) => {
                state.stories.push(storyToDelete);
                state.stories.sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              }),
              false,
              'deleteStory:rollback'
            );
          }
          setErrorMessage('Failed to delete story. Please try again.');
          throw error;
        } finally {
          clearOperationState(id);
        }
      },

      duplicateStory: async (id) => {
        const { stories, setOperationState, clearOperationState, setErrorMessage } = get();
        const storyToDuplicate = stories.find((s) => s.id === id);

        if (!storyToDuplicate) {
          setErrorMessage('Story not found');
          return;
        }

        setOperationState(id, 'duplicating');

        try {
          const response = await fetch(`/api/library/story/${id}/duplicate`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to duplicate story');
          }

          const duplicatedStory = await response.json();

          // Add the duplicated story
          set(
            produce((state: LibraryState) => {
              state.stories.unshift({
                ...duplicatedStory,
                title: duplicatedStory.title || `${storyToDuplicate.title} (Copy)`,
                createdAt: new Date().toISOString(),
              });
            }),
            false,
            'duplicateStory:success'
          );
        } catch (error) {
          setErrorMessage('Failed to duplicate story. Please try again.');
          throw error;
        } finally {
          clearOperationState(id);
        }
      },

      bulkDeleteStories: async (ids) => {
        const { stories, setErrorMessage, ui } = get();
        const storiesToDelete = stories.filter((s) => ids.includes(s.id));

        set({ bulkDeleteLoading: true }, false, 'bulkDeleteStories:start');

        // Optimistic update
        set(
          produce((state: LibraryState) => {
            state.stories = state.stories.filter((s) => !ids.includes(s.id));
            state.ui.selectedStories.clear();
            state.ui.showBulkActions = false;
          }),
          false,
          'bulkDeleteStories:optimistic'
        );

        try {
          const response = await fetch('/api/library/story/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyIds: ids }),
          });

          if (!response.ok) {
            throw new Error('Failed to delete stories');
          }
        } catch (error) {
          // Rollback on error
          set(
            produce((state: LibraryState) => {
              state.stories.push(...storiesToDelete);
              state.stories.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              ids.forEach((id) => state.ui.selectedStories.add(id));
              state.ui.showBulkActions = true;
            }),
            false,
            'bulkDeleteStories:rollback'
          );
          setErrorMessage('Failed to delete selected stories. Please try again.');
          throw error;
        } finally {
          set({ bulkDeleteLoading: false }, false, 'bulkDeleteStories:end');
        }
      },

      setCurrentStory: (story) => set({ currentStory: story }, false, 'setCurrentStory'),

      // ===== Word History Actions =====
      setWordHistories: (histories) => set({ wordHistories: histories }, false, 'setWordHistories'),

      updateWordHistory: (id, updates) =>
        set(
          produce((state: LibraryState) => {
            const index = state.wordHistories.findIndex((h) => h.id === id);
            if (index !== -1 && state.wordHistories[index]) {
              Object.assign(state.wordHistories[index], updates);
            }
          }),
          false,
          'updateWordHistory'
        ),

      // ===== Search & Filter Actions =====
      setSearchQuery: (query) =>
        set(
          produce((state: LibraryState) => {
            state.searchFilters.query = query;
          }),
          false,
          'setSearchQuery'
        ),

      setFilterLevel: (level) =>
        set(
          produce((state: LibraryState) => {
            state.searchFilters.level = level;
          }),
          false,
          'setFilterLevel'
        ),

      setFilterLanguage: (language) =>
        set(
          produce((state: LibraryState) => {
            state.searchFilters.language = language;
          }),
          false,
          'setFilterLanguage'
        ),

      setSortBy: (sortBy) =>
        set(
          produce((state: LibraryState) => {
            state.searchFilters.sortBy = sortBy;
          }),
          false,
          'setSortBy'
        ),

      performSearch: async () => {
        const { searchFilters } = get();
        const { query } = searchFilters;

        if (!query.trim() || query.length < 2) {
          set({ searchResults: null }, false, 'performSearch:clear');
          return;
        }

        set({ isSearching: true }, false, 'performSearch:start');

        try {
          const response = await fetch(
            `/api/library/search?q=${encodeURIComponent(query)}&type=all`
          );

          if (response.ok) {
            const results = await response.json();
            set({ searchResults: results }, false, 'performSearch:success');
          } else {
            throw new Error('Search failed');
          }
        } catch (error) {
          console.error('Search error:', error);
          set({ searchResults: null }, false, 'performSearch:error');
        } finally {
          set({ isSearching: false }, false, 'performSearch:end');
        }
      },

      clearSearchResults: () => set({ searchResults: null }, false, 'clearSearchResults'),

      // ===== UI Actions =====
      setActiveTab: (tab) =>
        set(
          produce((state: LibraryState) => {
            state.ui.activeTab = tab;
          }),
          false,
          'setActiveTab'
        ),

      toggleStorySelection: (id) =>
        set(
          produce((state: LibraryState) => {
            if (state.ui.selectedStories.has(id)) {
              state.ui.selectedStories.delete(id);
            } else {
              state.ui.selectedStories.add(id);
            }
          }),
          false,
          'toggleStorySelection'
        ),

      selectAllStories: () => {
        const { getFilteredStories } = get();
        const filteredStories = getFilteredStories();

        set(
          produce((state: LibraryState) => {
            if (state.ui.selectedStories.size === filteredStories.length) {
              state.ui.selectedStories.clear();
            } else {
              state.ui.selectedStories = new Set(filteredStories.map((s) => s.id));
            }
          }),
          false,
          'selectAllStories'
        );
      },

      clearSelectedStories: () =>
        set(
          produce((state: LibraryState) => {
            state.ui.selectedStories.clear();
          }),
          false,
          'clearSelectedStories'
        ),

      setShowBulkActions: (show) =>
        set(
          produce((state: LibraryState) => {
            state.ui.showBulkActions = show;
            if (!show) {
              state.ui.selectedStories = new Set();
            }
          }),
          false,
          'setShowBulkActions'
        ),

      setDeleteConfirmId: (id) =>
        set(
          produce((state: LibraryState) => {
            state.ui.deleteConfirmId = id;
          }),
          false,
          'setDeleteConfirmId'
        ),

      setShowFilters: (show) =>
        set(
          produce((state: LibraryState) => {
            state.ui.showFilters = show;
          }),
          false,
          'setShowFilters'
        ),

      setErrorMessage: (message) =>
        set(
          produce((state: LibraryState) => {
            state.ui.errorMessage = message;
          }),
          false,
          'setErrorMessage'
        ),

      setSuccessMessage: (message) =>
        set(
          produce((state: LibraryState) => {
            state.ui.successMessage = message;
          }),
          false,
          'setSuccessMessage'
        ),

      clearMessages: () =>
        set(
          produce((state: LibraryState) => {
            state.ui.errorMessage = null;
            state.ui.successMessage = null;
          }),
          false,
          'clearMessages'
        ),

      // ===== Operation State Actions =====
      setOperationState: (id, operation) =>
        set(
          produce((state: LibraryState) => {
            if (operation) {
              state.operationStates[id] = operation;
            } else {
              delete state.operationStates[id];
            }
          }),
          false,
          'setOperationState'
        ),

      clearOperationState: (id) =>
        set(
          produce((state: LibraryState) => {
            delete state.operationStates[id];
          }),
          false,
          'clearOperationState'
        ),

      // ===== Translation Actions =====
      setTranslatedWords: (words) => set({ translatedWords: words }, false, 'setTranslatedWords'),

      loadTranslations: async (storyId) => {
        set({ translationsLoading: true }, false, 'loadTranslations:start');

        try {
          const response = await fetch(`/api/library/story/${storyId}/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            set({ translatedWords: result.words }, false, 'loadTranslations:success');
          } else {
            throw new Error('Failed to load translations');
          }
        } catch (error) {
          console.error('Translation loading error:', error);
          get().setErrorMessage('Failed to load translations');
          throw error;
        } finally {
          set({ translationsLoading: false }, false, 'loadTranslations:end');
        }
      },

      // ===== Computed Getters =====
      getFilteredStories: () => {
        const { stories, searchFilters, searchResults } = get();
        const { query, level, language, sortBy } = searchFilters;

        // Use search results if available and search is active
        let storiesToFilter = stories;
        if (searchResults && query.length >= 2) {
          storiesToFilter = searchResults.stories || [];
        }

        let filtered = storiesToFilter.filter((story) => {
          const matchesLevel = level === 'all' || story.level === level;
          const matchesLanguage = language === 'all' || story.language === language;
          return matchesLevel && matchesLanguage;
        });

        // Sort
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'title':
              return a.title.localeCompare(b.title);
            case 'level':
              return (a.level || '').localeCompare(b.level || '');
            case 'date':
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        });

        return filtered;
      },

      getFilteredWords: () => {
        const { wordHistories, searchFilters, searchResults } = get();
        const { query, level, language } = searchFilters;

        // Use search results if available and search is active
        let wordsToFilter = wordHistories;
        if (searchResults && query.length >= 2) {
          // Convert search results to WordHistory format
          const searchWordHistories = (searchResults.words || []).map((word) => {
            // Find existing history for this word, or create a placeholder
            const existingHistory = wordHistories.find((h) => h.word.id === word.id);
            return (
              existingHistory || {
                id: `search-${word.id}`,
                word,
                mastery: 0,
                createdAt: new Date().toISOString(),
              }
            );
          });
          wordsToFilter = searchWordHistories;
        }

        return wordsToFilter.filter((h) => {
          const matchesLevel = level === 'all' || h.word.level === level;
          const matchesLanguage = language === 'all' || h.word.language === language;
          return matchesLevel && matchesLanguage;
        });
      },

      getStoryById: (id) => {
        const { stories } = get();
        return stories.find((s) => s.id === id);
      },

      getSelectedStoriesArray: () => {
        const { ui } = get();
        return Array.from(ui.selectedStories);
      },

      // ===== Utility Actions =====
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'library-store',
    }
  )
);

// ============= Selectors for performance optimization =============

// Story selectors
export const selectStories = (state: LibraryState) => state.stories;
export const selectCurrentStory = (state: LibraryState) => state.currentStory;

// Word selectors
export const selectWordHistories = (state: LibraryState) => state.wordHistories;
export const selectTranslatedWords = (state: LibraryState) => state.translatedWords;

// Search selectors
export const selectSearchFilters = (state: LibraryState) => state.searchFilters;
export const selectSearchResults = (state: LibraryState) => state.searchResults;
export const selectIsSearching = (state: LibraryState) => state.isSearching;

// UI selectors
export const selectUIState = (state: LibraryState) => state.ui;
export const selectActiveTab = (state: LibraryState) => state.ui.activeTab;
export const selectSelectedStories = (state: LibraryState) => state.ui.selectedStories;
export const selectShowBulkActions = (state: LibraryState) => state.ui.showBulkActions;
export const selectErrorMessage = (state: LibraryState) => state.ui.errorMessage;
export const selectSuccessMessage = (state: LibraryState) => state.ui.successMessage;

// Loading selectors
export const selectOperationStates = (state: LibraryState) => state.operationStates;
export const selectIsLoading = (state: LibraryState) => state.isLoading;
export const selectBulkDeleteLoading = (state: LibraryState) => state.bulkDeleteLoading;
export const selectPracticeLoading = (state: LibraryState) => state.practiceLoading;
export const selectTranslationsLoading = (state: LibraryState) => state.translationsLoading;

// ============= Hooks for commonly used combinations =============

export const useFilteredLibraryData = () => {
  const stories = useLibraryStore(selectStories);
  const wordHistories = useLibraryStore(selectWordHistories);
  const activeTab = useLibraryStore(selectActiveTab);

  return {
    filteredStories: stories,
    filteredWords: wordHistories,
    activeTab,
  };
};

export const useLibraryUIState = () => {
  const ui = useLibraryStore(selectUIState);
  const operationStates = useLibraryStore(selectOperationStates);
  const isLoading = useLibraryStore(selectIsLoading);
  const bulkDeleteLoading = useLibraryStore(selectBulkDeleteLoading);

  return {
    ...ui,
    operationStates,
    isLoading,
    bulkDeleteLoading,
  };
};

export const useStoryOperations = () => {
  const deleteStory = useLibraryStore((state) => state.deleteStory);
  const duplicateStory = useLibraryStore((state) => state.duplicateStory);
  const bulkDeleteStories = useLibraryStore((state) => state.bulkDeleteStories);
  const updateStory = useLibraryStore((state) => state.updateStory);

  return {
    deleteStory,
    duplicateStory,
    bulkDeleteStories,
    updateStory,
  };
};
