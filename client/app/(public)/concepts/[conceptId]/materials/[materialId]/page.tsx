import Link from 'next/link';

import {
  fetchConceptById,
  fetchMaterialById,
  fetchMaterials,
  fetchStudyCases,
} from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppBreadcrumb from '@/components/shared/Breadcrumb';

import { ChevronLeft, ChevronRight, Code2 } from 'lucide-react';

import MaterialContent from './MaterialContent';

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ conceptId: string; materialId: string }>;
}) {
  const { conceptId, materialId } = await params;
  const [
    { data: material },
    { data: materials },
    { data: studyCases },
    { data: concept },
  ] = await Promise.all([
    fetchMaterialById(materialId),
    fetchMaterials(undefined, { conceptId: Number(conceptId) }),
    fetchStudyCases(undefined, { materialId: Number(materialId) }),
    fetchConceptById(conceptId),
  ]);

  const currentIndex = materials.findIndex((m) => m.id === Number(materialId));
  const prevMaterial = currentIndex > 0 ? materials[currentIndex - 1] : null;
  const nextMaterial =
    currentIndex < materials.length - 1 ? materials[currentIndex + 1] : null;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title, href: `/concepts/${conceptId}` },
          { label: material.title },
        ]}
      />

      {/* Header */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Badge className='text-sm'>{concept.title}</Badge>

          <Badge
            variant='secondary'
            className='text-sm'
          >
            Part {material.order} of {materials.length}
          </Badge>
        </div>

        {/* <h1 className='text-4xl font-bold tracking-tight'>{material.title}</h1> */}
      </div>

      {/* Content */}
      <MaterialContent content={material.content} />

      {/* Prev / Next Navigation */}
      <div className='flex items-center justify-between pt-8 border-t border-border'>
        {prevMaterial ? (
          <Link href={`/concepts/${conceptId}/materials/${prevMaterial.id}`}>
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

        <Link href={`/concepts/${conceptId}`}>
          <Button variant='outline'>Back to {concept.title}</Button>
        </Link>

        {nextMaterial ? (
          <Link href={`/concepts/${conceptId}/materials/${nextMaterial.id}`}>
            <Button className='w-28 gap-2'>
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </Link>
        ) : (
          <div className='w-28'></div>
        )}
      </div>

      {/* Study Cases */}
      {studyCases.length > 0 && (
        <div className='space-y-4 pt-4 border-t border-border'>
          <div className='space-y-1'>
            <h2 className='text-2xl font-bold'>Practice Exercises</h2>

            <p className='text-muted-foreground'>
              Apply what you&apos;ve learned with hands-on coding challenges.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {studyCases.map((studyCase, index) => (
              <Link
                key={studyCase.id}
                href={`/concepts/${conceptId}/materials/${materialId}/study-cases/${studyCase.id}`}
              >
                <div className='group h-full bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-200 flex flex-col gap-3'>
                  <div className='flex items-start justify-between'>
                    <Badge
                      variant='outline'
                      className='text-xs'
                    >
                      Challenge {index + 1}
                    </Badge>

                    <Code2 className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>

                  <h3 className='font-semibold'>{studyCase.title}</h3>

                  <p className='text-sm text-muted-foreground line-clamp-2 flex-1'>
                    {studyCase.description}
                  </p>

                  <Button
                    size='sm'
                    className='w-full mt-auto'
                  >
                    Start Challenge
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
