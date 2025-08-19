# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack multi-language learning application focused on German and Spanish vocabulary acquisition through gamification and spaced repetition. Built with Next.js 15, PostgreSQL, and Vercel AI SDK.

## Architecture

The application is planned as a React-based web app with the following core components:

- **Learning Modes**: Smart Start, Matching Pairs, Example Sentences, Sentence Creation, Spaced Repetition
- **Progression System**: Word mastery levels (New → Learning → Familiar → Known → Mastered)
- **Content Management**: Structured vocabulary database with CEFR levels (A1-C2)
- **LLM Integration**: For generating contextual example sentences and validation

## Key Implementation Details

### Current State
- Initial design component in `/docs/initial_design.md` contains a React component with:
  - German matching game implementation
  - Level selection (A1-C2)
  - Topic-based word organization
  - Custom word input capability
  - Score tracking

### Data Structure
Vocabulary is organized by:
- Language (German/Spanish)
- CEFR Level (A1-C2)
- Topics (e.g., "Daily Routines", "Work & Career")
- Word objects containing: L2 word, L1 translation, part of speech, gender, examples, difficulty, frequency

### User Progress Schema
Tracks per-user:
- Current language selection
- Words learned count
- Current level
- Streak information
- Word history with review dates and mastery levels
- User-generated sentences

## Quick Start

```bash
# Navigate to the app directory
cd langfu-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and API keys

# Set up PostgreSQL database
npm run db:push    # Push schema to database
npm run db:seed    # Seed initial data

# Start development server
npm run dev
```

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with initial vocabulary
- `npm run lint` - Run linting

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with secure httpOnly cookies
- **AI Integration**: Vercel AI SDK (OpenAI/Anthropic support)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: Vercel-ready

## Key Features Implemented

1. **Authentication System**
   - Password-based login with JWT tokens
   - Secure cookie storage
   - Test credentials: d.dejan.djukic@gmail.com / langfu-test

2. **Learning Modes**
   - Matching pairs game (German/Spanish → English)
   - AI-generated example sentences
   - Sentence creation with validation
   - Spaced repetition algorithm

3. **Progress Tracking**
   - User progress per language
   - Word mastery levels (0-5 scale)
   - Streak tracking
   - Next review scheduling

4. **Vocabulary Management**
   - Load custom vocabulary via JSON
   - Support for German and Spanish
   - CEFR levels (A1-C2)
   - Topic-based organization

## Database Schema

Key models in `prisma/schema.prisma`:
- User: Authentication and preferences
- Word: Vocabulary items with language, level, topic
- WordHistory: User's learning progress per word
- Progress: Overall user progress per language
- UserSentence: User-created sentences
- VocabularySet: Imported vocabulary collections

## Important Notes

- AI features require valid API keys in .env.local
- PostgreSQL must be running locally or use cloud instance
- Spaced repetition intervals: 1 → 3 → 7 → 14 → 30 → 90 days
- Cookie authentication persists for 30 days
- Mobile-responsive design with touch optimization
- always build project locally to ensure it runs before pushing
- we use pnpm, not npm