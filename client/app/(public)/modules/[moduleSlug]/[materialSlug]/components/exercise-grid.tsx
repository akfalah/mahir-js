'use client';

import { useEffect, useState } from 'react';

import { fetchExerciseProgress } from '@/lib/fetch';
import { useAuthStore } from '@/stores/use-auth-store';

import { CardStatus, ExerciseSummary } from '@/types';

import { PublicTimelineCard } from '@/components/shared/public-timeline-card';

type Props = {
  exercises: ExerciseSummary[];
  moduleSlug: string;
  materialSlug: string;
};

type ExerciseEntry = {
  exercise: ExerciseSummary;
  status?: CardStatus;
};

function buildEntries(
  exercises: ExerciseSummary[],
  completedIds: Set<number> | null,
): ExerciseEntry[] {
  const sorted = [...exercises].sort((a, b) => a.order - b.order);

  if (!completedIds) {
    return sorted.map((exercise) => ({ exercise }));
  }

  const entries: ExerciseEntry[] = [];
  let previousDone = true; // first exercise is always reachable

  for (const exercise of sorted) {
    const isDone = completedIds.has(exercise.id);

    const status: CardStatus = isDone
      ? 'completed'
      : previousDone
        ? 'in-progress'
        : 'locked';

    entries.push({ exercise, status });
    previousDone = isDone;
  }

  return entries;
}

export function ExerciseGrid({ exercises, moduleSlug, materialSlug }: Props) {
  const { user, token, hasHydrated } = useAuthStore();

  const isStudent = hasHydrated && user?.role === 'STUDENT';
  const exerciseIds = exercises.map((exercise) => exercise.id).join(',');

  const [completedIds, setCompletedIds] = useState<Set<number> | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isStudent) return;

    let isActive = true;

    fetchExerciseProgress(token)
      .then((res) => {
        if (!isActive) return;

        setCompletedIds(
          new Set(
            res.data
              .filter((progress) => progress.isCompleted)
              .map((progress) => progress.exerciseId),
          ),
        );
      })
      .catch((error) => {
        console.error('Failed to fetch exercise progress:', error);
        if (isActive) setCompletedIds(null);
      })
      .finally(() => {
        if (isActive) setIsFetched(true);
      });

    return () => {
      isActive = false;
    };
    // exerciseIds (stable string) drives refetch, not the array identity
  }, [isStudent, token, exerciseIds]);

  // Avoid flashing wrong statuses while a student's data is loading
  if (isStudent && !isFetched) return null;

  const entries = buildEntries(exercises, isStudent ? completedIds : null);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
      {entries.map(({ exercise, status }) => (
        <PublicTimelineCard
          key={exercise.id}
          label={'exercise'}
          order={exercise.order}
          title={exercise.title}
          description={exercise.description}
          continueLabel={'Start Solving'}
          reviewLabel={'Review Your Code'}
          status={status}
          href={`/modules/${moduleSlug}/${materialSlug}/${exercise.slug}`}
          showBadgeIcon={true}
          showIconRail={false}
        />
      ))}
    </div>
  );
}
