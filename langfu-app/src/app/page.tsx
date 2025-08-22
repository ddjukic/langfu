import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic rendering since we're using cookies
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  console.log('[HomePage] Checking authentication status');

  // Check if user is authenticated
  const user = await getCurrentUser();

  if (user) {
    console.log('[HomePage] User authenticated, redirecting to dashboard');
    redirect('/dashboard');
  } else {
    console.log('[HomePage] No authenticated user, redirecting to login');
    redirect('/login');
  }
}
