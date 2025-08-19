import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExtractedVocabularyClient from './extracted-vocabulary-client';

export default async function ExtractedVocabularyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get all web extractions for this user
  const extractions = await prisma.webExtraction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      extractedWords: true,
    },
    orderBy: {
      extractedAt: 'desc',
    },
  });

  // Convert dates to ISO strings for client component
  const extractionsForClient = extractions.map((e) => ({
    ...e,
    extractedAt: e.extractedAt.toISOString(),
  }));

  return (
    <ExtractedVocabularyClient
      extractions={extractionsForClient}
      currentLanguage={user.currentLanguage}
    />
  );
}
