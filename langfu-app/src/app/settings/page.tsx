import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's full data
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      currentLanguage: true,
      dailyGoal: true,
    },
  });

  if (!fullUser) {
    redirect('/login');
  }

  return <SettingsClient user={fullUser} />;
}