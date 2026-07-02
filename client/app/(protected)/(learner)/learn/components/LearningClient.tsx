'use client';

import { useState } from 'react';
import Link from 'next/link';

import { BookOpenCheck, Code2 } from 'lucide-react';

import { useLearningDashboard } from '../utils/use-learning-dashboard';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import LearningOverview from './LearningOverview';
import LearningPath from './LearningPath';
import LearningSubmissions from './LearningSubmissions';

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

      <Skeleton className='h-8 w-full rounded-2xl' />
      <Skeleton className='h-80 rounded-3xl' />
    </div>
  );
}

export default function LearningClient() {
  const {
    user,
    hasHydrated,
    isLoading,
    conceptGroups,
    continueTarget,
    totalStudyCases,
    completedStudyCases,
    overallProgress,
    submissions,
    submissionsPagination,
    concepts,
    materials,
    setSubmissionPage,
    setSubmissionLimit,
  } = useLearningDashboard();

  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmissionPageChange = (page: number) => {
    setActiveTab('submissions');
    setSubmissionPage(page);
  };

  const handleSubmissionPageSizeChange = (limit: number) => {
    setActiveTab('submissions');
    setSubmissionLimit(limit);
  };

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

  if (user.role !== 'STUDENT') {
    return (
      <div className='container mx-auto flex flex-col items-center gap-y-5 px-4 py-16 text-center md:py-20'>
        <div className='flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
          <BookOpenCheck className='size-7' />
        </div>

        <div className='flex max-w-xl flex-col gap-y-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
            Student access required.
          </h1>

          <p className='text-muted-foreground'>
            This page is designed for student learning progress. Please use a
            student account to view this dashboard.
          </p>
        </div>

        <Button
          variant='secondary'
          asChild
        >
          <Link href='/concepts'>Browse Concepts</Link>
        </Button>
      </div>
    );
  }

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
          value={activeTab}
          onValueChange={setActiveTab}
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
              <span className='sm:hidden'>Path</span>
              <span className='hidden sm:inline'>Learning Path</span>
            </TabsTrigger>

            <TabsTrigger
              value='submissions'
              className='rounded-xl px-5 text-xs md:text-sm'
            >
              <span className='sm:hidden'>Subs</span>
              <span className='hidden sm:inline'>Submissions</span>
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
              submissionCount={submissionsPagination.total}
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
            <LearningSubmissions
              submissions={submissions}
              pagination={submissionsPagination}
              onPageChange={handleSubmissionPageChange}
              onPageSizeChange={handleSubmissionPageSizeChange}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
