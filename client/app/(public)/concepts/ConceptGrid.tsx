'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { ArrowRight, Layers3 } from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material, MaterialProgress } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialProgresses, setMaterialProgresses] = useState<
    MaterialProgress[]
  >([]);

  const shouldShowProgress = hasHydrated && user?.role === 'STUDENT';

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
      if (!hasHydrated) {
        return;
      }

      if (user?.role !== 'STUDENT') {
        setMaterials([]);
        setMaterialProgresses([]);
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
  }, [concepts, hasHydrated, user?.role]);

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
          <Card
            key={concept.id}
            className='group flex h-full flex-col shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
          >
            <CardContent className='flex flex-1 flex-col gap-y-5 p-4 md:p-5'>
              <div className='flex items-center justify-between gap-4'>
                <Badge
                  variant={isCompleted ? 'default' : 'outline'}
                  className='rounded-full'
                >
                  {isCompleted ? 'Completed' : `Concept ${concept.order}`}
                </Badge>

                <div className='flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                  <Layers3 className='size-5' />
                </div>
              </div>

              <div className='flex flex-col gap-y-2'>
                <h2 className='text-lg font-bold tracking-tight transition-colors group-hover:text-primary'>
                  {concept.title}
                </h2>

                <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
                  {concept.description}
                </p>
              </div>

              {shouldShowProgress && (
                <div className='flex flex-col gap-y-2 rounded-2xl bg-muted/40 p-3'>
                  <div className='flex items-center justify-between gap-4 text-xs'>
                    <span className='text-muted-foreground'>
                      {progress.completed} of {progress.total} materials
                      completed
                    </span>

                    <span className='font-medium'>{progress.value}%</span>
                  </div>

                  <Progress value={progress.value} />
                </div>
              )}
            </CardContent>

            <CardFooter className='p-4 md:p-5'>
              <Button
                asChild
                variant={isCompleted ? 'secondary' : 'default'}
                className='w-full gap-2'
              >
                <Link href={`/concepts/${concept.slug}`}>
                  {isCompleted ? 'Review Concept' : 'Explore Concept'}
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </section>
  );
}
