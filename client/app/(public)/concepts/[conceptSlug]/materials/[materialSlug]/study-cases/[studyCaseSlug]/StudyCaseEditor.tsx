'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  Send,
  TestTube2,
  XCircle,
} from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

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

type DisplayedTestStatus = TestResultStatus | 'PENDING';

type DisplayedTestCase = {
  id: number;
  description: string;
  status: DisplayedTestStatus;
  input: string;
  expected: string;
  received?: string | null;
  whatToCheck?: string | null;
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

function formatCaseValue(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 1) {
      return stringifyValue(entries[0][1]);
    }

    return entries
      .map(([key, item]) => `${key}: ${stringifyValue(item)}`)
      .join(', ');
  }

  return stringifyValue(value);
}

function formatInputValue(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);

    return entries
      .map(([key, item]) => `${key}: ${stringifyValue(item)}`)
      .join(', ');
  }

  return stringifyValue(value);
}

function cleanFailureMessage(message?: string | null) {
  return (message ?? '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseOutputValue(value?: unknown) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return trimmedValue;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
}

function getDynamicWhatToCheck({
  status,
  expected,
  received,
  failureMessage,
}: {
  status?: TestResultStatus;
  expected?: unknown;
  received?: unknown;
  failureMessage?: string | null;
}) {
  if (!status || status === 'PASSED') {
    return null;
  }

  const cleanMessage = cleanFailureMessage(failureMessage);
  const parsedExpected = parseOutputValue(expected);
  const parsedReceived = parseOutputValue(received);
  const expectedType = getValueType(parsedExpected);

  if (status === 'ERROR') {
    if (cleanMessage.includes('SyntaxError')) {
      return 'Your code has a syntax error. Check missing brackets, parentheses, keywords, or symbols.';
    }

    if (cleanMessage.includes('ReferenceError')) {
      return 'Your code uses a variable or function that has not been defined. Check the spelling of your variable or function name.';
    }

    if (cleanMessage.includes('TypeError')) {
      return 'Your code uses a value in the wrong way. Check the data type, function call, or returned value.';
    }

    if (cleanMessage.toLowerCase().includes('timeout')) {
      return 'Your code took too long to run. Check whether your loop condition can stop correctly.';
    }

    return 'Your code could not run correctly. Check your syntax, function structure, and returned value.';
  }

  if (parsedReceived === undefined || parsedReceived === 'undefined') {
    return 'Your function did not return a value. Make sure you use return and return the expected result.';
  }

  if (parsedReceived === null || parsedReceived === 'null') {
    return 'Your function returned null. Check your condition or default return value.';
  }

  if (expectedType === 'boolean') {
    return 'Your boolean result is not correct. Check the condition and make sure it returns true or false in the right case.';
  }

  if (expectedType === 'number') {
    return 'Your number result is not correct. Check your calculation, operator, initial value, or loop process.';
  }

  if (expectedType === 'string') {
    return 'Your text result is not correct. Check spelling, capitalization, spacing, or the condition that returns the text.';
  }

  if (expectedType === 'array') {
    return 'Your array result is not correct. Check the item order, loop boundaries, and how you add values to the array.';
  }

  if (expectedType === 'object') {
    return 'Your object result is not correct. Check the property names, property values, and returned object structure.';
  }

  return 'Your result is different from the expected output. Review your logic and return value.';
}

function getStudyCaseHint(studyCase: StudyCase) {
  if (studyCase.hint) {
    return studyCase.hint;
  }

  return 'Read the task carefully, start with a simple solution, run the test, then improve your code step by step.';
}

function getTestCaseStatusStyle(status: DisplayedTestStatus = 'PENDING') {
  if (status === 'PASSED') {
    return {
      label: 'Passed',
      icon: CheckCircle2,
      className: 'border-green-200 bg-green-50 text-green-800',
    };
  }

  if (status === 'FAILED') {
    return {
      label: 'Needs Fix',
      icon: XCircle,
      className: 'border-red-200 bg-red-50 text-red-800',
    };
  }

  if (status === 'ERROR') {
    return {
      label: 'Error',
      icon: AlertCircle,
      className: 'border-orange-200 bg-orange-50 text-orange-800',
    };
  }

  return {
    label: 'Not Tested',
    icon: Circle,
    className: 'border-border bg-muted/30 text-muted-foreground',
  };
}

function TestCaseFeedbackCard({
  testCase,
  index,
}: {
  testCase: DisplayedTestCase;
  index: number;
}) {
  const statusStyle = getTestCaseStatusStyle(testCase.status);
  const Icon = statusStyle.icon;

  return (
    <div className={`rounded-2xl border p-4 ${statusStyle.className}`}>
      <div className='flex flex-col gap-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <Icon className='size-5 shrink-0' />

            <div className='flex flex-col gap-y-1'>
              <p className='text-sm font-semibold'>Checkpoint {index + 1}</p>

              <p className='text-sm leading-relaxed opacity-90'>
                {testCase.description}
              </p>
            </div>
          </div>

          <Badge
            variant='outline'
            className='shrink-0 bg-background/70'
          >
            {statusStyle.label}
          </Badge>
        </div>

        <div className='grid gap-3 rounded-xl bg-background/70 p-3 text-sm'>
          <div className='flex flex-col gap-y-1'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Input
            </p>

            <p className='rounded-lg bg-background p-2 font-medium'>
              {testCase.input}
            </p>
          </div>

          <div className='flex flex-col gap-y-1'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Expected
            </p>

            <p className='rounded-lg bg-background p-2 font-medium'>
              {testCase.expected}
            </p>
          </div>

          {testCase.status !== 'PENDING' && (
            <div className='flex flex-col gap-y-1'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Received
              </p>

              <p className='rounded-lg bg-background p-2 font-medium'>
                {testCase.received ?? 'No output received'}
              </p>
            </div>
          )}

          {testCase.whatToCheck && (
            <div className='rounded-lg bg-muted/60 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                What to check
              </p>

              <p className='pt-1 leading-relaxed'>{testCase.whatToCheck}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

  const userId = user?.id;
  const userRole = user?.role;

  const [code, setCode] = useState(starterCode);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isFetchingTests, setIsFetchingTests] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canInteract = hasHydrated && userRole === 'STUDENT';

  const resultMap = useMemo(() => {
    return new Map(results.map((result) => [result.testCaseId, result]));
  }, [results]);

  const displayedTestCases: DisplayedTestCase[] = testCases.map((testCase) => {
    const result = resultMap.get(testCase.id);

    return {
      id: testCase.id,
      description: result?.description ?? testCase.description,
      status: result?.status ?? 'PENDING',
      input: formatInputValue(testCase.input),
      expected: formatCaseValue(result?.expected ?? testCase.expected),
      received: result?.received,
      whatToCheck: getDynamicWhatToCheck({
        status: result?.status,
        expected: result?.expected ?? testCase.expected,
        received: result?.received,
        failureMessage: result?.failureMessage,
      }),
    };
  });

  const sampleTestCase = displayedTestCases[0] ?? null;

  const totalTests = displayedTestCases.length;

  const passedCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'PASSED',
  ).length;

  const failedCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'FAILED',
  ).length;

  const errorCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'ERROR',
  ).length;

  const progress = totalTests > 0 ? (passedCount / totalTests) * 100 : 0;

  const hasResults = results.length > 0;
  const allPassed = hasResults && totalTests > 0 && passedCount === totalTests;

  const isProcessingResult = isTesting || isSubmitting;

  const feedbackContent = useMemo(() => {
    if (!message) {
      return null;
    }

    if (allPassed) {
      return {
        title: 'All checks passed',
        description:
          'Nice work. Review your code and simplify it if needed. If you make changes, run the test again before submitting.',
        className: 'border-green-200 bg-green-50 text-green-800',
        icon: CheckCircle2,
      };
    }

    if (hasResults) {
      return {
        title: 'Keep improving your solution',
        description:
          'Some checks still need attention. Compare the expected and received results, then update your code.',
        className: 'border-orange-200 bg-orange-50 text-orange-900',
        icon: AlertCircle,
      };
    }

    return {
      title: 'Notice',
      description: message,
      className: '',
      icon: AlertCircle,
    };
  }, [allPassed, hasResults, message]);

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
      if (!hasHydrated || !userId || userRole !== 'STUDENT') {
        return;
      }

      try {
        const params = new URLSearchParams({
          studyCaseId: String(studyCase.id),
          status: 'PASSED',
          sortBy: 'createdAt',
          orderBy: 'desc',
          limit: '1',
          userId: String(userId),
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
          'You have completed this study case. Your submitted code is loaded for review.',
        );
      } catch {
        // Keep starter code.
      }
    };

    fetchLatestPassedSubmission();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, studyCase.id, userId, userRole]);

  const handleReset = () => {
    hasUserEditedCode.current = true;
    setCode(starterCode);
    setResults([]);
    setMessage('Your code has been reset to the starter code.');
  };

  const handleRunTest = async () => {
    if (!canInteract) {
      setMessage('Please sign in as a student to run the test.');
      return;
    }

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
        setMessage(
          'All tests passed. Review your code and run the test again if you make changes.',
        );
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
    if (!canInteract) {
      setMessage('Please sign in as a student to submit your answer.');
      return;
    }

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
        setMessage(
          'Excellent. Your answer has been submitted successfully. You can continue when you are ready.',
        );
      } else if (submissionResult.status === 'FAILED') {
        setMessage(
          'Your answer was submitted, but some checks still need attention.',
        );
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
    <div className='grid min-h-[calc(100dvh-9rem)] gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'>
      <section className='flex min-w-0 h-fit flex-col overflow-hidden rounded-3xl border bg-card shadow-sm'>
        <div className='flex flex-1 flex-col gap-y-8 overflow-y-auto p-5 md:p-7'>
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
                function based on the task and checkpoints below.
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
              <h2 className='text-lg font-bold tracking-tight'>Checkpoints</h2>

              <p className='text-sm text-muted-foreground'>
                Check the input and expected output before writing your code.
              </p>
            </div>

            {isFetchingTests ? (
              <Skeleton className='h-32 w-full rounded-2xl' />
            ) : displayedTestCases.length > 0 ? (
              <div className='flex flex-col gap-y-3'>
                <section className='flex flex-col gap-y-4'>
                  <div className='flex flex-col gap-y-1'>
                    <h2 className='text-lg font-bold tracking-tight'>
                      Sample Case
                    </h2>

                    <p className='text-sm text-muted-foreground'>
                      Use this example to understand the input and expected
                      output.
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
                            This sample shows one possible input and the
                            expected result.
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
            ) : (
              <div className='rounded-2xl border border-dashed bg-muted/40 p-8 text-center'>
                <p className='text-sm font-medium'>No checkpoints yet</p>

                <p className='text-sm text-muted-foreground'>
                  Published test cases will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

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
                onChange={(value) => {
                  hasUserEditedCode.current = true;
                  setCode(value || '');
                }}
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

              {feedbackContent && (
                <Alert className={feedbackContent.className}>
                  {(() => {
                    const FeedbackIcon = feedbackContent.icon;

                    return <FeedbackIcon className='size-4' />;
                  })()}

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

              <div className='grid w-full gap-3 sm:grid-cols-[1fr_1fr_1fr]'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleReset}
                  disabled={isTesting || isSubmitting}
                  className='gap-2'
                >
                  <RotateCcw className='size-4' />
                  Reset Code
                </Button>

                <Button
                  type='button'
                  variant='secondary'
                  onClick={handleRunTest}
                  disabled={!canInteract || isTesting || isSubmitting}
                  className='gap-2'
                >
                  <TestTube2 className='size-4' />
                  {isTesting ? 'Testing...' : 'Run Test'}
                </Button>

                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!canInteract || isTesting || isSubmitting}
                  className='gap-2'
                >
                  <Send className='size-4' />
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
                      <p className='text-sm font-semibold'>
                        No test result yet
                      </p>

                      <p className='text-sm leading-relaxed text-muted-foreground'>
                        Read the problem and sample case first. Then write your
                        solution and click Run Test to see all checkpoint
                        results.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </CardContent>

          <CardFooter className='flex flex-col gap-y-4 border-t bg-background p-4 md:p-5'>
            <div className='grid w-full grid-cols-1 gap-3 md:grid-cols-3 md:items-center'>
              <div className='flex justify-start'>
                {prevStudyCase && (
                  <Button
                    variant='ghost'
                    size='sm'
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
                  variant='ghost'
                  size='sm'
                  asChild
                  className='gap-2'
                >
                  <Link
                    href={`/concepts/${concept.slug}/materials/${material.slug}`}
                  >
                    <BookOpenCheck className='size-4' />
                    Back to Material
                  </Link>
                </Button>
              </div>

              <div className='flex justify-end'>
                {nextStudyCase && (
                  <Button
                    variant='ghost'
                    size='sm'
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
            </div>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
