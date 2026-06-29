import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Role } from '@/types';

import { useAuthStore } from '@/stores/use-auth-store';

export const useAuth = (requiredRole?: Role) => {
  const { user, isLoading, isInitialized, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (user && requiredRole && user.role !== requiredRole) {
      router.push('/learn');
    }
  }, [user, isInitialized, requiredRole, router]);

  return { user, isLoading };
};
