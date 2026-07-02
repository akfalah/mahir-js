import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

import { fetchConceptBySlug, fetchConcepts, fetchMaterials } from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicBreadcrumb from '@/components/shared/PublicBreadcrumb';
import MaterialGrid from './components/MaterialGrid';

type Props = {
  params: Promise<{
    conceptSlug: string;
  }>;
};

export default async function ConceptDetailPage({ params }: Props) {
  const { conceptSlug } = await params;

  const [{ data: concept }, { data: concepts }] = await Promise.all([
    fetchConceptBySlug(conceptSlug),
    fetchConcepts(),
  ]);

  if (!concept) {
    notFound();
  }

  const { data: materials } = await fetchMaterials(undefined, {
    conceptId: concept.id,
    sortBy: 'order',
    orderBy: 'asc',
  });

  const currentIndex = concepts.findIndex((c) => c.order === concept.order);

  const prevConcept = currentIndex > 0 ? concepts[currentIndex - 1] : null;

  const nextConcept =
    currentIndex >= 0 && currentIndex < concepts.length - 1
      ? concepts[currentIndex + 1]
      : null;

  return (
    <div className='container mx-auto px-4 py-10 md:py-12 flex flex-col gap-y-8'>
      <PublicBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title },
        ]}
      />

      <section className='flex max-w-3xl flex-col gap-y-4'>
        <Badge
          variant='secondary'
          className='w-fit rounded-full px-3 py-1'
        >
          Concept #{concept.order}
        </Badge>

        <div className='flex flex-col gap-y-3'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
            {concept.title}
          </h1>

          <p className='text-base md:text-lg leading-relaxed text-muted-foreground'>
            {concept.description}
          </p>
        </div>
      </section>

      <section className='flex flex-col gap-y-5'>
        <div className='flex flex-col gap-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Materials</h2>

          <p className='text-muted-foreground'>
            Follow the materials in order to understand this concept step by
            step.
          </p>
        </div>

        {materials.length > 0 ? (
          <MaterialGrid
            concept={concept}
            materials={materials}
          />
        ) : (
          <div className='rounded-2xl border border-dashed bg-card p-10 text-center'>
            <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <BookOpen className='size-6' />
            </div>

            <div className='flex flex-col gap-y-2 pt-4'>
              <h3 className='font-bold'>No materials yet</h3>

              <p className='text-sm text-muted-foreground'>
                Published materials for this concept will appear here.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className='grid grid-cols-1 gap-3 border-t pt-8 md:grid-cols-3 md:items-center'>
        <div className='flex justify-start'>
          {prevConcept && (
            <Button
              variant='outline'
              asChild
              className='gap-2'
            >
              <Link href={`/concepts/${prevConcept.slug}`}>
                <ChevronLeft className='size-4' />
                Previous
              </Link>
            </Button>
          )}
        </div>

        <div className='flex justify-center'>
          <Button
            variant='secondary'
            asChild
          >
            <Link href='/concepts'>Back to Concepts</Link>
          </Button>
        </div>

        <div className='flex justify-end'>
          {nextConcept && (
            <Button
              asChild
              className='gap-2'
            >
              <Link href={`/concepts/${nextConcept.slug}`}>
                Next
                <ChevronRight className='size-4' />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
