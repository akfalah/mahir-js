'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { BookOpenCheck, Code2 } from 'lucide-react';

import {
  fetchConceptProgresses,
  fetchMaterialProgresses,
  fetchPublishedConcepts,
  fetchPublishedMaterials,
  fetchPublishedStudyCases,
  fetchStudyCaseProgresses,
  fetchSubmissions,
} from '@/lib/fetch';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material } from '@/types';

import {
  ConceptGroup,
  ContinueTarget,
  LearningDashboard,
} from '../utils/types';

import LearningOverview from './LearningOverview';
import LearningPath from './LearningPath';
import LearningSubmissions from './LearningSubmissions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function buildMaterialHref(concept: Concept, material: Material) {
  return `/concepts/${concept.slug}/materials/${material.slug}`;
}

function MyLearningSkeleton() {
  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <section className='flex max-w-3xl flex-col gap-y-4'>
        <Skeleton className='h-7 w-32 rounded-full' />

        <div className='flex flex-col gap-y-3'>
          <Skeleton className='h-12 w-full max-w-xl' />
          <Skeleton className='h-6 w-full max-w-2xl' />
        </div>
      </section>

      <Skeleton className='h-12 w-full max-w-xl rounded-2xl' />
      <Skeleton className='h-80 rounded-3xl' />
    </div>
  );
}

export default function LearningClient() {
  const { user, token, hasHydrated } = useAuthStore();

  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchLearningDashboard = async () => {
      if (!hasHydrated) {
        return;
      }

      if (!user) {
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const conceptsRes = await fetchPublishedConcepts(token);

        const concepts = conceptsRes.data;

        const materialsResponses = await Promise.all(
          concepts.map((concept) =>
            fetchPublishedMaterials(token, {
              conceptId: concept.id,
            }),
          ),
        );

        const materials = materialsResponses.flatMap((res) => res.data);

        const studyCaseResponses = await Promise.all(
          materials.map((material) =>
            fetchPublishedStudyCases(token, {
              materialId: material.id,
            }),
          ),
        );

        const studyCases = studyCaseResponses.flatMap((res) => res.data);

        const [
          conceptProgressesRes,
          materialProgressesRes,
          studyCaseProgressesRes,
          submissionsRes,
        ] = await Promise.all([
          fetchConceptProgresses(token),
          fetchMaterialProgresses(token),
          fetchStudyCaseProgresses(token),
          fetchSubmissions(token),
        ]);

        if (!isActive) {
          return;
        }

        setDashboard({
          concepts,
          materials,
          studyCases,
          conceptProgresses: conceptProgressesRes.data,
          materialProgresses: materialProgressesRes.data,
          studyCaseProgresses: studyCaseProgressesRes.data,
          submissions: submissionsRes.data,
        });
      } catch (error) {
        console.error('Failed to fetch learning dashboard:', error);

        if (!isActive) {
          return;
        }

        setDashboard({
          concepts: [],
          materials: [],
          studyCases: [],
          conceptProgresses: [],
          materialProgresses: [],
          studyCaseProgresses: [],
          submissions: [],
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchLearningDashboard();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, token, user]);

  const completedStudyCaseIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [dashboard]);

  const completedConceptIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.conceptProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.conceptId),
    );
  }, [dashboard]);

  const completedMaterialIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.materialProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.materialId),
    );
  }, [dashboard]);

  const conceptGroups = useMemo<ConceptGroup[]>(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.concepts.map((concept) => {
      const conceptMaterials = dashboard.materials.filter(
        (material) => material.conceptId === concept.id,
      );

      const materials = conceptMaterials.map((material) => {
        const materialStudyCases = dashboard.studyCases.filter(
          (studyCase) => studyCase.materialId === material.id,
        );

        const completedStudyCases = materialStudyCases.filter((studyCase) =>
          completedStudyCaseIds.has(studyCase.id),
        ).length;

        return {
          material,
          studyCases: materialStudyCases,
          completedStudyCases,
          totalStudyCases: materialStudyCases.length,
          isCompleted: completedMaterialIds.has(material.id),
          href: buildMaterialHref(concept, material),
        };
      });

      const totalStudyCases = materials.reduce(
        (total, item) => total + item.totalStudyCases,
        0,
      );

      const completedStudyCases = materials.reduce(
        (total, item) => total + item.completedStudyCases,
        0,
      );

      const progress =
        totalStudyCases > 0
          ? Math.round((completedStudyCases / totalStudyCases) * 100)
          : 0;

      return {
        concept,
        materials,
        completedStudyCases,
        totalStudyCases,
        progress,
        isCompleted: completedConceptIds.has(concept.id),
      };
    });
  }, [
    completedConceptIds,
    completedMaterialIds,
    completedStudyCaseIds,
    dashboard,
  ]);

  const continueTarget = useMemo<ContinueTarget | null>(() => {
    if (!dashboard) {
      return null;
    }

    for (const concept of dashboard.concepts) {
      const conceptMaterials = dashboard.materials.filter(
        (material) => material.conceptId === concept.id,
      );

      for (const material of conceptMaterials) {
        if (!completedMaterialIds.has(material.id)) {
          const materialStudyCases = dashboard.studyCases.filter(
            (studyCase) => studyCase.materialId === material.id,
          );

          const nextStudyCase =
            materialStudyCases.find(
              (studyCase) => !completedStudyCaseIds.has(studyCase.id),
            ) ?? null;

          return {
            concept,
            material,
            nextStudyCase,
            href: buildMaterialHref(concept, material),
          };
        }
      }
    }

    return null;
  }, [completedMaterialIds, completedStudyCaseIds, dashboard]);

  if (!hasHydrated || isLoading) {
    return <MyLearningSkeleton />;
  }

  if (!user) {
    return (
      <div className='container mx-auto flex flex-col items-center gap-y-5 px-4 py-16 text-center md:py-20'>
        <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <BookOpenCheck className='size-7' />
        </div>

        <div className='flex max-w-xl flex-col gap-y-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
            Sign in to view your learning progress.
          </h1>

          <p className='text-muted-foreground'>
            Your completed challenges, submissions, and learning progress will
            appear here after you sign in.
          </p>
        </div>

        <Button asChild>
          <Link href='/sign-in'>Sign In</Link>
        </Button>
      </div>
    );
  }

  const totalStudyCases = dashboard?.studyCases.length ?? 0;
  const completedStudyCases = completedStudyCaseIds.size;
  const submissions = dashboard?.submissions ?? [];
  const concepts = dashboard?.concepts ?? [];
  const materials = dashboard?.materials ?? [];

  const overallProgress =
    totalStudyCases > 0
      ? Math.round((completedStudyCases / totalStudyCases) * 100)
      : 0;

  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <section className='flex max-w-3xl flex-col gap-y-4'>
        <Badge
          variant='secondary'
          className='w-fit rounded-full px-3 py-1'
        >
          My Learning
        </Badge>

        <div className='flex flex-col gap-y-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
            Continue learning JavaScript.
          </h1>

          <p className='text-base leading-relaxed text-muted-foreground md:text-lg'>
            Track your materials, coding challenges, submissions, and automated
            grading progress in one place.
          </p>
        </div>
      </section>

      {totalStudyCases === 0 ? (
        <Card className='rounded-3xl border-dashed'>
          <CardContent className='flex flex-col items-center gap-y-4 p-6 text-center md:p-8'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <Code2 className='size-7' />
            </div>

            <div className='flex max-w-xl flex-col gap-y-2'>
              <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
                No learning data found.
              </h2>

              <p className='text-muted-foreground'>
                Published concepts, materials, or coding challenges could not be
                loaded.
              </p>
            </div>

            <Button
              variant='secondary'
              asChild
            >
              <Link href='/concepts'>Open Concepts</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          defaultValue='overview'
          className='flex flex-col gap-y-6'
        >
          <TabsList className='grid h-auto w-full grid-cols-3 rounded-2xl p-1'>
            <TabsTrigger
              value='overview'
              className='rounded-xl px-5 text-xs md:text-sm'
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value='path'
              className='rounded-xl px-5 text-xs md:text-sm'
            >
              Learning Path
            </TabsTrigger>

            <TabsTrigger
              value='submissions'
              className='rounded-xl px-5 text-xs md:text-sm'
            >
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='flex flex-col gap-y-5'
          >
            <LearningOverview
              continueTarget={continueTarget}
              conceptCount={concepts.length}
              materialCount={materials.length}
              totalStudyCases={totalStudyCases}
              completedStudyCases={completedStudyCases}
              submissionCount={submissions.length}
              overallProgress={overallProgress}
            />
          </TabsContent>

          <TabsContent
            value='path'
            className='flex flex-col gap-y-5'
          >
            <LearningPath conceptGroups={conceptGroups} />
          </TabsContent>

          <TabsContent
            value='submissions'
            className='flex flex-col gap-y-5'
          >
            <LearningSubmissions submissions={submissions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
