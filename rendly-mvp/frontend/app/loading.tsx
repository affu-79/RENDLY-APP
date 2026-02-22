import { PageSkeleton } from '@/components/common/SkeletonLoader';

/**
 * Instant skeleton at 0ms on route load. No blank page.
 * Spinner (DelayedLoader) is shown only after 300ms if context isLoading is true.
 */
export default function Loading() {
  return <PageSkeleton />;
}
