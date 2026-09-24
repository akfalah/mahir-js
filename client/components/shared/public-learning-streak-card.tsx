'use client';

import { useEffect, useState } from 'react';
import { cn } from 'cn';

import { Check, Flame } from 'lucide-react';

import { LearningStreak } from '@/types';

import { useAuthStore } from '@/stores/use-auth-store';

import { fetchLearningStreak } from '@/lib/fetch';
import { addDays } from '@/lib/helpers/date-formatter';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayState = 'done' | 'today' | 'idle';

const cellClass: Record<DayState, string> = {
  done: 'bg-primary text-white border-primary',
  today: 'bg-transparent border-primary ring-2 ring-primary/25',
  idle: 'bg-muted border-border',
};

function buildWeek(today: string, activeDates: string[]) {
  const active = new Set(activeDates);
  const todayIndex = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sun

  return DAY_LABELS.map((label, index) => {
    const date = addDays(today, index - todayIndex);

    const state: DayState = active.has(date)
      ? 'done'
      : date === today
        ? 'today'
        : 'idle';

    return { label, date, state };
  });
}

function getMessage({ currentStreak, today, activeDates }: LearningStreak) {
  if (currentStreak === 0) return 'Start your streak today';
  if (activeDates.includes(today)) return 'Keep it up!';
  return 'Submit today to keep it going';
}

export function PublicLearningStreakCard() {
  const { token } = useAuthStore();

  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetchLearningStreak(token)
      .then((res) => {
        if (isActive) setStreak(res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch learning streak:', error);
        if (isActive) setHasError(true);
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const week = streak ? buildWeek(streak.today, streak.activeDates) : null;

  return (
    <Card className='py-6 gap-y-6'>
      <CardHeader className='px-6'>
        <CardTitle className='text-2xl font-semibold'>
          Learning Streak
        </CardTitle>
      </CardHeader>

      <CardContent className='px-6 flex flex-col gap-y-6'>
        <div className='flex gap-x-4'>
          <div className='size-14 shrink-0 flex items-center justify-center bg-orange-200 text-orange-600 rounded-lg'>
            <Flame className='size-8' />
          </div>

          <div className='flex flex-col gap-y-0.5'>
            {streak ? (
              <>
                <p className='text-lg font-semibold'>
                  {streak.currentStreak}{' '}
                  {streak.currentStreak === 1 ? 'Day' : 'Days'}
                </p>
                <span className='text-xs font-medium text-muted-foreground'>
                  {getMessage(streak)}
                </span>
              </>
            ) : (
              <span className='text-sm text-muted-foreground'>
                {hasError ? "Couldn't load your streak" : 'Loading...'}
              </span>
            )}
          </div>
        </div>

        <div className='grid grid-cols-7 gap-3'>
          {(
            week ??
            DAY_LABELS.map((label) => ({ label, date: label, state: null }))
          ).map(({ label, date, state }) => (
            <div
              key={date}
              className='flex flex-col items-center gap-y-2.5'
            >
              <p className='text-xs font-medium text-muted-foreground'>
                {label}
              </p>

              <div
                className={cn(
                  'size-8 flex items-center justify-center border rounded-md',
                  state
                    ? cellClass[state]
                    : 'bg-muted border-border animate-pulse',
                )}
              >
                {state === 'done' && <Check className='size-6' />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
