/* eslint-disable @next/next/no-assign-module-variable */
'use client';

import { useEffect, useState } from 'react';

import { Module } from '@/types';

import { useAuthStore } from '@/stores/use-auth-store';

import { fetchMaterialProgress, fetchPublishedMaterials } from '@/lib/fetch';

import {
  PublicTimelineCard,
  type PublicTimelineCardStatus,
} from '@/components/shared/public-timeline-card';

type ModuleProgress = {
  completed: number;
  total: number;
  value: number;
};

type ProgressByModule = Map<number, ModuleProgress>;

type TimelineItem = {
  module: Module;
  status?: PublicTimelineCardStatus;
  progress?: ModuleProgress;
};

function buildTimelineItems(
  modules: Module[],
  progressByModule: ProgressByModule | null,
): TimelineItem[] {
  const sorted = [...modules].sort((a, b) => a.order - b.order);

  // No progress data (guest, non-student, or fetch failed): plain cards, nothing locked
  if (!progressByModule) {
    return sorted.map((module) => ({ module }));
  }

  const items: TimelineItem[] = [];
  let previousDone = true; // first module is always reachable

  for (const module of sorted) {
    const progress = progressByModule.get(module.id) ?? {
      completed: 0,
      total: 0,
      value: 0,
    };
    const isDone = progress.total > 0 && progress.completed === progress.total;

    const status: PublicTimelineCardStatus = isDone
      ? 'completed'
      : previousDone
        ? 'in-progress'
        : 'locked';

    items.push({ module, status, progress });
    previousDone = isDone;
  }

  return items;
}

export function ModuleTimeline({ modules }: { modules: Module[] }) {
  const { user, token, hasHydrated } = useAuthStore();

  const isStudent = hasHydrated && user?.role === 'STUDENT';

  const [progressByModule, setProgressByModule] =
    useState<ProgressByModule | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isStudent) return;

    let isActive = true;

    const load = async () => {
      try {
        const [materialResponses, progressResponse] = await Promise.all([
          Promise.all(
            modules.map((module) =>
              fetchPublishedMaterials(token, { moduleId: module.id }),
            ),
          ),
          fetchMaterialProgress(token),
        ]);

        if (!isActive) return;

        const completedIds = new Set(
          progressResponse.data
            .filter((progress) => progress.isCompleted)
            .map((progress) => progress.materialId),
        );

        const result: ProgressByModule = new Map();

        modules.forEach((module, index) => {
          const materials = materialResponses[index].data;
          const completed = materials.filter((material) =>
            completedIds.has(material.id),
          ).length;
          const total = materials.length;

          result.set(module.id, {
            completed,
            total,
            value: total > 0 ? Math.round((completed / total) * 100) : 0,
          });
        });

        setProgressByModule(result);
      } catch (error) {
        console.error('Failed to fetch module progress data:', error);

        if (isActive) setProgressByModule(null);
      } finally {
        if (isActive) setIsFetched(true);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [modules, isStudent, token]);

  // Avoid flashing wrong statuses while a student's data is loading
  if (isStudent && !isFetched) return null;

  const items = buildTimelineItems(
    modules,
    isStudent ? progressByModule : null,
  );

  return (
    <>
      {items.map(({ module, status, progress }) => (
        <PublicTimelineCard
          key={module.id}
          label='module'
          order={module.order}
          title={module.title}
          description={module.description}
          status={status}
          progress={progress}
          href={`/modules/${module.slug}`}
          continueLabel={
            progress?.completed === 0 ? 'Start Learning' : undefined
          }
        />
      ))}
    </>
  );
}
