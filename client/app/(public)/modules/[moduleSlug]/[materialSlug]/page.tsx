import { notFound } from 'next/navigation';

import { fetchMaterialBySlug } from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { PublicBreadcrumb } from '@/components/shared/public-breadcrumb';
import { PublicHeader } from '@/components/shared/public-header';

import { MaterialContent } from './components/material-content';
import { ExerciseGrid } from './components/exercise-grid';

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; materialSlug: string }>;
}) {
  const { moduleSlug, materialSlug } = await params;
  const { data: material } = await fetchMaterialBySlug(materialSlug);

  if (!material) notFound();

  return (
    <>
      <PublicBreadcrumb />

      <PublicHeader
        title={material.title}
        paragraph={material.description}
        badges={<Badge variant='tertiary'>Material {material.order}</Badge>}
      />

      <Separator />

      <MaterialContent content={material.content} />

      <Separator />

      <div className='flex flex-col gap-y-6 xl:gap-y-8'>
        <div className='flex items-end justify-between'>
          <h2 className='text-xl lg:text-2xl font-semibold'>Code Exercises</h2>

          <span className='text-xs font-medium text-muted-foreground'>
            {material.exercises.length} Exercises available
          </span>
        </div>

        <ExerciseGrid
          exercises={material.exercises}
          moduleSlug={moduleSlug}
          materialSlug={material.slug}
        />
      </div>
    </>
  );
}
