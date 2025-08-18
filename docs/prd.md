# Product Requirements Document: Multi-Language Learning App with Spaced Repetition

## Executive Summary
A comprehensive language learning application that uses gamification, spaced repetition, and AI-powered content generation to help users master German and Spanish vocabulary through multiple learning modalities.

## 1. Product Overview

### Vision
Create an adaptive, engaging language learning platform that combines proven learning techniques (spaced repetition, active recall, contextual learning) with modern gamification to maximize vocabulary retention and practical usage.

### Core Learning Philosophy
- **Multi-modal learning**: Matching, reading, writing, and contextual usage
- **Spaced repetition**: Scientifically-proven intervals for long-term retention
- **Progressive difficulty**: Adaptive learning based on user performance
- **Contextual understanding**: Words taught through sentences and real-world usage

## 2. User Personas

### Primary User
- **Age**: 18-45
- **Goal**: Achieve conversational fluency in German or Spanish
- **Pain Points**: Traditional apps lack depth, don't track real mastery, limited practice modes
- **Needs**: Structured progression, variety in exercises, clear progress tracking

## 3. Core Features

### 3.1 Language Selection
- **Supported Languages**: German, Spanish (expandable architecture)
- **Selection Point**: Initial app setup and changeable in settings
- **Data Structure**: Shared schema across languages

### 3.2 Learning Modes

#### Mode 1: Smart Start (Default)
- **Trigger**: User presses "Start" button
- **Logic**: 
  - If words due for review → Spaced Repetition mode
  - If no reviews due → Topic selection for new words
  - Adaptive based on user's learning history

#### Mode 2: Matching Pairs (Current Implementation)
- **Functionality**: Match L2 words with L1 translations
- **Rounds**: 5 word pairs per round
- **Progression**: Auto-advance to next round
- **Completion**: Transitions to Example Sentences mode

#### Mode 3: Example Sentences (New)
- **Trigger**: After completing matching exercise
- **Display**: 5 AI-generated sentences using learned words
- **Features**:
  - Highlight target word in each sentence
  - Translation on tap/hover
  - Audio pronunciation (future)
  
#### Mode 4: Sentence Creation (New)
- **Trigger**: After viewing example sentences
- **Task**: User writes original sentence using target word
- **Validation**: 
  - Basic: Check word inclusion
  - Advanced: LLM validation for grammar/context (future)
- **Feedback**: Instant validation with corrections

#### Mode 5: Spaced Repetition Review
- **Algorithm**: Modified Leitner system
- **Intervals**: 
  - New → 1 day → 3 days → 7 days → 14 days → 30 days → 90 days
- **Review Types**:
  - Recognition (see word, recall meaning)
  - Production (see meaning, type word)
  - Contextual (fill in blank in sentence)

### 3.3 Progression System

#### Word Mastery Levels
1. **New**: Just encountered
2. **Learning**: Completed 1 exercise
3. **Familiar**: Completed 2-3 exercises
4. **Known**: 3+ successful reviews
5. **Mastered**: 5+ reviews with >90% accuracy

#### User Progression Metrics
- **Total Words Learned**: Count of words at "Known" or "Mastered"
- **Current Streak**: Consecutive days of practice
- **Level Progress**: Based on CEFR (A1-C2)
- **Topic Completion**: % of words mastered per topic

### 3.4 Word Library

#### Features
- **Search & Filter**: By level, topic, mastery status
- **Word Details**:
  - Translation
  - Example sentences
  - User's sentences
  - Practice history
  - Next review date
- **Statistics**:
  - Times reviewed
  - Accuracy rate
  - Last seen date

### 3.5 Web Content Extraction (New)

#### Overview
- **Purpose**: Extract vocabulary from real-world web content for contextual learning
- **Process**: URL → Content Fetch → AI Analysis → Vocabulary Extraction → Save to Library

#### Features
- **URL Input**: Simple paste-and-process interface
- **Content Analysis**: 
  - HTML parsing and text extraction
  - Key vocabulary identification based on frequency and relevance
  - Automatic language detection (German/Spanish)
  - CEFR level estimation for extracted words
- **Extraction History**:
  - Saved web pages with original URLs
  - Timestamp of extraction
  - Associated vocabulary packages
  - Custom topics/tags for organization
- **Vocabulary Processing**:
  - Automatic translation to English
  - Part of speech tagging
  - Example sentences from source content
  - Difficulty scoring based on context

#### Web Extractions Library
- **List View**: All extracted web pages
- **Details per Extraction**:
  - Source URL and title
  - Extraction date
  - Word count extracted
  - Preview of content
  - Associated vocabulary package
- **Actions**:
  - View original content
  - Practice extracted vocabulary
  - Edit/refine word list
  - Export to custom vocabulary set

### 3.6 Content Management

#### Vocabulary Database
```json
{
  "language": "german|spanish",
  "levels": {
    "A1": {
      "topics": {
        "Daily Routines": {
          "words": [
            {
              "id": "unique_id",
              "l2": "aufstehen",
              "l1": "to get up",
              "pos": "verb",
              "gender": "n/a",
              "examples": ["Ich stehe um 7 Uhr auf."],
              "difficulty": 1,
              "frequency": 950
            }
          ]
        }
      }
    }
  }
}
```

#### LLM Integration Setup
- **Endpoint URL Input**: Settings page field for API endpoint
- **Authentication**: API key storage (encrypted)
- **Models Supported**: OpenAI, Anthropic, local LLMs
- **Fallback**: Pre-generated sentences if API unavailable

### 3.6 User Data Schema

```json
{
  "userId": "unique_id",
  "settings": {
    "currentLanguage": "german",
    "dailyGoal": 20,
    "notificationsEnabled": true
  },
  "progress": {
    "german": {
      "wordsLearned": 245,
      "currentLevel": "A2",
      "streak": 15,
      "lastPractice": "2024-01-15T10:30:00Z"
    }
  },
  "wordHistory": {
    "word_id": {
      "firstSeen": "2024-01-01T10:00:00Z",
      "reviewCount": 5,
      "correctCount": 4,
      "lastReview": "2024-01-15T10:30:00Z",
      "nextReview": "2024-01-22T10:30:00Z",
      "masteryLevel": 3,
      "userSentences": ["Ich stehe jeden Tag früh auf."]
    }
  }
}
```

## 4. User Flows

### 4.1 First-Time User Flow
1. **Welcome Screen** → Language selection
2. **Level Assessment** → Quick quiz or self-selection
3. **Tutorial** → Brief intro to learning modes
4. **First Session** → Guided matching exercise
5. **Example Sentences** → Show AI-generated examples
6. **Create Sentence** → First sentence creation
7. **Progress Summary** → Show achievements

### 4.2 Returning User Daily Flow
1. **Home Screen** → Shows streak, words due for review
2. **Smart Start** → Automatically selects optimal activity
3. **Spaced Repetition** → Review due words (if any)
4. **New Content** → Learn 5-10 new words
5. **Practice** → Matching → Examples → Creation
6. **Daily Summary** → Progress and next session preview

### 4.3 Custom Practice Flow
1. **Practice Menu** → Choose specific mode
2. **Configuration** → Select level/topic/word count
3. **Practice Session** → Complete chosen exercise
4. **Results** → Performance summary
5. **Next Action** → Continue or return to menu

## 5. Technical Requirements

### 5.1 Frontend
- **Framework**: React with TypeScript
- **State Management**: Context API or Redux
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Storage**: LocalStorage for offline data

### 5.2 Backend Services
- **LLM Integration**: 
  - Endpoint configuration
  - Request queuing
  - Response caching
  - Fallback handling

### 5.3 Data Persistence
- **Local Storage**:
  - User progress
  - Word history
  - Settings
  - Cached sentences
- **Sync Strategy**: Optional cloud backup (future)

## 6. UI/UX Specifications

### 6.1 Design Principles
- **Clean & Focused**: Minimal distractions
- **Visual Feedback**: Immediate response to actions
- **Progress Visibility**: Always show advancement
- **Mobile-First**: Optimized for touch interaction

### 6.2 Key Screens

#### Home Dashboard
- Daily goal progress
- Streak counter
- Words due for review
- Smart Start button
- Quick access to modes

#### Learning Screen
- Clear instructions
- Progress indicator
- Visual word cards
- Animation feedback
- Skip/hint options

#### Progress Screen
- Visual charts
- Mastery breakdown
- Calendar heatmap
- Achievements
- Statistics

#### Word Library
- Grid/list view toggle
- Mastery indicators
- Search bar
- Filter chips
- Batch actions

## 7. Success Metrics

### 7.1 Engagement Metrics
- **Daily Active Users** (DAU)
- **Average Session Duration**
- **Streak Retention Rate**
- **Mode Completion Rate**

### 7.2 Learning Metrics
- **Words Mastered per Week**
- **Review Accuracy Rate**
- **Sentence Creation Success Rate**
- **Time to Mastery** (per word average)

### 7.3 Technical Metrics
- **LLM Response Time**
- **Cache Hit Rate**
- **Error Rate**
- **Offline Usage %**

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Enhance current matching game
- Add language selection
- Implement basic progression tracking
- Create word library UI

### Phase 2: Contextual Learning (Weeks 3-4)
- Example sentences display
- Sentence creation interface
- Basic validation
- LLM integration setup

### Phase 3: Spaced Repetition (Weeks 5-6)
- Implement SR algorithm
- Review scheduling
- Multiple review modes
- Progress persistence

### Phase 4: Smart Features (Weeks 7-8)
- Smart Start logic
- Adaptive difficulty
- Performance analytics
- Achievement system

### Phase 5: Polish & Optimization (Weeks 9-10)
- Performance optimization
- Offline capabilities
- Advanced animations
- User testing & refinement

## 9. Future Enhancements

### Near-term (3-6 months)
- Audio pronunciation
- Speech recognition
- Grammar exercises
- Conversation practice

### Long-term (6-12 months)
- AI tutor chat
- Story-based learning
- Community features
- Gamification leagues

## 10. Risk Mitigation

### Technical Risks
- **LLM Dependency**: Pre-generated fallback content
- **Data Loss**: Regular local backups, export feature
- **Performance**: Lazy loading, pagination

### User Experience Risks
- **Complexity**: Progressive disclosure, good onboarding
- **Motivation**: Streaks, achievements, visible progress
- **Difficulty Spikes**: Adaptive algorithm, skip options

## 11. Acceptance Criteria

### Matching Game
- ✅ 5 pairs per round
- ✅ German-first selection
- ✅ Visual feedback for correct/incorrect
- ✅ Auto-progression

### Example Sentences
- ✅ 5 sentences per word set
- ✅ Target word highlighting
- ✅ Translation available

### Sentence Creation
- ✅ Text input validation
- ✅ Word inclusion check
- ✅ Feedback display

### Spaced Repetition
- ✅ Correct interval calculation
- ✅ Multiple review types
- ✅ Progress tracking

### Progress System
- ✅ Mastery levels updating
- ✅ Statistics accurate
- ✅ Streak maintenance

This PRD provides a comprehensive blueprint for evolving the current matching game into a full-featured language learning platform while preserving all existing functionality and adding the requested features systematically.