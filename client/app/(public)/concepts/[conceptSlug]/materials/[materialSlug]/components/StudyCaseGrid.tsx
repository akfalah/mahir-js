'use client';

import { useEffect, useMemo, useState } from 'react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material, StudyCase, StudyCaseProgress } from '@/types';

import PublicLearningCard from '@/components/shared/PublicLearningCard';

type Props = {
  concept: Concept;
  material: Material;
  studyCases: StudyCase[];
};

export default function StudyCaseGrid({
  concept,
  material,
  studyCases,
}: Props) {
  const { user, hasHydrated } = useAuthStore();

  const userRole = user?.role;
  const shouldShowProgress = hasHydrated && userRole === 'STUDENT';

  const [studyCaseProgresses, setStudyCaseProgresses] = useState<
    StudyCaseProgress[]
  >([]);

  useEffect(() => {
    let isActive = true;

    const fetchStudyCaseProgresses = async () => {
      if (!hasHydrated || userRole !== 'STUDENT') {
        return;
      }

      try {
        const res = await api.get<{ data: StudyCaseProgress[] }>(
          '/progress/study-cases',
        );

        if (!isActive) {
          return;
        }

        setStudyCaseProgresses(res.data.data);
      } catch {
        if (!isActive) {
          return;
        }

        setStudyCaseProgresses([]);
      }
    };

    fetchStudyCaseProgresses();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, userRole]);

  const completedStudyCaseIds = useMemo(() => {
    return new Set(
      studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [studyCaseProgresses]);

  return (
    <section className='grid grid-cols-1 items-stretch gap-4 md:grid-cols-2'>
      {studyCases.map((studyCase, index) => {
        const isCompleted =
          shouldShowProgress && completedStudyCaseIds.has(studyCase.id);

        return (
          <PublicLearningCard
            key={studyCase.id}
            title={studyCase.title}
            description={studyCase.description}
            href={`/concepts/${concept.slug}/materials/${material.slug}/study-cases/${studyCase.slug}`}
            actionLabel={isCompleted ? 'Review Solution' : 'Start Practice'}
            actionVariant={isCompleted ? 'secondary' : 'default'}
            primaryBadge={{
              label: `Challenge ${index + 1}`,
              variant: 'outline',
            }}
            secondaryBadge={
              shouldShowProgress
                ? {
                    label: isCompleted ? 'Passed' : 'Practice',
                    variant: isCompleted ? 'default' : 'secondary',
                  }
                : undefined
            }
          />
        );
      })}
    </section>
  );
}
