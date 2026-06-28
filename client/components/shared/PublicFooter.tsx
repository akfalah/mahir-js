'use client';

import Link from 'next/link';

import { Code2 } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

export default function PublicFooter() {
  const { user, hasHydrated } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const dashboardHref = isAdmin ? '/admin' : '/learn';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'My Learning';

  return (
    <footer className='bg-card/70 border-t'>
      <div className='container mx-auto px-4 py-8 flex flex-col gap-y-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <div className='flex items-center gap-x-3'>
            <div className='size-10 flex items-center justify-center text-primary bg-primary/10 rounded-full'>
              <Code2 className='size-5' />
            </div>

            <div>
              <p className='font-bold tracking-tight'>
                Mahir<span className='text-primary'>.js</span>
              </p>

              <p className='text-sm text-muted-foreground'>
                Learn JavaScript with guided practice.
              </p>
            </div>
          </div>

          <nav className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <Link
              href='/'
              className='transition-colors hover:text-foreground'
            >
              Home
            </Link>

            <Link
              href='/concepts'
              className='transition-colors hover:text-foreground'
            >
              Concepts
            </Link>

            {!hasHydrated ? (
              <Skeleton className='h-4 w-24' />
            ) : user ? (
              <Link href={dashboardHref}>{dashboardLabel}</Link>
            ) : (
              <>
                <Link
                  href='/sign-in'
                  className='transition-colors hover:text-foreground'
                >
                  Sign In
                </Link>

                <Link
                  href='/sign-up'
                  className='transition-colors hover:text-foreground'
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>

        <Separator />

        <div>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} Mahir.js. Built for beginner JavaScript
            learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
