// Mock API responses for testing

export class MockAPI {
  // Authentication mocks
  static mockLoginSuccess() {
    return {
      success: true,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferredLanguage: 'de',
      },
      token: 'mock-jwt-token',
    };
  }

  static mockLoginFailure() {
    return {
      success: false,
      error: 'Invalid credentials',
    };
  }

  static mockRegisterSuccess() {
    return {
      success: true,
      user: {
        id: 'new-user-123',
        email: 'newuser@example.com',
        name: 'New User',
        preferredLanguage: 'de',
      },
      token: 'mock-jwt-token',
    };
  }

  static mockRegisterFailure() {
    return {
      success: false,
      error: 'Email already exists',
    };
  }

  // Vocabulary mocks
  static mockGetWords(language: 'de' | 'es', level: string, topic: string) {
    const words =
      language === 'de'
        ? [
            { id: '1', word: 'Haus', translation: 'house', gender: 'das', level, topic },
            { id: '2', word: 'Katze', translation: 'cat', gender: 'die', level, topic },
            { id: '3', word: 'laufen', translation: 'to run', partOfSpeech: 'verb', level, topic },
          ]
        : [
            { id: '1', word: 'casa', translation: 'house', gender: 'la', level, topic },
            { id: '2', word: 'gato', translation: 'cat', gender: 'el', level, topic },
            { id: '3', word: 'correr', translation: 'to run', partOfSpeech: 'verb', level, topic },
          ];

    return {
      success: true,
      words,
      total: words.length,
    };
  }

  static mockSaveVocabulary() {
    return {
      success: true,
      message: 'Vocabulary saved successfully',
      savedCount: 10,
    };
  }

  // Progress mocks
  static mockGetProgress(userId: string, language: 'de' | 'es') {
    return {
      success: true,
      progress: {
        userId,
        language,
        wordsLearned: 45,
        currentLevel: 'A2',
        streak: 7,
        lastActivity: new Date().toISOString(),
        totalTimeSpent: 3600, // seconds
        achievements: ['First Word', '7 Day Streak'],
      },
    };
  }

  static mockUpdateProgress() {
    return {
      success: true,
      message: 'Progress updated successfully',
    };
  }

  // AI/LLM mocks
  static mockGenerateExamples(word: string) {
    return {
      success: true,
      examples: [
        `Here is an example sentence with ${word}.`,
        `Another context where you might use ${word}.`,
        `A third example showing ${word} in action.`,
      ],
    };
  }

  static mockValidateSentence(sentence: string) {
    return {
      success: true,
      isCorrect: sentence.length > 10,
      feedback:
        sentence.length > 10
          ? 'Great job! Your sentence is grammatically correct.'
          : 'Try to make your sentence a bit longer and more descriptive.',
      corrections: [],
    };
  }

  // Session mocks
  static mockGetLearningSession() {
    return {
      success: true,
      session: {
        id: 'session-123',
        words: [
          { id: '1', word: 'Haus', translation: 'house', mastery: 0 },
          { id: '2', word: 'Katze', translation: 'cat', mastery: 1 },
          { id: '3', word: 'laufen', translation: 'to run', mastery: 0 },
        ],
        mode: 'matching',
        timeLimit: 300, // seconds
      },
    };
  }

  static mockSubmitSessionResults() {
    return {
      success: true,
      summary: {
        correctAnswers: 8,
        incorrectAnswers: 2,
        accuracy: 0.8,
        xpEarned: 50,
        streakMaintained: true,
      },
    };
  }

  // Settings mocks
  static mockGetSettings(userId: string) {
    return {
      success: true,
      settings: {
        userId,
        preferredLanguage: 'de',
        dailyGoal: 10,
        notificationsEnabled: true,
        soundEnabled: true,
        theme: 'system',
        fontSize: 'medium',
      },
    };
  }

  static mockUpdateSettings() {
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  }

  // Error responses
  static mockServerError() {
    return {
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    };
  }

  static mockUnauthorized() {
    return {
      success: false,
      error: 'Unauthorized',
      statusCode: 401,
    };
  }

  static mockNotFound() {
    return {
      success: false,
      error: 'Resource not found',
      statusCode: 404,
    };
  }

  static mockRateLimit() {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      statusCode: 429,
      retryAfter: 60, // seconds
    };
  }

  // Utility function to simulate network delay
  static async withDelay<T>(response: T, delayMs: number = 100): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(response), delayMs);
    });
  }

  // Utility function to simulate random failures
  static withRandomFailure<T>(
    successResponse: T,
    failureResponse: any,
    failureRate: number = 0.1
  ): T | any {
    return Math.random() < failureRate ? failureResponse : successResponse;
  }
}
