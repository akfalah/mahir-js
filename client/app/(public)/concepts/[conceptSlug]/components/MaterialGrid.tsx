'use client';

import { useEffect, useMemo, useState } from 'react';

import { BookOpen } from 'lucide-react';

import {
  fetchPublishedStudyCases,
  fetchStudyCaseProgresses,
} from '@/lib/fetch';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material, StudyCase, StudyCaseProgress } from '@/types';

import PublicLearningCard from '@/components/shared/PublicLearningCard';

type Props = {
  concept: Concept;
  materials: Material[];
};

type MaterialProgressSummary = {
  completed: number;
  total: number;
  value: number;
};

export default function MaterialGrid({ concept, materials }: Props) {
  const { user, token, hasHydrated } = useAuthStore();

  const shouldShowProgress = hasHydrated && user?.role === 'STUDENT';

  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);
  const [studyCaseProgresses, setStudyCaseProgresses] = useState<
    StudyCaseProgress[]
  >([]);

  useEffect(() => {
    let isActive = true;

    const fetchProgressData = async () => {
      if (!shouldShowProgress) {
        setStudyCases([]);
        setStudyCaseProgresses([]);
        return;
      }

      try {
        const [studyCaseResponses, studyCaseProgressesRes] = await Promise.all([
          Promise.all(
            materials.map((material) =>
              fetchPublishedStudyCases(token, {
                materialId: material.id,
              }),
            ),
          ),
          fetchStudyCaseProgresses(token),
        ]);

        if (!isActive) {
          return;
        }

        setStudyCases(studyCaseResponses.flatMap((res) => res.data));
        setStudyCaseProgresses(studyCaseProgressesRes.data);
      } catch (error) {
        console.error('Failed to fetch material progress data:', error);

        if (!isActive) {
          return;
        }

        setStudyCases([]);
        setStudyCaseProgresses([]);
      }
    };

    fetchProgressData();

    return () => {
      isActive = false;
    };
  }, [materials, shouldShowProgress, token]);

  const materialIds = useMemo(() => {
    return new Set(materials.map((material) => material.id));
  }, [materials]);

  const filteredStudyCases = useMemo(() => {
    return studyCases.filter((studyCase) =>
      materialIds.has(studyCase.materialId),
    );
  }, [materialIds, studyCases]);

  const completedStudyCaseIds = useMemo(() => {
    return new Set(
      studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [studyCaseProgresses]);

  const materialProgressMap = useMemo(() => {
    return new Map<number, MaterialProgressSummary>(
      materials.map((material) => {
        const materialStudyCases = filteredStudyCases.filter(
          (studyCase) => studyCase.materialId === material.id,
        );

        const completed = materialStudyCases.filter((studyCase) =>
          completedStudyCaseIds.has(studyCase.id),
        ).length;

        const total = materialStudyCases.length;
        const value = total > 0 ? Math.round((completed / total) * 100) : 0;

        return [
          material.id,
          {
            completed,
            total,
            value,
          },
        ];
      }),
    );
  }, [completedStudyCaseIds, filteredStudyCases, materials]);

  return (
    <section className='grid items-stretch gap-5 md:grid-cols-2'>
      {materials.map((material) => {
        const progress = materialProgressMap.get(material.id) ?? {
          completed: 0,
          total: 0,
          value: 0,
        };

        const isCompleted =
          shouldShowProgress &&
          progress.total > 0 &&
          progress.completed === progress.total;

        return (
          <PublicLearningCard
            key={material.id}
            title={material.title}
            description={material.description}
            href={`/concepts/${concept.slug}/materials/${material.slug}`}
            actionLabel={isCompleted ? 'Review Material' : 'Read Material'}
            actionVariant={isCompleted ? 'secondary' : 'default'}
            primaryBadge={{
              label: isCompleted ? 'Completed' : `Part ${material.order}`,
              variant: isCompleted ? 'default' : 'outline',
            }}
            icon={<BookOpen className='size-5' />}
            progress={
              shouldShowProgress
                ? {
                    completed: progress.completed,
                    total: progress.total,
                    value: progress.value,
                    label: 'completed',
                  }
                : undefined
            }
          />
        );
      })}
    </section>
  );
}
