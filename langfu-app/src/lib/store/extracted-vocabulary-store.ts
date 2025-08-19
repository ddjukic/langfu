import { create } from 'zustand';

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
  title: string | null;
  url: string;
  language: string;
  wordCount: number;
  level: string | null;
  extractedAt: string;
  extractedWords: ExtractedWord[];
}

interface ExtractedVocabularyState {
  extractions: WebExtraction[];
  isLoading: boolean;

  // Actions
  setExtractions: (extractions: WebExtraction[]) => void;
  setLoading: (loading: boolean) => void;

  // Optimistic delete
  deleteExtraction: (id: string) => void;

  // Restore on error
  restoreExtraction: (extraction: WebExtraction) => void;
}

export const useExtractedVocabularyStore = create<ExtractedVocabularyState>((set) => ({
  extractions: [],
  isLoading: false,

  setExtractions: (extractions) => set({ extractions }),
  setLoading: (loading) => set({ isLoading: loading }),

  deleteExtraction: (id) =>
    set((state) => ({
      extractions: state.extractions.filter((e) => e.id !== id),
    })),

  restoreExtraction: (extraction) =>
    set((state) => ({
      extractions: [...state.extractions, extraction].sort(
        (a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()
      ),
    })),
}));
