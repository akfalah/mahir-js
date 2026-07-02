import Link from 'next/link';

import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Code2,
  Layers3,
  Trophy,
} from 'lucide-react';

import { ContinueTarget } from '../utils/learning-types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Props = {
  continueTarget: ContinueTarget | null;
  conceptCount: number;
  materialCount: number;
  totalStudyCases: number;
  completedStudyCases: number;
  submissionCount: number;
  overallProgress: number;
};

export default function LearningOverview({
  continueTarget,
  conceptCount,
  materialCount,
  totalStudyCases,
  completedStudyCases,
  submissionCount,
  overallProgress,
}: Props) {
  return (
    <section className='flex flex-col gap-y-5'>
      <div className='grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]'>
        <Card className='overflow-hidden rounded-3xl border-primary/20 bg-primary/5'>
          <CardContent className='flex flex-col gap-y-7 p-6 md:p-8'>
            <div className='flex flex-wrap gap-2'>
              <Badge>Continue Learning</Badge>

              {continueTarget && (
                <Badge variant='outline'>{continueTarget.concept.title}</Badge>
              )}
            </div>

            {continueTarget ? (
              <div className='flex flex-col gap-y-4'>
                <div className='flex flex-col gap-y-3'>
                  <h2 className='text-3xl font-bold tracking-tight md:text-5xl'>
                    {continueTarget.material.title}
                  </h2>

                  <p className='max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
                    Continue from the material you have not completed yet. Read
                    the explanation, understand the examples, then move to the
                    coding challenge.
                  </p>
                </div>

                {continueTarget.nextStudyCase && (
                  <div className='rounded-2xl border bg-background/80 p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                        <Code2 className='size-5' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='text-sm font-semibold'>
                          Next coding challenge
                        </p>

                        <p className='text-sm text-muted-foreground'>
                          {continueTarget.nextStudyCase.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex flex-wrap gap-3'>
                  <Button
                    asChild
                    className='gap-2'
                  >
                    <Link href={continueTarget.href}>
                      Continue Learning
                      <ArrowRight className='size-4' />
                    </Link>
                  </Button>

                  <Button
                    variant='secondary'
                    asChild
                  >
                    <Link href='/concepts'>Browse Concepts</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-y-4'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-700'>
                  <CheckCircle2 className='size-7' />
                </div>

                <div className='flex flex-col gap-y-3'>
                  <h2 className='text-3xl font-bold tracking-tight md:text-5xl'>
                    All available materials are completed.
                  </h2>

                  <p className='max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
                    You have completed the current learning path. You can review
                    previous concepts or wait for new materials.
                  </p>
                </div>

                <Button
                  asChild
                  className='w-fit gap-2'
                >
                  <Link href='/concepts'>
                    Review Concepts
                    <Layers3 className='size-4' />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='rounded-3xl'>
          <CardContent className='flex h-full flex-col justify-between gap-y-6 p-6 md:p-8'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <Trophy className='size-6' />
              </div>

              <p className='text-4xl font-bold'>{overallProgress}%</p>
            </div>

            <div className='flex flex-col gap-y-3'>
              <div className='flex flex-col gap-y-1'>
                <p className='font-semibold'>Overall Progress</p>

                <p className='text-sm text-muted-foreground'>
                  {completedStudyCases} of {totalStudyCases} challenges
                  completed.
                </p>
              </div>

              <Progress value={overallProgress} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='rounded-3xl'>
        <CardContent className='grid gap-4 p-6 grid-cols-2 md:grid-cols-4'>
          <div className='rounded-2xl bg-muted/60 p-4'>
            <p className='text-2xl font-bold'>{conceptCount}</p>
            <p className='text-sm text-muted-foreground'>Concepts</p>
          </div>

          <div className='rounded-2xl bg-muted/60 p-4'>
            <p className='text-2xl font-bold'>{materialCount}</p>
            <p className='text-sm text-muted-foreground'>Materials</p>
          </div>

          <div className='rounded-2xl bg-muted/60 p-4'>
            <p className='text-2xl font-bold'>{totalStudyCases}</p>
            <p className='text-sm text-muted-foreground'>Challenges</p>
          </div>

          <div className='rounded-2xl bg-muted/60 p-4'>
            <p className='text-2xl font-bold'>{submissionCount}</p>
            <p className='text-sm text-muted-foreground'>Submissions</p>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-3xl border-dashed'>
        <CardContent className='flex items-start gap-4 p-6'>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <BookOpenCheck className='size-5' />
          </div>

          <div className='flex flex-col gap-y-1'>
            <p className='font-semibold'>Learning flow</p>

            <p className='text-sm leading-relaxed text-muted-foreground'>
              Read the material first, then solve the study case and use the
              automated feedback to improve your solution.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
