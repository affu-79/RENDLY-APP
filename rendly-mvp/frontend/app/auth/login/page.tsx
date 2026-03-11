'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /auth/login redirects to /auth/sign-up (Sign Up page).
 */
export default function AuthLoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/sign-up');
  }, [router]);
  return null;
}
