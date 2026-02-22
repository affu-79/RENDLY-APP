import { PageSkeleton } from '@/components/common/SkeletonLoader';

/**
 * Instant skeleton at 0ms when navigating to auth routes.
 */
export default function AuthLoading() {
  return <PageSkeleton />;
}
