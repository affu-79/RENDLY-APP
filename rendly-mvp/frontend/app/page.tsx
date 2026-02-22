'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamic import so "/" compiles in &lt;5s. Heavy content loads in a separate chunk.
 */
const WelcomeContent = dynamic(
  () => import('@/components/home/WelcomeContent'),
  {
    loading: () => (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    ),
  }
);

export default function Page() {
  return <WelcomeContent />;
}
