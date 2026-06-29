import { notFound } from 'next/navigation';

import {
  fetchConceptBySlug,
  fetchMaterialBySlug,
  fetchStudyCaseBySlug,
  fetchStudyCases,
} from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import PublicBreadcrumb from '@/components/shared/PublicBreadcrumb';

import StudyCaseEditor from './StudyCaseEditor';

type Props = {
  params: Promise<{
    conceptSlug: string;
    materialSlug: string;
    studyCaseSlug: string;
  }>;
};

export default async function StudyCaseDetailPage({ params }: Props) {
  const { conceptSlug, materialSlug, studyCaseSlug } = await params;

  const [{ data: concept }, { data: material }, { data: studyCase }] =
    await Promise.all([
      fetchConceptBySlug(conceptSlug),
      fetchMaterialBySlug(materialSlug),
      fetchStudyCaseBySlug(studyCaseSlug),
    ]);

  if (!concept || !material || !studyCase) {
    notFound();
  }

  if (material.conceptId !== concept.id) {
    notFound();
  }

  if (studyCase.materialId !== material.id) {
    notFound();
  }

  const { data: studyCases } = await fetchStudyCases(undefined, {
    materialId: material.id,
    sortBy: 'order',
    orderBy: 'asc',
    limit: 100,
  });

  const currentIndex = studyCases.findIndex((item) => item.id === studyCase.id);

  const prevStudyCase = currentIndex > 0 ? studyCases[currentIndex - 1] : null;

  const nextStudyCase =
    currentIndex >= 0 && currentIndex < studyCases.length - 1
      ? studyCases[currentIndex + 1]
      : null;

  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <PublicBreadcrumb
        items={[
          { label: 'Concepts', href: '/concepts' },
          { label: concept.title, href: `/concepts/${concept.slug}` },
          {
            label: material.title,
            href: `/concepts/${concept.slug}/materials/${material.slug}`,
          },
          { label: studyCase.title },
        ]}
      />

      <section className='flex max-w-3xl flex-col gap-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant='secondary'
            className='w-fit rounded-full px-3 py-1'
          >
            Challenge {studyCase.order}
          </Badge>
        </div>

        <div className='flex flex-col gap-y-3'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
            {studyCase.title}
          </h1>

          <p className='text-base md:text-lg leading-relaxed text-muted-foreground'>
            {studyCase.description}
          </p>
        </div>
      </section>

      <StudyCaseEditor
        key={studyCase.id}
        concept={concept}
        material={material}
        studyCase={studyCase}
        prevStudyCase={prevStudyCase}
        nextStudyCase={nextStudyCase}
      />
    </div>
  );
}
