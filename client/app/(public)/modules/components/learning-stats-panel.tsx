'use client';

import Link from 'next/link';

import { Flame } from 'lucide-react';

import { useAuthStore } from '@/stores/use-auth-store';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { LearningStreakCard } from './learning-streak-card';
import { OverallLearningProgressCard } from './overall-learning-progress-card';

function GuestStatsCta() {
  return (
    <Card className='py-6 gap-y-6'>
      <CardHeader className='px-6'>
        <CardTitle className='text-xl lg:text-2xl font-semibold'>
          Track Your Learning
        </CardTitle>
      </CardHeader>

      <CardContent className='px-6 flex flex-col gap-y-6'>
        <div className='flex gap-x-4'>
          <div className='size-12 lg:size-14 shrink-0 flex items-center justify-center bg-orange-200 text-orange-600 rounded-lg'>
            <Flame className='size-6 lg:size-8' />
          </div>

          <p className='text-xs lg:text-sm text-muted-foreground'>
            Sign in to see your overall progress and build a daily learning
            streak.
          </p>
        </div>

        <div className='flex justify-center gap-x-3'>
          <Button
            asChild
            variant={'outline'}
            className='w-20'
          >
            <Link href='/sign-in'>Sign In</Link>
          </Button>

          <Button
            asChild
            className='w-20'
          >
            <Link href='/sign-up'>Sign Up</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LearningStatsPanel() {
  const { user, hasHydrated } = useAuthStore();

  // Wait for the auth store, otherwise logged-in users would flash the CTA
  if (!hasHydrated) return null;

  if (!user) return <GuestStatsCta />;

  // Admins and any other non-student roles see nothing
  if (user.role !== 'STUDENT') return null;

  return (
    <>
      <LearningStreakCard />
      <OverallLearningProgressCard />
    </>
  );
}
