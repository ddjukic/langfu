import { getCurrentUser } from '@/lib/auth';
import TopicLearningClient from './topic-learning-client';
export const dynamic = 'force-dynamic';

export default async function TopicPage() {
  const user = await getCurrentUser();
  return <TopicLearningClient user={user} />;
}
