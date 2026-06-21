import Link from 'next/link';

import {
  fetchConceptById,
  fetchMaterialById,
  fetchStudyCaseById,
} from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppBreadcrumb from '@/components/shared/Breadcrumb';

import { ChevronLeft } from 'lucide-react';

import StudyCaseEditor from './StudyCaseEditor';

export default async function StudyCaseDetailPage({
  params,
}: {
  params: Promise<{
    conceptId: string;
    materialId: string;
    studyCaseId: string;
  }>;
}) {
  const { conceptId, materialId, studyCaseId } = await params;
  const [{ data: studyCase }, { data: material }, { data: concept }] =
    await Promise.all([
      fetchStudyCaseById(studyCaseId),
      fetchMaterialById(materialId),
      fetchConceptById(conceptId),
    ]);

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title, href: `/concepts/${conceptId}` },
          {
            label: material.title,
            href: `/concepts/${conceptId}/materials/${materialId}`,
          },
          { label: studyCase.title },
        ]}
      />

      <div>
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='mb-4'
        >
          <Link href={`/concepts/${conceptId}/materials/${materialId}`}>
            <ChevronLeft className='w-4 h-4 mr-1' />
            Kembali
          </Link>
        </Button>

        <Badge
          variant='outline'
          className='mb-2'
        >
          #{studyCase.order}
        </Badge>

        <h1 className='text-3xl font-bold'>{studyCase.title}</h1>

        <p className='text-muted-foreground mt-1'>{studyCase.description}</p>
      </div>

      <StudyCaseEditor studyCase={studyCase} />
    </div>
  );
}
