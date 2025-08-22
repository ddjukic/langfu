import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { prisma } from '../src/lib/prisma';
import { LibrarySearchService } from '../src/lib/services/library-search';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*',
    exposedHeaders: ['Mcp-Session-Id'],
    allowedHeaders: ['Content-Type', 'mcp-session-id'],
  })
);

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

async function resolveUserId(input: { userId?: string; userEmail?: string }) {
  if (input.userId) {
    const u = await prisma.user.findUnique({ where: { id: input.userId } });
    if (u) return u.id;
  }
  if (input.userEmail) {
    const u = await prisma.user.findUnique({ where: { email: input.userEmail } });
    if (u) return u.id;
  }
  const first = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  return first?.id;
}

function getServer() {
  const server = new McpServer({ name: 'langfu-mcp', version: '1.0.0' });

  server.registerTool(
    'create_story',
    {
      title: 'Create Story',
      description:
        "Create and save a story to the user's library with properly structured keywords",
      inputSchema: {
        userId: z.string().optional().describe('User ID for story ownership'),
        userEmail: z.string().optional().describe('User email as alternative to userId'),
        title: z.string().describe('Story title'),
        topic: z.string().optional().describe('Story topic/theme'),
        keywords: z
          .array(
            z.object({
              l2: z.string().describe('Word in target language'),
              l1: z.string().describe('Translation in English'),
              pos: z.string().optional().describe('Part of speech'),
              examples: z
                .array(
                  z.object({
                    sentence: z.string().describe('Example sentence'),
                    translation: z.string().describe('Translation of example'),
                  })
                )
                .min(2)
                .describe('At least 2 example sentences required'),
            })
          )
          .min(5)
          .describe('At least 5 keywords with translations and examples required'),
        prompt: z.string().optional().describe('Original prompt used to generate story'),
        content: z.string().describe('Full story content'),
        language: z.enum(['GERMAN', 'SPANISH']).describe('Story language'),
        level: z.string().describe('CEFR level (A1-C2)'),
      },
    },
    async ({ userId, userEmail, title, topic, keywords, prompt, content, language, level }) => {
      // Validate CEFR level
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const normalizedLevel = level.toUpperCase();
      if (!validLevels.includes(normalizedLevel)) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Invalid CEFR level "${level}". Must be one of: ${validLevels.join(', ')}`,
            },
          ],
          isError: true,
        } as const;
      }

      // Validate keywords structure
      for (const keyword of keywords) {
        if (!keyword.l1 || keyword.l1.trim() === '') {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Keyword "${keyword.l2}" is missing its English translation.`,
              },
            ],
            isError: true,
          } as const;
        }
        if (!keyword.examples || keyword.examples.length < 2) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Keyword "${keyword.l2}" needs at least 2 example sentences (has ${keyword.examples?.length || 0})`,
              },
            ],
            isError: true,
          } as const;
        }
        for (const example of keyword.examples) {
          if (!example.translation || example.translation.trim() === '') {
            return {
              content: [
                {
                  type: 'text',
                  text: `Error: Example sentence "${example.sentence}" for keyword "${keyword.l2}" is missing its translation.`,
                },
              ],
              isError: true,
            } as const;
          }
        }
      }

      const resolvedUserId = await resolveUserId({ userId, userEmail });
      if (!resolvedUserId)
        return {
          content: [
            { type: 'text', text: 'No user found. Please create an account in Langfu first.' },
          ],
          isError: true,
        } as const;

      const wordCount = content.trim().split(/\s+/).length;
      const summary = content.replace(/\s+/g, ' ').trim().split(' ').slice(0, 10).join(' ');

      // Keywords are already properly structured with translations and examples
      const story = await prisma.story.create({
        data: {
          userId: resolvedUserId,
          title,
          topic,
          keywords, // Store the full objects with translations and examples
          prompt: prompt ?? null,
          words: keywords, // Keep same data for backwards compatibility
          content,
          language: language as any,
          level: normalizedLevel,
          wordCount,
          summary,
        },
      });
      return { content: [{ type: 'text', text: story.id }] } as const;
    }
  );

  server.registerTool(
    'create_lesson',
    {
      title: 'Create Lesson',
      description: 'Create and save a lesson with structured content',
      inputSchema: {
        userId: z.string().optional(),
        userEmail: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        content: z.any(),
        language: z.enum(['GERMAN', 'SPANISH']),
      },
    },
    async ({ userId, userEmail, title, description, content, language }) => {
      const resolvedUserId = await resolveUserId({ userId, userEmail });
      if (!resolvedUserId)
        return {
          content: [
            { type: 'text', text: 'No user found. Please create an account in Langfu first.' },
          ],
          isError: true,
        } as const;
      const lesson = await prisma.lesson.create({
        data: { userId: resolvedUserId, title, description, content, language: language as any },
      });
      return { content: [{ type: 'text', text: lesson.id }] } as const;
    }
  );

  server.registerTool(
    'create_word_package',
    {
      title: 'Create Word Package',
      description:
        'Create a vocabulary package with words, translations, and example sentences. All words MUST have example sentences. Can be created globally (for all users) or for a specific user.',
      inputSchema: {
        name: z
          .string()
          .describe(
            'The topic name for this vocabulary package (e.g., "Bicycles", "Weather", "Food")'
          ),
        description: z
          .string()
          .optional()
          .describe('Optional description of the vocabulary package'),
        language: z.enum(['GERMAN', 'SPANISH']).describe('Target language for the vocabulary'),
        level: z.string().describe('CEFR level (A1, A2, B1, B2, C1, C2)'),
        userId: z
          .string()
          .optional()
          .describe(
            'Optional user ID to create a personalized package. If not provided, package is available to all users'
          ),
        userEmail: z.string().optional().describe('Optional user email as alternative to userId'),
        isPublic: z
          .boolean()
          .optional()
          .default(true)
          .describe('Whether the package is public (default: true)'),
        words: z
          .array(
            z.object({
              l2: z.string().describe('Word in target language (German or Spanish)'),
              l1: z.string().describe('Translation in English'),
              pos: z.string().optional().describe('Part of speech (noun, verb, adjective, etc.)'),
              examples: z
                .array(
                  z.object({
                    sentence: z
                      .string()
                      .describe('Example sentence using the word in target language'),
                    translation: z.string().describe('English translation of the example sentence'),
                  })
                )
                .min(2, 'Each word must have at least 2 example sentences for better learning'),
            })
          )
          .min(5, 'Package must contain at least 5 words for effective learning'),
      },
    },
    async ({ name, description, language, level, userId, userEmail, isPublic = true, words }) => {
      // Validate CEFR level
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validLevels.includes(level.toUpperCase())) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Invalid CEFR level "${level}". Must be one of: ${validLevels.join(', ')}`,
            },
          ],
          isError: true,
        } as const;
      }

      // Validate that all words have sufficient example sentences
      for (const word of words) {
        if (!word.examples || word.examples.length < 2) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Word "${word.l2}" has ${word.examples?.length || 0} example sentences. Each word must have at least 2 example sentences for effective learning.`,
              },
            ],
            isError: true,
          } as const;
        }

        // Validate example sentence translations
        for (const example of word.examples) {
          if (!example.translation || example.translation.trim() === '') {
            return {
              content: [
                {
                  type: 'text',
                  text: `Error: Example sentence "${example.sentence}" for word "${word.l2}" is missing its English translation.`,
                },
              ],
              isError: true,
            } as const;
          }
        }
      }

      // Normalize level to uppercase
      const normalizedLevel = level.toUpperCase();

      // Resolve user if provided
      let resolvedUserId: string | null = null;
      if (userId || userEmail) {
        const tempUserId = await resolveUserId({ userId, userEmail });
        if (tempUserId) {
          resolvedUserId = tempUserId;
        }
      }

      // Create vocabulary set (VocabularySet doesn't have userId field)
      const set = await prisma.vocabularySet.create({
        data: {
          name,
          description,
          language: language as any,
          isPublic: isPublic,
          data: words,
        },
      });

      // Also create individual Word entries for learning flow
      const createdWords = await Promise.all(
        words.map(async (word) => {
          // Check if word already exists (prevent duplicates)
          const existing = await prisma.word.findFirst({
            where: {
              l2: word.l2,
              l1: word.l1,
              language: language as any,
              level: normalizedLevel,
              topic: name,
            },
          });

          if (existing) {
            // Update existing word with new examples if needed
            const existingExampleCount = await prisma.example.count({
              where: { wordId: existing.id },
            });

            if (existingExampleCount < word.examples.length) {
              // Add missing examples
              await prisma.example.createMany({
                data: word.examples.slice(existingExampleCount).map((example) => ({
                  wordId: existing.id,
                  sentence: example.sentence,
                  translation: example.translation || '',
                })),
              });
            }
            return existing;
          }

          // Create new word with examples
          const newWord = await prisma.word.create({
            data: {
              l2: word.l2,
              l1: word.l1,
              pos: word.pos,
              language: language as any,
              level: normalizedLevel,
              topic: name,
              examples: {
                create: word.examples.map((example) => ({
                  sentence: example.sentence,
                  translation: example.translation || '',
                })),
              },
            },
            include: {
              examples: true,
            },
          });

          return newWord;
        })
      );

      // Count total examples created
      const totalExamples = words.reduce((sum, word) => sum + word.examples.length, 0);

      // Determine package type for message
      const packageType = isPublic
        ? '🌍 Public package (available to all users)'
        : '🔒 Private package';

      return {
        content: [
          {
            type: 'text',
            text:
              `✅ Successfully created vocabulary package "${name}" (${language}, Level ${normalizedLevel})\n` +
              `${packageType}\n` +
              `📦 Created ${createdWords.length} words with ${totalExamples} example sentences\n` +
              `🆔 VocabularySet ID: ${set.id}\n` +
              `📚 Topic: ${name}\n` +
              `📝 Description: ${description || 'No description provided'}`,
          },
        ],
      } as const;
    }
  );

  // Query library tool
  server.registerTool(
    'query_library',
    {
      title: 'Query Library',
      description:
        'Search and query the library for words, stories, and vocabulary sets. Supports natural language queries.',
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe(
            'Natural language query like "list my german topics" or "how many B2 words in Spanish"'
          ),
        language: z.enum(['GERMAN', 'SPANISH', 'all']).optional().describe('Filter by language'),
        level: z.string().optional().describe('CEFR level (A1-C2) or "all"'),
        topic: z.string().optional().describe('Filter by topic name'),
        userId: z.string().optional().describe('Filter by user ID'),
        userEmail: z.string().optional().describe('Filter by user email'),
        limit: z.number().optional().default(50).describe('Maximum results to return'),
        includeExamples: z
          .boolean()
          .optional()
          .default(false)
          .describe('Include example sentences for words'),
        searchType: z
          .enum(['all', 'words', 'stories', 'sets', 'statistics'])
          .optional()
          .default('all')
          .describe('Type of content to search'),
      },
    },
    async ({
      query,
      language,
      level,
      topic,
      userId,
      userEmail,
      limit,
      includeExamples,
      searchType,
    }) => {
      // Resolve user if email provided
      let resolvedUserId = userId;
      if (userEmail && !userId) {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (user) resolvedUserId = user.id;
      }

      // Parse natural language query if provided
      let searchOptions = query ? LibrarySearchService.parseNaturalQuery(query) : {};

      // Override with explicit parameters
      if (language && language !== 'all') searchOptions.language = language as any;
      if (level && level !== 'all') searchOptions.level = level;
      if (topic) searchOptions.topic = topic;
      if (resolvedUserId) searchOptions.userId = resolvedUserId;
      searchOptions.limit = limit;
      searchOptions.includeExamples = includeExamples;

      // Perform search based on type
      let results;
      switch (searchType) {
        case 'words':
          const words = await LibrarySearchService.searchWords(searchOptions);
          results = { words };
          break;
        case 'stories':
          const stories = await LibrarySearchService.searchStories(searchOptions);
          results = { stories };
          break;
        case 'sets':
          const sets = await LibrarySearchService.searchVocabularySets(searchOptions);
          results = { vocabularySets: sets };
          break;
        case 'statistics':
          const stats = await LibrarySearchService.getStatistics(searchOptions);
          results = { statistics: stats };
          break;
        default:
          results = await LibrarySearchService.search(searchOptions);
      }

      // Format response
      let response = '📚 Library Query Results\n\n';

      if (results.statistics) {
        response += `📊 Statistics:\n`;
        response += `• Total Words: ${results.statistics.totalWords}\n`;
        response += `• Total Stories: ${results.statistics.totalStories}\n`;
        response += `• Total Sets: ${results.statistics.totalSets}\n`;

        if (Object.keys(results.statistics.byLanguage).length > 0) {
          response += `\nBy Language:\n`;
          for (const [lang, count] of Object.entries(results.statistics.byLanguage)) {
            response += `• ${lang}: ${count} words\n`;
          }
        }

        if (Object.keys(results.statistics.byLevel).length > 0) {
          response += `\nBy Level:\n`;
          for (const [lvl, count] of Object.entries(results.statistics.byLevel)) {
            response += `• ${lvl}: ${count} words\n`;
          }
        }

        if (Object.keys(results.statistics.byTopic).length > 0) {
          response += `\nTop Topics:\n`;
          for (const [tp, count] of Object.entries(results.statistics.byTopic)) {
            response += `• ${tp}: ${count} words\n`;
          }
        }
      }

      if (results.words && results.words.length > 0) {
        response += `\n📝 Words (${results.words.length} found):\n`;
        results.words.forEach((word) => {
          response += `• ${word.l2} - ${word.l1} (${word.level}, ${word.topic || 'no topic'})\n`;
          if (includeExamples && word.examples) {
            word.examples.forEach((ex) => {
              response += `  → "${ex.sentence}" - "${ex.translation}"\n`;
            });
          }
        });
      }

      if (results.stories && results.stories.length > 0) {
        response += `\n📖 Stories (${results.stories.length} found):\n`;
        results.stories.forEach((story) => {
          response += `• "${story.title}" - ${story.topic || 'General'} (${story.language}, ${story.level || 'No level'})\n`;
          if (story.summary) {
            response += `  Summary: ${story.summary}\n`;
          }
        });
      }

      if (results.vocabularySets && results.vocabularySets.length > 0) {
        response += `\n📦 Vocabulary Sets (${results.vocabularySets.length} found):\n`;
        results.vocabularySets.forEach((set) => {
          response += `• ${set.name} - ${set.wordCount} words (${set.language}, ${set.isPublic ? 'Public' : 'Private'})\n`;
          if (set.description) {
            response += `  ${set.description}\n`;
          }
        });
      }

      return { content: [{ type: 'text', text: response }] } as const;
    }
  );

  // Get topics tool
  server.registerTool(
    'get_topics',
    {
      title: 'Get Topics',
      description: 'Get a list of all unique topics in the library',
      inputSchema: {
        language: z.enum(['GERMAN', 'SPANISH', 'all']).optional().describe('Filter by language'),
        level: z.string().optional().describe('Filter by CEFR level'),
        includeWordCount: z
          .boolean()
          .optional()
          .default(true)
          .describe('Include word count for each topic'),
      },
    },
    async ({ language, level, includeWordCount }) => {
      const where: any = {};

      if (language && language !== 'all') {
        where.language = language;
      }

      if (level && level !== 'all') {
        where.level = level.toUpperCase();
      }

      // Don't filter out null topics here, just exclude them from results later

      const topics = await prisma.word.groupBy({
        by: ['topic'],
        where,
        _count: includeWordCount ? { topic: true } : undefined,
        orderBy: includeWordCount ? { _count: { topic: 'desc' } } : { topic: 'asc' },
      });

      let response = `📚 Topics in Library\n\n`;

      if (topics.length === 0) {
        response += 'No topics found with the specified criteria.';
      } else {
        response += `Found ${topics.length} unique topics:\n\n`;
        topics.forEach((item) => {
          if (item.topic) {
            response += `• ${item.topic}`;
            if (includeWordCount && '_count' in item) {
              const count =
                typeof item._count === 'object' ? item._count.topic || item._count : item._count;
              response += ` (${count} words)`;
            }
            response += '\n';
          }
        });
      }

      return { content: [{ type: 'text', text: response }] } as const;
    }
  );

  return server;
}

app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.header('mcp-session-id') ?? undefined;
    let transport: StreamableHTTPServerTransport;
    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport;
        },
      });
      const server = getServer();
      await server.connect(transport);
    }
    await transport.handleRequest(req as any, res as any, req.body);
  } catch (err) {
    console.error('MCP POST error', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/mcp', async (req, res) => {
  const sessionId = req.header('mcp-session-id') ?? undefined;
  if (!sessionId || !transports[sessionId])
    return res.status(400).send('Invalid or missing session ID');
  return await transports[sessionId].handleRequest(req as any, res as any);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.header('mcp-session-id') ?? undefined;
  if (!sessionId || !transports[sessionId])
    return res.status(400).send('Invalid or missing session ID');
  return await transports[sessionId].handleRequest(req as any, res as any);
});

// Simple test endpoint for direct vocabulary package creation
app.post('/test/create-vocab', async (req, res) => {
  try {
    const {
      name,
      description,
      language,
      level,
      userId,
      userEmail,
      isPublic = true,
      words,
    } = req.body;

    // Validate CEFR level
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid CEFR level "${level}". Must be one of: ${validLevels.join(', ')}`,
      });
    }

    // Validate words have examples
    for (const word of words) {
      if (!word.examples || word.examples.length < 2) {
        return res.status(400).json({
          error: `Word "${word.l2}" needs at least 2 example sentences (has ${word.examples?.length || 0})`,
        });
      }
    }

    // Normalize level
    const normalizedLevel = level.toUpperCase();

    // Resolve user if provided
    let resolvedUserId: string | null = null;
    if (userId || userEmail) {
      const tempUserId = await resolveUserId({ userId, userEmail });
      if (tempUserId) {
        resolvedUserId = tempUserId;
      }
    }

    // Create vocabulary set (VocabularySet doesn't have userId field)
    const set = await prisma.vocabularySet.create({
      data: {
        name,
        description,
        language: language as any,
        isPublic: isPublic,
        data: words,
      },
    });

    // Create individual Word entries
    const createdWords = await Promise.all(
      words.map(async (word: any) => {
        const existing = await prisma.word.findFirst({
          where: {
            l2: word.l2,
            language: language as any,
            level: normalizedLevel,
            topic: name,
          },
        });

        if (existing) return existing;

        return await prisma.word.create({
          data: {
            l2: word.l2,
            l1: word.l1,
            pos: word.pos,
            language: language as any,
            level: normalizedLevel,
            topic: name,
            examples: {
              create: word.examples.map((example: any) => ({
                sentence: example.sentence,
                translation: example.translation || '',
              })),
            },
          },
          include: { examples: true },
        });
      })
    );

    const totalExamples = words.reduce((sum: number, word: any) => sum + word.examples.length, 0);
    const packageType = resolvedUserId ? 'user-specific' : 'public';

    return res.json({
      success: true,
      message: `Created ${packageType} vocabulary package "${name}"`,
      data: {
        setId: set.id,
        name,
        language,
        level: normalizedLevel,
        wordCount: createdWords.length,
        exampleCount: totalExamples,
        isPublic,
        userId: resolvedUserId,
      },
    });
  } catch (error: any) {
    console.error('Error creating vocabulary package:', error);
    return res.status(500).json({ error: error.message || 'Failed to create vocabulary package' });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3040;
app.listen(PORT, () => {
  console.log(`Langfu MCP server listening on http://localhost:${PORT}/mcp`);
  console.log(`Test endpoint available at http://localhost:${PORT}/test/create-vocab`);
});
