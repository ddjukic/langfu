# LangFu Codebase Cleanup Plan

## Critical Issues Identified

### 1. Library Shows Only WordHistory (88) Instead of All Words (242)

**Impact**: Users can't see all available vocabulary, only what they've interacted with
**Root Cause**: `/src/app/library/page.tsx` queries `WordHistory` instead of `Word`

### 2. MCP Server Lacks Validation

**Impact**: Invalid data can corrupt the database
**Root Cause**: `create_story` tool accepts keywords without translations/examples

### 3. Inconsistent Data Access Patterns

**Impact**: Confusion about when to use Word vs WordHistory
**Examples**: Some features query Word directly, others use WordHistory

### 4. State Management Spaghetti

**Impact**: Duplicate logic, hard to maintain
**Examples**: Multiple stores, mixed patterns, prop drilling

## Phase 1: Critical Fix - Library Visibility (DAY 1)

### Task 1.1: Fix Library Page Query

**File**: `/src/app/library/page.tsx`
**Change**: Query ALL Words with optional WordHistory join

```typescript
// FROM:
const histories = await prisma.wordHistory.findMany({
  where: { userId: user.id },
  include: { word: true },
});

// TO:
const words = await prisma.word.findMany({
  include: {
    wordHistories: {
      where: { userId: user.id },
      take: 1,
    },
  },
});
```

### Task 1.2: Update LibraryClient Component

**File**: `/src/app/library/library-client.tsx`
**Change**: Display mastery level 0 for unlearned words

### Task 1.3: Create LibraryService

**File**: `/src/lib/services/library.service.ts`
**Purpose**: Centralize all library data access

## Phase 2: MCP Server Validation (DAY 2-3)

### Task 2.1: Add Strict Validation to create_story

**File**: `/scripts/mcp-server.ts`
**Change**: Require keywords with translations and examples

```typescript
keywords: z.array(
  z.object({
    l2: z.string(),
    l1: z.string(),
    examples: z
      .array(
        z.object({
          sentence: z.string(),
          translation: z.string(),
        })
      )
      .min(2),
  })
).min(5);
```

### Task 2.2: Add Validation to All MCP Tools

- create_lesson: Validate content structure
- create_word_package: Already has validation (keep it)

## Phase 3: Architecture Refactoring (DAY 4-7)

### Task 3.1: Create Service Layer

**New Files**:

- `/src/lib/services/word.service.ts` - All word operations
- `/src/lib/services/story.service.ts` - All story operations
- `/src/lib/services/auth.service.ts` - Authentication logic
- `/src/lib/services/progress.service.ts` - Progress tracking

### Task 3.2: Consolidate State Management

**Action**: Merge all stores into single Zustand store

- Combine library-store, extracted-store into one
- Clear separation of concerns
- Remove duplicate logic

### Task 3.3: API Route Cleanup

**Action**: Remove duplicate logic, use services

- Standardize error handling
- Consistent response formats
- Use services for business logic

## Phase 4: Code Quality (WEEK 2+)

### Task 4.1: TypeScript Strictness

- Enable strict mode
- Fix all type errors
- Add proper generics

### Task 4.2: Performance Optimization

- Add caching layer
- Optimize database queries
- Implement pagination

### Task 4.3: Testing

- Unit tests for services
- Integration tests for API routes
- E2E tests for critical flows

## Quick Wins (Can Do Today)

1. **Fix Library Query** (30 min) - Show all 242 words
2. **Add MCP Validation** (30 min) - Prevent bad data
3. **Clean Up Unused Files** (15 min) - Remove test scripts
4. **Fix Search Highlighting** (15 min) - Already done
5. **Document API Routes** (30 min) - Add JSDoc comments

## Success Metrics

- [ ] Library shows all 242 words, not just 88
- [ ] MCP server validates all required fields
- [ ] Service layer handles all business logic
- [ ] Single source of truth for state
- [ ] 80% test coverage
- [ ] Sub-500ms page load times
- [ ] Zero TypeScript errors

## Migration Strategy

1. Feature branch for each phase
2. Backward compatibility maintained
3. Incremental rollout
4. Rollback plan for each phase

## Timeline

- **Day 1**: Phase 1 - Critical fixes
- **Day 2-3**: Phase 2 - MCP validation
- **Day 4-7**: Phase 3 - Architecture
- **Week 2+**: Phase 4 - Quality

## Risk Mitigation

- Create database backups before changes
- Test on staging environment first
- Keep old code paths until new ones proven
- Monitor error rates during rollout
