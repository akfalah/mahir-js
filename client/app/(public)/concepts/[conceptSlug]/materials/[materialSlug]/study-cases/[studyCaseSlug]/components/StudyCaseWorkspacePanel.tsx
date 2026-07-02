import Editor from '@monaco-editor/react';

import { LockKeyhole, RotateCcw, Send, TestTube2 } from 'lucide-react';

import { Concept, Material, StudyCase } from '@/types';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import PublicPrevNextNavigation from '@/components/shared/PublicPrevNextNavigation';

import { DisplayedTestCase, FeedbackContent } from '../utils/types';
import TestCaseFeedbackCard from './TestCardFeedBack';

type Props = {
  concept: Concept;
  material: Material;
  prevStudyCase: StudyCase | null;
  nextStudyCase: StudyCase | null;
  code: string;
  allPassed: boolean;
  hasResults: boolean;
  hasHydrated: boolean;
  canInteract: boolean;
  isTesting: boolean;
  isSubmitting: boolean;
  isProcessingResult: boolean;
  passedCount: number;
  failedCount: number;
  errorCount: number;
  totalTests: number;
  progress: number;
  feedbackContent: FeedbackContent;
  displayedTestCases: DisplayedTestCase[];
  onCodeChange: (value: string) => void;
  onReset: () => void;
  onRunTest: () => void;
  onSubmit: () => void;
};

export default function StudyCaseWorkspacePanel({
  concept,
  material,
  prevStudyCase,
  nextStudyCase,
  code,
  allPassed,
  hasResults,
  hasHydrated,
  canInteract,
  isTesting,
  isSubmitting,
  isProcessingResult,
  passedCount,
  failedCount,
  errorCount,
  totalTests,
  progress,
  feedbackContent,
  displayedTestCases,
  onCodeChange,
  onReset,
  onRunTest,
  onSubmit,
}: Props) {
  const FeedbackIcon = feedbackContent?.icon;

  return (
    <section className='flex min-w-0 flex-col rounded-3xl border bg-card shadow-sm'>
      <Card className='flex flex-col overflow-hidden rounded-3xl border-0 shadow-none'>
        <CardHeader className='flex items-center justify-end gap-4 border-b p-4 md:p-5'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline'>JavaScript</Badge>

            <Badge variant={allPassed ? 'default' : 'secondary'}>
              {hasResults
                ? `${passedCount}/${totalTests} passed`
                : 'Not tested'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='flex min-h-0 flex-1 flex-col p-0'>
          <div className='shrink-0 border-b'>
            <Editor
              height='430px'
              language='javascript'
              theme='light'
              value={code}
              onChange={(value) => onCodeChange(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                padding: {
                  top: 18,
                  bottom: 18,
                },
              }}
            />
          </div>

          <section className='flex flex-col gap-y-4 p-4 md:p-5'>
            <div className='flex w-full flex-col gap-y-2'>
              <div className='flex items-center justify-between gap-4 text-sm'>
                <span className='font-medium'>Test progress</span>

                <span className='text-muted-foreground'>
                  {passedCount} of {totalTests} passed
                </span>
              </div>

              <Progress value={progress} />

              {hasResults && (
                <div className='flex flex-wrap gap-2 text-xs'>
                  <Badge variant='secondary'>{passedCount} passed</Badge>

                  {failedCount > 0 && (
                    <Badge variant='outline'>{failedCount} need fix</Badge>
                  )}

                  {errorCount > 0 && (
                    <Badge variant='outline'>{errorCount} error</Badge>
                  )}
                </div>
              )}
            </div>

            {feedbackContent && FeedbackIcon && (
              <Alert className={feedbackContent.className}>
                <FeedbackIcon className='size-4' />

                <AlertTitle>{feedbackContent.title}</AlertTitle>

                <AlertDescription>
                  {feedbackContent.description}
                </AlertDescription>
              </Alert>
            )}

            {!canInteract && hasHydrated && (
              <Alert>
                <LockKeyhole className='size-4' />

                <AlertTitle>Student access required</AlertTitle>

                <AlertDescription>
                  You can read this study case, but you need to sign in as a
                  student to run tests and submit your answer.
                </AlertDescription>
              </Alert>
            )}

            <div className='grid w-full gap-3 sm:grid-cols-3'>
              <Button
                type='button'
                variant='outline'
                onClick={onReset}
                disabled={isTesting || isSubmitting}
                className='gap-2'
              >
                <RotateCcw className='size-4' />
                Reset Code
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={onRunTest}
                disabled={!canInteract || isTesting || isSubmitting}
                className='gap-2'
              >
                {isTesting ? (
                  <Spinner className='size-4' />
                ) : (
                  <TestTube2 className='size-4' />
                )}
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>

              <Button
                type='button'
                onClick={onSubmit}
                disabled={!canInteract || isTesting || isSubmitting}
                className='gap-2'
              >
                {isSubmitting ? (
                  <Spinner className='size-4' />
                ) : (
                  <Send className='size-4' />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </section>

          <Separator />

          <section className='flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto p-4 md:p-5'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex flex-col gap-y-1'>
                <h2 className='text-base font-bold tracking-tight'>
                  Test Results
                </h2>

                <p className='text-sm text-muted-foreground'>
                  Run the test to see all checkpoint results.
                </p>
              </div>

              <Badge variant={allPassed ? 'default' : 'secondary'}>
                {hasResults
                  ? `${passedCount}/${totalTests} passed`
                  : 'Not tested'}
              </Badge>
            </div>

            {isProcessingResult ? (
              <div className='flex flex-col gap-y-3'>
                <Skeleton className='h-32 w-full rounded-2xl' />
                <Skeleton className='h-32 w-full rounded-2xl' />
                <Skeleton className='h-32 w-full rounded-2xl' />
              </div>
            ) : hasResults && displayedTestCases.length > 0 ? (
              <div className='flex flex-col gap-y-3'>
                {displayedTestCases.map((testCase, index) => (
                  <TestCaseFeedbackCard
                    key={testCase.id}
                    testCase={testCase}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className='flex flex-1 items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center'>
                <div className='flex max-w-sm flex-col items-center gap-y-3'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground'>
                    <TestTube2 className='size-6' />
                  </div>

                  <div className='flex flex-col gap-y-1'>
                    <p className='text-sm font-semibold'>No test result yet</p>

                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      Read the problem and sample case first. Then write your
                      solution and click Run Test to see all checkpoint results.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </CardContent>

        <CardFooter className='flex flex-col bg-background p-4 md:p-5'>
          <PublicPrevNextNavigation
            previous={
              prevStudyCase
                ? {
                    href: `/concepts/${concept.slug}/materials/${material.slug}/study-cases/${prevStudyCase.slug}`,
                    label: 'Previous',
                  }
                : null
            }
            next={
              nextStudyCase
                ? {
                    href: `/concepts/${concept.slug}/materials/${material.slug}/study-cases/${nextStudyCase.slug}`,
                    label: 'Next',
                  }
                : null
            }
            backHref={`/concepts/${concept.slug}/materials/${material.slug}`}
            backLabel={`Back to ${material.title}`}
          />
        </CardFooter>
      </Card>
    </section>
  );
}
