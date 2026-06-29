'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/use-auth-store';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUser, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  return <>{children}</>;
}
