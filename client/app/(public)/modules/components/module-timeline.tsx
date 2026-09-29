'use client';

import { Material, Module } from '@/types';
import { fetchMaterialProgress, fetchPublishedMaterials } from '@/lib/fetch';

import { PublicTimelineCard } from '@/components/shared/public-timeline-card';
import { useEntityTimeline } from '@/hooks/use-entity-timeline';

export function ModuleTimeline({ modules }: { modules: Module[] }) {
  const { entries, isLoading } = useEntityTimeline<Module, Material>({
    items: modules,
    fetchChildren: (token) => fetchPublishedMaterials(token),
    getChildParentId: (material) => material.moduleId,
    getChildId: (material) => material.id,
    fetchChildProgress: (token) => fetchMaterialProgress(token),
    getProgressChildId: (progress) => progress.materialId as number,
  });

  if (isLoading) return null;

  return (
    <>
      {entries.map(({ item, status, progress }) => (
        <PublicTimelineCard
          key={item.id}
          label='module'
          order={item.order}
          title={item.title}
          description={item.description}
          status={status}
          progress={progress}
          href={`/modules/${item.slug}`}
          continueLabel={
            progress?.completed === 0 ? 'Start Learning' : undefined
          }
        />
      ))}
    </>
  );
}
