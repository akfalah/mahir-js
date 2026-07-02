import Link from 'next/link';

import {
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Layers3,
} from 'lucide-react';

import { ConceptGroup } from '../utils/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Props = {
  conceptGroups: ConceptGroup[];
};

function getMaterialProgress(completed: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export default function LearningPath({ conceptGroups }: Props) {
  return (
    <section className='flex flex-col gap-y-5'>
      <div className='flex flex-col gap-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Learning Path</h2>

        <p className='text-muted-foreground'>
          Follow the concepts, read the materials, and complete the coding
          challenges in order.
        </p>
      </div>

      <div className='flex flex-col gap-y-5'>
        {conceptGroups.map((conceptGroup) => (
          <Card
            key={conceptGroup.concept.id}
            className='overflow-hidden rounded-3xl'
          >
            <CardHeader className='border-b bg-muted/30 p-5 md:p-6'>
              <div className='flex flex-col gap-y-5 lg:flex-row lg:items-center lg:justify-between'>
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
                          conceptGroup.isCompleted ? 'default' : 'secondary'
                        }
                      >
                        {conceptGroup.isCompleted
                          ? 'Completed'
                          : `Concept ${conceptGroup.concept.order}`}
                      </Badge>

                      <Badge variant='outline'>
                        {conceptGroup.completedStudyCases} of{' '}
                        {conceptGroup.totalStudyCases} challenges completed
                      </Badge>
                    </div>

                    <div className='flex flex-col gap-y-1'>
                      <h3 className='text-xl font-bold tracking-tight md:text-2xl'>
                        {conceptGroup.concept.title}
                      </h3>

                      <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                        {conceptGroup.concept.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex w-full flex-col gap-y-2 lg:w-56'>
                  <div className='flex items-center justify-between gap-4 text-sm'>
                    <span className='text-muted-foreground'>Progress</span>

                    <span className='font-semibold'>
                      {conceptGroup.progress}%
                    </span>
                  </div>

                  <Progress value={conceptGroup.progress} />
                </div>
              </div>
            </CardHeader>

            <CardContent className='flex flex-col gap-y-3 p-5 md:p-6'>
              {conceptGroup.materials.length > 0 ? (
                conceptGroup.materials.map((materialGroup) => {
                  const materialProgress = getMaterialProgress(
                    materialGroup.completedStudyCases,
                    materialGroup.totalStudyCases,
                  );

                  return (
                    <div
                      key={materialGroup.material.id}
                      className='rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/30 md:p-5'
                    >
                      <div className='flex flex-col gap-y-4 lg:flex-row lg:items-center lg:justify-between'>
                        <div className='flex items-start gap-4'>
                          <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                            <BookOpenCheck className='size-5' />
                          </div>

                          <div className='flex flex-col gap-y-2'>
                            <div className='flex flex-wrap gap-2'>
                              <Badge
                                variant={
                                  materialGroup.isCompleted
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                {materialGroup.isCompleted
                                  ? 'Completed'
                                  : 'In Progress'}
                              </Badge>

                              <Badge variant='secondary'>
                                {materialGroup.totalStudyCases} challenge
                                {materialGroup.totalStudyCases === 1 ? '' : 's'}
                              </Badge>
                            </div>

                            <div className='flex flex-col gap-y-1'>
                              <p className='font-semibold'>
                                {materialGroup.material.title}
                              </p>

                              <p className='text-sm text-muted-foreground'>
                                {materialGroup.completedStudyCases} of{' '}
                                {materialGroup.totalStudyCases} challenges
                                completed.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col gap-y-3 lg:w-64'>
                          <Progress value={materialProgress} />

                          <Button
                            asChild
                            size='sm'
                            variant={
                              materialGroup.isCompleted
                                ? 'secondary'
                                : 'default'
                            }
                            className='w-fit gap-2 lg:self-end'
                          >
                            <Link href={materialGroup.href}>
                              {materialGroup.isCompleted
                                ? 'Review Material'
                                : 'Open Material'}
                              <ChevronRight className='size-4' />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='rounded-2xl border border-dashed p-6 text-center'>
                  <p className='font-semibold'>No materials available.</p>

                  <p className='pt-1 text-sm text-muted-foreground'>
                    Published materials for this concept will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
