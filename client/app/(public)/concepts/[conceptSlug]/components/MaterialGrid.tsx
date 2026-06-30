'use client';

import { useEffect, useMemo, useState } from 'react';

import { BookOpen } from 'lucide-react';

import api from '@/lib/api';

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
  const { user, hasHydrated } = useAuthStore();

  const userRole = user?.role;
  const shouldShowProgress = hasHydrated && userRole === 'STUDENT';

  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);
  const [studyCaseProgresses, setStudyCaseProgresses] = useState<
    StudyCaseProgress[]
  >([]);

  useEffect(() => {
    let isActive = true;

    const safeGet = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await api.get<{ data: T }>(url);

        return res.data.data ?? fallback;
      } catch {
        return fallback;
      }
    };

    const fetchProgressData = async () => {
      if (!hasHydrated || userRole !== 'STUDENT') {
        return;
      }

      const studyCasesByMaterial = await Promise.all(
        materials.map((material) =>
          safeGet<StudyCase[]>(
            `/study-cases?materialId=${material.id}&isPublished=true&sortBy=order&orderBy=asc&limit=100`,
            [],
          ),
        ),
      );

      const nextStudyCases = studyCasesByMaterial.flat();

      const nextStudyCaseProgresses = await safeGet<StudyCaseProgress[]>(
        '/progress/study-cases',
        [],
      );

      if (!isActive) {
        return;
      }

      setStudyCases(nextStudyCases);
      setStudyCaseProgresses(nextStudyCaseProgresses);
    };

    fetchProgressData();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, materials, userRole]);

  const completedStudyCaseIds = useMemo(() => {
    return new Set(
      studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [studyCaseProgresses]);

  const getMaterialProgress = (material: Material): MaterialProgressSummary => {
    const materialStudyCases = studyCases.filter(
      (studyCase) => studyCase.materialId === material.id,
    );

    const completed = materialStudyCases.filter((studyCase) =>
      completedStudyCaseIds.has(studyCase.id),
    ).length;

    const total = materialStudyCases.length;

    const value = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      value,
    };
  };

  return (
    <section className='grid items-stretch gap-5 md:grid-cols-2'>
      {materials.map((material) => {
        const progress = getMaterialProgress(material);

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
