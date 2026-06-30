'use client';

import { useEffect, useMemo, useState } from 'react';

import { Layers3 } from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material, MaterialProgress } from '@/types';

import PublicLearningCard from '@/components/shared/PublicLearningCard';

type Props = {
  concepts: Concept[];
};

type ConceptProgressSummary = {
  completed: number;
  total: number;
  value: number;
};

export default function ConceptGrid({ concepts }: Props) {
  const { user, hasHydrated } = useAuthStore();

  const userRole = user?.role;
  const shouldShowProgress = hasHydrated && userRole === 'STUDENT';

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialProgresses, setMaterialProgresses] = useState<
    MaterialProgress[]
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

      const materialsByConcept = await Promise.all(
        concepts.map((concept) =>
          safeGet<Material[]>(
            `/materials?conceptId=${concept.id}&sortBy=order&orderBy=asc&limit=100`,
            [],
          ),
        ),
      );

      const nextMaterials = materialsByConcept.flat();

      const nextMaterialProgresses = await safeGet<MaterialProgress[]>(
        '/progress/materials',
        [],
      );

      if (!isActive) {
        return;
      }

      setMaterials(nextMaterials);
      setMaterialProgresses(nextMaterialProgresses);
    };

    fetchProgressData();

    return () => {
      isActive = false;
    };
  }, [concepts, hasHydrated, userRole]);

  const completedMaterialIds = useMemo(() => {
    return new Set(
      materialProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.materialId),
    );
  }, [materialProgresses]);

  const getConceptProgress = (concept: Concept): ConceptProgressSummary => {
    const conceptMaterials = materials.filter(
      (material) => material.conceptId === concept.id,
    );

    const completed = conceptMaterials.filter((material) =>
      completedMaterialIds.has(material.id),
    ).length;

    const total = conceptMaterials.length;

    const value = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      value,
    };
  };

  return (
    <section className='grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3'>
      {concepts.map((concept) => {
        const progress = getConceptProgress(concept);

        const isCompleted =
          shouldShowProgress &&
          progress.total > 0 &&
          progress.completed === progress.total;

        return (
          <PublicLearningCard
            key={concept.id}
            title={concept.title}
            description={concept.description}
            href={`/concepts/${concept.slug}`}
            actionLabel={isCompleted ? 'Review Concept' : 'Explore Concept'}
            actionVariant={isCompleted ? 'secondary' : 'default'}
            primaryBadge={{
              label: isCompleted ? 'Completed' : `Concept ${concept.order}`,
              variant: isCompleted ? 'default' : 'outline',
            }}
            icon={<Layers3 className='size-5' />}
            progress={
              shouldShowProgress
                ? {
                    completed: progress.completed,
                    total: progress.total,
                    value: progress.value,
                    label: 'materials completed',
                  }
                : undefined
            }
          />
        );
      })}
    </section>
  );
}
