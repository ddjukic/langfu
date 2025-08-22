# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack multi-language learning application focused on German and Spanish vocabulary acquisition through gamification and spaced repetition. Built with Next.js 15, PostgreSQL, and Vercel AI SDK.

## Architecture Overview

### Application Structure
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Next.js API Routes with server-side authentication
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with secure httpOnly cookies and middleware protection
- **AI Integration**: Vercel AI SDK supporting OpenAI/Anthropic models
- **Testing**: Jest for unit tests, Playwright for E2E testing across multiple browsers/devices
- **PWA**: Progressive Web App with service worker and offline support

### Core Learning System
- **Learning Modes**: Matching game, swipe cards, example sentences, sentence creation, spaced repetition
- **Progression System**: 6-level mastery scale (0-5) with spaced repetition scheduling
- **Content Management**: Structured vocabulary with CEFR levels (A1-C2) and topics
- **Progress Tracking**: Per-user statistics, streaks, and learning analytics with charts

### Key Architectural Patterns
- **Client-Server Separation**: React Client Components handle UI, Server Components handle data fetching
- **Middleware Authentication**: Route protection via Next.js middleware with JWT verification
- **Zustand State Management**: Client-side state for extracted vocabulary and UI state
- **Prisma Relations**: Complex relational data model with proper indexing
- **Error Recovery**: Token rotation and graceful auth failure handling

## Quick Start

```bash
# Navigate to the app directory
cd langfu-app

# Install dependencies (uses pnpm, not npm)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with DATABASE_URL, AI API keys

# Set up PostgreSQL database
pnpm db:push    # Push schema to database
pnpm db:seed    # Seed initial vocabulary data

# Start development server
pnpm dev        # http://localhost:3000
```

## Development Commands

### Core Development
- `pnpm dev` - Start development server (http://localhost:3000)
- `pnpm build` - Build for production (includes Prisma generation)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Operations
- `pnpm db:push` - Push Prisma schema to database
- `pnpm db:seed` - Seed database with initial vocabulary

### Testing
- `pnpm test` - Run Jest unit tests
- `pnpm test:watch` - Jest in watch mode
- `pnpm test:coverage` - Generate test coverage report
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e:ui` - Run Playwright with UI mode
- `pnpm test:e2e:debug` - Debug Playwright tests
- `pnpm test:e2e:mobile` - Test mobile viewports only
- `pnpm test:e2e:dark` - Test dark mode functionality
- `pnpm test:a11y` - Run accessibility tests
- `pnpm test:all` - Run both unit and E2E tests

### PWA & Assets
- `pnpm generate:icons` - Generate PWA icons
- `pnpm generate:screenshots` - Generate PWA screenshots
- `pnpm pwa:setup` - Setup PWA assets

### MCP Server
- `pnpm mcp:dev` - Start MCP server for AI integrations

## Key File Locations

### Core Application
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility libraries (auth, Prisma, stores)
- `prisma/schema.prisma` - Database schema definition
- `src/middleware.ts` - Authentication middleware

### Configuration
- `next.config.ts` - Next.js configuration with PWA support
- `playwright.config.ts` - E2E testing configuration
- `jest.config.ts` - Unit testing configuration
- `tailwind.config.js` - Styling configuration

### Authentication System
- `src/lib/auth.ts` - JWT token management, password hashing, user authentication
- `src/middleware.ts` - Route protection and token verification
- Auth cookies: httpOnly, secure, 30-day expiration
- Password recovery via email lookup when token/user mismatch occurs

## Database Schema Architecture

### Core Models
- **User**: Authentication, preferences, language selection
- **Session**: JWT token management with expiration tracking
- **Progress**: Per-language learning statistics and streaks
- **Word**: Vocabulary items with language, CEFR level, topics, metadata
- **WordHistory**: Individual word learning progress with spaced repetition scheduling
- **Example**: AI-generated example sentences for vocabulary
- **UserSentence**: User-created sentences with AI validation

### Extended Features
- **VocabularySet**: Imported vocabulary collections
- **WebExtraction**: Web content analysis for vocabulary extraction
- **ExtractedWord**: Words extracted from web content
- **Story**: AI-generated stories for immersive learning
- **Lesson**: Structured lesson content

### Key Relationships
- User → Progress (per language)
- User → WordHistory (per word mastery tracking)
- Word → Examples (AI-generated sentences)
- Word → UserSentences (user creations)

## Testing Strategy

### Unit Testing (Jest)
- Components in `src/components/__tests__/`
- Utilities in `src/lib/__tests__/`
- 60% coverage threshold for branches, functions, lines, statements

### E2E Testing (Playwright)
- Cross-browser testing: Chrome, Firefox, Safari, Edge
- Mobile testing: Multiple viewport sizes (320px, 375px, 768px, tablets)
- Dark mode functionality testing
- Accessibility compliance testing (WCAG)
- Test files in `tests/e2e/` and `tests/a11y/`

## AI Integration Architecture

### Supported Providers
- OpenAI (GPT models)
- Anthropic (Claude models)
- Configured via environment variables

### Use Cases
- Example sentence generation for vocabulary
- User sentence validation and feedback
- Story generation for immersive learning
- Web content extraction and vocabulary analysis

## PWA Features

### Service Worker
- Offline support with custom caching strategies
- Font caching (Google Fonts, static fonts)
- Image and asset caching
- API response caching with NetworkFirst strategy

### Mobile Optimization
- Touch gesture support for swipe learning
- Responsive design with mobile-first approach
- App icon generation and PWA manifest
- Screenshot generation for app stores

## Important Notes

### Development Practices
- **Package Manager**: Use `pnpm`, not `npm`
- **Build Verification**: Always run `pnpm build` locally before pushing
- **Environment Setup**: Requires valid DATABASE_URL and AI API keys
- **Authentication**: Test credentials: d.dejan.djukic@gmail.com / langfu-test

### Deployment Requirements
- PostgreSQL database (local or cloud)
- Environment variables for production
- Vercel-optimized configuration
- PWA assets generation required

### Performance Considerations
- Spaced repetition intervals: 1 → 3 → 7 → 14 → 30 → 90 days
- Cookie authentication: 30-day expiration
- Database indexing on frequently queried fields
- Image optimization and lazy loading