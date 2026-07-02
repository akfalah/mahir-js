'use client';

import { useEffect, useMemo, useState } from 'react';

import { fetchStudyCaseProgresses } from '@/lib/fetch';

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
  const { user, token, hasHydrated } = useAuthStore();

  const shouldShowProgress = hasHydrated && user?.role === 'STUDENT';

  const [studyCaseProgresses, setStudyCaseProgresses] = useState<
    StudyCaseProgress[]
  >([]);

  useEffect(() => {
    let isActive = true;

    const fetchProgressData = async () => {
      if (!shouldShowProgress) {
        setStudyCaseProgresses([]);
        return;
      }

      try {
        const res = await fetchStudyCaseProgresses(token);

        if (!isActive) {
          return;
        }

        setStudyCaseProgresses(res.data);
      } catch (error) {
        console.error('Failed to fetch study case progress data:', error);

        if (!isActive) {
          return;
        }

        setStudyCaseProgresses([]);
      }
    };

    fetchProgressData();

    return () => {
      isActive = false;
    };
  }, [shouldShowProgress, token]);

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
