### MCP Usage (Local Claude Code)

Setup

- Run setup:

```bash
bash /home/dd/dejan_dev/langfu/setup_mcp_server.sh
```

- Start server:

```bash
cd /home/dd/dejan_dev/langfu/langfu-app && pnpm mcp:dev
```

Add to Claude Code (@Web transport)

```bash
claude mcp add langfu-mcp --transport http http://localhost:3040/mcp
```

Available Tools

- create_story
  - input: `{ userId?, userEmail?, title, topic?, keywords[], prompt?, words?, content, language('GERMAN'|'SPANISH'), level? }`
  - output: story id (text)
- create_lesson
  - input: `{ userId?, userEmail?, title, description?, content(any), language('GERMAN'|'SPANISH') }`
  - output: lesson id (text)
- create_word_package
  - input: `{ name, description?, language('GERMAN'|'SPANISH'), level(A1-C2), isPublic?(true), userId?, userEmail?, words: [{l2,l1,pos?,examples:[{sentence,translation}]}] }`
  - output: Detailed success message with set ID and statistics
  - Requirements:
    - Minimum 5 words per package
    - Minimum 2 example sentences per word
    - All example sentences must have translations
    - CEFR level must be valid (A1, A2, B1, B2, C1, C2)

Example prompts

```bash
claude "Use langfu-mcp to call create_story with { title: 'City Cycling Adventure', topic: 'travel', keywords: ['bicycle','city','park'], content: '...', language: 'GERMAN' }"
claude "Use langfu-mcp to call create_lesson with { title: 'Modal Verbs A1', description: 'Practice modal verbs', content: { sections: [...] }, language: 'GERMAN' }"
claude "Use langfu-mcp to create a vocabulary package about weather with 10 German words at A1 level, each with 2 example sentences and translations"
```

Test Endpoint (for direct HTTP testing)

```bash
# Test endpoint available at http://localhost:3040/test/create-vocab
curl -X POST http://localhost:3040/test/create-vocab \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Topic Name",
    "description": "Optional description",
    "language": "GERMAN",
    "level": "A1",
    "isPublic": true,
    "words": [
      {
        "l2": "German word",
        "l1": "English translation",
        "pos": "noun",
        "examples": [
          {"sentence": "Example in German", "translation": "English translation"},
          {"sentence": "Another example", "translation": "English translation"}
        ]
      }
    ]
  }'
```

Where to see results

- Open the app → Library → My Stories
- Click a story to view: summary (10 words), prompt, full content, and any words payload.

References

- Hackteam MCP server tutorial: https://hackteam.io/blog/build-your-first-mcp-server-with-typescript-in-under-10-minutes/
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
