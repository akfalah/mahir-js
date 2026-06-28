'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicLandingActions() {
  const { user, hasHydrated } = useAuthStore();

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : '/learn';
  const dashboardLabel =
    user?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Learning';

  if (!hasHydrated) {
    return (
      <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <Skeleton className='h-11 w-full sm:w-40' />
        <Skeleton className='h-11 w-full sm:w-44' />
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center gap-3 sm:flex-row'>
      <Button
        size='lg'
        asChild
        className='gap-2'
      >
        <Link href='/concepts'>
          Start Learning
          <ArrowRight className='h-4 w-4' />
        </Link>
      </Button>

      {user ? (
        <Button
          size='lg'
          variant='outline'
          asChild
        >
          <Link href={dashboardHref}>{dashboardLabel}</Link>
        </Button>
      ) : (
        <Button
          size='lg'
          variant='outline'
          asChild
        >
          <Link href='/sign-up'>Create Free Account</Link>
        </Button>
      )}
    </div>
  );
}
