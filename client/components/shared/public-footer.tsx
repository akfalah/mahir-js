'use client';

import Link from 'next/link';

import { useAuthStore } from '@/stores/use-auth-store';

import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

import { PublicLogo } from './public-logo';

export function PublicFooter() {
  const { user, hasHydrated } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  return (
    <footer className='bg-background/70 border-t'>
      <div className='container mx-auto py-8 px-4 lg:px-16 w-full flex flex-col gap-y-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <PublicLogo
            href={'/'}
            variant={'with-text'}
            size={'bigger'}
          />
          <nav className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <Link
              href={'/'}
              className='hover:text-foreground transition-colors'
            >
              Home
            </Link>

            <Link
              href={'/modules'}
              className='hover:text-foreground transition-colors'
            >
              Curriculum
            </Link>

            {!hasHydrated ? (
              <Skeleton className='h-4 w-24' />
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href={'/admin'}
                    className='hover:text-foreground transition-colors'
                  >
                    Admin Dashboard
                  </Link>
                )}

                {!user && (
                  <>
                    <Link
                      href={'/sign-in'}
                      className='hover:text-foreground transition-colors'
                    >
                      Sign In
                    </Link>

                    <Link
                      href={'/sign-up'}
                      className='hover:text-foreground transition-colors'
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        <Separator />

        <div>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} MahirJS Built for beginner JavaScript
            learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
