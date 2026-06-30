import { notFound } from 'next/navigation';

import {
  fetchConceptBySlug,
  fetchMaterialBySlug,
  fetchStudyCaseBySlug,
  fetchStudyCases,
} from '@/lib/fetch';

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
