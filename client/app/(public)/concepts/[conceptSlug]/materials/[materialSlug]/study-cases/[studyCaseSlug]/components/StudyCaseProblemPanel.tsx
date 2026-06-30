import { Lightbulb } from 'lucide-react';

import { Concept, Material, StudyCase } from '@/types';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { getStudyCaseHint } from '../utils/study-case-editor';

import { SampleTestCase } from '../utils/types';

type Props = {
  concept: Concept;
  material: Material;
  studyCase: StudyCase;
  isFetchingTests: boolean;
  sampleTestCase: SampleTestCase | null;
};

export default function StudyCaseProblemPanel({
  concept,
  material,
  studyCase,
  isFetchingTests,
  sampleTestCase,
}: Props) {
  return (
    <section className='flex h-fit min-w-0 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm'>
      <div className='flex flex-col gap-y-8 p-5 md:p-7'>
        <section className='flex flex-col gap-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>{concept.title}</Badge>

            <Badge variant='outline'>{material.title}</Badge>
          </div>

          <div className='flex flex-col gap-y-3'>
            <h1 className='text-2xl font-bold tracking-tight md:text-4xl'>
              {studyCase.title}
            </h1>

            <p className='text-sm leading-relaxed text-muted-foreground md:text-base'>
              {studyCase.description}
            </p>
          </div>
        </section>

        <section className='flex flex-col gap-y-3'>
          <h2 className='text-lg font-bold tracking-tight'>
            Function Description
          </h2>

          <div className='rounded-2xl border bg-muted/30 p-4'>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Complete the{' '}
              <code className='rounded bg-background px-1 py-0.5 font-mono text-foreground'>
                {studyCase.functionName || 'solution'}
              </code>{' '}
              function based on the task and sample case below.
            </p>

            {studyCase.parameterNames &&
              studyCase.parameterNames.length > 0 && (
                <div className='flex flex-col gap-y-2 pt-4'>
                  <p className='text-sm font-semibold'>Parameters</p>

                  <ul className='flex flex-col gap-y-1 text-sm text-muted-foreground'>
                    {studyCase.parameterNames.map((parameterName) => (
                      <li key={parameterName}>
                        <code className='rounded bg-background px-1 py-0.5 font-mono text-foreground'>
                          {parameterName}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>

        <Alert className='border-yellow-200 bg-yellow-50 text-yellow-950'>
          <Lightbulb className='size-4' />

          <AlertTitle>Hint</AlertTitle>

          <AlertDescription className='leading-relaxed'>
            {getStudyCaseHint(studyCase)}
          </AlertDescription>
        </Alert>

        <section className='flex flex-col gap-y-4'>
          <div className='flex flex-col gap-y-1'>
            <h2 className='text-lg font-bold tracking-tight'>Sample Case</h2>

            <p className='text-sm text-muted-foreground'>
              Use this example to understand the input and expected output.
            </p>
          </div>

          {isFetchingTests ? (
            <Skeleton className='h-40 w-full rounded-2xl' />
          ) : sampleTestCase ? (
            <div className='rounded-2xl border bg-muted/30 p-4'>
              <div className='flex flex-col gap-y-4'>
                <div className='flex flex-col gap-y-1'>
                  <p className='text-sm font-semibold'>
                    {sampleTestCase.description}
                  </p>

                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    This sample shows one possible input and the expected
                    result.
                  </p>
                </div>

                <div className='grid gap-3 text-sm'>
                  <div className='flex flex-col gap-y-1'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      Sample Input
                    </p>

                    <p className='rounded-xl bg-background p-3 font-medium'>
                      {sampleTestCase.input}
                    </p>
                  </div>

                  <div className='flex flex-col gap-y-1'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      Sample Output
                    </p>

                    <p className='rounded-xl bg-background p-3 font-medium'>
                      {sampleTestCase.expected}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed bg-muted/40 p-8 text-center'>
              <p className='text-sm font-medium'>No sample case yet</p>

              <p className='text-sm text-muted-foreground'>
                The first published test case will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
