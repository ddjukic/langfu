### Langfu MCP Server

This app exposes an MCP server so external agents (e.g., Anthropic Claude, Claude Desktop) can create stories, lessons, and word packages in your Langfu account.

#### Capabilities

- **create_story**: Save a story to `My Stories` (title, topic, keywords, content, language, optional CEFR level). Returns created ID.
- **create_lesson**: Save a structured lesson payload as JSON. Returns created ID.
- **create_word_package**: Save a vocabulary set with words `{ l2, l1, level? }`. Returns created ID.

#### Auth

- For local Claude Code usage, tools do not require JWT. You may optionally supply `userId` or `userEmail`; otherwise the first user in the DB is used.

#### Transport

- Streamable HTTP per the MCP TypeScript SDK. Stateful sessions with `Mcp-Session-Id` header.

Endpoints (standalone server):

- POST `http://localhost:3040/mcp` — init and client->server messages
- GET `http://localhost:3040/mcp` — server->client notifications (SSE)
- DELETE `http://localhost:3040/mcp` — terminate session

Endpoints (Next.js route):

- `POST|GET|DELETE` `/api/mcp`

#### Run

- Install deps: `pnpm i`
- Start standalone MCP server:

```bash
pnpm mcp:dev
```

#### Claude Desktop Config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "langfu-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/langfu-app/node_modules/.bin/tsx", "scripts/mcp-server.ts"],
      "env": {
        "DATABASE_URL": "postgres://...",
        "JWT_SECRET": "<same as app>"
      }
    }
  }
}
```

#### Tool Schemas

- create_story

```json
{
  "userId": "string?",
  "userEmail": "string?",
  "title": "string",
  "topic": "string?",
  "keywords": ["string"],
  "content": "string",
  "language": "GERMAN|SPANISH",
  "level": "string?"
}
```

- create_lesson

```json
{
  "userId": "string?",
  "userEmail": "string?",
  "title": "string",
  "description": "string?",
  "content": {},
  "language": "GERMAN|SPANISH"
}
```

- create_word_package

```json
{
  "name": "string",
  "description": "string?",
  "language": "GERMAN|SPANISH",
  "words": [{ "l2": "string", "l1": "string", "level": "string?" }]
}
```

#### Data Model Additions (Prisma)

- `Story` and `Lesson` models created. Stories are displayed under `My Stories` in `Library` and have detail pages at `/library/story/[id]`.

#### Usage Example (Claude)

- Prompt: "Create a story about renewable energy with 12 keywords and save it to Langfu."
- Claude selects `langfu-mcp.create_story` and passes your JWT token and story fields, committing it to your library. Visit `Library → My Stories` to view.

#### References

- Hackteam tutorial on building an MCP server in TypeScript: [hackteam.io article](https://hackteam.io/blog/build-your-first-mcp-server-with-typescript-in-under-10-minutes/)
- Model Context Protocol TypeScript SDK: [GitHub repo](https://github.com/modelcontextprotocol/typescript-sdk)
