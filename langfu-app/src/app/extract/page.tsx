import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExtractClient from './extract-client';
export const dynamic = 'force-dynamic';

export default async function ExtractPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ExtractClient />;
}
