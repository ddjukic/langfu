#!/usr/bin/env bash
set -euo pipefail

# Langfu MCP Server local setup script
# - Installs pnpm if missing
# - Installs dependencies
# - Pushes Prisma schema
# - Prints Claude Code add command and usage examples

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/langfu-app"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Please install Node >= 18 and re-run." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found; installing pnpm..."
  corepack enable || true
  corepack prepare pnpm@10.12.1 --activate
fi

echo "Installing dependencies..."
cd "$APP_DIR"
pnpm install

echo "Generating Prisma client and pushing schema..."
pnpm prisma generate
pnpm db:push

echo "Setup complete."
echo
echo "Run standalone MCP server (recommended for Claude Code local):"
echo "  cd $APP_DIR && pnpm mcp:dev"
echo
MCP_URL="http://localhost:3040/mcp"
echo "Then, in Claude Code, add the MCP server (@Web transport):"
echo "  claude mcp add langfu-mcp --transport http $MCP_URL"
echo
echo "Example prompts in Claude Code:"
cat <<'EXAMPLES'
- Create a story and save to my library:
  "Use langfu-mcp to call create_story with { title: 'City Cycling Adventure', topic: 'travel', keywords: ['bicycle','city','park'], content: '...', language: 'GERMAN' }"

- Create a lesson:
  "Use langfu-mcp to call create_lesson with { title: 'Modal Verbs A1', description: 'Practice modal verbs', content: { sections: [...] }, language: 'GERMAN' }"

- Create a word package:
  "Use langfu-mcp to call create_word_package with { name: 'Weather Basics', language: 'GERMAN', words: [{ l2: 'Wetter', l1: 'weather' }, { l2: 'Regen', l1: 'rain' }] }"
EXAMPLES

echo
echo "Open Langfu app and see: Library → My Stories"





