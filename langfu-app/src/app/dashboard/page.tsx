import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';

// Force dynamic rendering since we're using cookies for authentication
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  console.log('[Dashboard] Loading dashboard page');

  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    console.error('[Dashboard] No user found - this should not happen as middleware handles auth');
    // This should not happen as middleware handles auth
    // Return error message instead of redirect to avoid loops
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p>Unable to load user data. Please try logging in again.</p>
          <a href="/login" className="text-blue-500 underline mt-4 inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  console.log('[Dashboard] User loaded successfully:', user.email);

  // Get user's progress
  const progress = await prisma.progress.findFirst({
    where: {
      userId: user.id,
      language: user.currentLanguage,
    },
  });

  // Get words due for review
  const wordsDueForReview = await prisma.wordHistory.count({
    where: {
      userId: user.id,
      nextReview: {
        lte: new Date(),
      },
    },
  });

  // Get recent word history
  const recentWords = await prisma.wordHistory.findMany({
    where: {
      userId: user.id,
    },
    include: {
      word: true,
    },
    orderBy: {
      lastReview: 'desc',
    },
    take: 10,
  });

  return (
    <DashboardClient
      user={user}
      progress={progress}
      wordsDueForReview={wordsDueForReview}
      recentWords={recentWords}
    />
  );
}
