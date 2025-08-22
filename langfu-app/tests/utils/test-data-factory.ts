// Test data factory for creating consistent test data

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  preferredLanguage: 'de' | 'es';
}

export interface TestWord {
  id: string;
  word: string;
  translation: string;
  language: 'de' | 'es';
  level: string;
  topic: string;
  partOfSpeech?: string;
  gender?: string;
  examples?: string[];
}

export interface TestProgress {
  userId: string;
  language: 'de' | 'es';
  wordsLearned: number;
  currentLevel: string;
  streak: number;
  lastActivity: Date;
}

export class TestDataFactory {
  private static userCounter = 0;
  private static wordCounter = 0;

  // Create a test user
  static createUser(overrides?: Partial<TestUser>): TestUser {
    this.userCounter++;
    return {
      id: `test-user-${this.userCounter}`,
      email: `testuser${this.userCounter}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${this.userCounter}`,
      preferredLanguage: 'de',
      ...overrides,
    };
  }

  // Create multiple test users
  static createUsers(count: number, overrides?: Partial<TestUser>): TestUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  // Create a test word
  static createWord(overrides?: Partial<TestWord>): TestWord {
    this.wordCounter++;
    const germanWords = [
      { word: 'Haus', translation: 'house', gender: 'das' },
      { word: 'Katze', translation: 'cat', gender: 'die' },
      { word: 'laufen', translation: 'to run', partOfSpeech: 'verb' },
      { word: 'schön', translation: 'beautiful', partOfSpeech: 'adjective' },
    ];

    const spanishWords = [
      { word: 'casa', translation: 'house', gender: 'la' },
      { word: 'gato', translation: 'cat', gender: 'el' },
      { word: 'correr', translation: 'to run', partOfSpeech: 'verb' },
      { word: 'hermoso', translation: 'beautiful', partOfSpeech: 'adjective' },
    ];

    const isGerman = !overrides?.language || overrides.language === 'de';
    const wordData = isGerman
      ? germanWords[this.wordCounter % germanWords.length]!
      : spanishWords[this.wordCounter % spanishWords.length]!;

    return {
      id: `test-word-${this.wordCounter}`,
      word: wordData?.word || 'test',
      translation: wordData?.translation || 'test',
      language: isGerman ? ('de' as const) : ('es' as const),
      level: 'A1',
      topic: 'Daily Life',
      examples: [`Example sentence with ${wordData?.word || 'test'}`],
      partOfSpeech: wordData?.partOfSpeech,
      gender: wordData?.gender,
      ...overrides,
    } as TestWord;
  }

  // Create multiple test words
  static createWords(count: number, overrides?: Partial<TestWord>): TestWord[] {
    return Array.from({ length: count }, () => this.createWord(overrides));
  }

  // Create vocabulary set for a specific level and topic
  static createVocabularySet(
    language: 'de' | 'es',
    level: string,
    topic: string,
    wordCount: number = 10
  ): TestWord[] {
    return this.createWords(wordCount, { language, level, topic });
  }

  // Create test progress
  static createProgress(
    userId: string,
    language: 'de' | 'es',
    overrides?: Partial<TestProgress>
  ): TestProgress {
    return {
      userId,
      language,
      wordsLearned: Math.floor(Math.random() * 100),
      currentLevel: 'A1',
      streak: Math.floor(Math.random() * 30),
      lastActivity: new Date(),
      ...overrides,
    };
  }

  // Create a learning session data
  static createLearningSession() {
    return {
      sessionId: `session-${Date.now()}`,
      startTime: new Date(),
      words: this.createWords(10),
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedWords: 0,
    };
  }

  // Create authentication tokens
  static createAuthTokens() {
    return {
      accessToken: `test-access-token-${Date.now()}`,
      refreshToken: `test-refresh-token-${Date.now()}`,
      expiresIn: 3600,
    };
  }

  // Create form data for testing
  static createLoginFormData(overrides?: Partial<{ email: string; password: string }>) {
    return {
      email: 'test@example.com',
      password: 'TestPassword123!',
      ...overrides,
    };
  }

  static createRegistrationFormData(
    overrides?: Partial<{
      email: string;
      password: string;
      confirmPassword: string;
      name: string;
      preferredLanguage: string;
    }>
  ) {
    return {
      email: `newuser${Date.now()}@example.com`,
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      name: 'New Test User',
      preferredLanguage: 'de',
      ...overrides,
    };
  }

  // Create sentence for testing
  static createSentence(wordId: string, userId: string) {
    return {
      id: `sentence-${Date.now()}`,
      wordId,
      userId,
      sentence: 'This is a test sentence with the word.',
      isCorrect: true,
      feedback: 'Great job!',
      createdAt: new Date(),
    };
  }

  // Create theme test data
  static createThemeTestData() {
    return {
      themes: ['light', 'dark', 'system'],
      defaultTheme: 'system',
      currentTheme: 'light',
      systemPreference: 'light',
    };
  }

  // Create mobile viewport configurations
  static getMobileViewports() {
    return [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Pixel 5', width: 393, height: 851 },
      { name: 'Samsung Galaxy S21', width: 384, height: 854 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
    ];
  }

  // Create accessibility test scenarios
  static getAccessibilityScenarios() {
    return [
      { name: 'Keyboard Navigation', keys: ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'] },
      {
        name: 'Screen Reader',
        ariaAttributes: ['aria-label', 'aria-describedby', 'role', 'aria-live'],
      },
      { name: 'Color Contrast', minRatio: 4.5 },
      { name: 'Focus Indicators', minSize: 2 },
      { name: 'Touch Targets', minSize: 44 },
    ];
  }

  // Reset counters for test isolation
  static reset() {
    this.userCounter = 0;
    this.wordCounter = 0;
  }
}
