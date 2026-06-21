import Link from 'next/link';

import { fetchConceptById, fetchConcepts, fetchMaterials } from '@/lib/fetch';

import { Button } from '@/components/ui/button';
import AppBreadcrumb from '@/components/shared/Breadcrumb';

import { ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const [{ data: concept }, { data: concepts }, { data: materials }] =
    await Promise.all([
      fetchConceptById(conceptId),
      fetchConcepts(),
      fetchMaterials(undefined, { conceptId: Number(conceptId) }),
    ]);

  const currentIndex = concepts.findIndex((m) => m.id === Number(conceptId));
  const prevConcept = currentIndex > 0 ? concepts[currentIndex - 1] : null;
  const nextConcept =
    currentIndex < concepts.length - 1 ? concepts[currentIndex + 1] : null;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title },
        ]}
      />

      {/* Header */}
      <div className='space-y-3'>
        <h1 className='text-4xl font-bold tracking-tight'>{concept.title}</h1>

        <p className='text-muted-foreground text-lg'>{concept.description}</p>
      </div>

      {/* Materials */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Topics to Learn</h2>

        <div className='space-y-3'>
          {materials.map((material) => (
            <div
              key={material.id}
              className='group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-200'
            >
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-4 flex-1 min-w-0'>
                  <div className='h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <span className='text-primary text-sm font-bold'>
                      {material.order}
                    </span>
                  </div>

                  <div className='min-w-0'>
                    <h3 className='font-semibold'>{material.title}</h3>
                    <div className='flex items-center gap-1 mt-0.5 text-xs text-muted-foreground'>
                      <BookOpen className='h-3 w-3' />
                      <span>Material</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/concepts/${conceptId}/materials/${material.id}`}
                  className='shrink-0'
                >
                  <Button
                    size='sm'
                    className='gap-1'
                  >
                    Learn
                    <ArrowRight className='h-3 w-3' />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next Navigation */}
        <div className='flex items-center justify-between py-8 border-y border-border'>
          {prevConcept ? (
            <Link href={`/concepts/${prevConcept.id}`}>
              <Button
                variant='outline'
                className='w-28 gap-2'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
            </Link>
          ) : (
            <div className='w-28'></div>
          )}

          <Link href={`/concepts`}>
            <Button variant='outline'>Back to the concept list</Button>
          </Link>

          {nextConcept ? (
            <Link href={`/concepts/${nextConcept.id}`}>
              <Button className='w-28 gap-2'>
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </Link>
          ) : (
            <div className='w-28'></div>
          )}
        </div>
      </div>
    </div>
  );
}
