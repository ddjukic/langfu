# Work in Progress - LangFu Critical Library & Vocabulary Fixes

## Context & Critical Issues

**URGENT PROBLEMS IDENTIFIED:**
1. **Vocabulary Display Broken**: Words showing as "—" in library stories and empty blocks in matching game
2. **No Interactive Features**: Library stories lack hover translations and keyword highlighting  
3. **Poor Library UX**: Need navigation between words/stories, search functionality, and CRUD operations
4. **Inconsistent Experience**: Library and topic mode provide completely different experiences

**Screenshot Evidence**: `/home/dd/Pictures/Screenshots/Screenshot from 2025-08-21 14-18-49.png` shows matching game with empty word blocks

## Root Cause Analysis

### Data Processing Issues:
- Vocabulary data not properly parsed from story keywords/words fields
- Interactive story component not rendering keywords correctly
- Matching game not receiving proper vocabulary data

### UX/UI Missing Features:
- Library lacks proper navigation and organization
- No search functionality for words and stories
- No CRUD operations for story management
- Inconsistent design patterns across app

**Target Experience:**
- Fully functional vocabulary display throughout app
- Interactive library stories with hover translations
- Modern library UI with search and navigation
- Complete story management capabilities

## Technical Analysis

### Current Topic Mode Features (GOOD):
- `renderHoverableStory()` - Interactive hover translations with tooltips
- Keywords list with examples and synonyms
- "Practice Words" button that prepares extracted words for session
- Good mobile-responsive design

### Current Library Stories (LACKS):
- Plain text display without interactivity
- No keyword highlighting or translations
- No practice functionality
- Basic layout without enhancements

### Practice Flow Issues:
- Topic mode saves to localStorage and redirects to `/learn/session?mode=extracted`
- Learning session loads from localStorage but may have redirect issues
- Possible conflict with web extraction flow causing wrong redirects

## Implementation Plan

### Task 1: Fix Critical Vocabulary Display Issues
**Agent: QA Test Engineer** 
- Debug vocabulary data parsing in library stories
- Fix keyword rendering in interactive story component
- Ensure proper data flow from database to UI components
- Test matching game vocabulary display

### Task 2: Complete Library Story Interactive Experience  
**Agent: Frontend Engineer**
- Implement proper keyword highlighting with hover translations
- Fix interactive story rendering with tooltips
- Ensure story content displays keywords properly
- Match topic mode interactive experience exactly

### Task 3: Enhanced Library UI/UX System
**Agent: Mobile Frontend Engineer**
- Redesign library with navigation between Words/Stories sections
- Add appropriate icons and visual hierarchy
- Implement tabbed navigation for easy switching
- Create consistent design language
- Add story CRUD operations (edit, delete)

### Task 4: Search & Filter Functionality
**Agent: Backend Engineer** 
- Implement search API for words and stories
- Search both word content and translations
- Add filters by language, level, topic
- Create search UI components
- Ensure fast search performance

## Agent Coordination

Each agent should:
1. Read this WIP.md for context
2. Focus on their specific task area
3. Test their implementation thoroughly
4. Report back with changes made and any issues found
5. Coordinate with other agents if dependencies arise

## Success Criteria

- [ ] Vocabulary words display correctly in all components
- [ ] Library stories have identical interactive experience to topic mode
- [ ] Seamless navigation between Words and Stories sections
- [ ] Fast, accurate search across all content
- [ ] Complete story management capabilities
- [ ] Consistent mobile-first design throughout
- [ ] All functionality tested and verified

## Technical Requirements

### Data Handling:
- Parse story.keywords and story.words fields correctly
- Transform data for interactive components
- Handle both JSON string and object formats
- Maintain data consistency across components

### UI/UX Standards:
- Mobile-first responsive design
- Consistent purple/pink gradient theme
- Touch-friendly 44px minimum targets
- Dark mode support throughout
- Glass effects and modern styling

### Search Requirements:
- Real-time search as user types
- Search German words, English translations, story titles
- Filter by level (A1-C2), language, topic
- Sort by relevance, date, alphabetical

### CRUD Operations:
- Edit story titles and content
- Delete stories with confirmation
- Duplicate stories for variations
- Export/import story collections

## Files to Focus On

### Story Enhancement:
- `/app/library/story/[id]/page.tsx` - Enhance with interactive features
- `/app/learn/topic/topic-learning-client.tsx` - Extract reusable components

### Practice Flow Fix:
- `/app/learn/session/page.tsx` - Debug mode routing
- `/app/learn/session/learning-session.tsx` - Fix redirect logic

### Navigation:
- All learning mode components need navigation headers
- Mobile-specific touch interactions
- Consistent back button behavior

---

*Last Updated: 2025-08-21*
*Priority: CRITICAL - User experience is currently broken*