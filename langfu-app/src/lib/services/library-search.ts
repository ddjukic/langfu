import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';

export interface SearchOptions {
  query?: string;
  language?: Language | 'all';
  level?: string | 'all';
  topic?: string;
  userId?: string;
  limit?: number;
  includeExamples?: boolean;
}

export interface SearchResults {
  words?: Array<{
    id: string;
    l2: string;
    l1: string;
    level: string;
    topic: string | null;
    language: Language;
    pos?: string | null;
    exampleCount?: number;
    examples?: Array<{
      sentence: string;
      translation: string;
    }>;
  }>;
  stories?: Array<{
    id: string;
    title: string;
    topic: string | null;
    language: Language;
    level: string | null;
    wordCount: number;
    summary: string | null;
    createdAt: Date;
  }>;
  vocabularySets?: Array<{
    id: string;
    name: string;
    description: string | null;
    language: Language;
    isPublic: boolean;
    wordCount: number;
    createdAt: Date;
  }>;
  statistics?: {
    totalWords: number;
    totalStories: number;
    totalSets: number;
    byLanguage: Record<string, number>;
    byLevel: Record<string, number>;
    byTopic: Record<string, number>;
  };
}

export class LibrarySearchService {
  /**
   * Search for words based on criteria
   */
  static async searchWords(options: SearchOptions) {
    const where: any = {};

    if (options.language && options.language !== 'all') {
      where.language = options.language;
    }

    if (options.level && options.level !== 'all') {
      where.level = options.level.toUpperCase();
    }

    if (options.topic) {
      where.topic = {
        contains: options.topic,
        mode: 'insensitive',
      };
    }

    if (options.query) {
      where.OR = [
        { l2: { contains: options.query, mode: 'insensitive' } },
        { l1: { contains: options.query, mode: 'insensitive' } },
        { topic: { contains: options.query, mode: 'insensitive' } },
      ];
    }

    const words = await prisma.word.findMany({
      where,
      include: {
        examples: options.includeExamples ? true : false,
        _count: {
          select: { examples: true },
        },
      },
      take: options.limit || 100,
      orderBy: [{ topic: 'asc' }, { level: 'asc' }, { l2: 'asc' }],
    });

    return words.map((word) => ({
      id: word.id,
      l2: word.l2,
      l1: word.l1,
      level: word.level,
      topic: word.topic,
      language: word.language,
      pos: word.pos,
      exampleCount: word._count.examples,
      examples: options.includeExamples
        ? word.examples?.map((ex) => ({
            sentence: ex.sentence,
            translation: ex.translation || '',
          }))
        : undefined,
    }));
  }

  /**
   * Search for stories based on criteria
   */
  static async searchStories(options: SearchOptions) {
    const where: any = {};

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.language && options.language !== 'all') {
      where.language = options.language;
    }

    if (options.level && options.level !== 'all') {
      where.level = options.level.toUpperCase();
    }

    if (options.topic) {
      where.topic = {
        contains: options.topic,
        mode: 'insensitive',
      };
    }

    if (options.query) {
      where.OR = [
        { title: { contains: options.query, mode: 'insensitive' } },
        { topic: { contains: options.query, mode: 'insensitive' } },
        { summary: { contains: options.query, mode: 'insensitive' } },
      ];
    }

    const stories = await prisma.story.findMany({
      where,
      select: {
        id: true,
        title: true,
        topic: true,
        language: true,
        level: true,
        wordCount: true,
        summary: true,
        createdAt: true,
      },
      take: options.limit || 100,
      orderBy: { createdAt: 'desc' },
    });

    return stories;
  }

  /**
   * Search for vocabulary sets
   */
  static async searchVocabularySets(options: SearchOptions) {
    const where: any = {};

    if (options.language && options.language !== 'all') {
      where.language = options.language;
    }

    if (options.query) {
      where.OR = [
        { name: { contains: options.query, mode: 'insensitive' } },
        { description: { contains: options.query, mode: 'insensitive' } },
      ];
    }

    // Show public sets or user's private sets
    if (options.userId) {
      where.OR = [{ isPublic: true }, { userId: options.userId }];
    } else {
      where.isPublic = true;
    }

    const sets = await prisma.vocabularySet.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        isPublic: true,
        data: true,
        createdAt: true,
      },
      take: options.limit || 100,
      orderBy: { createdAt: 'desc' },
    });

    return sets.map((set) => ({
      id: set.id,
      name: set.name,
      description: set.description,
      language: set.language,
      isPublic: set.isPublic,
      wordCount: Array.isArray(set.data) ? (set.data as any[]).length : 0,
      createdAt: set.createdAt,
    }));
  }

  /**
   * Get statistics about the library
   */
  static async getStatistics(options: SearchOptions) {
    const wordWhere: any = {};
    const storyWhere: any = {};

    if (options.userId) {
      storyWhere.userId = options.userId;
    }

    if (options.language && options.language !== 'all') {
      wordWhere.language = options.language;
      storyWhere.language = options.language;
    }

    if (options.level && options.level !== 'all') {
      wordWhere.level = options.level.toUpperCase();
      storyWhere.level = options.level.toUpperCase();
    }

    // Get counts
    const [totalWords, totalStories, totalSets] = await Promise.all([
      prisma.word.count({ where: wordWhere }),
      prisma.story.count({ where: storyWhere }),
      prisma.vocabularySet.count({ where: { language: wordWhere.language } }),
    ]);

    // Get breakdowns
    const [byLanguage, byLevel, byTopic] = await Promise.all([
      // By language
      prisma.word.groupBy({
        by: ['language'],
        where: wordWhere,
        _count: true,
      }),
      // By level
      prisma.word.groupBy({
        by: ['level'],
        where: wordWhere,
        _count: true,
      }),
      // By topic
      prisma.word.groupBy({
        by: ['topic'],
        where: wordWhere,
        _count: true,
        orderBy: { _count: { topic: 'desc' } },
        take: 10, // Top 10 topics
      }),
    ]);

    return {
      totalWords,
      totalStories,
      totalSets,
      byLanguage: byLanguage.reduce(
        (acc, item) => {
          acc[item.language] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byLevel: byLevel.reduce(
        (acc, item) => {
          acc[item.level] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byTopic: byTopic.reduce(
        (acc, item) => {
          if (item.topic) acc[item.topic] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Unified search across all library content
   */
  static async search(options: SearchOptions): Promise<SearchResults> {
    const results: SearchResults = {};

    // Search words if no specific type or includes words
    const [words, stories, vocabularySets, statistics] = await Promise.all([
      this.searchWords(options),
      this.searchStories(options),
      this.searchVocabularySets(options),
      this.getStatistics(options),
    ]);

    if (words.length > 0) results.words = words;
    if (stories.length > 0) results.stories = stories;
    if (vocabularySets.length > 0) results.vocabularySets = vocabularySets;
    results.statistics = statistics;

    return results;
  }

  /**
   * Natural language query parser
   */
  static parseNaturalQuery(query: string): SearchOptions {
    const options: SearchOptions = {};
    const lowerQuery = query.toLowerCase();

    // Detect language
    if (/german|deutsch|🇩🇪/i.test(query)) {
      options.language = 'GERMAN' as Language;
    } else if (/spanish|español|🇪🇸/i.test(query)) {
      options.language = 'SPANISH' as Language;
    }

    // Detect level
    const levelMatch = query.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
    if (levelMatch) {
      options.level = levelMatch[1].toUpperCase();
    }

    // Special case: if asking for "topics", don't search for specific words
    const isAskingForTopics =
      /\b(list|show|get|have|my)\s+(all\s+)?(german|spanish)?\s*(language\s+)?topics?\b/i.test(
        query
      );
    const isAskingForStats = /\bhow many\b/i.test(query);

    if (!isAskingForTopics && !isAskingForStats) {
      // Detect topic keywords
      const topicKeywords = [
        'bicycle',
        'bike',
        'cycling',
        'travel',
        'traveling',
        'transport',
        'transportation',
        'food',
        'drink',
        'weather',
        'family',
        'work',
        'school',
        'hobby',
        'sport',
        'house',
        'home',
        'city',
        'nature',
        'animal',
        'technology',
        'computer',
        'music',
        'art',
        'culture',
        'holiday',
        'vacation',
        'shopping',
        'clothes',
      ];

      for (const keyword of topicKeywords) {
        if (lowerQuery.includes(keyword)) {
          options.topic = keyword;
          break;
        }
      }

      // Extract search terms (remove language, level, and common words)
      const cleanQuery = query
        .replace(/\b(german|spanish|deutsch|español|A1|A2|B1|B2|C1|C2)\b/gi, '')
        .replace(
          /\b(list|show|find|search|get|have|any|all|my|topics?|words?|stories?|related|about|language)\b/gi,
          ''
        )
        .trim();

      if (cleanQuery.length > 2) {
        options.query = cleanQuery;
      }
    }

    return options;
  }
}
