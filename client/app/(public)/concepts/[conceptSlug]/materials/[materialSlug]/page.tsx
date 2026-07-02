import { notFound } from 'next/navigation';

import { Code2 } from 'lucide-react';

import {
  fetchConceptBySlug,
  fetchMaterialBySlug,
  fetchMaterials,
  fetchStudyCases,
} from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import PublicBreadcrumb from '@/components/shared/PublicBreadcrumb';
import PublicPrevNextNavigation from '@/components/shared/PublicPrevNextNavigation';

import MaterialContent from './components/MaterialContent';
import StudyCaseGrid from './components/StudyCaseGrid';

type Props = {
  params: Promise<{
    conceptSlug: string;
    materialSlug: string;
  }>;
};

export default async function MaterialDetailPage({ params }: Props) {
  const { conceptSlug, materialSlug } = await params;

  const [{ data: concept }, { data: material }] = await Promise.all([
    fetchConceptBySlug(conceptSlug),
    fetchMaterialBySlug(materialSlug),
  ]);

  if (!concept || !material) {
    notFound();
  }

  if (material.conceptId !== concept.id) {
    notFound();
  }

  const [{ data: materials }, { data: studyCases }] = await Promise.all([
    fetchMaterials(undefined, {
      conceptId: concept.id,
      sortBy: 'order',
      orderBy: 'asc',
    }),
    fetchStudyCases(undefined, {
      materialId: material.id,
      sortBy: 'order',
      orderBy: 'asc',
    }),
  ]);

  const currentIndex = materials.findIndex((item) => item.id === material.id);

  const prevMaterial = currentIndex > 0 ? materials[currentIndex - 1] : null;

  const nextMaterial =
    currentIndex >= 0 && currentIndex < materials.length - 1
      ? materials[currentIndex + 1]
      : null;

  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <PublicBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title, href: `/concepts/${concept.slug}` },
          { label: material.title },
        ]}
      />

      <section className='flex max-w-3xl flex-col gap-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant='secondary'
            className='w-fit rounded-full px-3 py-1'
          >
            {concept.title}
          </Badge>

          <Badge
            variant='outline'
            className='w-fit rounded-full px-3 py-1'
          >
            Part {material.order} of {materials.length}
          </Badge>
        </div>
      </section>

      <article className='flex flex-col gap-y-8 rounded-3xl border bg-card p-6 shadow-sm md:p-8'>
        <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
          {material.title}
        </h1>

        <MaterialContent content={material.content} />
      </article>

      <section className='flex flex-col gap-y-5'>
        <div className='flex flex-col gap-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Practice Exercises
          </h2>

          <p className='text-muted-foreground'>
            Practice this material through small coding challenges.
          </p>
        </div>

        {studyCases.length > 0 ? (
          <div className='grid gap-5 md:grid-cols-2'>
            <StudyCaseGrid
              concept={concept}
              material={material}
              studyCases={studyCases}
            />
          </div>
        ) : (
          <div className='rounded-2xl border border-dashed bg-card p-10 text-center'>
            <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <Code2 className='size-6' />
            </div>

            <div className='flex flex-col gap-y-2 pt-4'>
              <h3 className='font-bold'>No practice yet</h3>

              <p className='text-sm text-muted-foreground'>
                Published practice exercises for this material will appear here.
              </p>
            </div>
          </div>
        )}
      </section>

      <PublicPrevNextNavigation
        previous={
          prevMaterial
            ? {
                href: `/concepts/${concept.slug}/materials/${prevMaterial.slug}`,
                label: 'Previous',
              }
            : null
        }
        next={
          nextMaterial
            ? {
                href: `/concepts/${concept.slug}/materials/${nextMaterial.slug}`,
                label: 'Next',
              }
            : null
        }
        backHref={`/concepts/${concept.slug}`}
        backLabel={`Back to ${concept.title}`}
      />
    </div>
  );
}
