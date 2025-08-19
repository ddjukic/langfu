import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/auth';

export default async function HomePage() {
  // Simply check for auth cookie presence to avoid DB call
  const token = await getAuthCookie();

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
