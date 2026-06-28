'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import {
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Code2,
  Layers3,
  Play,
  Trophy,
} from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/auth.store';

import {
  Concept,
  ConceptProgress,
  Material,
  MaterialProgress,
  StudyCase,
  StudyCaseProgress,
} from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type LearningDashboard = {
  concepts: Concept[];
  materials: Material[];
  studyCases: StudyCase[];
  conceptProgresses: ConceptProgress[];
  materialProgresses: MaterialProgress[];
  studyCaseProgresses: StudyCaseProgress[];
};

type ContinueTarget = {
  concept: Concept;
  material: Material;
  studyCase: StudyCase;
  href: string;
};

type MaterialGroup = {
  material: Material;
  studyCases: StudyCase[];
  completedStudyCases: number;
  totalStudyCases: number;
  isCompleted: boolean;
};

type ConceptGroup = {
  concept: Concept;
  materials: MaterialGroup[];
  completedStudyCases: number;
  totalStudyCases: number;
  progress: number;
  isCompleted: boolean;
};

function buildStudyCaseHref(
  concept: Concept,
  material: Material,
  studyCase: StudyCase,
) {
  return `/concepts/${concept.slug}/materials/${material.slug}/study-cases/${studyCase.slug}`;
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

      <Skeleton className='h-64 rounded-3xl' />
      <Skeleton className='h-32 rounded-3xl' />
      <Skeleton className='h-96 rounded-3xl' />
    </div>
  );
}

export default function LearningClient() {
  const { user, hasHydrated } = useAuthStore();

  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const safeGet = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await api.get<{ data: T }>(url);

        return res.data.data ?? fallback;
      } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);

        return fallback;
      }
    };

    const fetchLearningDashboard = async () => {
      if (!hasHydrated || !user) {
        return;
      }

      const concepts = await safeGet<Concept[]>(
        '/concepts?sortBy=order&orderBy=asc&limit=100',
        [],
      );

      const materialsByConcept = await Promise.all(
        concepts.map((concept) =>
          safeGet<Material[]>(
            `/materials?conceptId=${concept.id}&sortBy=order&orderBy=asc&limit=100`,
            [],
          ),
        ),
      );

      const materials = materialsByConcept.flat();

      const studyCasesByMaterial = await Promise.all(
        materials.map((material) =>
          safeGet<StudyCase[]>(
            `/study-cases?materialId=${material.id}&isPublished=true&sortBy=order&orderBy=asc&limit=100`,
            [],
          ),
        ),
      );

      const studyCases = studyCasesByMaterial.flat();

      const [conceptProgresses, materialProgresses, studyCaseProgresses] =
        await Promise.all([
          safeGet<ConceptProgress[]>('/progress/concepts', []),
          safeGet<MaterialProgress[]>('/progress/materials', []),
          safeGet<StudyCaseProgress[]>('/progress/study-cases', []),
        ]);

      if (!isActive) {
        return;
      }

      setDashboard({
        concepts,
        materials,
        studyCases,
        conceptProgresses,
        materialProgresses,
        studyCaseProgresses,
      });

      setIsLoading(false);
    };

    fetchLearningDashboard();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, user]);

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
        const materialStudyCases = dashboard.studyCases.filter(
          (studyCase) => studyCase.materialId === material.id,
        );

        for (const studyCase of materialStudyCases) {
          if (!completedStudyCaseIds.has(studyCase.id)) {
            return {
              concept,
              material,
              studyCase,
              href: buildStudyCaseHref(concept, material, studyCase),
            };
          }
        }
      }
    }

    return null;
  }, [completedStudyCaseIds, dashboard]);

  if (!hasHydrated || isLoading) {
    return <MyLearningSkeleton />;
  }

  if (!user) {
    return (
      <div className='container mx-auto flex flex-col items-center gap-y-5 px-4 py-16 md:py-20 text-center'>
        <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <BookOpenCheck className='size-7' />
        </div>

        <div className='flex max-w-xl flex-col gap-y-3'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
            Sign in to view your learning progress.
          </h1>

          <p className='text-muted-foreground'>
            Your completed challenges and learning progress will appear here
            after you sign in.
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
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
            Continue learning JavaScript.
          </h1>

          <p className='text-base md:text-lg leading-relaxed text-muted-foreground'>
            Lanjutkan latihan dari study case berikutnya dan lihat progres
            belajar Anda berdasarkan konsep.
          </p>
        </div>
      </section>

      {totalStudyCases === 0 ? (
        <Card className='rounded-3xl border-dashed'>
          <CardContent className='flex flex-col items-center gap-y-4 p-6 md:p-8 text-center'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <Code2 className='size-7' />
            </div>

            <div className='flex max-w-xl flex-col gap-y-2'>
              <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
                No learning data found.
              </h2>

              <p className='text-muted-foreground'>
                Concepts, materials, or study cases could not be loaded. Check
                the API response in the browser console.
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
        <>
          <section className='grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-5'>
            <Card className='overflow-hidden rounded-3xl border-primary/20 bg-primary/5'>
              <CardContent className='flex flex-col gap-y-6 p-6 md:p-8'>
                <div className='flex flex-col gap-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge>Continue Learning</Badge>

                    {continueTarget && (
                      <Badge variant='outline'>
                        {continueTarget.concept.title}
                      </Badge>
                    )}
                  </div>

                  {continueTarget ? (
                    <div className='flex flex-col gap-y-3'>
                      <h2 className='text-2xl md:text-4xl font-bold tracking-tight'>
                        {continueTarget.studyCase.title}
                      </h2>

                      <p className='max-w-2xl leading-relaxed text-muted-foreground'>
                        Anda sedang berada di materi{' '}
                        <span className='font-medium text-foreground'>
                          {continueTarget.material.title}
                        </span>
                        . Lanjutkan study case berikutnya untuk meneruskan
                        progres belajar.
                      </p>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-y-3'>
                      <h2 className='text-2xl md:text-4xl font-bold tracking-tight'>
                        All challenges completed.
                      </h2>

                      <p className='max-w-2xl leading-relaxed text-muted-foreground'>
                        Semua study case yang tersedia sudah selesai. Anda bisa
                        membuka kembali konsep untuk melakukan review.
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex flex-wrap gap-3'>
                  {continueTarget ? (
                    <Button
                      asChild
                      className='gap-2'
                    >
                      <Link href={continueTarget.href}>
                        Continue Practice
                        <Play className='size-4' />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className='gap-2'
                    >
                      <Link href='/concepts'>
                        Review Concepts
                        <Layers3 className='size-4' />
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant='secondary'
                    asChild
                  >
                    <Link href='/concepts'>Browse Concepts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className='rounded-3xl'>
              <CardContent className='flex h-full flex-col justify-between gap-y-6 p-6 md:p-8'>
                <div className='flex flex-col gap-y-3'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <Trophy className='size-6' />
                  </div>

                  <div className='flex flex-col gap-y-1'>
                    <p className='text-sm text-muted-foreground'>
                      Overall Progress
                    </p>

                    <p className='text-4xl font-bold'>{overallProgress}%</p>
                  </div>
                </div>

                <div className='flex flex-col gap-y-3'>
                  <Progress value={overallProgress} />

                  <p className='text-sm text-muted-foreground'>
                    {completedStudyCases} of {totalStudyCases} study cases
                    completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='flex flex-col gap-y-5'>
            <div className='flex flex-col gap-y-2'>
              <h2 className='text-2xl font-bold tracking-tight'>
                Learning Path
              </h2>

              <p className='text-muted-foreground'>
                Ikuti urutan konsep, materi, dan study case di bawah ini.
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              {conceptGroups.map((conceptGroup) => (
                <Card
                  key={conceptGroup.concept.id}
                  className='overflow-hidden rounded-3xl'
                >
                  <CardHeader className='border-b p-5 md:p-6'>
                    <div className='flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between'>
                      <div className='flex items-start gap-4'>
                        <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                          {conceptGroup.isCompleted ? (
                            <CheckCircle2 className='size-6' />
                          ) : (
                            <Layers3 className='size-6' />
                          )}
                        </div>

                        <div className='flex flex-col gap-y-2'>
                          <div className='flex flex-wrap gap-2'>
                            <Badge
                              variant={
                                conceptGroup.isCompleted
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {conceptGroup.isCompleted
                                ? 'Completed'
                                : `Concept ${conceptGroup.concept.order}`}
                            </Badge>

                            <Badge variant='outline'>
                              {conceptGroup.completedStudyCases} /{' '}
                              {conceptGroup.totalStudyCases} completed
                            </Badge>
                          </div>

                          <div className='flex flex-col gap-y-1'>
                            <h3 className='text-xl md:text-2xl font-bold tracking-tight'>
                              {conceptGroup.concept.title}
                            </h3>

                            <p className='text-sm leading-relaxed text-muted-foreground'>
                              {conceptGroup.concept.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='flex min-w-40 flex-col gap-y-2'>
                        <div className='flex items-center justify-between gap-4 text-sm'>
                          <span className='text-muted-foreground'>
                            Progress
                          </span>

                          <span className='font-medium'>
                            {conceptGroup.progress}%
                          </span>
                        </div>

                        <Progress value={conceptGroup.progress} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='flex flex-col gap-y-4 p-5 md:p-6'>
                    {conceptGroup.materials.map((materialGroup) => (
                      <div
                        key={materialGroup.material.id}
                        className='rounded-2xl border bg-card p-4 md:p-5'
                      >
                        <div className='flex flex-col gap-y-4'>
                          <div className='flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
                                <BookOpenCheck className='size-5' />
                              </div>

                              <div className='flex flex-col'>
                                <p className='font-semibold'>
                                  {materialGroup.material.title}
                                </p>

                                <p className='text-sm text-muted-foreground'>
                                  {materialGroup.completedStudyCases} of{' '}
                                  {materialGroup.totalStudyCases} study cases
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant={
                                materialGroup.isCompleted
                                  ? 'default'
                                  : 'outline'
                              }
                              className='w-fit'
                            >
                              {materialGroup.isCompleted
                                ? 'Completed'
                                : 'In Progress'}
                            </Badge>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            {materialGroup.studyCases.map((studyCase) => {
                              const isCompleted = completedStudyCaseIds.has(
                                studyCase.id,
                              );

                              const href = buildStudyCaseHref(
                                conceptGroup.concept,
                                materialGroup.material,
                                studyCase,
                              );

                              return (
                                <Link
                                  key={studyCase.id}
                                  href={href}
                                  className='group rounded-2xl border p-4 transition-all hover:border-primary/50 hover:bg-primary/5'
                                >
                                  <div className='flex items-start justify-between gap-4'>
                                    <div className='flex items-start gap-3'>
                                      <div
                                        className={
                                          isCompleted
                                            ? 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground'
                                            : 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'
                                        }
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className='size-4' />
                                        ) : (
                                          <Circle className='size-4' />
                                        )}
                                      </div>

                                      <div className='flex flex-col gap-y-1'>
                                        <p className='font-medium transition-colors group-hover:text-primary'>
                                          {studyCase.title}
                                        </p>

                                        <p className='line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
                                          {studyCase.description}
                                        </p>
                                      </div>
                                    </div>

                                    <Badge
                                      variant={
                                        isCompleted ? 'default' : 'secondary'
                                      }
                                      className='shrink-0'
                                    >
                                      {isCompleted ? 'Done' : 'Start'}
                                    </Badge>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
