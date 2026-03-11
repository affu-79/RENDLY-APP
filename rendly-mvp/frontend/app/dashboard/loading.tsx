import { PageSkeleton } from '@/components/common/SkeletonLoader';

/**
 * Shown while dashboard segment (including /dashboard and /dashboard/chat) is loading.
 */
export default function DashboardLoading() {
  return <PageSkeleton />;
}
