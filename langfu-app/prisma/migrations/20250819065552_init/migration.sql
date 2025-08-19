-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('GERMAN', 'SPANISH');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "currentLanguage" "public"."Language" NOT NULL DEFAULT 'GERMAN',
    "dailyGoal" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "public"."Language" NOT NULL,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" TEXT NOT NULL DEFAULT 'A1',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPractice" TIMESTAMP(3),
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Word" (
    "id" TEXT NOT NULL,
    "language" "public"."Language" NOT NULL,
    "level" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "l2" TEXT NOT NULL,
    "l1" TEXT NOT NULL,
    "pos" TEXT,
    "gender" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Example" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WordHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),
    "nextReview" TIMESTAMP(3),
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSentence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VocabularySet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" "public"."Language" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularySet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebExtraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "language" "public"."Language" NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customTopic" TEXT,
    "level" TEXT,

    CONSTRAINT "WebExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExtractedWord" (
    "id" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "l2" TEXT NOT NULL,
    "l1" TEXT NOT NULL,
    "pos" TEXT,
    "gender" TEXT,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "context" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "level" TEXT,

    CONSTRAINT "ExtractedWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Progress_userId_idx" ON "public"."Progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_language_key" ON "public"."Progress"("userId", "language");

-- CreateIndex
CREATE INDEX "Word_language_level_topic_idx" ON "public"."Word"("language", "level", "topic");

-- CreateIndex
CREATE INDEX "Word_l2_idx" ON "public"."Word"("l2");

-- CreateIndex
CREATE INDEX "Example_wordId_idx" ON "public"."Example"("wordId");

-- CreateIndex
CREATE INDEX "WordHistory_userId_idx" ON "public"."WordHistory"("userId");

-- CreateIndex
CREATE INDEX "WordHistory_wordId_idx" ON "public"."WordHistory"("wordId");

-- CreateIndex
CREATE INDEX "WordHistory_nextReview_idx" ON "public"."WordHistory"("nextReview");

-- CreateIndex
CREATE UNIQUE INDEX "WordHistory_userId_wordId_key" ON "public"."WordHistory"("userId", "wordId");

-- CreateIndex
CREATE INDEX "UserSentence_userId_idx" ON "public"."UserSentence"("userId");

-- CreateIndex
CREATE INDEX "UserSentence_wordId_idx" ON "public"."UserSentence"("wordId");

-- CreateIndex
CREATE INDEX "VocabularySet_language_idx" ON "public"."VocabularySet"("language");

-- CreateIndex
CREATE INDEX "WebExtraction_userId_idx" ON "public"."WebExtraction"("userId");

-- CreateIndex
CREATE INDEX "WebExtraction_language_idx" ON "public"."WebExtraction"("language");

-- CreateIndex
CREATE INDEX "ExtractedWord_extractionId_idx" ON "public"."ExtractedWord"("extractionId");

-- CreateIndex
CREATE INDEX "ExtractedWord_l2_idx" ON "public"."ExtractedWord"("l2");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Example" ADD CONSTRAINT "Example_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WordHistory" ADD CONSTRAINT "WordHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WordHistory" ADD CONSTRAINT "WordHistory_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSentence" ADD CONSTRAINT "UserSentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSentence" ADD CONSTRAINT "UserSentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebExtraction" ADD CONSTRAINT "WebExtraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExtractedWord" ADD CONSTRAINT "ExtractedWord_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "public"."WebExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
