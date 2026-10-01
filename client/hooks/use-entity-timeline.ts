'use client';

import { useEffect, useState } from 'react';

import { CardStatus } from '@/types';

import { useAuthStore } from '@/stores/use-auth-store';

type EntityTimelineItem = {
  id: number;
  order: number;
  slug: string;
  title: string;
  description: string;
};

type ChildProgress = { completed: number; total: number; value: number };
type ProgressByParent = Map<number, ChildProgress>;

export type TimelineEntry<T extends EntityTimelineItem> = {
  item: T;
  status?: CardStatus;
  progress?: ChildProgress;
};

function buildEntries<T extends EntityTimelineItem>(
  items: T[],
  progressByParent: ProgressByParent | null,
): TimelineEntry<T>[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  if (!progressByParent) {
    return sorted.map((item) => ({ item }));
  }

  const entries: TimelineEntry<T>[] = [];
  let previousDone = true; // first item is always reachable

  for (const item of sorted) {
    const progress = progressByParent.get(item.id) ?? {
      completed: 0,
      total: 0,
      value: 0,
    };
    const isDone = progress.total > 0 && progress.completed === progress.total;

    const status: CardStatus = isDone
      ? 'completed'
      : previousDone
        ? 'in-progress'
        : 'locked';

    entries.push({ item, status, progress });
    previousDone = isDone;
  }

  return entries;
}

type UseEntityTimelineOptions<T extends EntityTimelineItem, TChild> = {
  items: T[];
  fetchChildren: (token: string | null) => Promise<{ data: TChild[] }>;
  getChildParentId: (child: TChild) => number;
  getChildId: (child: TChild) => number;
  fetchChildProgress: (
    token: string | null,
  ) => Promise<{ data: { isCompleted: boolean; [key: string]: unknown }[] }>;
  getProgressChildId: (progress: { [key: string]: unknown }) => number;
};

export function useEntityTimeline<T extends EntityTimelineItem, TChild>({
  items,
  fetchChildren,
  getChildParentId,
  getChildId,
  fetchChildProgress,
  getProgressChildId,
}: UseEntityTimelineOptions<T, TChild>) {
  const { user, token, hasHydrated } = useAuthStore();

  const isStudent = hasHydrated && user?.role === 'STUDENT';
  const itemIds = items.map((item) => item.id).join(',');

  const [progressByParent, setProgressByParent] =
    useState<ProgressByParent | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isStudent) return;

    let isActive = true;

    const load = async () => {
      try {
        const [childrenRes, progressRes] = await Promise.all([
          fetchChildren(token),
          fetchChildProgress(token),
        ]);

        if (!isActive) return;

        const completedChildIds = new Set(
          progressRes.data
            .filter((progress) => progress.isCompleted)
            .map(getProgressChildId),
        );

        const result: ProgressByParent = new Map();

        for (const item of items) {
          const children = childrenRes.data.filter(
            (child) => getChildParentId(child) === item.id,
          );
          const completed = children.filter((child) =>
            completedChildIds.has(getChildId(child)),
          ).length;

          result.set(item.id, {
            completed,
            total: children.length,
            value:
              children.length > 0
                ? Math.round((completed / children.length) * 100)
                : 0,
          });
        }

        setProgressByParent(result);
      } catch (error) {
        console.error('Failed to fetch timeline progress data:', error);
        if (isActive) setProgressByParent(null);
      } finally {
        if (isActive) setIsFetched(true);
      }
    };

    load();

    return () => {
      isActive = false;
    };
    // items is intentionally left out — itemIds (a stable string of the
    // same ids) is what should trigger a refetch, not the array's identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent, token, itemIds, fetchChildren, fetchChildProgress]);

  return {
    entries: buildEntries(items, isStudent ? progressByParent : null),
    isLoading: isStudent && !isFetched,
  };
}
