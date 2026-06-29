'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code2,
  Lightbulb,
  RotateCcw,
  Send,
  TestTube2,
  XCircle,
} from 'lucide-react';

import {
  ApiResponse,
  Concept,
  Material,
  StudyCase,
  Submission,
  SubmissionDetail,
  TestCase,
  TestResult,
  TestResultStatus,
} from '@/types';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type DisplayedTestStatus = TestResultStatus | 'PENDING';

type DisplayedTestCase = {
  id: number;
  description: string;
  status: DisplayedTestStatus;
  expected: string;
  received?: string | null;
  failureMessage?: string | null;
};

type Props = {
  concept: Concept;
  material: Material;
  studyCase: StudyCase;
  prevStudyCase: StudyCase | null;
  nextStudyCase: StudyCase | null;
};

function stringifyValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getStudyCaseHint(studyCase: StudyCase) {
  if (studyCase.hint) {
    return studyCase.hint;
  }

  return 'Start with the simplest solution. Run the test first, read the result, then improve your code step by step.';
}

function getTestCaseStatusStyle(status: DisplayedTestStatus = 'PENDING') {
  if (status === 'PASSED') {
    return {
      label: 'Passed',
      icon: CheckCircle2,
      className: 'border-green-300 bg-green-100 text-green-800',
    };
  }

  if (status === 'FAILED') {
    return {
      label: 'Failed',
      icon: XCircle,
      className: 'border-red-300 bg-red-100 text-red-800',
    };
  }

  if (status === 'ERROR') {
    return {
      label: 'Error',
      icon: AlertCircle,
      className: 'border-orange-300 bg-orange-100 text-orange-800',
    };
  }

  return {
    label: 'Not Tested',
    icon: Circle,
    className: 'border-border bg-muted/40 text-muted-foreground',
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getSubmissionResult(submissionId: number) {
  const maxAttempts = 15;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await api.get<{ data: SubmissionDetail }>(
      `/submissions/${submissionId}`,
    );

    const submission = res.data.data;

    if (submission.status !== 'PENDING' && submission.status !== 'RUNNING') {
      return submission;
    }

    await wait(1000);
  }

  throw new Error('Submission is still processing. Please try again.');
}

export default function StudyCaseEditor({
  concept,
  material,
  studyCase,
  prevStudyCase,
  nextStudyCase,
}: Props) {
  const starterCode = useMemo(() => {
    return (
      studyCase.starterCode ||
      `function ${studyCase.functionName || 'solution'}() {\n  // Write your code here\n}`
    );
  }, [studyCase.functionName, studyCase.starterCode]);

  const { user, hasHydrated } = useAuthStore();
  const hasUserEditedCode = useRef(false);

  const [code, setCode] = useState(starterCode);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isFetchingTests, setIsFetchingTests] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resultMap = useMemo(() => {
    return new Map(results.map((result) => [result.testCaseId, result]));
  }, [results]);

  const displayedTestCases: DisplayedTestCase[] = testCases.map((testCase) => {
    const result = resultMap.get(testCase.id);

    return {
      id: testCase.id,
      description: result?.description ?? testCase.description,
      status: result?.status ?? 'PENDING',
      expected: result?.expected ?? stringifyValue(testCase.expected),
      received: result?.received,
      failureMessage: result?.failureMessage,
    };
  });

  const totalTests = displayedTestCases.length;

  const passedCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'PASSED',
  ).length;

  const progress = totalTests > 0 ? (passedCount / totalTests) * 100 : 0;

  const hasResults = results.length > 0;
  const allPassed = hasResults && totalTests > 0 && passedCount === totalTests;

  useEffect(() => {
    const fetchTestCases = async () => {
      setIsFetchingTests(true);

      try {
        const res = await api.get<{ data: TestCase[] }>(
          `/test-cases?studyCaseId=${studyCase.id}&sortBy=order&orderBy=asc&limit=100`,
        );

        setTestCases(res.data.data);
      } finally {
        setIsFetchingTests(false);
      }
    };

    fetchTestCases();
  }, [studyCase.id]);

  useEffect(() => {
    let isActive = true;

    const fetchLatestPassedSubmission = async () => {
      if (!hasHydrated || !user) {
        return;
      }

      try {
        const params = new URLSearchParams({
          studyCaseId: String(studyCase.id),
          status: 'PASSED',
          sortBy: 'createdAt',
          orderBy: 'desc',
          limit: '1',
          userId: String(user.id),
        });

        const res = await api.get<ApiResponse<Submission[]>>(
          `/submissions?${params.toString()}`,
        );

        const latestPassedSubmission = res.data.data[0];

        if (!latestPassedSubmission) {
          return;
        }

        const detailRes = await api.get<{ data: SubmissionDetail }>(
          `/submissions/${latestPassedSubmission.id}`,
        );

        const completedSubmission = detailRes.data.data;

        if (!isActive || hasUserEditedCode.current) {
          return;
        }

        setCode(completedSubmission.code);
        setResults(completedSubmission.testResults ?? []);
        setMessage(
          'You have completed this challenge. Your submitted code is loaded.',
        );
      } catch {
        // tetap pakai starterCode
      }
    };

    fetchLatestPassedSubmission();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, studyCase.id, user]);

  const handleReset = () => {
    hasUserEditedCode.current = true;
    setCode(starterCode);
    setResults([]);
    setMessage('Your code has been reset to the starter code.');
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setMessage(null);

    try {
      const res = await api.post<{ data: SubmissionDetail }>(
        '/submissions/run',
        {
          studyCaseId: studyCase.id,
          code,
        },
      );

      const data = res.data.data;

      setResults(data.testResults ?? []);

      if (data.status === 'PASSED') {
        setMessage('Great! All tests passed. You can submit your answer now.');
      } else {
        setMessage(
          'Some tests are still failing. Read the feedback and improve your code.',
        );
      }
    } catch {
      setMessage('Unable to run tests. Please check your code and try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('Your answer is being submitted and tested. Please wait...');

    try {
      const res = await api.post<{ data: Submission }>('/submissions', {
        studyCaseId: studyCase.id,
        code,
      });

      const submission = res.data.data;

      const submissionResult = await getSubmissionResult(submission.id);

      setResults(submissionResult.testResults ?? []);

      if (submissionResult.status === 'PASSED') {
        setMessage('Excellent! Your answer has been submitted successfully.');
      } else if (submissionResult.status === 'FAILED') {
        setMessage('Your answer was submitted, but some tests still failed.');
      } else {
        setMessage(
          submissionResult.errorMessage ||
            'Your answer was submitted, but an error occurred while testing.',
        );
      }
    } catch {
      setMessage('Unable to submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_420px]'>
      <section className='flex flex-col gap-y-4'>
        <Card>
          <CardContent className='flex flex-col gap-y-4 p-6'>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>Your Task</Badge>
            </div>

            <div className='flex flex-col gap-y-2'>
              <h2 className='text-xl font-bold tracking-tight'>
                Write your solution
              </h2>

              <p className='text-sm leading-relaxed text-muted-foreground'>
                Write your code, run the tests, read the feedback, improve your
                solution, and submit when you are ready.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between gap-4 border-b p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <Code2 className='size-5' />
              </div>

              <div className='flex flex-col'>
                <p className='text-sm font-semibold'>Code Editor</p>
                <p className='text-xs text-muted-foreground'>
                  Write your JavaScript function here.
                </p>
              </div>
            </div>

            <Badge variant={allPassed ? 'default' : 'secondary'}>
              {hasResults
                ? `${passedCount}/${totalTests} passed`
                : 'Not tested'}
            </Badge>
          </CardHeader>

          <Editor
            height='440px'
            language='javascript'
            theme='light'
            value={code}
            onChange={(value) => {
              hasUserEditedCode.current = true;
              setCode(value || '');
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </Card>

        <Card>
          <CardContent className='flex flex-col gap-y-4 p-6'>
            <div className='flex flex-col gap-y-2'>
              <div className='flex items-center justify-between gap-4 text-sm'>
                <span className='font-medium'>Test progress</span>

                <span className='text-muted-foreground'>
                  {passedCount} of {totalTests} passed
                </span>
              </div>

              <Progress value={progress} />
            </div>

            {message && (
              <Alert
                className={
                  allPassed
                    ? 'border-green-100 bg-green-50 text-green-800'
                    : undefined
                }
              >
                <AlertCircle className='size-4' />
                <AlertTitle>
                  {allPassed ? 'All tests passed' : 'Feedback'}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className='grid gap-3 sm:grid-cols-3'>
              <Button
                type='button'
                variant='outline'
                onClick={handleReset}
                className='gap-2'
              >
                <RotateCcw className='size-4' />
                Reset Code
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={handleRunTest}
                disabled={isTesting || isSubmitting}
                className='gap-2'
              >
                <TestTube2 className='size-4' />
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>

              <Button
                type='button'
                onClick={handleSubmit}
                disabled={isTesting || isSubmitting}
                className='gap-2'
              >
                <Send className='size-4' />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className='grid grid-cols-1 md:grid-cols-3 gap-3 border-t pt-8 md:items-center'>
          <div className='flex justify-start'>
            {prevStudyCase && (
              <Button
                variant='outline'
                asChild
                className='gap-2'
              >
                <Link
                  href={`/concepts/${concept.slug}/materials/${material.slug}/study-cases/${prevStudyCase.slug}`}
                >
                  <ChevronLeft className='size-4' />
                  Previous
                </Link>
              </Button>
            )}
          </div>

          <div className='flex justify-center'>
            <Button
              variant='secondary'
              asChild
            >
              <Link
                href={`/concepts/${concept.slug}/materials/${material.slug}`}
              >
                Back to Material
              </Link>
            </Button>
          </div>

          <div className='flex justify-end'>
            {nextStudyCase && (
              <Button
                asChild
                className='gap-2'
              >
                <Link
                  href={`/concepts/${concept.slug}/materials/${material.slug}/study-cases/${nextStudyCase.slug}`}
                >
                  Next
                  <ChevronRight className='size-4' />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </section>

      <aside className='flex h-fit flex-col gap-y-4 lg:sticky lg:top-24'>
        <Alert className='border-yellow-300 bg-yellow-50 text-yellow-950'>
          <Lightbulb className='size-4' />

          <AlertTitle>Hint</AlertTitle>

          <AlertDescription className='leading-relaxed'>
            {getStudyCaseHint(studyCase)}
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className='flex flex-col gap-y-4 p-6'>
            <div className='flex flex-col gap-y-1'>
              <h2 className='text-lg font-bold tracking-tight'>Test Cases</h2>

              <p className='text-sm text-muted-foreground'>
                Run your code and check which cases already pass.
              </p>
            </div>

            {isFetchingTests ? (
              <div className='flex flex-col gap-y-3'>
                <Skeleton className='h-24 w-full rounded-2xl' />
                <Skeleton className='h-24 w-full rounded-2xl' />
                <Skeleton className='h-24 w-full rounded-2xl' />
              </div>
            ) : displayedTestCases.length > 0 ? (
              <div className='flex flex-col gap-y-3'>
                {displayedTestCases.map((testCase, index) => {
                  const statusStyle = getTestCaseStatusStyle(testCase.status);
                  const Icon = statusStyle.icon;

                  return (
                    <div
                      key={testCase.id}
                      className={`rounded-2xl border p-4 ${statusStyle.className}`}
                    >
                      <div className='flex flex-col gap-y-4'>
                        <div className='flex justify-between'>
                          <div className='flex items-start gap-x-3'>
                            <Icon className='size-5 shrink-0' />

                            <div className='flex flex-col gap-y-1'>
                              <p className='text-sm font-semibold'>
                                Test Case {index + 1}
                              </p>

                              <p className='text-sm opacity-90'>
                                {testCase.description}
                              </p>
                            </div>
                          </div>

                          <Badge variant='outline'>{statusStyle.label}</Badge>
                        </div>

                        <div className='flex flex-col gap-y-2'>
                          {testCase.status !== 'PENDING' && (
                            <div className='*:w-full flex flex-col gap-y-1 rounded-xl bg-card/70 p-3 text-sm'>
                              <p>
                                <span className='font-semibold'>Expected:</span>{' '}
                                {testCase.expected}
                              </p>

                              {testCase.received !== undefined && (
                                <p>
                                  <span className='font-semibold'>
                                    Received:
                                  </span>{' '}
                                  {testCase.received}
                                </p>
                              )}

                              {testCase.failureMessage && (
                                <p className='leading-relaxed'>
                                  {testCase.failureMessage}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed bg-muted/40 p-6 text-center'>
                <p className='text-sm font-medium'>No test cases yet</p>
                <p className='text-sm text-muted-foreground'>
                  Published test cases will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
