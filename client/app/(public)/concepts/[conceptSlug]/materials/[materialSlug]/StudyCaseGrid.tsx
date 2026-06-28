'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/auth.store';

import { Concept, Material, StudyCase, StudyCaseProgress } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

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

  const [studyCaseProgresses, setStudyCaseProgresses] = useState<
    StudyCaseProgress[]
  >([]);

  useEffect(() => {
    let isActive = true;

    const fetchStudyCaseProgresses = async () => {
      if (!hasHydrated || !user) {
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
  }, [hasHydrated, user]);

  const completedStudyCaseIds = useMemo(() => {
    return new Set(
      studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [studyCaseProgresses]);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {studyCases.map((studyCase, index) => {
        const isCompleted = completedStudyCaseIds.has(studyCase.id);

        return (
          <Card
            key={studyCase.id}
            className='group flex h-full flex-col shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
          >
            <CardContent className='flex flex-1 flex-col gap-y-4 p-4 md:p-5'>
              <div className='flex items-center justify-between gap-3'>
                <Badge
                  variant='outline'
                  className='rounded-full'
                >
                  Challenge {index + 1}
                </Badge>

                <Badge
                  variant={isCompleted ? 'default' : 'secondary'}
                  className='rounded-full'
                >
                  {isCompleted ? 'Passed' : 'Practice'}
                </Badge>
              </div>

              <div className='flex flex-col gap-y-2'>
                <h3 className='text-lg font-bold tracking-tight transition-colors group-hover:text-primary'>
                  {studyCase.title}
                </h3>

                <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
                  {studyCase.description}
                </p>
              </div>
            </CardContent>

            <CardFooter className='p-4 md:p-5'>
              <Button
                asChild
                variant={isCompleted ? 'secondary' : 'default'}
                className='w-full gap-2'
              >
                <Link
                  href={`/concepts/${concept.slug}/materials/${material.slug}/study-cases/${studyCase.slug}`}
                >
                  {isCompleted ? 'Review Solution' : 'Start Practice'}
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
