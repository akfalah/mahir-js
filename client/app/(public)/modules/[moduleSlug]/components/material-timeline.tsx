'use client';

import { Exercise, MaterialSummary } from '@/types';

import { useEntityTimeline } from '@/hooks/use-entity-timeline';

import { fetchExerciseProgress, fetchPublishedExercises } from '@/lib/fetch';

import { PublicTimelineCard } from '@/components/shared/public-timeline-card';

type Props = {
  materials: MaterialSummary[];
  moduleSlug: string; // needed to build each material's nested href
};

export function MaterialTimeline({ materials, moduleSlug }: Props) {
  const { entries, isLoading } = useEntityTimeline<MaterialSummary, Exercise>({
    items: materials,
    fetchChildren: (token) => fetchPublishedExercises(token),
    getChildParentId: (exercise) => exercise.materialId,
    getChildId: (exercise) => exercise.id,
    fetchChildProgress: (token) => fetchExerciseProgress(token),
    getProgressChildId: (progress) => progress.exerciseId as number,
  });

  if (isLoading) return null;

  return (
    <>
      {entries.map(({ item, status, progress }) => (
        <PublicTimelineCard
          key={item.id}
          label={'material'}
          order={item.order}
          title={item.title}
          description={item.description}
          status={status}
          progress={progress}
          href={`/modules/${moduleSlug}/${item.slug}`}
          continueLabel={
            progress?.completed === 0 ? 'Start Learning' : undefined
          }
        />
      ))}
    </>
  );
}
